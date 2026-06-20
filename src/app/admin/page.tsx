"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Users, Filter, CheckCircle, FileText, Settings, Download, Search, CheckSquare, XCircle, AlertTriangle, ScanLine, Loader2, FileCheck, FileX, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "admin") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Inisialisasi Konsol Admin...</p>
        </div>
      </div>
    );
  }

  const actionBtnClass = "px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 text-white flex justify-center items-center gap-2";
  const navLinkClass = "flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white hover:border-white/20 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-100 pb-12 animate-in fade-in duration-500">
      <Navbar />
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Console */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Konsol Administratif</h1>
            <p className="text-sm text-cyan-400 mt-2 font-medium tracking-wide">Control Center & Validasi Data Wisuda</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/scan" className="animate-pulse mr-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center gap-2 border border-cyan-400/50">
              <ScanLine className="h-5 w-5" /> Scan QR Toga
            </Link>
            <div className="h-8 w-px bg-white/20 hidden sm:block mx-1"></div>
            <Link href="/admin/angkatan" className={navLinkClass}><Users className="h-4 w-4" /> Gelombang</Link>
            <Link href="/admin/kelola-user" className={navLinkClass}><CheckSquare className="h-4 w-4" /> Otorisasi User</Link>
            <Link href="/admin/laporan" className={navLinkClass}><FileText className="h-4 w-4" /> Rekam Jejak</Link>
            <Link href="/admin/settings" className={navLinkClass}><Settings className="h-4 w-4" /> Konfigurasi</Link>
            <a href="/api/admin/export-pddikti" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center gap-2">
              <Download className="h-4 w-4" /> Ekspor PDDikti
            </a>
          </div>
        </div>

        {/* Global Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Populasi", value: data?.totalPendaftar || 0, icon: <Users className="h-7 w-7" />, color: "blue", gradient: "from-blue-500/20 to-blue-600/5", glow: "rgba(59,130,246,0.3)" },
            { label: "Antrean Validasi", value: data?.mahasiswaList.length || 0, icon: <Loader2 className="h-7 w-7" />, color: "amber", gradient: "from-amber-500/20 to-orange-600/5", glow: "rgba(245,158,11,0.3)" },
            { label: "Disetujui Sistem", value: data?.validatedCount || 0, icon: <CheckCircle className="h-7 w-7" />, color: "emerald", gradient: "from-emerald-500/20 to-teal-600/5", glow: "rgba(16,185,129,0.3)" }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border border-${stat.color}-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_${stat.glow}]`}>
               <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-500/20 rounded-full blur-2xl`}></div>
               <div className="flex items-center gap-5 relative z-10">
                 <div className={`p-4 bg-${stat.color}-500/20 border border-${stat.color}-500/30 text-${stat.color}-400 rounded-2xl`}>
                   {stat.icon}
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className={`text-4xl font-black text-${stat.color}-400 mt-1`}>{stat.value}</p>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Angkatan Filter Layer */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row sm:items-center gap-4 shadow-inner">
          <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" /> Parameter Gelombang:
          </label>
          <div className="relative w-full sm:w-72">
            <select
              value={selectedAngkatan}
              onChange={(e) => setSelectedAngkatan(e.target.value)}
              className="appearance-none w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none shadow-inner cursor-pointer"
            >
              <option value="">Semua Gelombang (Global)</option>
              {data?.semuaAngkatan.map((a) => (
                <option key={a._id} value={a._id}>{a.nama} {a.isActive ? "[Aktif]" : ""}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {flash && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 border ${flash.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />} {flash.message}
          </div>
        )}

        {/* Validation Matrix Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-md">
            <h2 className="font-extrabold text-white text-xl flex items-center gap-3">
              <Search className="h-5 w-5 text-cyan-400" /> Matrix Validasi Data
            </h2>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> {data?.mahasiswaList.length || 0} Menunggu
            </span>
          </div>

          {data?.mahasiswaList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-800/50 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                 <CheckSquare className="h-10 w-10" />
              </div>
              <p className="text-white font-bold text-2xl mb-2 tracking-tight">Zona Validasi Bersih</p>
              <p className="text-slate-400 text-sm">Sistem tidak mendeteksi adanya antrean dokumen pada parameter ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data?.mahasiswaList.map((m) => (
                <div key={m._id} className="group hover:bg-white/[0.03] transition-colors duration-300">
                  <div 
                    className="px-8 py-6 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/20">
                        {m.namaLengkap ? m.namaLengkap.charAt(0).toUpperCase() : m.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200 text-lg group-hover:text-cyan-400 transition-colors">{m.namaLengkap || "Identitas Anonim"}</p>
                        <p className="text-sm font-medium text-slate-500 font-mono mt-1">{m.username}</p>
                      </div>
                    </div>
                    <button className="text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-cyan-500 hover:text-white transition-all shadow-sm">
                      {expandedId === m._id ? "Tutup Panel" : "Inspeksi Visual"}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${expandedId === m._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {expandedId === m._id && (
                    <div className="px-8 pb-8 pt-4 bg-black/20 border-t border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> NIK</p>
                            <p className="font-mono font-medium text-slate-200">{m.nik || "Tidak Terdeteksi"}</p>
                         </div>
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Biodata Lahir</p>
                            <p className="font-medium text-slate-200">{m.tempatLahir || "-"}, {m.tanggalLahir ? new Date(m.tanggalLahir).toLocaleDateString("id-ID") : "-"}</p>
                         </div>
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Filter className="h-3 w-3" /> Konsentrasi</p>
                            <p className="font-medium text-slate-200">{m.konsentrasi || "-"}</p>
                         </div>
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><User className="h-3 w-3" /> Dimensi Fisik</p>
                            <p className="font-medium text-slate-200">Toga: <strong className="text-cyan-400">{m.ukuranToga || "-"}</strong> <span className="text-slate-600">|</span> Kaos: <strong className="text-cyan-400">{m.ukuranKaos || "-"}</strong></p>
                         </div>
                         <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 shadow-inner md:col-span-2 lg:col-span-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><FileText className="h-3 w-3" /> Manuskrip / Skripsi</p>
                            <p className="font-medium text-slate-200 leading-relaxed">{m.judulSkripsi || "Kosong"}</p>
                         </div>
                      </div>

                      {/* Document Viewers */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        {m.fileKtp && (
                          <a href={m.fileKtp} target="_blank" className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-center py-4 rounded-2xl font-bold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-md flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Buka Lembar KTP
                          </a>
                        )}
                        {m.fileIjazahSma && (
                          <a href={m.fileIjazahSma} target="_blank" className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-center py-4 rounded-2xl font-bold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-md flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Buka Lembar Ijazah
                          </a>
                        )}
                      </div>

                      {/* Action Matrix */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "approve" })}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex-1`}
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
                          className={`${actionBtnClass} bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] flex-1`}
                        >
                          <FileX className="h-5 w-5" /> Tolak Berkas
                        </button>
                        <button
                          onClick={() => validateMutation.mutate({ studentId: m._id, action: "reject_nama" })}
                          disabled={validateMutation.isPending}
                          className={`${actionBtnClass} bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex-1`}
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
