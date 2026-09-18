import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  FINISHED: "Full time",
  POSTPONED: "Postponed",
};

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: "bg-[#EDE7D8] text-[#55503F]",
  LIVE: "bg-[#F3E9E4] text-[#8A4A2E]",
  FINISHED: "bg-[#EAF3EA] text-[#2B5A2B]",
  POSTPONED: "bg-[#EDE7D8] text-[#8a8471]",
};

export default async function MatchCentrePage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, gameweek: true },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Match centre</h2>
      <p className="text-sm text-[#8a8471] mt-1">Lunchtime fixtures and results.</p>

      <div className="mt-5 space-y-3">
        {matches.length === 0 && (
          <div className="card p-6 text-center text-sm text-[#8a8471]">No matches have been added yet.</div>
        )}
        {matches.map((m) => (
          <div key={m.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-[#8a8471]">
                Gameweek {m.gameweek.number} ·{" "}
                {new Date(m.date).toLocaleString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="mt-1 font-display text-lg font-semibold flex items-center gap-3">
                <span>{m.homeTeam.name}</span>
                {m.status === "FINISHED" || m.status === "LIVE" ? (
                  <span className="rounded-md bg-[#F6F3EA] px-2 py-0.5 text-base">
                    {m.homeScore ?? 0} – {m.awayScore ?? 0}
                  </span>
                ) : (
                  <span className="text-[#8a8471] text-sm font-normal">vs</span>
                )}
                <span>{m.awayTeam.name}</span>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[m.status]}`}>
              {STATUS_LABEL[m.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
