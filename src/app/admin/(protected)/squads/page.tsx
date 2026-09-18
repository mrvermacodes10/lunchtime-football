import { prisma } from "@/lib/prisma";
import SquadsAdmin from "@/components/admin/SquadsAdmin";

export default async function AdminSquadsPage({
  searchParams,
}: {
  searchParams: { manager?: string };
}) {
  const squads = await prisma.squad.findMany({
    include: { manager: true, players: { include: { player: true } }, captain: true },
    orderBy: [{ gameweek: "desc" }, { savedAt: "desc" }],
  });

  return (
    <SquadsAdmin
      highlightManager={searchParams.manager}
      squads={squads.map((s) => ({
        id: s.id,
        managerName: s.manager.name,
        formation: s.formation,
        gameweek: s.gameweek,
        totalPrice: s.totalPrice,
        moneyLeft: s.moneyLeft,
        totalPoints: s.totalPoints,
        gwPoints: s.gwPoints,
        locked: s.locked,
        savedAt: s.savedAt.toISOString(),
        captainId: s.captainId,
        captainName: s.captain?.name ?? null,
        players: s.players.map((sp) => ({ id: sp.player.id, name: sp.player.name })),
      }))}
    />
  );
}
