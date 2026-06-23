"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Loader2, CheckCircle, AlertTriangle, Users, Plus, Edit2, Trash2, Calendar, Hash, Type } from "lucide-react";

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

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Memuat Gelombang...</p>
        </div>
      </div>
    );
  }

  const inputClassName = "w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none";
  const labelClassName = "block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Flash Notifications */}
        {flash && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-bold shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 border ${flash.type === "success" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30" : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />} {flash.message}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-6 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-visible z-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="w-full md:w-auto flex-1 relative z-10">
             <div className="flex items-center gap-3 mb-2">
               <BackButton href="/admin" label="Kembali ke Dashboard Admin" />
             </div>
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Kelola Gelombang</h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Pengaturan Angkatan Wisuda</p>
           </div>

           <button
             onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", tanggalWisuda: "", biaya: "" }); }}
             className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
           >
             <Plus className="h-5 w-5" /> Tambah Angkatan
           </button>
        </div>

        {/* Tambah/Edit Angkatan Form */}
        {showForm && (
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors mb-6 p-6 sm:p-8 relative">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-xl flex items-center gap-3 mb-6">
              {editId ? <Edit2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /> : <Plus className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />} 
              {editId ? "Edit Angkatan" : "Tambah Angkatan Baru"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className={labelClassName}><Type className="h-4 w-4"/> Nama Angkatan</label>
                <input
                  type="text" placeholder="Cth: Angkatan 2026"
                  value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}><Calendar className="h-4 w-4"/> Tanggal Wisuda</label>
                <input
                  type="date" placeholder="Tanggal Wisuda"
                  value={form.tanggalWisuda} onChange={(e) => setForm({ ...form, tanggalWisuda: e.target.value })}
                  className={inputClassName}
                />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/30">
                <label className={`${labelClassName} text-amber-700 dark:text-amber-400`}><Hash className="h-4 w-4"/> Biaya Wisuda (Rp) *</label>
                <input
                  type="number" placeholder="Cth: 1500000"
                  value={form.biaya} onChange={(e) => setForm({ ...form, biaya: e.target.value })}
                  className={`${inputClassName} border-amber-300 dark:border-amber-500/50 focus:ring-amber-500 focus:border-amber-500 font-bold text-amber-900 dark:text-amber-100`}
                  required
                />
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 font-medium">Nilai ini bersifat final untuk angkatan ini dan akan digunakan sebagai rujukan tagihan.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button 
                onClick={() => saveMutation.mutate({ id: editId, ...form, biaya: Number(form.biaya) })}
                disabled={saveMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center"
              >
                {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (editId ? "Simpan Perubahan" : "Tambah")}
              </button>
              <button 
                onClick={() => setShowForm(false)} 
                className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Nama Gelombang</th>
                  <th className="px-6 py-4">Tanggal Wisuda</th>
                  <th className="px-6 py-4">Biaya</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Peserta</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {angkatanList?.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors duration-200">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Users className="h-4 w-4" />
                      </div>
                      {a.nama}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                      {a.tanggalWisuda ? new Date(a.tanggalWisuda).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-6 py-4 font-bold font-mono text-cyan-600 dark:text-cyan-400">
                      Rp {a.biaya.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${a.isActive ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"}`}>
                        {a.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {a.totalMahasiswa}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center items-center">
                        {!a.isActive && (
                          <button
                            onClick={() => saveMutation.mutate({ id: a._id, action: "set_active" })}
                            className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
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
                          className="p-1.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-200 dark:border-amber-500/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!a.isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus angkatan ${a.nama}?`)) {
                                saveMutation.mutate({ id: a._id, action: "delete" });
                              }
                            }}
                            className="p-1.5 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-500/20 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {angkatanList?.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Belum ada data angkatan wisuda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
