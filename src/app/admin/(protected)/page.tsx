import { prisma } from "@/lib/prisma";
import { getSettings, getCurrentGameweek, getLeagueTable } from "@/lib/data";
import Link from "next/link";

export default async function AdminDashboard() {
  const [settings, gw, playerCount, managerCount, table, matchCount] = await Promise.all([
    getSettings(),
    getCurrentGameweek(),
    prisma.player.count(),
    prisma.manager.count(),
    getLeagueTable(),
    prisma.match.count(),
  ]);
  const leader = table[0];

  const stats = [
    { label: "Current gameweek", value: gw ? `GW${gw.number}` : "None set" },
    { label: "Players", value: playerCount },
    { label: "Managers", value: managerCount },
    { label: "League leader", value: leader ? `${leader.managerName} — ${leader.totalPoints} pts` : "No squads yet" },
    { label: "Transfer window", value: settings.transferWindowOpen ? "Open" : "Shut" },
    { label: "Matches recorded", value: matchCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-[#8a8471] mt-1">
        {settings.leagueName} · {settings.season}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xs uppercase tracking-wide text-[#8a8471] font-semibold">{s.label}</div>
            <div className="mt-1 font-display text-xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/players" className="btn-secondary">
          Manage players
        </Link>
        <Link href="/admin/gameweeks" className="btn-secondary">
          Manage gameweeks
        </Link>
        <Link href="/admin/settings" className="btn-secondary">
          Edit settings
        </Link>
        <Link href="/" className="btn-secondary">
          View public site
        </Link>
      </div>
    </div>
  );
}
