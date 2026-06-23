import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export default function BackButton({ href, label = "Kembali", className = "" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-white/10 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}
