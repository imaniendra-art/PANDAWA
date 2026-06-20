"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { CheckCircle, AlertTriangle, Loader2, RefreshCw, FileText, CheckSquare, FileX, Search, ExternalLink, Wallet } from "lucide-react";

export default function AdminKeuanganPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && !["admin", "keuangan"].includes((session.user as any).role)) {
      router.replace("/");
    }
  }, [session, status, router]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-keuangan"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/keuangan/dashboard`);
      if (!res.ok) throw new Error("Gagal memuat data keuangan");
      return res.json();
    },
    enabled: status === "authenticated",
    refetchInterval: 5000,
  });

  const validateMutation = useMutation({
    mutationFn: async ({ studentId, action, catatanKeuangan }: { studentId: string; action: string; catatanKeuangan?: string }) => {
      const res = await fetch("/api/admin/keuangan/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, catatanKeuangan }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["admin-keuangan"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-emerald-600 dark:text-emerald-500 animate-spin mb-6" />
          <p className="text-emerald-700 dark:text-emerald-400 font-bold tracking-widest uppercase animate-pulse">Menyiapkan Panel Keuangan...</p>
        </div>
      </div>
    );
  }

  const actionBtnClass = "px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 text-white flex justify-center items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Flash Notifications */}
        {flash && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-bold shadow-md flex items-center gap-3 border ${flash.type === "success" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30" : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />} {flash.message}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-4 shadow-sm relative overflow-visible z-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="w-full flex-1 relative z-10 flex items-center gap-4">
             <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
               <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
             </div>
             <div>
               <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Otorisasi Keuangan</h1>
               <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Validasi Pembayaran Mahasiswa Pendaftar Wisuda</p>
             </div>
           </div>

           <button onClick={() => refetch()} className="p-2.5 bg-white/40 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all shadow-sm">
              <RefreshCw className="h-5 w-5" />
           </button>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Antrean Menunggu", value: data?.totalMenunggu || 0, icon: <Loader2 className="h-7 w-7" />, color: "amber" },
            { label: "Sudah Divalidasi", value: data?.validatedCount || 0, icon: <CheckCircle className="h-7 w-7" />, color: "emerald" },
            { label: "Perlu Revisi", value: data?.rejectedCount || 0, icon: <AlertTriangle className="h-7 w-7" />, color: "rose" }
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-${stat.color}-500/20 dark:to-${stat.color}-600/5 backdrop-blur-xl border border-slate-200 dark:border-${stat.color}-500/20 rounded-3xl p-6 relative overflow-hidden shadow-sm transition-colors`}>
               <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-500/20 border border-${stat.color}-100 dark:border-${stat.color}-500/30 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className={`text-4xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mt-1`}>{stat.value}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Table / Queue List */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl overflow-hidden transition-colors">
          <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-xl flex items-center gap-3">
              <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Daftar Antrean Verifikasi
            </h2>
          </div>

          {data?.mahasiswaList?.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <CheckSquare className="h-10 w-10" />
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-2xl mb-2 tracking-tight">Antrean Bersih</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Semua pembayaran pendaftar telah selesai diproses.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/5">
              {data?.mahasiswaList?.map((m: any) => (
                <div key={m._id} className="p-8 hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors duration-300">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Mahasiswa Info */}
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {m.namaLengkap ? m.namaLengkap.charAt(0).toUpperCase() : m.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{m.namaLengkap || "Identitas Anonim"}</p>
                        <p className="text-sm font-medium text-slate-500 font-mono mt-1">{m.username}</p>
                      </div>
                    </div>

                    {/* Dokumen Keuangan */}
                    <div className="flex gap-4">
                      {m.fileBuktiPembayaran && (
                        <a href={m.fileBuktiPembayaran} target="_blank" className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm">
                          <ExternalLink className="h-4 w-4" /> Bukti Bayar
                        </a>
                      )}
                      {m.fileBebasSks && (
                        <a href={m.fileBebasSks} target="_blank" className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-slate-200 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm">
                          <ExternalLink className="h-4 w-4" /> Bebas SKS/Keuangan
                        </a>
                      )}
                    </div>

                    {/* Aksi */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                        disabled={validateMutation.isPending}
                        className={`${actionBtnClass} bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]`}
                      >
                        <CheckSquare className="h-4 w-4" /> Validasi Lunas
                      </button>
                      <button
                        onClick={() => {
                          const catatan = prompt("Tuliskan alasan penolakan/perbaikan pembayaran:");
                          if(catatan) validateMutation.mutate({ studentId: m._id, action: "reject", catatanKeuangan: catatan });
                        }}
                        disabled={validateMutation.isPending}
                        className={`${actionBtnClass} bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-500 dark:to-red-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]`}
                      >
                        <FileX className="h-4 w-4" /> Tolak
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
