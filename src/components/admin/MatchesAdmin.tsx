"use client";

import { useState, useTransition } from "react";
import { createMatch, updateMatch, deleteMatch } from "@/app/actions/admin";

type Team = { id: string; name: string };
type Gameweek = { id: string; number: number };
type Match = {
  id: string;
  date: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  gameweekId: string;
  gameweekNumber: number;
};

const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm";
const STATUSES = ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchesAdmin({
  matches,
  teams,
  gameweeks,
}: {
  matches: Match[];
  teams: Team[];
  gameweeks: Gameweek[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-semibold">Matches</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add match"}
        </button>
      </div>

      {showAdd && (
        <form
          action={(fd) => startTransition(async () => { await createMatch(fd); setShowAdd(false); })}
          className="card p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Gameweek</label>
            <select name="gameweekId" required className={inputCls + " w-full"}>
              {gameweeks.map((g) => (
                <option key={g.id} value={g.id}>
                  GW{g.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Date &amp; time</label>
            <input name="date" type="datetime-local" required className={inputCls + " w-full"} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Home team</label>
            <select name="homeTeamId" required className={inputCls + " w-full"}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Away team</label>
            <select name="awayTeamId" required className={inputCls + " w-full"} defaultValue={teams[1]?.id}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-primary" disabled={isPending}>
            Create match
          </button>
        </form>
      )}

      <div className="space-y-3">
        {matches.length === 0 && <div className="card p-6 text-center text-sm text-[#8a8471]">No matches yet.</div>}
        {matches.map((m) =>
          editingId === m.id ? (
            <form
              key={m.id}
              action={(fd) => startTransition(async () => { await updateMatch(fd); setEditingId(null); })}
              className="card p-4 grid sm:grid-cols-3 md:grid-cols-6 gap-3 items-end"
            >
              <input type="hidden" name="id" value={m.id} />
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Gameweek</label>
                <select name="gameweekId" defaultValue={m.gameweekId} className={inputCls + " w-full"}>
                  {gameweeks.map((g) => (
                    <option key={g.id} value={g.id}>
                      GW{g.number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Date &amp; time</label>
                <input name="date" type="datetime-local" defaultValue={toLocalInput(m.date)} className={inputCls + " w-full"} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Status</label>
                <select name="status" defaultValue={m.status} className={inputCls + " w-full"}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">{m.homeTeamName} score</label>
                <input name="homeScore" type="number" defaultValue={m.homeScore ?? ""} className={inputCls + " w-full"} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">{m.awayTeamName} score</label>
                <input name="awayScore" type="number" defaultValue={m.awayScore ?? ""} className={inputCls + " w-full"} />
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
            <div key={m.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs text-[#8a8471]">
                  GW{m.gameweekNumber} · {new Date(m.date).toLocaleString()} · {m.status}
                </div>
                <div className="font-display font-semibold">
                  {m.homeTeamName} {m.homeScore ?? "-"} – {m.awayScore ?? "-"} {m.awayTeamName}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingId(m.id)} className="text-sm font-medium underline">
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this match?")) startTransition(() => deleteMatch(m.id));
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
