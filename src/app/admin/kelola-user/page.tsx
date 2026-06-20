"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Mahasiswa {
  _id: string;
  username: string;
  namaLengkap: string | null;
  statusPendaftaran: string;
  createdAt: string;
}

export default function KelolaUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data } = useQuery<{
    mahasiswaList: Mahasiswa[];
    semuaAngkatan: Array<{ _id: string; nama: string; isActive: boolean }>;
    angkatanId: string;
  }>({
    queryKey: ["kelola-user", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/admin/kelola-user${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const resetPw = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (d) => setFlash({ type: "success", message: d.message }),
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  const hapusUser = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch("/api/admin/hapus-mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["kelola-user"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-blue-600 text-sm hover:underline">&larr; Kembali</Link>
            <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
          </div>
        </div>

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

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">NIM</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Terdaftar</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.mahasiswaList.map((m) => (
                <tr key={m._id}>
                  <td className="px-4 py-3">{m.username}</td>
                  <td className="px-4 py-3 font-medium">{m.namaLengkap || "-"}</td>
                  <td className="px-4 py-3 text-center text-xs">{m.statusPendaftaran}</td>
                  <td className="px-4 py-3 text-center text-xs">{new Date(m.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => { if (confirm(`Reset password ${m.username} ke "123456"?`)) resetPw.mutate(m._id); }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => { if (confirm(`Hapus permanen ${m.namaLengkap || m.username}?`)) hapusUser.mutate(m._id); }}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
