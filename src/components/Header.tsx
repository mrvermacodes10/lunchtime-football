import NavLinks from "./NavLinks";

export default function Header({
  leagueName,
  season,
  managerCount,
  gwNumber,
  leaderName,
  leaderPoints,
}: {
  leagueName: string;
  season: string;
  managerCount: number;
  gwNumber: number | null;
  leaderName: string | null;
  leaderPoints: number;
}) {
  return (
    <header className="bg-[#0E1F1A] text-[#F6F3EA]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            {leagueName.toUpperCase()}
          </h1>
          <p className="text-sm text-[#C9A227] font-medium">{season}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#F6F3EA]/75">
          <span>
            {managerCount} {managerCount === 1 ? "manager" : "managers"}
          </span>
          {gwNumber !== null && (
            <>
              <span aria-hidden>·</span>
              <span>Gameweek {gwNumber}</span>
            </>
          )}
          {leaderName && (
            <>
              <span aria-hidden>·</span>
              <span>
                Current leader: <span className="text-[#F6F3EA] font-medium">{leaderName}</span> — {leaderPoints} pts
              </span>
            </>
          )}
        </div>

        <div className="mt-5">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
