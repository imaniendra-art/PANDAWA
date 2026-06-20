"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Upload, User, CheckCircle, AlertCircle, Printer, Loader2, Save, FileText, FileCheck } from "lucide-react";

interface MahasiswaData {
  id: string;
  username: string;
  namaLengkap: string | null;
  statusPendaftaran: string;
  catatanKeuangan: string | null;
  catatanAdmin: string | null;
  nomorUrut: number | null;
  tanggalLahir: string | null;
  tempatLahir: string | null;
  nik: string | null;
  konsentrasi: string | null;
  judulSkripsi: string | null;
  ukuranToga: string | null;
  ukuranKaos: string | null;
  fileSuratPernyataan: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  "Belum Mendaftar": "bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  "Menunggu Validasi Keuangan": "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  "Revisi Pembayaran": "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  "Mengisi Biodata": "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  "Menunggu Validasi Admin": "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
  "Revisi Berkas": "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  "Revisi Beda Nama": "bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]",
  "Lulus/Cetak Kartu": "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
};

export default function MahasiswaDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [flash, setFlash] = useState<{ type: string; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user && (session.user as { role: string }).role !== "mahasiswa") {
      router.replace("/" + (session.user as { role: string }).role);
    }
  }, [session, status, router]);

  const { data, isLoading } = useQuery<MahasiswaData>({
    queryKey: ["mahasiswa-me"],
    queryFn: async () => {
      const res = await fetch("/api/mahasiswa/me");
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const uploadTahap1 = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/mahasiswa/upload-tahap1", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["mahasiswa-me"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  const submitBiodata = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/mahasiswa/submit-biodata", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["mahasiswa-me"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  const setujuPernyataan = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mahasiswa/setuju-pernyataan", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: (d) => {
      setFlash({ type: "success", message: d.message });
      queryClient.invalidateQueries({ queryKey: ["mahasiswa-me"] });
    },
    onError: (e: Error) => setFlash({ type: "error", message: e.message }),
  });

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-cyan-600 dark:text-cyan-500 animate-spin mb-6" />
          <p className="text-cyan-700 dark:text-cyan-400 font-bold tracking-widest uppercase animate-pulse">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const st = data.statusPendaftaran;

  const handleTahap1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    uploadTahap1.mutate(fd);
  };

  const handleBiodata = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submitBiodata.mutate(fd);
  };

  const inputClassName = "w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none";
  const labelClassName = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
  const cardClassName = "bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-8 relative overflow-hidden transition-colors";
  const fileInputClass = "w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-cyan-100 dark:file:bg-cyan-500/20 file:text-cyan-700 dark:file:text-cyan-300 hover:file:bg-cyan-200 dark:hover:file:bg-cyan-500/30 file:transition-all cursor-pointer bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl p-1 shadow-sm dark:shadow-none";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 pb-12 animate-in fade-in duration-500 transition-colors">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Dashboard */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">Portal Mahasiswa</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium flex items-center gap-2 justify-center sm:justify-start">
              <User className="h-4 w-4 text-cyan-600 dark:text-cyan-500" />
              {data.username} <span className="text-slate-300 dark:text-white/20">|</span> <span className="text-cyan-600 dark:text-cyan-400">{data.namaLengkap || "Identitas Belum Lengkap"}</span>
            </p>
          </div>
        </div>

        {flash && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-inner border ${flash.type === "success" ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"}`}>
            {flash.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5 animate-pulse" />} 
            {flash.message}
          </div>
        )}

        {/* Status Card */}
        <div className={cardClassName}>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Status Sistem</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-md ${STATUS_BADGE[st] || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                {st}
              </span>
            </div>
            {data.nomorUrut && (
              <div className="sm:text-right bg-slate-100 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Nomor Urut Kelulusan</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
                  #{String(data.nomorUrut).padStart(3, "0")}
                </p>
              </div>
            )}
          </div>

          {data.catatanKeuangan && (
            <div className="mt-6 bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 p-5 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-sm shadow-inner relative z-10">
              <strong className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400"><AlertCircle className="h-5 w-5" /> Catatan Otoritas Keuangan:</strong> 
              <p className="leading-relaxed">{data.catatanKeuangan}</p>
            </div>
          )}
          {data.catatanAdmin && (
            <div className="mt-6 bg-orange-100 dark:bg-orange-500/10 text-orange-800 dark:text-orange-300 p-5 rounded-2xl border border-orange-200 dark:border-orange-500/20 text-sm shadow-inner relative z-10">
              <strong className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400"><AlertCircle className="h-5 w-5" /> Instruksi Revisi Admin:</strong> 
              <p className="leading-relaxed">{data.catatanAdmin}</p>
            </div>
          )}
        </div>

        {/* Tahap 1 */}
        {["Belum Mendaftar", "Revisi Pembayaran"].includes(st) && (
          <div className={cardClassName}>
            <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Fase 1: Transmisi Dokumen</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Unggah instrumen pembayaran dan bukti kelulusan SKS dalam format PDF/Gambar.</p>
            </div>
            
            <form onSubmit={handleTahap1} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Berkas Bebas SKS</label>
                  <input type="file" name="file_bebas_sks" accept=".pdf,.png,.jpg,.jpeg" className={fileInputClass} required />
                </div>
                <div>
                  <label className={labelClassName}>Bukti Pembayaran Valid</label>
                  <input type="file" name="file_bukti_pembayaran" accept=".pdf,.png,.jpg,.jpeg" className={fileInputClass} required />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploadTahap1.isPending}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {uploadTahap1.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {uploadTahap1.isPending ? "Mentransmisi..." : "Mulai Unggah"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tahap 2 */}
        {["Mengisi Biodata", "Revisi Berkas"].includes(st) && (
          <div className={cardClassName}>
            <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 relative z-10">
              <div className="inline-flex items-center justify-center p-3 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-xl mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Fase 2: Registrasi Identitas</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Sinkronisasi data sistem dengan dokumen KTP dan Ijazah resmi.</p>
            </div>

            <form onSubmit={handleBiodata} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className={labelClassName}>Nama Lengkap Resmi</label>
                  <input type="text" name="nama_lengkap" defaultValue={data.namaLengkap || ""} className={inputClassName} placeholder="Sesuai cetakan ijazah" required />
                </div>
                <div>
                  <label className={labelClassName}>Nomor Induk Kependudukan (NIK)</label>
                  <input 
                    type="text" 
                    name="nik" 
                    defaultValue={data.nik || ""} 
                    className={inputClassName} 
                    placeholder="16 Digit Angka"
                    required 
                    minLength={16} 
                    maxLength={16} 
                    pattern="[0-9]{16}" 
                  />
                </div>
                <div>
                  <label className={labelClassName}>Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" defaultValue={data.tempatLahir || ""} className={inputClassName} required />
                </div>
                <div>
                  <label className={labelClassName}>Tanggal Lahir</label>
                  <input type="date" name="tanggal_lahir" defaultValue={data.tanggalLahir ? data.tanggalLahir.split("T")[0] : ""} className={inputClassName} required />
                </div>
                <div>
                  <label className={labelClassName}>Program / Konsentrasi</label>
                  <input type="text" name="konsentrasi" defaultValue={data.konsentrasi || ""} className={inputClassName} required />
                </div>
                <div>
                  <label className={labelClassName}>Spesifikasi Toga</label>
                  <select name="ukuran_toga" defaultValue={data.ukuranToga || ""} className={inputClassName} required>
                    <option value="" disabled className="bg-slate-100 dark:bg-slate-900 text-slate-500">Pilih Dimensi</option>
                    {["S","M","L","XL","XXL"].map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClassName}>Judul Karya Ilmiah / Skripsi</label>
                  <input type="text" name="judul_skripsi" defaultValue={data.judulSkripsi || ""} className={inputClassName} required />
                </div>
                <div>
                  <label className={labelClassName}>Spesifikasi Kaos</label>
                  <select name="ukuran_kaos" defaultValue={data.ukuranKaos || ""} className={inputClassName} required>
                    <option value="" disabled className="bg-slate-100 dark:bg-slate-900 text-slate-500">Pilih Dimensi</option>
                    {["S","M","L","XL","XXL"].map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 mt-4 border-t border-slate-200 dark:border-white/10">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                  <label className={labelClassName}>Scan Identitas (KTP)</label>
                  <p className="text-xs text-cyan-600 dark:text-cyan-500/70 mb-4">Resolusi tinggi (PDF/Gambar)</p>
                  <input type="file" name="file_ktp" accept=".pdf,.png,.jpg,.jpeg" className={fileInputClass} required />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                  <label className={labelClassName}>Scan Legalitas (Ijazah SMA)</label>
                  <p className="text-xs text-cyan-600 dark:text-cyan-500/70 mb-4">Resolusi tinggi (PDF/Gambar)</p>
                  <input type="file" name="file_ijazah_sma" accept=".pdf,.png,.jpg,.jpeg" className={fileInputClass} required />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                <button
                  type="submit"
                  disabled={submitBiodata.isPending}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitBiodata.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {submitBiodata.isPending ? "Merekam ke Sistem..." : "Simpan Biodata"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Revisi Beda Nama */}
        {st === "Revisi Beda Nama" && (
          <div className={`${cardClassName} border-orange-300 dark:border-orange-500/30 shadow-lg dark:shadow-[0_0_30px_rgba(249,115,22,0.15)]`}>
            <div className="mb-6 border-b border-orange-200 dark:border-orange-500/20 pb-4 relative z-10">
              <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-3">
                <AlertCircle className="h-6 w-6" /> Otentikasi Beda Nama
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-6 bg-orange-100 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-200 dark:border-orange-500/20 leading-relaxed relative z-10">{data.catatanAdmin}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (!fd.get("persetujuan")) {
                  setFlash({ type: "error", message: "Otorisasi wajib disetujui." });
                  return;
                }
                setujuPernyataan.mutate();
              }}
              className="space-y-6 relative z-10"
            >
              <label className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors shadow-sm dark:shadow-none">
                <input type="checkbox" name="persetujuan" className="mt-1 w-5 h-5 accent-cyan-600 dark:accent-cyan-500 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-white/20 rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Saya memberikan otorisasi digital bahwa data KTP dan Ijazah SMA merujuk pada individu yang sama. Saya bertanggung jawab penuh atas konsistensi identitas ini dalam sistem kampus.
                </span>
              </label>
              <button
                type="submit"
                disabled={setujuPernyataan.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(249,115,22,0.3)] dark:hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {setujuPernyataan.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <FileCheck className="h-4 w-4" />}
                Setujui & Transmisikan
              </button>
            </form>
          </div>
        )}

        {/* Wait States */}
        {st === "Menunggu Validasi Keuangan" && (
          <div className="bg-amber-50 dark:bg-amber-500/10 backdrop-blur-xl border border-amber-200 dark:border-amber-500/20 rounded-3xl p-10 text-center shadow-lg dark:shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/50 dark:bg-amber-500/10 rounded-full blur-2xl"></div>
             <Loader2 className="h-16 w-16 text-amber-500 dark:text-amber-400 animate-spin mx-auto mb-6 relative z-10" />
            <p className="text-amber-700 dark:text-amber-400 font-extrabold text-2xl tracking-tight mb-2 relative z-10">Otorisasi Keuangan Tertunda</p>
            <p className="text-amber-600 dark:text-amber-200/70 text-sm font-medium max-w-md mx-auto relative z-10">Sistem sedang menunggu sinyal validasi dari otoritas keuangan. Siklus maksimal memakan waktu 2x24 jam.</p>
          </div>
        )}
        
        {st === "Menunggu Validasi Admin" && (
          <div className="bg-cyan-50 dark:bg-cyan-500/10 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-3xl p-10 text-center shadow-lg dark:shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden transition-colors">
             <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-200/50 dark:bg-cyan-500/10 rounded-full blur-2xl"></div>
             <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-inner dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               <FileText className="h-8 w-8 animate-pulse" />
             </div>
            <p className="text-cyan-800 dark:text-cyan-400 font-extrabold text-2xl tracking-tight mb-2 relative z-10">Analisis Berkas Sedang Berjalan</p>
            <p className="text-cyan-700 dark:text-cyan-200/70 text-sm font-medium max-w-md mx-auto relative z-10">Admin sistem sedang melakukan verifikasi integritas data Anda. Silakan bersabar memonitor terminal ini.</p>
          </div>
        )}

        {/* Lulus / Cetak Kartu */}
        {st === "Lulus/Cetak Kartu" && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-12 text-center shadow-xl dark:shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-100/50 dark:from-emerald-900/20 to-transparent"></div>
             <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-300 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-inner dark:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
               <CheckCircle className="h-12 w-12" />
             </div>
            <p className="text-emerald-800 dark:text-emerald-400 font-black text-3xl tracking-tight mb-3 relative z-10 drop-shadow-sm dark:drop-shadow-md">Validasi Berhasil Disetujui</p>
            <p className="text-emerald-700 dark:text-emerald-200/80 font-medium mb-10 text-lg relative z-10">Identitas dan transmisi berkas wisuda Anda telah dikunci di dalam sistem.</p>
            
            <a
              href="/mahasiswa/cetak-kartu"
              target="_blank"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-500 dark:to-cyan-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg dark:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-xl dark:hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all duration-300 ease-in-out transform hover:-translate-y-1 relative z-10"
            >
              <Printer className="h-5 w-5" />
              UNDUH KARTU DIGITAL
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
