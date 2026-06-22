"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Settings, CheckCircle, AlertTriangle, Loader2, User, CreditCard, Building2, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const [form, setForm] = useState({
    ketuaPanitia: "", nidnKetua: "", biayaWisuda: "", ketuaPt: "", nidnKetuaPt: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Gagal memuat");
      const d = await res.json();
      setForm({
        ketuaPanitia: d.ketuaPanitia || "",
        nidnKetua: d.nidnKetua || "",
        biayaWisuda: d.biayaWisuda || "",
        ketuaPt: d.ketuaPt || "",
        nidnKetuaPt: d.nidnKetuaPt || "",
      });
      return d;
    },
    enabled: status === "authenticated",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      return res.json();
    },
    onSuccess: (d) => setFlash({ type: "success", message: d.message }),
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Memuat Konfigurasi...</p>
        </div>
      </div>
    );
  }

  const inputClassName = "w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none";
  const labelClassName = "block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Flash Notifications */}
        {flash && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-bold shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 border ${flash.type === "success" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30" : "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />} {flash.message}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl py-6 px-8 mb-8 shadow-sm dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors relative overflow-visible z-50 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="w-full relative z-10">
             <div className="flex items-center gap-3 mb-2">
               <Link href="/admin" className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline font-medium">&larr; Kembali ke Dashboard Admin</Link>
             </div>
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1 flex items-center gap-3">
               <Settings className="h-8 w-8 text-cyan-500" /> Konfigurasi Sistem
             </h1>
             <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium tracking-wide">Pengaturan Variabel Global Aplikasi</p>
           </div>
        </div>

        {/* Form Settings */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-colors p-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                <User className="h-5 w-5 text-cyan-500" /> Panitia Pelaksana
              </h3>
              <div>
                <label className={labelClassName}>Ketua Panitia Wisuda</label>
                <input type="text" placeholder="Nama Lengkap beserta Gelar" value={form.ketuaPanitia} onChange={(e) => setForm({ ...form, ketuaPanitia: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}>NIDN Ketua Panitia</label>
                <input type="text" placeholder="Nomor Induk Dosen Nasional" value={form.nidnKetua} onChange={(e) => setForm({ ...form, nidnKetua: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}><CreditCard className="h-4 w-4" /> Biaya Default Wisuda (Rp)</label>
                <input type="number" placeholder="Contoh: 1500000" value={form.biayaWisuda} onChange={(e) => setForm({ ...form, biayaWisuda: e.target.value })} className={inputClassName} />
                <p className="text-[10px] text-slate-500 mt-1">*Nilai ini akan digunakan sebagai default saat membuat angkatan baru.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                <Building2 className="h-5 w-5 text-cyan-500" /> Perguruan Tinggi
              </h3>
              <div>
                <label className={labelClassName}>Ketua Perguruan Tinggi</label>
                <input type="text" placeholder="Nama Lengkap Pimpinan PT beserta Gelar" value={form.ketuaPt} onChange={(e) => setForm({ ...form, ketuaPt: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}>NIDN Ketua PT</label>
                <input type="text" placeholder="Nomor Induk Dosen Nasional" value={form.nidnKetuaPt} onChange={(e) => setForm({ ...form, nidnKetuaPt: e.target.value })} className={inputClassName} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saveMutation.isPending ? "Menyimpan Konfigurasi..." : "Simpan Pengaturan"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
