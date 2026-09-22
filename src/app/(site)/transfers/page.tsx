import { prisma } from "@/lib/prisma";

export default async function TransfersPage() {
  const transfers = await prisma.transfer.findMany({
    include: { player: true, fromTeam: true, toTeam: true },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Transfers</h2>
      <p className="text-sm text-[#8a8471] mt-1">Player moves between teams, newest first.</p>

      <div className="mt-5 space-y-3">
        {transfers.length === 0 && (
          <div className="card p-6 text-center text-sm text-[#8a8471]">No transfers have been added yet.</div>
        )}
        {transfers.map((t) => (
          <div key={t.id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-[#8a8471]">
                {new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="mt-1 font-display text-lg font-semibold">{t.player.name}</div>
              <div className="mt-1 text-sm text-[#8a8471]">
                From: <span className="text-[#55503F] font-medium">{t.fromTeam.name}</span>
                {" · "}
                To: <span className="text-[#55503F] font-medium">{t.toTeam.name}</span>
              </div>
            </div>
            <span className="rounded-full bg-[#EAF3EA] text-[#2B5A2B] px-3 py-1 text-xs font-semibold">
              Fee: £{t.fee.toFixed(1)}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
