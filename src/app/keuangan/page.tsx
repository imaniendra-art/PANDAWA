"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Wallet, CheckSquare, Users, Loader2, CheckCircle, AlertTriangle, ChevronDown, FileX, Search, FileText, ExternalLink, X } from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "keuangan") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

  const { data, isLoading, refetch } = useQuery<KeuanganData>({
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Menyiapkan Pusat Layanan...</p>
        </div>
      </div>
    );
  }

  const actionBtnClass = "px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 text-white flex justify-center items-center gap-2";

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

        {/* Hero Section Control Center */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-6 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-visible z-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="w-full md:w-auto flex-1 relative z-10">
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Dashboard Keuangan</h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Pusat Validasi Pembayaran Wisuda</p>
           </div>

           {/* Filter Angkatan Dropdown (Glassmorphism) */}
           <div className="relative z-50 w-full md:w-auto flex items-center gap-3">
             <div 
               className="group relative flex items-center gap-3 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 hover:border-cyan-400 dark:hover:border-cyan-500/50 rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex-1 md:flex-none"
               onClick={() => setDropdownOpen(!dropdownOpen)}
             >
               <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
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
        </div>

        <div className="flex gap-2 mb-6">
          <Link href="/keuangan/buku-kas" className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">Buku Kas</Link>
          <Link href="/keuangan/laporan" className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">Laporan</Link>
        </div>

        {/* Global Stats Panel (Bento Block) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Menunggu Validasi", value: data?.mahasiswaList.length || 0, icon: <Loader2 className="h-7 w-7" />, color: "amber", lightBg: "bg-amber-50", darkBg: "dark:bg-amber-500/20", lightText: "text-amber-600", darkText: "dark:text-amber-400", lightBorder: "border-amber-100", darkBorder: "dark:border-amber-500/30" },
            { label: "Sudah Divalidasi", value: data?.validatedCount || 0, icon: <CheckCircle className="h-7 w-7" />, color: "emerald", lightBg: "bg-emerald-50", darkBg: "dark:bg-emerald-500/20", lightText: "text-emerald-600", darkText: "dark:text-emerald-400", lightBorder: "border-emerald-100", darkBorder: "dark:border-emerald-500/30" },
            { label: "Total Pemasukan", value: `Rp ${(data?.totalPemasukanPendaftaran || 0).toLocaleString("id-ID")}`, subtext: `@ Rp ${(data?.biayaPerMhs || 0).toLocaleString("id-ID")} / mhs`, icon: <Wallet className="h-7 w-7" />, color: "teal", lightBg: "bg-teal-50", darkBg: "dark:bg-teal-500/20", lightText: "text-teal-600", darkText: "dark:text-teal-400", lightBorder: "border-teal-100", darkBorder: "dark:border-teal-500/30" }
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-${stat.color}-500/20 dark:to-${stat.color}-600/5 backdrop-blur-xl border border-slate-200 dark:border-${stat.color}-500/20 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors`}>
               <div className={`hidden dark:block absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/20 rounded-full blur-2xl`}></div>
               <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-4 ${stat.lightBg} ${stat.darkBg} border ${stat.lightBorder} ${stat.darkBorder} ${stat.lightText} ${stat.darkText} rounded-2xl`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className={`text-2xl lg:text-3xl font-black ${stat.lightText} ${stat.darkText} mt-1 truncate`}>{stat.value}</p>
                   {stat.subtext && <p className="text-xs text-slate-500 mt-1 font-mono">{stat.subtext}</p>}
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Validation Matrix Panel */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors">
          <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center backdrop-blur-md">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-xl flex items-center gap-3">
              <Search className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /> Antrean Validasi Keuangan
            </h2>
          </div>

          {data?.mahasiswaList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
                 <CheckSquare className="h-10 w-10" />
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-2xl mb-2 tracking-tight">Antrean Kosong</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tidak ada berkas pembayaran yang perlu divalidasi saat ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/5">
              {data?.mahasiswaList.map((m) => (
                <div key={m._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors duration-300">
                  <div 
                    className="px-8 py-6 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/20">
                        {m.namaLengkap ? m.namaLengkap.charAt(0).toUpperCase() : m.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {m.namaLengkap || "Identitas Anonim"}
                        </p>
                        <p className="text-sm font-medium text-slate-500 font-mono mt-1">{m.username}</p>
                      </div>
                    </div>
                    <button className="text-cyan-700 dark:text-cyan-500 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-cyan-600 hover:text-white transition-all shadow-sm">
                      {expandedId === m._id ? "Tutup Panel" : "Lihat Bukti"}
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expandedId === m._id ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {expandedId === m._id && (
                    <div className="px-8 pb-8 pt-4 bg-slate-100/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {m.fileBebasSks && (
                          <button onClick={() => setPreviewUrl(m.fileBebasSks!)} className="flex-1 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all shadow-sm flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Bukti Bebas SKS
                          </button>
                        )}
                        {m.fileBuktiPembayaran && (
                          <button onClick={() => setPreviewUrl(m.fileBuktiPembayaran!)} className="flex-1 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 py-4 rounded-2xl font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all shadow-sm flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Bukti Pembayaran
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-500 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex-1`}
                        >
                          <CheckSquare className="h-5 w-5" /> Setujui Pembayaran
                        </button>
                        <button
                          onClick={() => {
                            const catatan = prompt("Catatan revisi untuk mahasiswa:");
                            if(catatan) {
                              validateMutation.mutate({ studentId: m._id, action: "reject", catatanKeuangan: catatan });
                            }
                          }}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-500 dark:to-red-600 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] flex-1`}
                        >
                          <FileX className="h-5 w-5" /> Tolak / Minta Revisi
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

      {/* Modal Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 sm:p-6" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Pratinjau Dokumen
              </h3>
              <button onClick={() => setPreviewUrl(null)} className="text-slate-500 hover:text-rose-500 bg-slate-200/50 hover:bg-rose-100 dark:bg-white/10 dark:hover:bg-rose-500/20 p-2 rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-200/50 dark:bg-black/20 p-2">
              <iframe src={previewUrl} className="w-full h-full rounded-xl bg-white dark:bg-slate-800" title="Preview" />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center">
              <a href={previewUrl} target="_blank" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" /> Buka di Tab Baru
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
