"use client";

import { useState, useTransition } from "react";
import { createPlayer, updatePlayer, deletePlayer, createRealTeam } from "@/app/actions/admin";

type Player = {
  id: string;
  name: string;
  price: number;
  totalPoints: number;
  gwPoints: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  saves: number;
  appearances: number;
  realTeamId: string;
  realTeam: { id: string; name: string };
};
type Team = { id: string; name: string };

const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm w-full";

export default function PlayersAdmin({ players, teams }: { players: Player[]; teams: Team[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-semibold">Players</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowTeamForm((v) => !v)}>
            {showTeamForm ? "Close" : "Add real team"}
          </button>
          <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? "Close" : "Add player"}
          </button>
        </div>
      </div>

      {showTeamForm && (
        <form
          action={(fd) => startTransition(() => createRealTeam(fd))}
          className="card p-4 mb-4 flex gap-2 items-end"
        >
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Team name</label>
            <input name="name" required className={inputCls} placeholder="e.g. Team 3" />
          </div>
          <button className="btn-primary" disabled={isPending}>
            Create team
          </button>
        </form>
      )}

      {showAdd && (
        <form
          action={(fd) => startTransition(async () => { await createPlayer(fd); setShowAdd(false); })}
          className="card p-4 mb-5 grid sm:grid-cols-2 md:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Name</label>
            <input name="name" required className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Team</label>
            <select name="realTeamId" required className={inputCls}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Price (£m)</label>
            <input name="price" type="number" step="0.5" min="0" defaultValue="4" className={inputCls} />
          </div>
          <div className="md:col-span-3">
            <button className="btn-primary" disabled={isPending}>
              {isPending ? "Adding…" : "Add player"}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-3 py-3 font-semibold">Name</th>
              <th className="px-3 py-3 font-semibold">Team</th>
              <th className="px-3 py-3 font-semibold">Price</th>
              <th className="px-3 py-3 font-semibold">Points</th>
              <th className="px-3 py-3 font-semibold">GW pts</th>
              <th className="px-3 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                teams={teams}
                editing={editingId === p.id}
                onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  teams,
  editing,
  onEdit,
}: {
  player: Player;
  teams: Team[];
  editing: boolean;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <tr className="border-b border-[#EDE7D8] last:border-0">
        <td className="px-3 py-2.5 font-medium">{player.name}</td>
        <td className="px-3 py-2.5 text-[#8a8471]">{player.realTeam.name}</td>
        <td className="px-3 py-2.5">£{player.price.toFixed(1)}m</td>
        <td className="px-3 py-2.5">{player.totalPoints}</td>
        <td className="px-3 py-2.5">{player.gwPoints}</td>
        <td className="px-3 py-2.5 text-right space-x-2">
          <button onClick={onEdit} className="text-sm font-medium underline">
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${player.name}?`)) startTransition(() => deletePlayer(player.id));
            }}
            disabled={isPending}
            className="text-sm font-medium text-[#8A4A2E] underline"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#EDE7D8] last:border-0 bg-[#F6F3EA]">
      <td colSpan={6} className="px-3 py-4">
        <form
          action={(fd) => startTransition(async () => { await updatePlayer(fd); onEdit(); })}
          className="grid sm:grid-cols-3 md:grid-cols-5 gap-3"
        >
          <input type="hidden" name="id" value={player.id} />
          <Field label="Name" name="name" defaultValue={player.name} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Team</label>
            <select name="realTeamId" defaultValue={player.realTeamId} className={inputCls}>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Price (£m)" name="price" type="number" step="0.5" defaultValue={player.price} />
          <Field label="Total points" name="totalPoints" type="number" defaultValue={player.totalPoints} />
          <Field label="GW points" name="gwPoints" type="number" defaultValue={player.gwPoints} />
          <Field label="Goals" name="goals" type="number" defaultValue={player.goals} />
          <Field label="Assists" name="assists" type="number" defaultValue={player.assists} />
          <Field label="Clean sheets" name="cleanSheets" type="number" defaultValue={player.cleanSheets} />
          <Field label="Saves" name="saves" type="number" defaultValue={player.saves} />
          <Field label="Appearances" name="appearances" type="number" defaultValue={player.appearances} />
          <div className="flex items-end gap-2">
            <button className="btn-primary" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={onEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">{label}</label>
      <input name={name} type={type} step={step} defaultValue={defaultValue} className={inputCls} />
    </div>
  );
}
