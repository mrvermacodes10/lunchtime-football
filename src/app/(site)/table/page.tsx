import Link from "next/link";
import { getLeagueTable, getCurrentGameweek } from "@/lib/data";

export default async function TablePage() {
  const [rows, gw] = await Promise.all([getLeagueTable(), getCurrentGameweek()]);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">League table</h2>
      <p className="text-sm text-[#8a8471] mt-1">
        Ranked by total fantasy points{gw ? ` · through Gameweek ${gw.number}` : ""}. Click a manager to see their squad.
      </p>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Manager</th>
              <th className="px-4 py-3 font-semibold">Squads saved</th>
              <th className="px-4 py-3 font-semibold text-right">GW points</th>
              <th className="px-4 py-3 font-semibold text-right">Total points</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8a8471]">
                  No squads saved yet — be the first to pick a team.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.managerId} className="border-b border-[#EDE7D8] last:border-0">
                <td className="px-4 py-3 font-display font-semibold">{r.rank}</td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/team/${r.managerId}`} className="underline decoration-[#cfc7b2] underline-offset-2 hover:decoration-[#10201A]">
                    {r.managerName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#8a8471]">{r.squadsSaved}</td>
                <td className="px-4 py-3 text-right">{r.gwPoints}</td>
                <td className="px-4 py-3 text-right font-display font-semibold">{r.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
