import { prisma } from "@/lib/prisma";
import { getSettings, getCurrentGameweek, getFormationList } from "@/lib/data";
import SquadBuilder from "@/components/SquadBuilder";

export default async function HomePage() {
  const [settings, gw, players] = await Promise.all([
    getSettings(),
    getCurrentGameweek(),
    prisma.player.findMany({
      include: { realTeam: true },
      orderBy: [{ totalPoints: "desc" }],
    }),
  ]);

  return (
    <SquadBuilder
      players={players}
      formations={getFormationList(settings)}
      startingBudget={settings.startingBudget}
      gameweek={gw?.number ?? null}
      transfersOpen={settings.transferWindowOpen}
      squadsLocked={gw?.squadsLocked ?? false}
    />
  );
}
