import { prisma } from "@/lib/prisma";
import PlayersAdmin from "@/components/admin/PlayersAdmin";

export default async function AdminPlayersPage() {
  const [players, teams] = await Promise.all([
    prisma.player.findMany({ include: { realTeam: true }, orderBy: { name: "asc" } }),
    prisma.realTeam.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <PlayersAdmin players={players} teams={teams} />;
}
