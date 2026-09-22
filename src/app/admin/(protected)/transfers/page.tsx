import { prisma } from "@/lib/prisma";
import TransfersAdmin from "@/components/admin/TransfersAdmin";

export default async function AdminTransfersPage() {
  const [transfers, players, teams] = await Promise.all([
    prisma.transfer.findMany({
      include: { player: true, fromTeam: true, toTeam: true },
      orderBy: { date: "desc" },
    }),
    prisma.player.findMany({ orderBy: { name: "asc" } }),
    prisma.realTeam.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <TransfersAdmin
      players={players.map((p) => ({ id: p.id, name: p.name }))}
      teams={teams}
      transfers={transfers.map((t) => ({
        id: t.id,
        date: t.date.toISOString(),
        fee: t.fee,
        playerId: t.playerId,
        playerName: t.player.name,
        fromTeamId: t.fromTeamId,
        fromTeamName: t.fromTeam.name,
        toTeamId: t.toTeamId,
        toTeamName: t.toTeam.name,
      }))}
    />
  );
}
