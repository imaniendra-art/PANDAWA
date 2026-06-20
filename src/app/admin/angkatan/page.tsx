"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface AngkatanItem {
  _id: string;
  nama: string;
  tanggalWisuda: string | null;
  biaya: number;
  isActive: boolean;
  totalMahasiswa: number;
}

export default function AngkatanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nama: "", tanggalWisuda: "", biaya: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data: angkatanList, isLoading } = useQuery<AngkatanItem[]>({
    queryKey: ["angkatan"],
    queryFn: async () => {
      const res = await fetch("/api/admin/angkatan");
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/admin/angkatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      setShowForm(false);
      setEditId(null);
      setForm({ nama: "", tanggalWisuda: "", biaya: "" });
      queryClient.invalidateQueries({ queryKey: ["angkatan"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-blue-600 text-sm hover:underline">&larr; Kembali</Link>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Angkatan</h1>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", tanggalWisuda: "", biaya: "" }); }}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
          >
            + Tambah Angkatan
          </button>
        </div>

        {flash && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${flash.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {flash.message}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold mb-4">{editId ? "Edit Angkatan" : "Tambah Angkatan Baru"}</h2>
            <div className="space-y-3">
              <input
                type="text" placeholder="Nama Angkatan (cth: Angkatan 2026)"
                value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date" placeholder="Tanggal Wisuda"
                value={form.tanggalWisuda} onChange={(e) => setForm({ ...form, tanggalWisuda: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number" placeholder="Biaya Wisuda"
                value={form.biaya} onChange={(e) => setForm({ ...form, biaya: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveMutation.mutate({ id: editId, ...form, biaya: Number(form.biaya) })}
                  className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800"
                >
                  {editId ? "Simpan Perubahan" : "Tambah"}
                </button>
                <button onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm">Batal</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Tanggal Wisuda</th>
                <th className="px-4 py-3 text-left">Biaya</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Mahasiswa</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {angkatanList?.map((a) => (
                <tr key={a._id}>
                  <td className="px-4 py-3 font-medium">{a.nama}</td>
                  <td className="px-4 py-3">{a.tanggalWisuda ? new Date(a.tanggalWisuda).toLocaleDateString("id-ID") : "-"}</td>
                  <td className="px-4 py-3">Rp {a.biaya.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-center">
                    {a.isActive ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Aktif</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">Tidak Aktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{a.totalMahasiswa}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      {!a.isActive && (
                        <button
                          onClick={() => saveMutation.mutate({ id: a._id, action: "set_active" })}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Set Aktif
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditId(a._id);
                          setForm({
                            nama: a.nama,
                            tanggalWisuda: a.tanggalWisuda ? a.tanggalWisuda.split("T")[0] : "",
                            biaya: String(a.biaya),
                          });
                          setShowForm(true);
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      {!a.isActive && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus angkatan ${a.nama}?`)) {
                              saveMutation.mutate({ id: a._id, action: "delete" });
                            }
                          }}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Hapus
                        </button>
                      )}
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
