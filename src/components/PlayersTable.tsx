"use client";

import { useMemo, useState } from "react";

type PlayerRow = {
  id: string;
  name: string;
  price: number;
  totalPoints: number;
  gwPoints: number;
  realTeam: { name: string };
  selectedCount: number;
  selectedPercent: number;
  totalManagers: number;
};

type SortKey = "points" | "price" | "name" | "selected";

export default function PlayersTable({ players, teams }: { players: PlayerRow[]; teams: string[] }) {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("points");

  const rows = useMemo(() => {
    let out = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (team !== "ALL") out = out.filter((p) => p.realTeam.name === team);
    out = [...out].sort((a, b) => {
      if (sort === "points") return b.totalPoints - a.totalPoints;
      if (sort === "price") return b.price - a.price;
      if (sort === "selected") return b.selectedPercent - a.selectedPercent;
      return a.name.localeCompare(b.name);
    });
    return out;
  }, [players, search, team, sort]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players…"
          className="rounded-md border border-[#cfc7b2] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30 w-full sm:w-52"
        />
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="rounded-md border border-[#cfc7b2] px-3 py-1.5 text-sm bg-white"
        >
          <option value="ALL">All teams</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-[#cfc7b2] px-3 py-1.5 text-sm bg-white ml-auto"
        >
          <option value="points">Sort: Total points</option>
          <option value="price">Sort: Price</option>
          <option value="selected">Sort: Selected by</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Team</th>
              <th className="px-4 py-3 font-semibold text-right">Price</th>
              <th className="px-4 py-3 font-semibold text-right">GW pts</th>
              <th className="px-4 py-3 font-semibold text-right">Total pts</th>
              <th className="px-4 py-3 font-semibold text-right">Selected by</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8a8471]">
                  No players match those filters.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-[#EDE7D8] last:border-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-[#8a8471]">{p.realTeam.name}</td>
                <td className="px-4 py-3 text-right">£{p.price.toFixed(1)}m</td>
                <td className="px-4 py-3 text-right">{p.gwPoints}</td>
                <td className="px-4 py-3 text-right font-display font-semibold">{p.totalPoints}</td>
                <td className="px-4 py-3 text-right">
                  {p.totalManagers === 0 ? (
                    <span className="text-[#8a8471]">—</span>
                  ) : (
                    <div>
                      <div className="font-medium">{p.selectedPercent}%</div>
                      <div className="text-[11px] text-[#8a8471]">
                        {p.selectedCount} of {p.totalManagers}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
