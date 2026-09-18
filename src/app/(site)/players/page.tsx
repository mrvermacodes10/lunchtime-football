import { prisma } from "@/lib/prisma";
import PlayersTable from "@/components/PlayersTable";

export default async function PlayersPage() {
  const [players, teams] = await Promise.all([
    prisma.player.findMany({ include: { realTeam: true }, orderBy: [{ totalPoints: "desc" }] }),
    prisma.realTeam.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Players</h2>
      <p className="text-sm text-[#8a8471] mt-1">Every player in the league, straight from the database.</p>
      <div className="mt-5">
        <PlayersTable players={players} teams={teams.map((t) => t.name)} />
      </div>
    </div>
  );
}
