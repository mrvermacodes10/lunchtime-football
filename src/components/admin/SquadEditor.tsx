"use client";

import { useMemo, useState, useTransition } from "react";
import { adminSaveSquad } from "@/app/actions/admin";
import { parseFormation, distributeIntoRows } from "@/lib/formations";

type PlayerOption = { id: string; name: string; price: number; totalPoints: number; realTeamName: string };

type SquadData = {
  id: string;
  managerName: string;
  gameweek: number;
  formation: string;
  captainId: string | null;
  totalPoints: number;
  gwPoints: number;
  locked: boolean;
  players: { id: string; name: string }[];
};

const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm w-24";

export default function SquadEditor({
  squad,
  allPlayers,
  startingBudget,
  formations,
  onClose,
}: {
  squad: SquadData;
  allPlayers: PlayerOption[];
  startingBudget: number;
  formations: string[];
  onClose: () => void;
}) {
  const [formation, setFormation] = useState(squad.formation);
  const [selectedIds, setSelectedIds] = useState<string[]>(squad.players.map((p) => p.id));
  const [captainId, setCaptainId] = useState<string | null>(squad.captainId);
  const [totalPoints, setTotalPoints] = useState(String(squad.totalPoints));
  const [gwPoints, setGwPoints] = useState(String(squad.gwPoints));
  const [locked, setLocked] = useState(squad.locked);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const playerById = useMemo(() => new Map(allPlayers.map((p) => [p.id, p])), [allPlayers]);
  const shape = parseFormation(formation) ?? { rows: [2, 2, 2] as [number, number, number], total: 6 };

  const selectedPlayers = selectedIds.map((id) => playerById.get(id)).filter(Boolean) as PlayerOption[];
  const spent = selectedPlayers.reduce((s, p) => s + p.price, 0);
  const moneyLeft = startingBudget - spent;

  function togglePlayer(p: PlayerOption) {
    setMessage(null);
    if (selectedIds.includes(p.id)) {
      setSelectedIds((ids) => ids.filter((id) => id !== p.id));
      if (captainId === p.id) setCaptainId(null);
      return;
    }
    if (selectedIds.length >= shape.total) {
      setMessage({ type: "error", text: `This squad is full for a ${formation} formation (${shape.total} players).` });
      return;
    }
    if (p.price > moneyLeft + 1e-9) {
      setMessage({ type: "error", text: `Not enough budget left to add ${p.name}.` });
      return;
    }
    setSelectedIds((ids) => [...ids, p.id]);
  }

  function makeCaptain(playerId: string) {
    setCaptainId(playerId);
    setMessage(null);
  }

  function handleFormationChange(next: string) {
    setFormation(next);
    const nextShape = parseFormation(next);
    if (!nextShape) return;
    if (selectedIds.length > nextShape.total) {
      const kept = selectedIds.slice(0, nextShape.total);
      setSelectedIds(kept);
      if (captainId && !kept.includes(captainId)) setCaptainId(null);
    }
  }

  function handleSave() {
    setMessage(null);
    if (selectedIds.length === shape.total && !captainId) {
      setMessage({ type: "error", text: "Choose a captain before saving — click \"C\" on one of the players." });
      return;
    }
    startTransition(async () => {
      const res = await adminSaveSquad({
        squadId: squad.id,
        formation,
        playerIds: selectedIds,
        captainId,
        totalPoints: parseInt(totalPoints, 10) || 0,
        gwPoints: parseInt(gwPoints, 10) || 0,
        locked,
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Squad updated." });
      } else {
        setMessage({ type: "error", text: res.error ?? "Couldn't save this squad." });
      }
    });
  }

  const filteredPlayers = allPlayers
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const rowSlots = distributeIntoRows(shape.rows, selectedPlayers);

  return (
    <div className="mt-3 border-t border-[#EDE7D8] pt-4 space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Formation</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {formations.map((f) => (
            <button
              key={f}
              onClick={() => handleFormationChange(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium border ${
                formation === f ? "bg-[#0E1F1A] text-[#F6F3EA] border-[#0E1F1A]" : "border-[#cfc7b2] hover:border-[#0E1F1A]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span>
          <span className="font-medium">{selectedIds.length} of {shape.total}</span> picked
        </span>
        <span>
          £{spent.toFixed(1)}m spent · <span className={moneyLeft < 0 ? "text-[#8A4A2E] font-medium" : ""}>£{moneyLeft.toFixed(1)}m left</span>
        </span>
      </div>

      <div className="pitch-surface p-3 sm:p-4 max-w-md">
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
                      <button onClick={() => togglePlayer(p)} className="w-full" title="Remove from squad">
                        <div className="text-[11px] font-semibold leading-tight truncate">{p.name}</div>
                        <div className="text-[10px] text-[#8a8471]">£{p.price.toFixed(1)}m</div>
                      </button>
                      <button
                        onClick={() => makeCaptain(p.id)}
                        disabled={captainId === p.id}
                        className={`mt-1 w-full rounded text-[9px] font-bold uppercase tracking-wide py-0.5 ${
                          captainId === p.id
                            ? "bg-[#C9A227] text-[#10201A] cursor-default"
                            : "bg-[#F6F3EA] text-[#8a8471] hover:bg-[#EDE7D8] hover:text-[#10201A]"
                        }`}
                      >
                        {captainId === p.id ? "Captain" : "Make captain"}
                      </button>
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

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Add / remove players</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players…"
          className="mt-1.5 w-full sm:w-64 rounded-md border border-[#cfc7b2] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30"
        />
        <div className="card mt-2 divide-y divide-[#EDE7D8] max-h-72 overflow-y-auto">
          {filteredPlayers.length === 0 && <p className="p-4 text-sm text-[#8a8471]">No players match that search.</p>}
          {filteredPlayers.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlayer(p)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-[#EAF3EA]" : "hover:bg-[#F6F3EA]"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    {p.name}
                    {captainId === p.id && (
                      <span className="w-4 h-4 rounded-full bg-[#C9A227] text-[#10201A] text-[9px] font-bold flex items-center justify-center">
                        C
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8a8471]">
                    {p.realTeamName} · {p.totalPoints} pts
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-sm">£{p.price.toFixed(1)}m</span>
                  <span
                    className={`text-xs rounded-full w-5 h-5 flex items-center justify-center border ${
                      isSelected ? "bg-[#0E1F1A] text-[#F6F3EA] border-[#0E1F1A]" : "border-[#cfc7b2]"
                    }`}
                  >
                    {isSelected ? "✓" : "+"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            message.type === "error" ? "bg-[#F3E9E4] text-[#8A4A2E]" : "bg-[#EAF3EA] text-[#2B5A2B]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3 border-t border-[#EDE7D8] pt-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">GW points</label>
          <input value={gwPoints} onChange={(e) => setGwPoints(e.target.value)} type="number" className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Total points</label>
          <input value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)} type="number" className={inputCls} />
        </div>
        <label className="flex items-center gap-1.5 text-sm pb-1.5">
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          Locked
        </label>
        <div className="flex gap-2 ml-auto">
          <button onClick={handleSave} disabled={isPending} className="btn-primary">
            {isPending ? "Saving…" : "Save squad"}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
