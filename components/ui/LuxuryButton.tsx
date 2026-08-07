"use client";

import Link from "next/link";

type LuxuryButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "gold" | "glass";
  className?: string;
};

export default function LuxuryButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "gold",
  className = "",
}: LuxuryButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-500 active:scale-95";

  const styles = {
    gold:
      "bg-[#C49A45] text-white shadow-xl hover:bg-[#b48833] hover:scale-105",

    glass:
      "border border-white/25 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 hover:scale-105",
  };

  const classes = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}