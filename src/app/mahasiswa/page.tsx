"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";

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
  "Belum Mendaftar": "bg-gray-100 text-gray-700",
  "Menunggu Validasi Keuangan": "bg-yellow-100 text-yellow-700",
  "Revisi Pembayaran": "bg-red-100 text-red-700",
  "Mengisi Biodata": "bg-blue-100 text-blue-700",
  "Menunggu Validasi Admin": "bg-yellow-100 text-yellow-700",
  "Revisi Berkas": "bg-red-100 text-red-700",
  "Revisi Beda Nama": "bg-orange-100 text-orange-700",
  "Lulus/Cetak Kartu": "bg-green-100 text-green-700",
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Mahasiswa</h1>
          <p className="text-sm text-gray-500">NIM: {data.username} — {data.namaLengkap || "Belum mengisi nama"}</p>
        </div>

        {flash && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              flash.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {flash.message}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status Pendaftaran</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[st] || "bg-gray-100"}`}>
                {st}
              </span>
            </div>
            {data.nomorUrut && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Nomor Urut</p>
                <p className="text-2xl font-bold text-green-600">#{String(data.nomorUrut).padStart(3, "0")}</p>
              </div>
            )}
          </div>

          {data.catatanKeuangan && (
            <div className="mt-3 bg-red-50 text-red-600 p-3 rounded text-sm">
              <strong>Catatan Keuangan:</strong> {data.catatanKeuangan}
            </div>
          )}
          {data.catatanAdmin && (
            <div className="mt-3 bg-orange-50 text-orange-600 p-3 rounded text-sm">
              <strong>Catatan Admin:</strong> {data.catatanAdmin}
            </div>
          )}
        </div>

        {/* Tahap 1: Upload Dokumen Awal */}
        {["Belum Mendaftar", "Revisi Pembayaran"].includes(st) && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tahap 1 — Upload Dokumen Awal</h2>
            <form onSubmit={handleTahap1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Bebas SKS (PDF/Gambar)</label>
                <input type="file" name="file_bebas_sks" accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran (PDF/Gambar)</label>
                <input type="file" name="file_bukti_pembayaran" accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm" required />
              </div>
              <button
                type="submit"
                disabled={uploadTahap1.isPending}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition"
              >
                {uploadTahap1.isPending ? "Mengunggah..." : "Unggah Dokumen"}
              </button>
            </form>
          </div>
        )}

        {/* Tahap 2: Isi Biodata */}
        {["Mengisi Biodata", "Revisi Berkas"].includes(st) && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tahap 2 — Pengisian Biodata</h2>
            <form onSubmit={handleBiodata} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (sesuai ijazah)</label>
                  <input type="text" name="nama_lengkap" defaultValue={data.namaLengkap || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                  <input type="text" name="nik" defaultValue={data.nik || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" defaultValue={data.tempatLahir || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input type="date" name="tanggal_lahir" defaultValue={data.tanggalLahir ? data.tanggalLahir.split("T")[0] : ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konsentrasi</label>
                  <input type="text" name="konsentrasi" defaultValue={data.konsentrasi || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Toga</label>
                  <select name="ukuran_toga" defaultValue={data.ukuranToga || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Pilih</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Skripsi</label>
                  <input type="text" name="judul_skripsi" defaultValue={data.judulSkripsi || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kaos</label>
                  <select name="ukuran_kaos" defaultValue={data.ukuranKaos || ""} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Pilih</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scan KTP (PDF/Gambar)</label>
                <input type="file" name="file_ktp" accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scan Ijazah SMA (PDF/Gambar)</label>
                <input type="file" name="file_ijazah_sma" accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm" required />
              </div>
              <button
                type="submit"
                disabled={submitBiodata.isPending}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition"
              >
                {submitBiodata.isPending ? "Menyimpan..." : "Simpan Biodata"}
              </button>
            </form>
          </div>
        )}

        {/* Revisi Beda Nama - Persetujuan Surat Pernyataan */}
        {st === "Revisi Beda Nama" && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Surat Pernyataan Beda Nama</h2>
            <p className="text-sm text-gray-600 mb-4">{data.catatanAdmin}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (!fd.get("persetujuan")) {
                  setFlash({ type: "error", message: "Anda harus mencentang persetujuan untuk melanjutkan." });
                  return;
                }
                setujuPernyataan.mutate();
              }}
              className="space-y-4"
            >
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="persetujuan" className="mt-1" />
                <span>
                  Saya menyatakan bahwa data diri saya pada KTP dan Ijazah SMA adalah benar milik saya yang sama, meskipun terdapat perbedaan penulisan nama. Saya bersedia menanggung segala akibat yang timbul.
                </span>
              </label>
              <button
                type="submit"
                disabled={setujuPernyataan.isPending}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition"
              >
                {setujuPernyataan.isPending ? "Menyimpan..." : "Setujui & Kirim"}
              </button>
            </form>
          </div>
        )}

        {/* Waiting states */}
        {st === "Menunggu Validasi Keuangan" && (
          <div className="bg-yellow-50 rounded-xl p-6 text-center">
            <p className="text-yellow-700 font-medium">Dokumen Anda sedang menunggu validasi dari bagian Keuangan.</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan cek kembali secara berkala.</p>
          </div>
        )}
        {st === "Menunggu Validasi Admin" && (
          <div className="bg-yellow-50 rounded-xl p-6 text-center">
            <p className="text-yellow-700 font-medium">Biodata Anda sedang menunggu validasi dari Admin.</p>
            <p className="text-yellow-600 text-sm mt-1">Silakan cek kembali secara berkala.</p>
          </div>
        )}

        {/* Lulus - Cetak Kartu */}
        {st === "Lulus/Cetak Kartu" && (
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <p className="text-green-700 font-medium text-lg">Selamat! Anda telah lulus validasi pendaftaran wisuda.</p>
            <p className="text-green-600 text-sm mt-1 mb-4">Nomor Urut Anda: <strong>#{String(data.nomorUrut).padStart(3, "0")}</strong></p>
            <a
              href="/mahasiswa/cetak-kartu"
              target="_blank"
              className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Cetak Kartu Peserta Wisuda
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
