import Link from "next/link";

type ButtonProps = {
  text: string;
  href?: string;
  variant?: "primary" | "secondary";
};

export default function Button({
  text,
  href = "/booking",
  variant = "primary",
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300";

  const primaryClasses =
    "bg-[#D4B483] text-black hover:bg-white hover:text-black hover:scale-105 shadow-lg";

  const secondaryClasses =
    "border border-white text-white hover:bg-white hover:text-black hover:scale-105";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${
        variant === "primary" ? primaryClasses : secondaryClasses
      }`}
    >
      {text}
    </Link>
  );
}
