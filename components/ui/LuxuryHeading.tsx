import { ReactNode } from "react";
import clsx from "clsx";

interface LuxuryHeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function LuxuryHeading({
  title,
  subtitle,
  center = false,
  children,
  className,
}: LuxuryHeadingProps) {
  return (
    <div
      className={clsx(
        center && "text-center",
        className
      )}
    >
      {subtitle && (
        <p className="mb-3 text-sm uppercase tracking-[0.4em] text-[#D4AF37]">
          {subtitle}
        </p>
      )}

      <h2 className="text-4xl font-light tracking-wide text-white lg:text-5xl">
        {title}
      </h2>

      {children && (
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
          {children}
        </p>
      )}
    </div>
  );
}