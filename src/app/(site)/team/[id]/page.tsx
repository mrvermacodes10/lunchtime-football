import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TeamSquadView from "@/components/TeamSquadView";

export default async function TeamPage({ params }: { params: { id: string } }) {
  const manager = await prisma.manager.findUnique({
    where: { id: params.id },
    include: {
      squads: {
        orderBy: { gameweek: "desc" },
        take: 1,
        include: {
          players: { include: { player: { include: { realTeam: true } } } },
          captain: true,
        },
      },
    },
  });

  if (!manager) notFound();

  const squad = manager.squads[0] ?? null;
  const players = squad ? squad.players.map((sp) => sp.player) : [];

  return (
    <div>
      <Link href="/table" className="text-sm text-[#8a8471] hover:text-[#10201A]">
        ‹ Back to league table
      </Link>

      <h2 className="font-display text-2xl font-semibold mt-3">{manager.name}</h2>

      {!squad ? (
        <p className="text-sm text-[#8a8471] mt-2">This manager hasn't saved a squad yet.</p>
      ) : (
        <>
          <p className="text-sm text-[#8a8471] mt-1">
            Gameweek {squad.gameweek} · {squad.formation} · £{squad.totalPrice.toFixed(1)}m spent · £
            {squad.moneyLeft.toFixed(1)}m left
            {squad.captain && (
              <>
                {" "}
                · Captain: <span className="font-medium text-[#55503F]">{squad.captain.name}</span>
              </>
            )}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-2 max-w-xs">
            <div className="card p-3">
              <div className="text-xs uppercase tracking-wide text-[#8a8471] font-semibold">GW points</div>
              <div className="font-display text-lg font-semibold">{squad.gwPoints}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs uppercase tracking-wide text-[#8a8471] font-semibold">Total points</div>
              <div className="font-display text-lg font-semibold">{squad.totalPoints}</div>
            </div>
          </div>

          <div className="mt-5 max-w-md">
            <TeamSquadView formation={squad.formation} players={players} captainId={squad.captainId} />
          </div>
        </>
      )}
    </div>
  );
}
