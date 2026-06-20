"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, Suspense } from "react";

function CetakSuratContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const angkatanId = searchParams.get("angkatanId") || "";

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const { data } = useQuery({
    queryKey: ["admin-laporan", angkatanId],
    queryFn: async () => {
      const params = angkatanId ? `?angkatanId=${angkatanId}` : "";
      const res = await fetch(`/api/admin/laporan${params}`);
      if (!res.ok) throw new Error("Gagal memuat");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  if (!data) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;

  const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const now = new Date();
  const tanggalCetak = `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold">SURAT REKOMENDASI</h1>
          <p className="text-sm">Nomor: ____/STIMI-YAPMI/____/2026</p>
          <p className="text-sm">Perihal: Rekomendasi Wisudawan {data.angkatanNama}</p>
        </div>

        <div className="text-sm space-y-3 mb-8">
          <p>Dengan hormat,</p>
          <p>Yang bertanda tangan di bawah ini, Ketua Panitia Wisuda STIMI YAPMI, dengan ini merekomendasikan {data.totalLulusan} orang mahasiswa yang telah memenuhi syarat untuk mengikuti Wisuda {data.angkatanNama}:</p>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
          <thead>
            <tr className="border-b-2">
              <th className="py-2 text-left w-10">No</th>
              <th className="py-2 text-left">NIM</th>
              <th className="py-2 text-left">Nama Lengkap</th>
              <th className="py-2 text-left">Konsentrasi</th>
            </tr>
          </thead>
          <tbody>
            {data.mahasiswaList.map((m: { _id: string; username: string; namaLengkap: string | null; konsentrasi: string | null }, idx: number) => (
              <tr key={m._id} className="border-b">
                <td className="py-1.5">{idx + 1}</td>
                <td className="py-1.5">{m.username}</td>
                <td className="py-1.5 font-medium">{m.namaLengkap}</td>
                <td className="py-1.5">{m.konsentrasi || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-sm space-y-2 mb-8">
          <p>Demikian surat rekomendasi ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
        </div>

        <div className="text-right text-sm">
          <p>Jakarta, {tanggalCetak}</p>
          <p className="font-semibold mt-1">Ketua Panitia Wisuda,</p>
          <p className="mt-16 underline font-medium">{data.settings?.ketuaPanitia || "-"}</p>
          <p>NIDN: {data.settings?.nidnKetua || "-"}</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <button onClick={() => window.print()} className="bg-blue-700 text-white px-8 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 print:hidden">
          Cetak Surat
        </button>
      </div>
    </div>
  );
}

export default function CetakSuratPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>}>
      <CetakSuratContent />
    </Suspense>
  );
}
