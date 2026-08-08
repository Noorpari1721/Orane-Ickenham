"use client";

import Link from "next/link";

const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

export default function BookingNavLinks() {
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="
            group
            relative
            text-[15px]
            font-medium
            tracking-wide
            text-white/80
            transition-all
            duration-300
            hover:text-[#D4AF37]
          "
        >
          {link.name}

          <span
            className="
              absolute
              -bottom-2
              left-0
              h-[2px]
              w-0
              rounded-full
              bg-[#D4AF37]
              transition-all
              duration-300
              group-hover:w-full
            "
          />

        </Link>
      ))}
    </>
  );
}
