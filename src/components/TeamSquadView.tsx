import { parseFormation, distributeIntoRows } from "@/lib/data";

type PlayerLite = {
  id: string;
  name: string;
  price: number;
  totalPoints: number;
  realTeam: { name: string };
};

export default function TeamSquadView({
  formation,
  players,
  captainId,
}: {
  formation: string;
  players: PlayerLite[];
  captainId: string | null;
}) {
  const shape = parseFormation(formation) ?? { rows: [2, 2, 2] as [number, number, number], total: players.length };
  const rowSlots = distributeIntoRows(shape.rows, players);

  return (
    <div className="pitch-surface p-3 sm:p-4">
      {rowSlots.map((row, rowIndex) => (
        <div key={rowIndex} className="mb-3 last:mb-0">
          <div className="flex justify-center gap-2 flex-wrap">
            {row.map((p, i) => (
              <div key={i} className="player-slot relative w-[92px] sm:w-[104px] px-1.5 py-2 text-center">
                {p ? (
                  <>
                    {captainId === p.id && (
                      <span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C9A227] text-[#10201A] text-[10px] font-bold flex items-center justify-center border border-white"
                        title="Captain"
                      >
                        C
                      </span>
                    )}
                    <div className="text-[11px] font-semibold leading-tight truncate">{p.name}</div>
                    <div className="text-[10px] text-[#8a8471]">£{p.price.toFixed(1)}m</div>
                  </>
                ) : (
                  <div className="text-[10px] text-[#8a8471]">Empty</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
