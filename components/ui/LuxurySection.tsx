import { HTMLAttributes } from "react";
import clsx from "clsx";

interface LuxurySectionProps
  extends HTMLAttributes<HTMLElement> {}

export default function LuxurySection({
  children,
  className,
  ...props
}: LuxurySectionProps) {
  return (
    <section
      className={clsx(
        "py-24 lg:py-32",
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {children}
      </div>
    </section>
  );
}
