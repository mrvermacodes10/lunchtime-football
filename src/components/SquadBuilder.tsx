"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { loadManagerSquad, saveSquad } from "@/app/actions/squad";
import { parseFormation } from "@/lib/data";

type PlayerLite = {
  id: string;
  name: string;
  price: number;
  totalPoints: number;
  realTeam: { name: string };
};

export default function SquadBuilder({
  players,
  formations,
  startingBudget,
  gameweek,
  transfersOpen,
  squadsLocked,
}: {
  players: PlayerLite[];
  formations: string[];
  startingBudget: number;
  gameweek: number | null;
  transfersOpen: boolean;
  squadsLocked: boolean;
}) {
  const [managerName, setManagerName] = useState("");
  const [formation, setFormation] = useState(formations[0] ?? "2-2-2");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasLoadedFor, setHasLoadedFor] = useState<string | null>(null);

  const playerById = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const shape = parseFormation(formation) ?? { rows: [2, 2, 2] as [number, number, number], total: 6 };

  const canEdit = transfersOpen && !squadsLocked && !locked;

  // Pull an existing squad once the manager finishes typing their name.
  useEffect(() => {
    const name = managerName.trim();
    if (!name || name === hasLoadedFor) return;
    const handle = setTimeout(() => {
      loadManagerSquad(name).then((res) => {
        setHasLoadedFor(name);
        if (res.squad) {
          setFormation(res.squad.formation);
          setSelectedIds(res.squad.playerIds);
          setLocked(res.squad.locked);
          setMessage({ type: "success", text: "Loaded your saved squad for this gameweek." });
        } else {
          setSelectedIds([]);
          setLocked(false);
        }
      });
    }, 500);
    return () => clearTimeout(handle);
  }, [managerName, hasLoadedFor]);

  const selectedPlayers = selectedIds.map((id) => playerById.get(id)).filter(Boolean) as PlayerLite[];
  const spent = selectedPlayers.reduce((s, p) => s + p.price, 0);
  const moneyLeft = startingBudget - spent;

  function togglePlayer(p: PlayerLite) {
    if (!canEdit) return;
    setMessage(null);
    if (selectedIds.includes(p.id)) {
      setSelectedIds((ids) => ids.filter((id) => id !== p.id));
      return;
    }
    if (selectedIds.length >= shape.total) {
      setMessage({ type: "error", text: `Your squad is full for a ${formation} formation (${shape.total} players).` });
      return;
    }
    if (p.price > moneyLeft + 1e-9) {
      setMessage({ type: "error", text: `Not enough budget left to add ${p.name}.` });
      return;
    }
    setSelectedIds((ids) => [...ids, p.id]);
  }

  function clearSquad() {
    setSelectedIds([]);
    setMessage(null);
  }

  function handleFormationChange(next: string) {
    setFormation(next);
    const nextShape = parseFormation(next);
    if (!nextShape) return;
    // Formation only changes the pitch layout, not who's allowed in it — but
    // if the new formation holds fewer players than are currently picked,
    // trim the squad down to fit (keeping the earliest picks).
    if (selectedIds.length > nextShape.total) {
      setSelectedIds((ids) => ids.slice(0, nextShape.total));
    }
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveSquad({ managerName, formation, playerIds: selectedIds });
      if (res.ok) {
        setMessage({ type: "success", text: `Squad saved for Gameweek ${res.gameweek}.` });
      } else {
        setMessage({ type: "error", text: res.error ?? "Couldn't save your squad." });
      }
    });
  }

  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Purely visual: distribute the selected players into pitch rows in
  // selection order, top row first. Any player can sit in any row — rows
  // exist only to lay the squad out like a football pitch.
  const rowSlots: { label: string; players: (PlayerLite | undefined)[] }[] = [];
  {
    let cursor = 0;
    shape.rows.forEach((count, i) => {
      const rowPlayers: (PlayerLite | undefined)[] = [];
      for (let s = 0; s < count; s++) {
        rowPlayers.push(selectedPlayers[cursor]);
        cursor++;
      }
      rowSlots.push({ label: `Row ${i + 1}`, players: rowPlayers });
    });
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <div className="space-y-4">
        <div className="card p-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Your name</label>
          <input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="e.g. Neel"
            className="mt-1.5 w-full rounded-md border border-[#cfc7b2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30"
            maxLength={60}
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#8a8471]">
            Formation — just a pitch layout, any player can fill any spot.
          </label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {formations.map((f) => (
              <button
                key={f}
                onClick={() => handleFormationChange(f)}
                disabled={!canEdit}
                className={`rounded-md px-3 py-1.5 text-sm font-medium border ${
                  formation === f ? "bg-[#0E1F1A] text-[#F6F3EA] border-[#0E1F1A]" : "border-[#cfc7b2] hover:border-[#0E1F1A]"
                } disabled:opacity-50`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-[#8a8471]">{shape.total} players on the pitch</p>
        </div>

        <div className="card p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Money left</span>
            <span className="font-display text-xl font-semibold">£{moneyLeft.toFixed(1)}m</span>
          </div>
          <div className="mt-1 text-sm text-[#8a8471]">
            {selectedIds.length} of {shape.total} picked · £{spent.toFixed(1)}m spent
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-[#EDE7D8] overflow-hidden">
            <div
              className="h-full bg-[#C9A227]"
              style={{ width: `${startingBudget > 0 ? Math.min(100, (spent / startingBudget) * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className="pitch-surface p-3 sm:p-4">
          {rowSlots.map((row) => (
            <div key={row.label} className="mb-3 last:mb-0">
              <div className="flex justify-center gap-2 flex-wrap">
                {row.players.map((p, i) => (
                  <div key={i} className="player-slot w-[92px] sm:w-[104px] px-1.5 py-2 text-center">
                    {p ? (
                      <button onClick={() => togglePlayer(p)} className="w-full" title="Remove">
                        <div className="text-[11px] font-semibold leading-tight truncate">{p.name}</div>
                        <div className="text-[10px] text-[#8a8471]">£{p.price.toFixed(1)}m</div>
                      </button>
                    ) : (
                      <div className="text-[10px] text-[#8a8471]">Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canEdit || isPending}
            className="btn-primary flex-1"
          >
            {isPending ? "Saving…" : `Save team for GW${gameweek ?? "-"}`}
          </button>
          <button onClick={clearSquad} disabled={!canEdit} className="btn-secondary">
            Clear
          </button>
        </div>
        <p className="text-xs text-[#8a8471]">
          {!transfersOpen
            ? "The transfer window is shut — the admin reopens it between gameweeks"
            : squadsLocked
            ? "Squads are locked for this gameweek"
            : locked
            ? "Your squad is locked for this gameweek"
            : `Pick ${shape.total} players for this formation · Add your name at the top`}
        </p>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">Transfer market</h2>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players…"
            className="rounded-md border border-[#cfc7b2] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30 w-full sm:w-64"
          />
        </div>

        <div className="card divide-y divide-[#EDE7D8] overflow-hidden">
          {filteredPlayers.length === 0 && (
            <p className="p-4 text-sm text-[#8a8471]">No players match that search.</p>
          )}
          {filteredPlayers.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlayer(p)}
                disabled={!canEdit}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                  isSelected ? "bg-[#EAF3EA]" : "hover:bg-[#F6F3EA]"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-[#8a8471]">
                    {p.realTeam.name} · {p.totalPoints} pts
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
    </div>
  );
}
