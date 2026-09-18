import Link from "next/link";
import { getLeagueTable } from "@/lib/data";

export default async function AdminTablePage() {
  const rows = await getLeagueTable();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">League table</h1>
      <p className="text-sm text-[#8a8471] mb-4">
        To change a manager's points, open their squad from{" "}
        <Link href="/admin/squads" className="underline">
          Squads
        </Link>
        .
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Manager</th>
              <th className="px-4 py-3 font-semibold text-right">GW points</th>
              <th className="px-4 py-3 font-semibold text-right">Total points</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.managerId} className="border-b border-[#EDE7D8] last:border-0">
                <td className="px-4 py-3 font-display font-semibold">{r.rank}</td>
                <td className="px-4 py-3 font-medium">{r.managerName}</td>
                <td className="px-4 py-3 text-right">{r.gwPoints}</td>
                <td className="px-4 py-3 text-right font-display font-semibold">{r.totalPoints}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/squads?manager=${encodeURIComponent(r.managerName)}`} className="text-sm underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
