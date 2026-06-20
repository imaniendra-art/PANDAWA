"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

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
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={dashboardLink} className="font-bold text-xl tracking-wide">
          PANDAWA
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:inline">
            {session?.user?.name || session?.user?.email}
          </span>
          <span className="bg-blue-600 px-2 py-0.5 rounded text-xs capitalize">
            {role}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
