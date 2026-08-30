"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Orane Ickenham Home"
      className="group flex items-center"
    >
      <Image
        src="/images/logo/orane-logo.png"
        alt="Orane Nails Lashes Spa"
        width={400}
        height={130}
        priority
        className="h-auto w-[150px] object-contain transition-transform duration-300 group-hover:scale-[1.03] md:w-[175px]"
      />
    </Link>
  );
}