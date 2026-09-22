"use client";

import { useState, useTransition } from "react";
import { createTransfer, updateTransfer, deleteTransfer } from "@/app/actions/admin";

type Player = { id: string; name: string };
type Team = { id: string; name: string };
type Transfer = {
  id: string;
  date: string;
  fee: number;
  playerId: string;
  playerName: string;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
};

const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm";

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export default function TransfersAdmin({
  transfers,
  players,
  teams,
}: {
  transfers: Transfer[];
  players: Player[];
  teams: Team[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-semibold">Transfers</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add transfer"}
        </button>
      </div>

      {showAdd && (
        <form
          action={(fd) => startTransition(async () => { await createTransfer(fd); setShowAdd(false); })}
          className="card p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Player</label>
            <select name="playerId" required className={inputCls + " w-full"}>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">From team</label>
            <select name="fromTeamId" required className={inputCls + " w-full"}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">To team</label>
            <select name="toTeamId" required className={inputCls + " w-full"} defaultValue={teams[1]?.id}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Fee (£m)</label>
            <input name="fee" type="number" step="0.1" min="0" defaultValue="0" required className={inputCls + " w-full"} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Date</label>
            <input name="date" type="date" required className={inputCls + " w-full"} />
          </div>
          <div className="md:col-span-5">
            <button className="btn-primary" disabled={isPending}>
              {isPending ? "Adding…" : "Add transfer"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {transfers.length === 0 && <div className="card p-6 text-center text-sm text-[#8a8471]">No transfers yet.</div>}
        {transfers.map((t) =>
          editingId === t.id ? (
            <form
              key={t.id}
              action={(fd) => startTransition(async () => { await updateTransfer(fd); setEditingId(null); })}
              className="card p-4 grid sm:grid-cols-3 md:grid-cols-6 gap-3 items-end"
            >
              <input type="hidden" name="id" value={t.id} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Player</label>
                <select name="playerId" defaultValue={t.playerId} className={inputCls + " w-full"}>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">From team</label>
                <select name="fromTeamId" defaultValue={t.fromTeamId} className={inputCls + " w-full"}>
                  {teams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">To team</label>
                <select name="toTeamId" defaultValue={t.toTeamId} className={inputCls + " w-full"}>
                  {teams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Fee (£m)</label>
                <input name="fee" type="number" step="0.1" min="0" defaultValue={t.fee} className={inputCls + " w-full"} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Date</label>
                <input name="date" type="date" defaultValue={toDateInput(t.date)} className={inputCls + " w-full"} />
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" disabled={isPending}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={t.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-[#8a8471]">{new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</div>
                <div className="font-display font-semibold">{t.playerName}</div>
                <div className="text-sm text-[#8a8471]">
                  {t.fromTeamName} → {t.toTeamName} · £{t.fee.toFixed(1)}m
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingId(t.id)} className="text-sm font-medium underline">
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete the ${t.playerName} transfer?`)) startTransition(() => deleteTransfer(t.id));
                  }}
                  disabled={isPending}
                  className="text-sm font-medium text-[#8A4A2E] underline"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
