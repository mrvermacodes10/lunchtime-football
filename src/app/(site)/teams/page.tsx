import { prisma } from "@/lib/prisma";

export default async function TeamsPage() {
  // Reuses the existing Player -> RealTeam relation directly (the same one
  // Admin -> Players edits) — no separate team-assignment system. Note:
  // Player.realTeamId is a required field in the schema, so in practice
  // every player already has a team; the "Unassigned" bucket below is a
  // defensive fallback (per the spec) rather than something that can
  // currently be reached.
  const [teams, allPlayers] = await Promise.all([
    prisma.realTeam.findMany({
      include: { players: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.player.findMany({ select: { id: true, realTeamId: true } }),
  ]);

  const knownTeamIds = new Set(teams.map((t) => t.id));
  const unassignedCount = allPlayers.filter((p) => !knownTeamIds.has(p.realTeamId)).length;

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Teams</h2>
      <p className="text-sm text-[#8a8471] mt-1">Every real team and the players currently assigned to it.</p>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {teams.length === 0 && (
          <div className="card p-6 text-center text-sm text-[#8a8471] sm:col-span-2">No teams have been added yet.</div>
        )}
        {teams.map((team) => (
          <div key={team.id} className="card p-4">
            <h3 className="font-display text-lg font-semibold">{team.name}</h3>
            <p className="text-xs text-[#8a8471] mt-0.5">
              {team.players.length} {team.players.length === 1 ? "player" : "players"}
            </p>
            {team.players.length === 0 ? (
              <p className="mt-3 text-sm text-[#8a8471]">No players assigned yet.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {team.players.map((p) => (
                  <li key={p.id} className="text-sm border-b border-[#EDE7D8] last:border-0 py-1.5">
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {unassignedCount > 0 && (
          <div className="card p-4">
            <h3 className="font-display text-lg font-semibold">Unassigned</h3>
            <p className="text-xs text-[#8a8471] mt-0.5">
              {unassignedCount} {unassignedCount === 1 ? "player" : "players"}
            </p>
            <p className="mt-3 text-sm text-[#8a8471]">
              These players don't currently belong to a team on record.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
