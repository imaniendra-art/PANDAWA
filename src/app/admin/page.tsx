"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface AdminData {
  mahasiswaList: Array<{
    _id: string;
    username: string;
    namaLengkap: string | null;
    nik: string | null;
    tempatLahir: string | null;
    tanggalLahir: string | null;
    konsentrasi: string | null;
    judulSkripsi: string | null;
    ukuranToga: string | null;
    ukuranKaos: string | null;
    fileKtp: string | null;
    fileIjazahSma: string | null;
  }>;
  validatedCount: number;
  totalPendaftar: number;
  semuaAngkatan: Array<{ _id: string; nama: string; isActive: boolean }>;
  angkatanId: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "admin") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

  const { data, isLoading } = useQuery<AdminData>({
    queryKey: ["admin-dashboard", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/admin/dashboard${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const validateMutation = useMutation({
    mutationFn: async ({ studentId, action, catatanAdmin }: { studentId: string; action: string; catatanAdmin?: string }) => {
      const res = await fetch("/api/admin/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, catatanAdmin }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
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
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/angkatan" className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 transition">Kelola Angkatan</Link>
            <Link href="/admin/kelola-user" className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 transition">Kelola User</Link>
            <Link href="/admin/laporan" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition">Laporan</Link>
            <Link href="/admin/settings" className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 transition">Pengaturan</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Pendaftar</p>
            <p className="text-2xl font-bold">{data?.totalPendaftar || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Menunggu Validasi</p>
            <p className="text-2xl font-bold text-yellow-600">{data?.mahasiswaList.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Lulus/Cetak Kartu</p>
            <p className="text-2xl font-bold text-green-600">{data?.validatedCount || 0}</p>
          </div>
        </div>

        {/* Angkatan Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter Angkatan:</label>
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
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
            <h2 className="font-semibold text-gray-800">Menunggu Validasi Admin</h2>
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
                      {expandedId === m._id ? "Tutup" : "Detail"}
                    </button>
                  </div>

                  {expandedId === m._id && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">NIK:</span> {m.nik || "-"}</p>
                        <p><span className="text-gray-500">Tempat Lahir:</span> {m.tempatLahir || "-"}</p>
                        <p><span className="text-gray-500">Tanggal Lahir:</span> {m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "-"}</p>
                        <p><span className="text-gray-500">Konsentrasi:</span> {m.konsentrasi || "-"}</p>
                        <p className="col-span-2"><span className="text-gray-500">Judul Skripsi:</span> {m.judulSkripsi || "-"}</p>
                        <p><span className="text-gray-500">Ukuran Toga:</span> {m.ukuranToga || "-"}</p>
                        <p><span className="text-gray-500">Ukuran Kaos:</span> {m.ukuranKaos || "-"}</p>
                      </div>
                      <div className="flex gap-2">
                        {m.fileKtp && (
                          <a href={m.fileKtp} target="_blank" className="text-blue-600 text-sm hover:underline">Lihat KTP</a>
                        )}
                        {m.fileIjazahSma && (
                          <a href={m.fileIjazahSma} target="_blank" className="text-blue-600 text-sm hover:underline">Lihat Ijazah SMA</a>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 transition"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => {
                            const catatan = prompt("Catatan revisi (opsional):");
                            validateMutation.mutate({ studentId: m._id, action: "reject", catatanAdmin: catatan || undefined });
                          }}
                          className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700 transition"
                        >
                          Kembalikan (Revisi Berkas)
                        </button>
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "reject_nama" })}
                          className="bg-orange-600 text-white px-4 py-1.5 rounded text-sm hover:bg-orange-700 transition"
                        >
                          Revisi Beda Nama
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
