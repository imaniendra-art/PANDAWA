"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";

interface KartuData {
  username: string;
  namaLengkap: string | null;
  nomorUrut: number | null;
  tanggalLahir: string | null;
  tempatLahir: string | null;
  konsentrasi: string | null;
  judulSkripsi: string | null;
  qrCodeToken: string | null;
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

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      return res.json();
    },
  });

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;

  const nomorUrut = String(data.nomorUrut || 0).padStart(3, "0");
  const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const now = new Date();
  const tanggalCetak = `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;

  const qrUrl = typeof window !== "undefined" && data.qrCodeToken 
    ? `${window.location.origin}/admin/scan/${data.qrCodeToken}` 
    : "";

  return (
    <div className="min-h-screen bg-gray-50 p-8 print:p-0 print:bg-white flex flex-col items-center">
      <div className="bg-white w-full max-w-2xl border-2 border-gray-800 rounded-xl p-8 print:border-none print:shadow-none shadow-lg">
        
        {/* Kop Surat */}
        <div className="flex justify-between items-center mb-6 border-b-4 border-gray-800 pb-4">
          <div className="w-20 h-20 relative">
            <Image 
              src="/images/logo-stimi.png" 
              alt="Logo STIMI" 
              fill
              className="object-contain" 
              priority
            />
          </div>
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-extrabold tracking-wide uppercase text-gray-900">STIMI YAPMI Makassar</h1>
            <p className="text-sm text-gray-700 font-semibold tracking-widest mt-1">BUKTI PENDAFTARAN WISUDA</p>
          </div>
          <div className="w-20 h-20 relative">
            <Image 
              src="/images/logo-berdampak.png" 
              alt="Logo Berdampak" 
              fill
              className="object-contain" 
              priority
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
          {/* Foto Placeholder & QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-200 w-[100px] h-[133px] border-2 border-gray-400 rounded flex flex-col items-center justify-center text-gray-500 text-xs font-semibold">
              <span className="mb-1">FOTO</span>
              <span>3x4</span>
            </div>

            {qrUrl ? (
              <div className="bg-white p-2 border-2 border-gray-300 rounded-lg flex flex-col items-center">
                <QRCode value={qrUrl} size={84} level="M" />
                <p className="text-[9px] mt-1 text-center font-mono text-gray-600">{data.qrCodeToken?.split('-')[0]}</p>
              </div>
            ) : (
               <div className="w-[100px] h-[100px] bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <span className="text-[10px] text-gray-400 text-center px-2">QR Code<br/>Belum Tersedia</span>
              </div>
            )}
          </div>

          {/* Tabel Data Mahasiswa */}
          <div className="flex-1 w-full">
             <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2.5 w-36 text-gray-600">No. Urut Wisuda</td><td className="py-2.5 text-lg">: <strong className="text-blue-800">{nomorUrut}</strong></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2.5 text-gray-600">NIM</td><td className="py-2.5 font-mono">: {data.username}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2.5 text-gray-600">Nama Lengkap</td><td className="py-2.5">: <strong className="text-gray-900">{data.namaLengkap}</strong></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2.5 text-gray-600">Tempat/Tgl Lahir</td><td className="py-2.5">: {data.tempatLahir}, {data.tanggalLahir ? new Date(data.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric'}) : "-"}</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2.5 text-gray-600">Konsentrasi</td><td className="py-2.5">: {data.konsentrasi}</td></tr>
                <tr><td className="py-2.5 text-gray-600 align-top">Judul Skripsi</td><td className="py-2.5 leading-relaxed">: {data.judulSkripsi}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-gray-100 pt-6 flex justify-between items-end text-sm">
          <div className="text-gray-500 text-xs max-w-xs">
            <p>* Kartu ini merupakan bukti sah pendaftaran wisuda.</p>
            <p className="mt-1">* Harap dibawa saat pengambilan Toga dan pelaksanaan Wisuda.</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Makassar, {tanggalCetak}</p>
            <p className="mt-1 font-bold text-gray-900">Ketua Panitia Wisuda,</p>
            <div className="h-20 flex items-center justify-center">
              {/* Tempat TTD */}
              <span className="text-gray-300 text-xs italic">Tanda Tangan & Cap</span>
            </div>
            <p className="underline font-bold text-gray-900">{settings?.ketuaPanitia || "-"}</p>
            <p className="text-gray-600 mt-0.5">NIDN. {settings?.nidnKetua || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-12 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Cetak Kartu PDF
        </button>
        <button
          onClick={() => router.push('/mahasiswa')}
          className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
