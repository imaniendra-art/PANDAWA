"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface BukuKasData {
  transaksiList: Array<{
    _id: string;
    jenis: string;
    tanggal: string;
    jumlah: number;
    keterangan: string;
  }>;
  pemasukanPendaftaran: number;
  pemasukanManual: number;
  pengeluaran: number;
  saldoAkhir: number;
  semuaAngkatan: Array<{ _id: string; nama: string; isActive: boolean }>;
  angkatanId: string;
}

export default function BukuKasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({ jenis: "Pemasukan", jumlah: "", keterangan: "", tanggal: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data, isLoading } = useQuery<BukuKasData>({
    queryKey: ["buku-kas", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/keuangan/buku-kas${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/keuangan/buku-kas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jumlah: Number(form.jumlah), angkatanId: selectedAngkatan || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      setShowForm(false);
      setForm({ jenis: "Pemasukan", jumlah: "", keterangan: "", tanggal: "" });
      queryClient.invalidateQueries({ queryKey: ["buku-kas"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/keuangan" className="text-blue-600 text-sm hover:underline">&larr; Kembali</Link>
            <h1 className="text-2xl font-bold text-gray-800">Buku Kas</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            + Tambah Transaksi
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">Pemasukan Pendaftaran</p>
            <p className="text-lg font-bold text-green-600">Rp {(data?.pemasukanPendaftaran || 0).toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">Pemasukan Manual</p>
            <p className="text-lg font-bold text-blue-600">Rp {(data?.pemasukanManual || 0).toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">Pengeluaran</p>
            <p className="text-lg font-bold text-red-600">Rp {(data?.pengeluaran || 0).toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-2 border-blue-200">
            <p className="text-xs text-gray-500">Saldo Akhir</p>
            <p className="text-lg font-bold text-blue-700">Rp {(data?.saldoAkhir || 0).toLocaleString("id-ID")}</p>
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

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold mb-4">Tambah Transaksi</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
              <input type="number" placeholder="Jumlah" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Keterangan" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => addMutation.mutate()} className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800">Simpan</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm">Batal</button>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Keterangan</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.transaksiList.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Belum ada transaksi manual.</td></tr>
              ) : (
                data?.transaksiList.map((t) => (
                  <tr key={t._id}>
                    <td className="px-4 py-3">{new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${t.jenis === "Pemasukan" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.keterangan}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.jenis === "Pemasukan" ? "text-green-600" : "text-red-600"}`}>
                      Rp {t.jumlah.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
