"use client";

type NavLinksProps = {
  links: {
    name: string;
    href: string;
  }[];
  scrolled: boolean;
  onNavigate: (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => void;
};

export default function NavLinks({
  links,
  scrolled,
  onNavigate,
}: NavLinksProps) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          onClick={(e) => onNavigate(e, link.href)}
          className={`
            group
            relative
            text-[15px]
            font-medium
            tracking-wide
            transition-all
            duration-300
            ${
              scrolled
                ? "text-[#1A1A1A]"
                : "text-white"
            }
          `}
        >
          <span className="relative z-10 transition duration-300 group-hover:text-[#C49A45]">
            {link.name}
          </span>

          <span
            className="
              absolute
              -bottom-2
              left-0
              h-[2px]
              w-0
              rounded-full
              bg-[#C49A45]
              transition-all
              duration-300
              group-hover:w-full
            "
          />
        </a>
      ))}
    </>
  );
}
