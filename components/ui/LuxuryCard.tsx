import { HTMLAttributes } from "react";
import clsx from "clsx";

type LuxuryCardProps = HTMLAttributes<HTMLDivElement>;

export default function LuxuryCard({
  children,
  className,
  ...props
}: LuxuryCardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-[#D4AF37]/40 hover:shadow-[0_0_40px_rgba(212,175,55,.15)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
