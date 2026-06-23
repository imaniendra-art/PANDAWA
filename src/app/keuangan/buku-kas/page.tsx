"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Loader2, Plus, Wallet, TrendingUp, TrendingDown, Landmark, CheckCircle, AlertTriangle, ChevronDown, Calendar, Type, Hash } from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Menarik Data Kas...</p>
        </div>
      </div>
    );
  }

  const inputClassName = "w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none";
  const labelClassName = "block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
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
               <BackButton href="/keuangan" label="Kembali ke Dashboard Keuangan" />
             </div>
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Buku Kas</h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Pencatatan Pemasukan & Pengeluaran</p>
           </div>

           <div className="relative z-50 w-full md:w-auto flex items-center gap-3">
             <div 
               className="group relative flex items-center gap-3 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 hover:border-cyan-400 dark:hover:border-cyan-500/50 rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex-1 md:flex-none"
               onClick={() => setDropdownOpen(!dropdownOpen)}
             >
               <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
               <div className="text-sm font-bold text-slate-800 dark:text-white w-full md:w-56 pr-6 truncate">
                 {selectedAngkatan ? data?.semuaAngkatan.find(a => a._id === selectedAngkatan)?.nama + (data?.semuaAngkatan.find(a => a._id === selectedAngkatan)?.isActive ? " [Aktif]" : "") : "Wisuda Ke- ... (Semua)"}
               </div>
               <div className={`absolute right-4 pointer-events-none text-slate-500 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}>
                 <ChevronDown className="h-4 w-4" />
               </div>
             </div>

             {dropdownOpen && (
               <div className="absolute top-full right-0 mt-2 w-full min-w-[280px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/20 shadow-2xl rounded-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                 <div 
                   className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-100 dark:border-white/5"
                   onClick={() => { setSelectedAngkatan(""); setDropdownOpen(false); }}
                 >
                   Wisuda Ke- ... (Semua)
                 </div>
                 <div className="max-h-60 overflow-y-auto">
                   {data?.semuaAngkatan.map((a) => (
                     <div 
                       key={a._id} 
                       className={`px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between ${selectedAngkatan === a._id ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                       onClick={() => { setSelectedAngkatan(a._id); setDropdownOpen(false); }}
                     >
                       {a.nama} 
                       {a.isActive && <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">Aktif</span>}
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>

           <button
             onClick={() => setShowForm(!showForm)}
             className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10"
           >
             <Plus className="h-5 w-5" /> Tambah Transaksi
           </button>
        </div>

        {/* Global Stats Panel (Bento Block) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pemasukan Pendaftaran", value: `Rp ${(data?.pemasukanPendaftaran || 0).toLocaleString("id-ID")}`, icon: <TrendingUp className="h-7 w-7" />, color: "emerald", lightBg: "bg-emerald-50", darkBg: "dark:bg-emerald-500/20", lightText: "text-emerald-600", darkText: "dark:text-emerald-400", lightBorder: "border-emerald-100", darkBorder: "dark:border-emerald-500/30" },
            { label: "Pemasukan Manual", value: `Rp ${(data?.pemasukanManual || 0).toLocaleString("id-ID")}`, icon: <Wallet className="h-7 w-7" />, color: "blue", lightBg: "bg-blue-50", darkBg: "dark:bg-blue-500/20", lightText: "text-blue-600", darkText: "dark:text-blue-400", lightBorder: "border-blue-100", darkBorder: "dark:border-blue-500/30" },
            { label: "Pengeluaran", value: `Rp ${(data?.pengeluaran || 0).toLocaleString("id-ID")}`, icon: <TrendingDown className="h-7 w-7" />, color: "rose", lightBg: "bg-rose-50", darkBg: "dark:bg-rose-500/20", lightText: "text-rose-600", darkText: "dark:text-rose-400", lightBorder: "border-rose-100", darkBorder: "dark:border-rose-500/30" },
            { label: "Saldo Akhir", value: `Rp ${(data?.saldoAkhir || 0).toLocaleString("id-ID")}`, icon: <Landmark className="h-7 w-7" />, color: "cyan", lightBg: "bg-cyan-50", darkBg: "dark:bg-cyan-500/20", lightText: "text-cyan-600", darkText: "dark:text-cyan-400", lightBorder: "border-cyan-400", darkBorder: "dark:border-cyan-500/80" }
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-${stat.color}-500/20 dark:to-${stat.color}-600/5 backdrop-blur-xl border ${stat.lightBorder} ${stat.darkBorder} rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors ${i === 3 ? 'border-2 dark:border-2 dark:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : ''}`}>
               <div className={`hidden dark:block absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/20 rounded-full blur-2xl`}></div>
               <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-4 ${stat.lightBg} ${stat.darkBg} border ${stat.lightBorder} ${stat.darkBorder} ${stat.lightText} ${stat.darkText} rounded-2xl`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight mb-1">{stat.label}</p>
                   <p className={`text-xl font-black ${stat.lightText} ${stat.darkText} mt-1 truncate`}>{stat.value}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Tambah Transaksi Form */}
        {showForm && (
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors mb-6 p-6 sm:p-8 relative">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-xl flex items-center gap-3 mb-6">
              <Plus className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /> Form Pencatatan Transaksi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClassName}><Type className="h-4 w-4"/> Jenis Transaksi</label>
                <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })} className={inputClassName}>
                  <option value="Pemasukan">Pemasukan Manual</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}><Hash className="h-4 w-4"/> Jumlah (Rp)</label>
                <input type="number" placeholder="Contoh: 150000" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}><Type className="h-4 w-4"/> Keterangan Detail</label>
                <input type="text" placeholder="Contoh: Biaya cetak banner" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}><Calendar className="h-4 w-4"/> Tanggal Transaksi</label>
                <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className={inputClassName} />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button 
                onClick={() => addMutation.mutate()} 
                disabled={addMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {addMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Simpan Pencatatan"}
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

        {/* Transaction List */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Jenis</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {data?.transaksiList.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Belum ada transaksi manual.</td></tr>
                ) : (
                  data?.transaksiList.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors duration-200">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">{new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${t.jenis === "Pemasukan" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"}`}>
                          {t.jenis}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{t.keterangan}</td>
                      <td className={`px-6 py-4 text-right font-bold font-mono ${t.jenis === "Pemasukan" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
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
    </div>
  );
}
