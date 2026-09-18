"use client";

import { useTransition } from "react";
import { createGameweek, setCurrentGameweek, toggleGameweekField, deleteGameweek } from "@/app/actions/admin";

type Gameweek = {
  id: string;
  number: number;
  isCurrent: boolean;
  transfersOpen: boolean;
  squadsLocked: boolean;
  scored: boolean;
};

export default function GameweeksAdmin({ gameweeks }: { gameweeks: Gameweek[] }) {
  const [isPending, startTransition] = useTransition();
  const nextNumber = gameweeks.length ? Math.max(...gameweeks.map((g) => g.number)) + 1 : 1;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">Gameweeks</h1>

      <form action={(fd) => startTransition(() => createGameweek(fd))} className="card p-4 mb-5 flex items-end gap-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">New gameweek number</label>
          <input name="number" type="number" defaultValue={nextNumber} className="rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm w-28" />
        </div>
        <button className="btn-primary" disabled={isPending}>
          Create gameweek
        </button>
      </form>

      <div className="card divide-y divide-[#EDE7D8]">
        {gameweeks.length === 0 && <p className="p-4 text-sm text-[#8a8471]">No gameweeks yet — create Gameweek 1 above.</p>}
        {gameweeks
          .sort((a, b) => a.number - b.number)
          .map((gw) => (
            <div key={gw.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-lg">GW{gw.number}</span>
                {gw.isCurrent && (
                  <span className="rounded-full bg-[#EAF3EA] text-[#2B5A2B] px-2 py-0.5 text-xs font-semibold">CURRENT</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {!gw.isCurrent && (
                  <button
                    onClick={() => startTransition(() => setCurrentGameweek(gw.id))}
                    disabled={isPending}
                    className="btn-secondary"
                  >
                    Make current
                  </button>
                )}
                <ToggleButton
                  active={gw.transfersOpen}
                  onLabel="Transfers open"
                  offLabel="Transfers shut"
                  onClick={() => startTransition(() => toggleGameweekField(gw.id, "transfersOpen"))}
                  disabled={isPending}
                />
                <ToggleButton
                  active={gw.squadsLocked}
                  onLabel="Squads locked"
                  offLabel="Squads unlocked"
                  onClick={() => startTransition(() => toggleGameweekField(gw.id, "squadsLocked"))}
                  disabled={isPending}
                  invertColor
                />
                <ToggleButton
                  active={gw.scored}
                  onLabel="Scored"
                  offLabel="Not scored"
                  onClick={() => startTransition(() => toggleGameweekField(gw.id, "scored"))}
                  disabled={isPending}
                />
                <button
                  onClick={() => {
                    if (confirm(`Delete GW${gw.number} and its matches?`)) startTransition(() => deleteGameweek(gw.id));
                  }}
                  disabled={isPending}
                  className="text-[#8A4A2E] underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onLabel,
  offLabel,
  onClick,
  disabled,
  invertColor,
}: {
  active: boolean;
  onLabel: string;
  offLabel: string;
  onClick: () => void;
  disabled: boolean;
  invertColor?: boolean;
}) {
  const good = invertColor ? !active : active;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
        good ? "bg-[#EAF3EA] text-[#2B5A2B] border-[#CFE3CF]" : "bg-[#F3E9E4] text-[#8A4A2E] border-[#E3D0C6]"
      }`}
    >
      {active ? onLabel : offLabel}
    </button>
  );
}
