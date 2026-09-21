import { prisma } from "@/lib/prisma";

export default async function TopScorersPage() {
  const players = await prisma.player.findMany({
    include: { realTeam: true },
    orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Top scorers</h2>
      <p className="text-sm text-[#8a8471] mt-1">
        Ranked by total points — calculated automatically from goals, MOTM, Under 5s and extra points.
      </p>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-4 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">Player</th>
              <th className="px-4 py-3 font-semibold">Team</th>
              <th className="px-4 py-3 font-semibold text-right">Goals</th>
              <th className="px-4 py-3 font-semibold text-right">MOTM</th>
              <th className="px-4 py-3 font-semibold text-right">Under 5</th>
              <th className="px-4 py-3 font-semibold text-right">Extra</th>
              <th className="px-4 py-3 font-semibold text-right">Total points</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#8a8471]">
                  No players yet.
                </td>
              </tr>
            )}
            {players.map((p, i) => (
              <tr key={p.id} className="border-b border-[#EDE7D8] last:border-0">
                <td className="px-4 py-3 font-display font-semibold">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-[#8a8471]">{p.realTeam.name}</td>
                <td className="px-4 py-3 text-right">{p.goals}</td>
                <td className="px-4 py-3 text-right">{p.motm}</td>
                <td className="px-4 py-3 text-right">{p.under5}</td>
                <td className="px-4 py-3 text-right">{p.extraPoints}</td>
                <td className="px-4 py-3 text-right font-display font-semibold">{p.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
