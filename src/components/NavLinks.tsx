"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Pick a squad" },
  { href: "/table", label: "Table" },
  { href: "/players", label: "Players" },
  { href: "/match-centre", label: "Match centre" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 sm:gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-[#F6F3EA] text-[#0E1F1A]" : "text-[#F6F3EA]/75 hover:text-[#F6F3EA] hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
