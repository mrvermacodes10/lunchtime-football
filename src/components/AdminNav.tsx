"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/admin";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/managers", label: "Managers" },
  { href: "/admin/squads", label: "Squads" },
  { href: "/admin/gameweeks", label: "Gameweeks" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/table", label: "League table" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-full sm:w-56 sm:min-h-screen bg-[#0E1F1A] text-[#F6F3EA] sm:sticky sm:top-0 sm:self-start flex sm:flex-col">
      <div className="p-5 hidden sm:block">
        <div className="font-display font-semibold">Lunchtime Football</div>
        <div className="text-xs text-[#F6F3EA]/60">Signed in as {username}</div>
      </div>
      <nav className="flex sm:flex-col gap-1 p-3 overflow-x-auto sm:overflow-visible flex-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                active ? "bg-[#F6F3EA] text-[#0E1F1A]" : "text-[#F6F3EA]/75 hover:bg-white/10 hover:text-[#F6F3EA]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="p-3 hidden sm:block">
        <button className="w-full text-left rounded-md px-3 py-2 text-sm font-medium text-[#F6F3EA]/75 hover:bg-white/10 hover:text-[#F6F3EA]">
          Sign out
        </button>
      </form>
    </aside>
  );
}
