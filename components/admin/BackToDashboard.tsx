import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToDashboard() {
  return (
    <div className="mb-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Back to Dashboard</span>
      </Link>
    </div>
  );
}