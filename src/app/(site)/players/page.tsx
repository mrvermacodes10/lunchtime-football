import { prisma } from "@/lib/prisma";
import { getPlayerSelectionStats } from "@/lib/data";
import PlayersTable from "@/components/PlayersTable";

export default async function PlayersPage() {
  const [players, teams, selection] = await Promise.all([
    prisma.player.findMany({ include: { realTeam: true }, orderBy: [{ totalPoints: "desc" }] }),
    prisma.realTeam.findMany({ orderBy: { name: "asc" } }),
    getPlayerSelectionStats(),
  ]);

  const rows = players.map((p) => {
    const stats = selection.forPlayer(p.id);
    return { ...p, selectedCount: stats.count, selectedPercent: stats.percent, totalManagers: stats.totalManagers };
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Players</h2>
      <p className="text-sm text-[#8a8471] mt-1">Every player in the league, straight from the database.</p>
      <div className="mt-5">
        <PlayersTable players={rows} teams={teams.map((t) => t.name)} />
      </div>
    </div>
  );
}
