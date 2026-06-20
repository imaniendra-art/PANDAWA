"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, GraduationCap, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const dashboardLink =
    role === "admin"
      ? "/admin"
      : role === "keuangan"
      ? "/keuangan"
      : "/mahasiswa";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={dashboardLink} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-shadow">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 leading-none mb-0.5">PANDAWA STIMI</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase leading-none hidden sm:block">Pusat Administrasi Pendaftaran Wisuda</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 sm:gap-5 text-sm">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-full shadow-inner">
            <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
            <span className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {role}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/30 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-sm dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
