"use client";

import { useState, useTransition } from "react";
import { updateSquad, deleteSquad, recalcSquadPoints } from "@/app/actions/admin";

type Squad = {
  id: string;
  managerName: string;
  formation: string;
  gameweek: number;
  totalPrice: number;
  moneyLeft: number;
  totalPoints: number;
  gwPoints: number;
  locked: boolean;
  savedAt: string;
  players: { id: string; name: string }[];
};

const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm w-20";

export default function SquadsAdmin({ squads, highlightManager }: { squads: Squad[]; highlightManager?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Squads</h1>
      <p className="text-sm text-[#8a8471] mb-4">Every squad saved by a manager, across all gameweeks.</p>

      <div className="space-y-3">
        {squads.length === 0 && <div className="card p-6 text-center text-sm text-[#8a8471]">No squads saved yet.</div>}
        {squads.map((s) => {
          const isHighlighted = highlightManager && s.managerName === highlightManager;
          return (
            <div key={s.id} className={`card p-4 ${isHighlighted ? "ring-2 ring-[#C9A227]" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.managerName}</div>
                  <div className="text-xs text-[#8a8471]">
                    GW{s.gameweek} · {s.formation} · £{s.totalPrice.toFixed(1)}m spent · £{s.moneyLeft.toFixed(1)}m left
                    {s.locked && <span className="ml-1.5 rounded-full bg-[#F3E9E4] text-[#8A4A2E] px-2 py-0.5 text-[10px] font-semibold">LOCKED</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="text-sm font-medium underline"
                  >
                    {expandedId === s.id ? "Hide players" : "Show players"}
                  </button>
                  <button
                    onClick={() => startTransition(() => recalcSquadPoints(s.id))}
                    disabled={isPending}
                    className="text-sm font-medium underline"
                  >
                    Recalc from players
                  </button>
                </div>
              </div>

              {expandedId === s.id && (
                <ul className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-sm text-[#55503F]">
                  {s.players.map((p) => (
                    <li key={p.id} className="border-b border-[#EDE7D8] py-1">
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}

              <form
                action={async (fd) => { await updateSquad(fd); }}
                className="mt-3 flex flex-wrap items-end gap-3 border-t border-[#EDE7D8] pt-3"
              >
                <input type="hidden" name="id" value={s.id} />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">GW points</label>
                  <input name="gwPoints" type="number" defaultValue={s.gwPoints} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Total points</label>
                  <input name="totalPoints" type="number" defaultValue={s.totalPoints} className={inputCls} />
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" name="locked" defaultChecked={s.locked} />
                  Locked
                </label>
                <button className="btn-primary" disabled={isPending}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${s.managerName}'s GW${s.gameweek} squad?`)) startTransition(() => deleteSquad(s.id));
                  }}
                  disabled={isPending}
                  className="text-sm font-medium text-[#8A4A2E] underline ml-auto"
                >
                  Delete squad
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
