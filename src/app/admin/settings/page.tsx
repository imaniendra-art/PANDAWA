"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-blue-600 text-sm hover:underline">&larr; Kembali</Link>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
        </div>

        {flash && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${flash.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {flash.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ketua Panitia Wisuda</label>
            <input type="text" value={form.ketuaPanitia} onChange={(e) => setForm({ ...form, ketuaPanitia: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIDN Ketua Panitia</label>
            <input type="text" value={form.nidnKetua} onChange={(e) => setForm({ ...form, nidnKetua: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Wisuda</label>
            <input type="text" value={form.biayaWisuda} onChange={(e) => setForm({ ...form, biayaWisuda: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <hr />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ketua Perguruan Tinggi</label>
            <input type="text" value={form.ketuaPt} onChange={(e) => setForm({ ...form, ketuaPt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIDN Ketua PT</label>
            <input type="text" value={form.nidnKetuaPt} onChange={(e) => setForm({ ...form, nidnKetuaPt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {saveMutation.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}
