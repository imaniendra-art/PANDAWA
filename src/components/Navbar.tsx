"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, GraduationCap, User } from "lucide-react";

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
    <nav className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={dashboardLink} className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white hover:text-cyan-400 transition-colors">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PANDAWA</span>
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <div className="hidden sm:flex items-center gap-3 text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-inner">
            <User className="h-4 w-4 text-cyan-400" />
            <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
            <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {role}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
