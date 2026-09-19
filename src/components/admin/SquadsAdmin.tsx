"use client";

import { useState, useTransition } from "react";
import { deleteSquad, recalcSquadPoints } from "@/app/actions/admin";
import SquadEditor from "./SquadEditor";

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
  captainId: string | null;
  captainName: string | null;
  players: { id: string; name: string }[];
};

type PlayerOption = { id: string; name: string; price: number; totalPoints: number; realTeamName: string };

export default function SquadsAdmin({
  squads,
  highlightManager,
  allPlayers,
  startingBudget,
  formations,
}: {
  squads: Squad[];
  highlightManager?: string;
  allPlayers: PlayerOption[];
  startingBudget: number;
  formations: string[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Squads</h1>
      <p className="text-sm text-[#8a8471] mb-4">
        Every squad saved by a manager, across all gameweeks. Edit a squad to add or remove players, change its
        formation, or set the captain.
      </p>

      <div className="space-y-3">
        {squads.length === 0 && <div className="card p-6 text-center text-sm text-[#8a8471]">No squads saved yet.</div>}
        {squads.map((s) => {
          const isHighlighted = highlightManager && s.managerName === highlightManager;
          const isEditing = editingId === s.id;
          return (
            <div key={s.id} className={`card p-4 ${isHighlighted ? "ring-2 ring-[#C9A227]" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.managerName}</div>
                  <div className="text-xs text-[#8a8471]">
                    GW{s.gameweek} · {s.formation} · £{s.totalPrice.toFixed(1)}m spent · £{s.moneyLeft.toFixed(1)}m left
                    {" · "}
                    Captain: <span className="font-medium text-[#55503F]">{s.captainName ?? "none set"}</span>
                    {" · "}
                    {s.gwPoints} GW pts · {s.totalPoints} total pts
                    {s.locked && <span className="ml-1.5 rounded-full bg-[#F3E9E4] text-[#8A4A2E] px-2 py-0.5 text-[10px] font-semibold">LOCKED</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(isEditing ? null : s.id)}
                    className="text-sm font-medium underline"
                  >
                    {isEditing ? "Close editor" : "Edit squad"}
                  </button>
                  <button
                    onClick={() => startTransition(() => recalcSquadPoints(s.id))}
                    disabled={isPending}
                    className="text-sm font-medium underline"
                  >
                    Recalc from players
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${s.managerName}'s GW${s.gameweek} squad?`)) startTransition(() => deleteSquad(s.id));
                    }}
                    disabled={isPending}
                    className="text-sm font-medium text-[#8A4A2E] underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isEditing && (
                <SquadEditor
                  squad={s}
                  allPlayers={allPlayers}
                  startingBudget={startingBudget}
                  formations={formations}
                  onClose={() => setEditingId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
