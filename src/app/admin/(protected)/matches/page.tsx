import { prisma } from "@/lib/prisma";
import MatchesAdmin from "@/components/admin/MatchesAdmin";

export default async function AdminMatchesPage() {
  const [matches, teams, gameweeks] = await Promise.all([
    prisma.match.findMany({ include: { homeTeam: true, awayTeam: true, gameweek: true }, orderBy: { date: "desc" } }),
    prisma.realTeam.findMany({ orderBy: { name: "asc" } }),
    prisma.gameweek.findMany({ orderBy: { number: "asc" } }),
  ]);

  return (
    <MatchesAdmin
      teams={teams}
      gameweeks={gameweeks.map((g) => ({ id: g.id, number: g.number }))}
      matches={matches.map((m) => ({
        id: m.id,
        date: m.date.toISOString(),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeTeamName: m.homeTeam.name,
        awayTeamName: m.awayTeam.name,
        gameweekId: m.gameweekId,
        gameweekNumber: m.gameweek.number,
      }))}
    />
  );
}
