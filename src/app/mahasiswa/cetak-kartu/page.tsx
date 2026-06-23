"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Printer, ArrowLeft, User, Cake, MapPin, PenTool, GraduationCap } from "lucide-react";

interface KartuData {
  username: string;
  namaLengkap: string | null;
  nomorUrut: number | null;
  tanggalLahir: string | null;
  tempatLahir: string | null;
  konsentrasi: string | null;
  judulSkripsi: string | null;
  qrCodeToken: string | null;
  fileFotoUrl: string | null;
  ketuaPanitia: string | null;
  nidnKetua: string | null;
}

export default function CetakKartuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data } = useQuery<KartuData>({
    queryKey: ["mahasiswa-me"],
    queryFn: async () => {
      const res = await fetch("/api/mahasiswa/me");
      if (!res.ok) throw new Error("Gagal memuat data");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  if (!data) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-400 font-mono tracking-widest animate-pulse"><p>INITIALIZING...</p></div>;

  const nomorUrut = String(data.nomorUrut || 0).padStart(3, "0");
  const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const now = new Date();
  const tanggalCetak = `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;

  const qrUrl = typeof window !== "undefined" && data.qrCodeToken 
    ? `${window.location.origin}/admin/scan/${data.qrCodeToken}` 
    : "";

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex flex-col items-center font-sans print:py-0 print:bg-transparent overflow-auto">
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5; margin: 0; }
        @media print { 
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; } 
        }
      `}} />

      <div className="w-[148mm] min-h-[210mm] bg-white border border-gray-300 shadow-2xl relative z-10 print:border-none print:shadow-none p-8 flex flex-col">
        
        {/* Kop Surat */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-200 print:border-black pb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo STIMI" 
              fill
              className="object-contain" 
              priority
              unoptimized
            />
          </div>
          <div className="text-center flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-gray-900 print:text-black leading-none">STIMI YAPMI Makassar</h1>
            <p className="text-[10px] sm:text-xs text-gray-600 print:text-gray-700 font-bold tracking-[0.2em] mt-1.5 uppercase">Bukti Pendaftaran Wisuda</p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
            <Image 
              src="/logo-kb.png" 
              alt="Logo Berdampak" 
              fill
              className="object-contain" 
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
          {/* Foto & QR Code Section */}
          <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            {/* Foto Formal */}
            <div className="w-[100px] h-[133px] bg-gray-100 border border-gray-300 print:border-black rounded-lg flex flex-col items-center justify-center text-gray-400 print:text-gray-500 text-xs font-bold overflow-hidden relative">
              {data.fileFotoUrl ? (
                <Image src={data.fileFotoUrl} alt="Foto Formal" fill className="object-cover" unoptimized />
              ) : (
                <>
                  <User className="h-6 w-6 mb-1 opacity-50" />
                  <span className="mb-1">FOTO</span>
                  <span>3x4</span>
                </>
              )}
            </div>

            {/* QR Code */}
            {qrUrl ? (
              <div className="bg-white p-2.5 rounded-xl flex flex-col items-center border border-gray-200 print:border-black">
                <QRCode value={qrUrl} size={84} level="H" />
                <p className="text-[9px] mt-1 text-center font-mono text-gray-800 print:text-black font-bold tracking-widest">{data.qrCodeToken?.split('-')[0]}</p>
              </div>
            ) : (
               <div className="w-[100px] h-[100px] bg-gray-100 flex flex-col items-center justify-center border border-dashed border-gray-300 print:border-gray-400 rounded-xl">
                <span className="text-[10px] text-gray-400 print:text-gray-500 text-center px-2">QR Code<br/>Tertunda</span>
              </div>
            )}
          </div>

          {/* Tabel Data Mahasiswa */}
          <div className="flex-1 w-full bg-white print:bg-transparent rounded-2xl print:rounded-none p-5 print:p-0 border border-gray-100 print:border-none">
             <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                <tr>
                  <td className="py-3 w-40 text-gray-500 print:text-gray-600 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-gray-400 print:text-gray-500" /> No. Urut Wisuda</td>
                  <td className="py-3 text-lg">: <strong className="text-gray-900 print:text-black font-black tracking-widest">{nomorUrut}</strong></td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 print:text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-400 print:text-gray-500" /> NIM</td>
                  <td className="py-3 font-mono text-gray-700 print:text-black">: {data.username}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 print:text-gray-600 flex items-center gap-2"><User className="h-4 w-4 text-gray-400 print:text-gray-500" /> Nama Lengkap</td>
                  <td className="py-3 text-gray-900 print:text-black">: <strong className="text-gray-900 print:text-black tracking-wide">{data.namaLengkap}</strong></td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 print:text-gray-600 flex items-center gap-2"><Cake className="h-4 w-4 text-gray-400 print:text-gray-500" /> TTL</td>
                  <td className="py-3 text-gray-700 print:text-black">: {data.tempatLahir}, {data.tanggalLahir ? new Date(data.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric'}) : "-"}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 print:text-gray-600 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400 print:text-gray-500" /> Konsentrasi</td>
                  <td className="py-3 text-gray-700 print:text-black font-semibold">: {data.konsentrasi}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-500 print:text-gray-600 align-top flex items-start gap-2 mt-0.5"><PenTool className="h-4 w-4 text-gray-400 print:text-gray-500" /> Judul Skripsi</td>
                  <td className="py-3 text-gray-800 print:text-black leading-relaxed italic">: "{data.judulSkripsi}"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-200 print:border-black pt-6 flex justify-between items-end text-sm">
          <div className="text-gray-500 print:text-gray-600 text-[10px] sm:text-xs max-w-[200px] font-medium">
            <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 print:bg-black"></span> Kartu ini merupakan bukti sah pendaftaran wisuda.</p>
            <p className="flex items-center gap-1.5 mt-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 print:bg-black"></span> Harap dibawa saat pengambilan Toga dan pelaksanaan Wisuda.</p>
          </div>
          <div className="text-center w-full sm:w-auto text-gray-700 print:text-black">
            <p>Makassar, {tanggalCetak}</p>
            <p className="mt-1 font-bold text-gray-900 print:text-black">Ketua Panitia Wisuda,</p>
            <div className="h-20 flex items-center justify-center">
              {/* Cap Stempel Digital */}
              <div className="border-[3px] border-emerald-600/70 print:border-emerald-700 text-emerald-700/80 print:text-emerald-800 rounded-full px-5 py-1.5 transform -rotate-12 shadow-sm opacity-90">
                <span className="block text-[9px] font-black uppercase tracking-widest mb-0.5">Valid by App</span>
                <span className="block text-xs font-black uppercase tracking-[0.15em]">PANDAWA STIMI</span>
              </div>
            </div>
            <p className="underline font-bold tracking-wide text-gray-900 print:text-black">{data.ketuaPanitia || "-"}</p>
            <p className="text-xs text-gray-500 print:text-gray-600 font-mono mt-1">NIDN. {data.nidnKetua || "-"}</p>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="mt-8 mb-12 flex gap-4 print:hidden relative z-10">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <Printer className="h-4 w-4" /> Cetak Kartu Fisik
        </button>
        <button
          onClick={() => router.push('/mahasiswa')}
          className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
