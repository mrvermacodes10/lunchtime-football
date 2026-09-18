"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createManager, updateManager, deleteManager } from "@/app/actions/admin";

type Manager = { id: string; name: string; squadCount: number };
const inputCls = "rounded-md border border-[#cfc7b2] px-2 py-1.5 text-sm w-full";

export default function ManagersAdmin({ managers }: { managers: Manager[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h1 className="font-display text-2xl font-semibold">Managers</h1>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "Add manager"}
        </button>
      </div>

      {showAdd && (
        <form
          action={(fd) => startTransition(async () => { await createManager(fd); setShowAdd(false); })}
          className="card p-4 mb-5 flex gap-2 items-end"
        >
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Manager name</label>
            <input name="name" required className={inputCls} />
          </div>
          <button className="btn-primary" disabled={isPending}>
            Add
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-[#EDE7D8] text-left text-xs uppercase tracking-wide text-[#8a8471]">
              <th className="px-3 py-3 font-semibold">Name</th>
              <th className="px-3 py-3 font-semibold">Squads saved</th>
              <th className="px-3 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {managers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-[#8a8471]">
                  No managers yet.
                </td>
              </tr>
            )}
            {managers.map((m) =>
              editingId === m.id ? (
                <tr key={m.id} className="border-b border-[#EDE7D8] last:border-0 bg-[#F6F3EA]">
                  <td colSpan={3} className="px-3 py-3">
                    <form
                      action={(fd) => startTransition(async () => { await updateManager(fd); setEditingId(null); })}
                      className="flex gap-2 items-end"
                    >
                      <input type="hidden" name="id" value={m.id} />
                      <input name="name" defaultValue={m.name} className={inputCls} />
                      <button className="btn-primary" disabled={isPending}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-secondary">
                        Cancel
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={m.id} className="border-b border-[#EDE7D8] last:border-0">
                  <td className="px-3 py-2.5 font-medium">{m.name}</td>
                  <td className="px-3 py-2.5 text-[#8a8471]">{m.squadCount}</td>
                  <td className="px-3 py-2.5 text-right space-x-3">
                    <Link href={`/admin/squads?manager=${encodeURIComponent(m.name)}`} className="text-sm font-medium underline">
                      View squad
                    </Link>
                    <button onClick={() => setEditingId(m.id)} className="text-sm font-medium underline">
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete manager ${m.name} and their squads?`)) startTransition(() => deleteManager(m.id));
                      }}
                      disabled={isPending}
                      className="text-sm font-medium text-[#8A4A2E] underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
