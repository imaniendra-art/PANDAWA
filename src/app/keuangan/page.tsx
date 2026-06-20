"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface KeuanganData {
  mahasiswaList: Array<{
    _id: string;
    username: string;
    namaLengkap: string | null;
    fileBebasSks: string | null;
    fileBuktiPembayaran: string | null;
  }>;
  validatedCount: number;
  totalPemasukanPendaftaran: number;
  semuaAngkatan: Array<{ _id: string; nama: string; isActive: boolean }>;
  angkatanId: string;
  biayaPerMhs: number;
}

export default function KeuanganDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "keuangan") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

  const { data, isLoading } = useQuery<KeuanganData>({
    queryKey: ["keuangan-dashboard", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/keuangan/dashboard${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const validateMutation = useMutation({
    mutationFn: async ({ studentId, action, catatanKeuangan }: { studentId: string; action: string; catatanKeuangan?: string }) => {
      const res = await fetch("/api/keuangan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, catatanKeuangan }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["keuangan-dashboard"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Memuat...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Keuangan</h1>
          <div className="flex gap-2">
            <Link href="/keuangan/buku-kas" className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">Buku Kas</Link>
            <Link href="/keuangan/laporan" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">Laporan</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Menunggu Validasi</p>
            <p className="text-2xl font-bold text-yellow-600">{data?.mahasiswaList.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Sudah Divalidasi</p>
            <p className="text-2xl font-bold text-green-600">{data?.validatedCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Pemasukan Pendaftaran</p>
            <p className="text-2xl font-bold">Rp {(data?.totalPemasukanPendaftaran || 0).toLocaleString("id-ID")}</p>
            <p className="text-xs text-gray-400">@ Rp {(data?.biayaPerMhs || 0).toLocaleString("id-ID")} / mhs</p>
          </div>
        </div>

        {/* Angkatan Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter Angkatan:</label>
          <select value={selectedAngkatan} onChange={(e) => setSelectedAngkatan(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Semua</option>
            {data?.semuaAngkatan.map((a) => (
              <option key={a._id} value={a._id}>{a.nama} {a.isActive ? "(Aktif)" : ""}</option>
            ))}
          </select>
        </div>

        {flash && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${flash.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {flash.message}
          </div>
        )}

        {/* Pending Validations */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-800">Menunggu Validasi Keuangan</h2>
          </div>
          {data?.mahasiswaList.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Tidak ada mahasiswa yang menunggu validasi.</div>
          ) : (
            <div className="divide-y">
              {data?.mahasiswaList.map((m) => (
                <div key={m._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{m.namaLengkap || m.username}</p>
                      <p className="text-sm text-gray-500">NIM: {m.username}</p>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      {expandedId === m._id ? "Tutup" : "Lihat Berkas"}
                    </button>
                  </div>
                  {expandedId === m._id && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-3">
                        {m.fileBebasSks && (
                          <a href={m.fileBebasSks} target="_blank" className="text-blue-600 text-sm hover:underline">Lihat Bukti Bebas SKS</a>
                        )}
                        {m.fileBuktiPembayaran && (
                          <a href={m.fileBuktiPembayaran} target="_blank" className="text-blue-600 text-sm hover:underline">Lihat Bukti Pembayaran</a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => {
                            const catatan = prompt("Catatan revisi (wajib):");
                            if (catatan) validateMutation.mutate({ studentId: m._id, action: "reject", catatanKeuangan: catatan });
                          }}
                          className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
