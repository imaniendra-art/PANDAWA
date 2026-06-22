"use client";

import Link from "next/link";
import { Users, CheckSquare, FileText, Settings, ScanLine, Download, X } from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  role?: string;
}

export default function AdminSidebar({ isOpen, setIsOpen, role }: AdminSidebarProps) {
  if (role !== "admin" && role !== "keuangan") return null;

  const menuItems = [
    { href: "/admin/angkatan", icon: <Users className="h-5 w-5" />, label: "Gelombang" },
    { href: "/admin/kelola-user", icon: <CheckSquare className="h-5 w-5" />, label: "Data Pendaftar" },
    { href: "/admin/laporan", icon: <FileText className="h-5 w-5" />, label: "Riwayat Pemeriksaan" },
    { href: "/admin/settings", icon: <Settings className="h-5 w-5" />, label: "Konfigurasi" },
    { href: "/admin/scan", icon: <ScanLine className="h-5 w-5" />, label: "Scan QR Toga" },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Menu Navigasi
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-6 px-4 flex flex-col gap-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all group font-bold text-sm"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors">
                {item.icon}
              </div>
              {item.label}
            </Link>
          ))}
          
          <a 
            href="/api/admin/export-pddikti" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group font-bold text-sm mt-4 border border-dashed border-slate-300 dark:border-white/20 hover:border-emerald-300 dark:hover:border-emerald-500/50"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
              <Download className="h-5 w-5" />
            </div>
            Ekspor PDDikti
          </a>
        </div>
      </div>
    </>
  );
}
