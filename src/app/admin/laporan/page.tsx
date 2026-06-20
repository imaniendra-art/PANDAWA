"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LaporanAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data } = useQuery({
    queryKey: ["admin-laporan", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/admin/laporan${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-blue-600 text-sm hover:underline">&larr; Kembali</Link>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Data Wisudawan</h1>
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/admin/export${selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : ""}`}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              Export CSV
            </a>
            <Link
              href={`/admin/cetak-surat${selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : ""}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
            >
              Cetak Surat LL
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter Angkatan:</label>
          <select value={selectedAngkatan} onChange={(e) => setSelectedAngkatan(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Semua</option>
            {data?.semuaAngkatan.map((a: { _id: string; nama: string; isActive: boolean }) => (
              <option key={a._id} value={a._id}>{a.nama} {a.isActive ? "(Aktif)" : ""}</option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-600">Total Lulusan: <strong>{data?.totalLulusan || 0}</strong></span>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left">No</th>
                <th className="px-3 py-3 text-left">NIM</th>
                <th className="px-3 py-3 text-left">Nama Lengkap</th>
                <th className="px-3 py-3 text-left">NIK</th>
                <th className="px-3 py-3 text-left">TTL</th>
                <th className="px-3 py-3 text-left">Konsentrasi</th>
                <th className="px-3 py-3 text-left">Toga</th>
                <th className="px-3 py-3 text-left">Kaos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.mahasiswaList.map((m: {
                _id: string; username: string; namaLengkap: string | null;
                nik: string | null; tempatLahir: string | null; tanggalLahir: string | null;
                konsentrasi: string | null; ukuranToga: string | null; ukuranKaos: string | null;
              }, idx: number) => (
                <tr key={m._id}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{m.username}</td>
                  <td className="px-3 py-2 font-medium">{m.namaLengkap || "-"}</td>
                  <td className="px-3 py-2 text-xs">{m.nik || "-"}</td>
                  <td className="px-3 py-2 text-xs">{m.tempatLahir}, {m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "-"}</td>
                  <td className="px-3 py-2 text-xs">{m.konsentrasi || "-"}</td>
                  <td className="px-3 py-2 text-center">{m.ukuranToga || "-"}</td>
                  <td className="px-3 py-2 text-center">{m.ukuranKaos || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
