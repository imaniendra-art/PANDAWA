"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LogIn, Loader2 } from "lucide-react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
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

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as { role: string }).role;
      router.replace(role === "admin" ? "/admin" : role === "keuangan" ? "/keuangan" : "/mahasiswa");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { username, password, redirect: false });

    if (result?.error) {
      setError("Username atau Password salah. Akses ditolak.");
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 font-sans selection:bg-cyan-500/30 text-slate-900 dark:text-slate-100 animate-in fade-in duration-500 transition-colors">
      
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 border-r border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-50 to-cyan-100 dark:from-blue-900/40 dark:via-slate-900 dark:to-cyan-900/40 z-0"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md h-80 mb-8 flex items-center justify-center z-10 drop-shadow-2xl">
          {animationData ? (
            <Lottie animationData={animationData} loop={true} />
          ) : (
             <div className="w-48 h-48 border-4 border-cyan-500/30 border-t-cyan-500 dark:border-t-cyan-400 rounded-full animate-spin"></div>
          )}
        </div>

        <div className="text-center max-w-lg z-10 relative">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Satu Langkah Lagi <br /> Menuju Gelar Impianmu. ✨
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Portal Pendaftaran Wisuda PANDAWA. Cepat, Paperless, dan Bebas Ribet. Wujudkan generasi Kampus Berdampak.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="flex justify-center items-center gap-6 mb-10">
            <img src="/logo-stimi.png" alt="Logo STIMI" className="h-16 w-auto object-contain drop-shadow-md dark:drop-shadow-lg" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150"; }} />
            <div className="w-px h-12 bg-slate-300 dark:bg-white/20"></div>
            <img src="/logo-berdampak.png" alt="Logo Berdampak" className="h-16 w-auto object-contain drop-shadow-md dark:drop-shadow-lg" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150"; }} />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Masuk PANDAWA</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Sistem Administrasi Wisuda Terpadu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-inner">
                <span className="animate-pulse">⚠️</span> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username (NIM)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan ID / NIM Anda"
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm dark:shadow-inner outline-none"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                {loading ? "Otentikasi..." : "Akses Sistem"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8 font-medium">
            Belum terdaftar di sistem?{" "}
            <Link href="/register" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 font-bold hover:underline transition-colors dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
              Registrasi Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
