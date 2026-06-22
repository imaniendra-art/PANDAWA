"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Download, Filter, ChevronDown, Loader2 } from "lucide-react";

export default function LaporanKeuanganPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["keuangan-laporan", selectedAngkatan],
    queryFn: async () => {
      const params = selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : "";
      const res = await fetch(`/api/keuangan/laporan${params}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Menyiapkan Laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Hero Section Control Center */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-6 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-visible z-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="w-full md:w-auto flex-1 relative z-10">
             <div className="flex items-center gap-3 mb-2">
               <Link href="/keuangan" className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline font-medium">&larr; Kembali ke Dashboard</Link>
             </div>
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Laporan Keuangan</h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Data Validasi Pembayaran Wisuda</p>
           </div>

           {/* Filter Angkatan Dropdown (Glassmorphism) */}
           <div className="relative z-50 w-full md:w-auto flex items-center gap-3">
             <div 
               className="group relative flex items-center gap-3 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 hover:border-cyan-400 dark:hover:border-cyan-500/50 rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex-1 md:flex-none"
               onClick={() => setDropdownOpen(!dropdownOpen)}
             >
               <Filter className="h-5 w-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
               <div className="text-sm font-bold text-slate-800 dark:text-white w-full md:w-56 pr-6 truncate">
                 {selectedAngkatan ? data?.semuaAngkatan.find((a: any) => a._id === selectedAngkatan)?.nama + (data?.semuaAngkatan.find((a: any) => a._id === selectedAngkatan)?.isActive ? " [Aktif]" : "") : "Wisuda Ke- ... (Semua)"}
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
                   {data?.semuaAngkatan.map((a: any) => (
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
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 relative z-10">
          <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide">Total Pemasukan:</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">Rp {(data?.totalPemasukanPendaftaran || 0).toLocaleString("id-ID")}</span>
          </div>

          <a
            href={`/api/keuangan/export${selectedAngkatan ? `?angkatanId=${selectedAngkatan}` : ""}`}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NIM</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4 text-center">Status Pembayaran</th>
                  <th className="px-6 py-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {data?.mahasiswaList.map((m: any, idx: number) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors duration-200">
                    <td className="px-6 py-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono text-cyan-600 dark:text-cyan-400 font-bold">{m.username}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{m.namaLengkap || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10">
                        {m.statusPendaftaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                      {m.catatanKeuangan || "-"}
                    </td>
                  </tr>
                ))}
                {data?.mahasiswaList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Belum ada data pendaftaran yang tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
