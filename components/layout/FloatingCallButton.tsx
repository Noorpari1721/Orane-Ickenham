import { Phone } from "lucide-react";

export default function FloatingCallButton() {
  return (
    <a
      href="tel:01895217151"
      aria-label="Call Orane Ickenham"
      className="
        fixed
        bottom-5
        right-5
        z-[60]
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        border
        border-[#D4AF37]/70
        bg-black/[0.72]
        text-[#D4AF37]
        shadow-[0_10px_30px_rgba(0,0,0,.48)]
        backdrop-blur-2xl
        backdrop-saturate-150
        transition-all
        duration-300
        hover:scale-105
        hover:bg-black/[0.82]
        hover:border-[#D4AF37]
        hover:shadow-[0_12px_35px_rgba(212,175,55,.28)]
        active:scale-90
        lg:hidden
      "
    >
      <Phone
        size={22}
        strokeWidth={1.8}
      />
    </a>
  );
}
