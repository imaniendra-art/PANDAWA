"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Users, Filter, CheckCircle, FileText, Settings, Download, Search, CheckSquare, XCircle, AlertTriangle, ScanLine, Loader2, FileCheck, FileX, ExternalLink } from "lucide-react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "admin") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

  useEffect(() => {
    // Fetch a futuristic dashboard/data processing animation
    fetch("https://assets9.lottiefiles.com/packages/lf20_t2v92oz8.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(() => {
        fetch("https://assets3.lottiefiles.com/packages/lf20_touohxv0.json")
          .then((res) => res.json())
          .then((data) => setAnimationData(data))
          .catch(console.error);
      });
  }, []);

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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Inisialisasi Konsol Admin...</p>
        </div>
      </div>
    );
  }

  const actionBtnClass = "px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 text-white flex justify-center items-center gap-2";
  const menuCardClass = "flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1 group";
  const menuIconClass = "h-8 w-8 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300";
  const menuTextClass = "font-bold text-slate-800 dark:text-white text-sm text-center";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Flash Notifications */}
        {flash && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-bold shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 border ${flash.type === "success" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30" : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />} {flash.message}
          </div>
        )}

        {/* Hero Section Control Center (Bento Block 1) */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-4 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           {/* Text Block */}
           <div className="w-full md:w-auto flex-1 relative z-10">
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1">Konsol Administratif</h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Control Center & Validasi Data Wisuda</p>
           </div>

           {/* Parameter Gelombang Inline */}
           <div className="relative z-10 w-full md:w-auto">
             <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 shadow-sm dark:shadow-inner">
               <Filter className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
               <select
                 value={selectedAngkatan}
                 onChange={(e) => setSelectedAngkatan(e.target.value)}
                 className="appearance-none bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer w-full md:w-64"
               >
                 <option value="" className="text-slate-800 dark:text-slate-200">Semua Gelombang (Global)</option>
                 {data?.semuaAngkatan.map((a) => (
                   <option key={a._id} value={a._id} className="text-slate-800 dark:text-slate-200">{a.nama} {a.isActive ? "[Aktif]" : ""}</option>
                 ))}
               </select>
             </div>
           </div>

           {/* Lottie Animation Compresed */}
           <div className="hidden lg:flex w-24 h-24 flex-shrink-0 relative z-10 items-center justify-center drop-shadow-xl">
             {animationData ? (
                <Lottie animationData={animationData} loop={true} />
             ) : (
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin"></div>
             )}
           </div>
        </div>

        {/* Main Navigation & Actions Grid (Bento Block 2) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <Link href="/admin/angkatan" className={menuCardClass}>
            <Users className={menuIconClass} />
            <span className={menuTextClass}>Gelombang</span>
          </Link>
          <Link href="/admin/kelola-user" className={menuCardClass}>
            <CheckSquare className={menuIconClass} />
            <span className={menuTextClass}>Otorisasi User</span>
          </Link>
          <Link href="/admin/laporan" className={menuCardClass}>
            <FileText className={menuIconClass} />
            <span className={menuTextClass}>Rekam Jejak</span>
          </Link>
          <Link href="/admin/settings" className={menuCardClass}>
            <Settings className={menuIconClass} />
            <span className={menuTextClass}>Konfigurasi</span>
          </Link>

          <Link href="/admin/scan" className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 border border-transparent dark:border-cyan-400/50 p-5 rounded-2xl shadow-lg hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:-translate-y-1 group">
            <ScanLine className="h-8 w-8 text-white group-hover:scale-110 group-hover:animate-pulse transition-transform duration-300" />
            <span className="font-bold text-white text-sm text-center">Scan QR Toga</span>
          </Link>
          <a href="/api/admin/export-pddikti" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-500 dark:to-teal-500 border border-transparent dark:border-emerald-400/50 p-5 rounded-2xl shadow-lg dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:-translate-y-1 group">
            <Download className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bold text-white text-sm text-center">Ekspor PDDikti</span>
          </a>
        </div>

        {/* Global Stats Panel (Bento Block 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Total Populasi", value: data?.totalPendaftar || 0, icon: <Users className="h-7 w-7" />, color: "blue", lightBg: "bg-blue-50", darkBg: "dark:bg-blue-500/20", lightText: "text-blue-600", darkText: "dark:text-blue-400", lightBorder: "border-blue-100", darkBorder: "dark:border-blue-500/30" },
            { label: "Antrean Validasi", value: data?.mahasiswaList.length || 0, icon: <Loader2 className="h-7 w-7" />, color: "amber", lightBg: "bg-amber-50", darkBg: "dark:bg-amber-500/20", lightText: "text-amber-600", darkText: "dark:text-amber-400", lightBorder: "border-amber-100", darkBorder: "dark:border-amber-500/30" },
            { label: "Disetujui Sistem", value: data?.validatedCount || 0, icon: <CheckCircle className="h-7 w-7" />, color: "emerald", lightBg: "bg-emerald-50", darkBg: "dark:bg-emerald-500/20", lightText: "text-emerald-600", darkText: "dark:text-emerald-400", lightBorder: "border-emerald-100", darkBorder: "dark:border-emerald-500/30" }
          ].map((stat, i) => (
            <div key={i} className={`bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-${stat.color}-500/20 dark:to-${stat.color}-600/5 backdrop-blur-xl border border-slate-200 dark:border-${stat.color}-500/20 rounded-3xl p-6 relative overflow-hidden shadow-sm dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors`}>
               <div className={`hidden dark:block absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/20 rounded-full blur-2xl`}></div>
               <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-4 ${stat.lightBg} ${stat.darkBg} border ${stat.lightBorder} ${stat.darkBorder} ${stat.lightText} ${stat.darkText} rounded-2xl`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className={`text-4xl font-black ${stat.lightText} ${stat.darkText} mt-1`}>{stat.value}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Validation Matrix Panel (Bento Block 4) */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors">
          <div className="px-8 py-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center backdrop-blur-md">
            <h2 className="font-extrabold text-slate-800 dark:text-white text-xl flex items-center gap-3">
              <Search className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /> Matrix Validasi Data
            </h2>
            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse"></span> {data?.mahasiswaList.length || 0} Menunggu
            </span>
          </div>

          {data?.mahasiswaList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
                 <CheckSquare className="h-10 w-10" />
              </div>
              <p className="text-slate-800 dark:text-white font-bold text-2xl mb-2 tracking-tight">Zona Validasi Bersih</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Sistem tidak mendeteksi adanya antrean dokumen pada parameter ini.</p>
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
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{m.namaLengkap || "Identitas Anonim"}</p>
                        <p className="text-sm font-medium text-slate-500 font-mono mt-1">{m.username}</p>
                      </div>
                    </div>
                    <button className="text-cyan-700 dark:text-cyan-500 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-cyan-600 hover:text-white transition-all shadow-sm">
                      {expandedId === m._id ? "Tutup Panel" : "Inspeksi Visual"}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${expandedId === m._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {expandedId === m._id && (
                    <div className="px-8 pb-8 pt-4 bg-slate-100/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> NIK</p>
                            <p className="font-mono font-medium text-slate-800 dark:text-slate-200">{m.nik || "Tidak Terdeteksi"}</p>
                         </div>
                         <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Biodata Lahir</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{m.tempatLahir || "-"}, {m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "-"}</p>
                         </div>
                         <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Filter className="h-3 w-3" /> Konsentrasi</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{m.konsentrasi || "-"}</p>
                         </div>
                         <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><User className="h-3 w-3" /> Dimensi Fisik</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Toga: <strong className="text-cyan-600 dark:text-cyan-400">{m.ukuranToga || "-"}</strong> <span className="text-slate-300 dark:text-slate-600">|</span> Kaos: <strong className="text-cyan-600 dark:text-cyan-400">{m.ukuranKaos || "-"}</strong></p>
                         </div>
                         <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-inner md:col-span-2 lg:col-span-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><FileText className="h-3 w-3" /> Manuskrip / Skripsi</p>
                            <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{m.judulSkripsi || "Kosong"}</p>
                         </div>
                      </div>

                      {/* Document Viewers */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        {m.fileKtp && (
                          <a href={m.fileKtp} target="_blank" className="flex-1 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 text-center py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-md flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Buka Lembar KTP
                          </a>
                        )}
                        {m.fileIjazahSma && (
                          <a href={m.fileIjazahSma} target="_blank" className="flex-1 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 text-center py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all shadow-sm dark:shadow-md flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Buka Lembar Ijazah
                          </a>
                        )}
                      </div>

                      {/* Action Matrix */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-300 dark:border-white/10">
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-500 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex-1`}
                        >
                          <FileCheck className="h-5 w-5" /> Otorisasi Bersih
                        </button>
                        <button
                          onClick={() => {
                            const catatan = prompt("Input log penolakan / instruksi revisi:");
                            if(catatan !== null) {
                              validateMutation.mutate({ studentId: m._id, action: "reject", catatanAdmin: catatan || undefined });
                            }
                          }}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-500 dark:to-red-600 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] flex-1`}
                        >
                          <FileX className="h-5 w-5" /> Tolak Berkas
                        </button>
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "reject_nama" })}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-500 dark:to-orange-500 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex-1`}
                        >
                          <AlertTriangle className="h-5 w-5" /> Flag: Beda Nama
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
