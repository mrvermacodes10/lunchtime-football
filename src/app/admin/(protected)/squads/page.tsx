import { prisma } from "@/lib/prisma";
import { getSettings, getFormationList } from "@/lib/data";
import SquadsAdmin from "@/components/admin/SquadsAdmin";

export default async function AdminSquadsPage({
  searchParams,
}: {
  searchParams: { manager?: string };
}) {
  const [squads, allPlayers, settings] = await Promise.all([
    prisma.squad.findMany({
      include: { manager: true, players: { include: { player: true } }, captain: true },
      orderBy: [{ gameweek: "desc" }, { savedAt: "desc" }],
    }),
    prisma.player.findMany({
      include: { realTeam: true },
      orderBy: [{ totalPoints: "desc" }],
    }),
    getSettings(),
  ]);

  return (
    <SquadsAdmin
      highlightManager={searchParams.manager}
      allPlayers={allPlayers.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        totalPoints: p.totalPoints,
        realTeamName: p.realTeam.name,
      }))}
      startingBudget={settings.startingBudget}
      formations={getFormationList(settings)}
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
