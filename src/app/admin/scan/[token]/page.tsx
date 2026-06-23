"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";

interface ScanData {
  id: string;
  username: string;
  namaLengkap: string | null;
  ukuranToga: string | null;
  statusToga: boolean;
  waktuAmbilToga: string | null;
}

export default function AdminScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (session?.user && !["admin", "keuangan"].includes((session.user as any).role)) {
      router.replace("/");
    }
  }, [status, session, router]);

  const { data, isLoading, isError, error } = useQuery<ScanData>({
    queryKey: ["admin-scan", token],
    queryFn: async () => {
      const res = await fetch(`/api/admin/scan?token=${token}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memuat data");
      }
      return res.json();
    },
    enabled: status === "authenticated" && !!token,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memproses penyerahan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scan", token] });
    },
  });

  if (isLoading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Memuat data...</p></div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <div className="mt-4 flex justify-center"><BackButton href="/admin/dashboard" label="Kembali" className="w-full justify-center" /></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col sm:justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-700 p-6 text-white text-center">
          <h1 className="text-2xl font-bold tracking-wide">PANDAWA SCANNER</h1>
          <p className="text-blue-100 text-sm mt-1">Verifikasi Pengambilan Toga</p>
        </div>

        {/* Profile Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-28 h-36 bg-gray-200 border-4 border-gray-100 shadow-sm rounded-lg mb-6 flex items-center justify-center text-gray-400 font-medium">
            FOTO
          </div>

          <div className="w-full space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NIM</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{data.username}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
              <p className="text-xl font-bold text-gray-900">{data.namaLengkap}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Ukuran Toga</p>
              <p className="text-3xl font-extrabold text-blue-900">{data.ukuranToga || "-"}</p>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {data.statusToga ? (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl text-center shadow-inner">
              <div className="font-bold flex items-center justify-center gap-2 text-lg mb-1">
                <span>⚠️</span> TOGA TELAH DIAMBIL
              </div>
              <p className="text-sm font-medium">
                PADA {data.waktuAmbilToga ? new Date(data.waktuAmbilToga).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }) : "-"}
              </p>
            </div>
          ) : (
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-5 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {submitMutation.isPending ? "MEMPROSES..." : "KONFIRMASI PENYERAHAN TOGA"}
            </button>
          )}

          {submitMutation.isError && (
            <p className="text-red-500 text-sm text-center mt-4 font-medium">{submitMutation.error.message}</p>
          )}
          
          <div className="mt-6 flex justify-center">
            <BackButton href="/admin/dashboard" label="Kembali ke Dashboard" className="w-full justify-center" />
          </div>
        </div>

      </div>
    </div>
  );
}
