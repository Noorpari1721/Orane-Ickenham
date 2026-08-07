import { HTMLAttributes } from "react";
import clsx from "clsx";

interface LuxuryBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {}

export default function LuxuryBadge({
  children,
  className,
  ...props
}: LuxuryBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1 text-xs font-medium tracking-wider text-[#D4AF37]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}