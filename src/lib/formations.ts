// Pure, dependency-free helpers around formation strings and pitch layout.
// Deliberately has NO import of prisma or anything server-only: this file
// is imported directly by client components (the squad builder, the admin
// squad editor), so pulling in prisma here would drag a server-only module
// into the browser bundle. src/lib/data.ts re-exports these for existing
// server-side callers, so nothing else needs to change its imports.

// Formation strings like "2-2-2" are ONLY a visual pitch layout for the
// squad builder — three rows, front-to-back, with that many slots each.
// They do not require players to have any particular position (players
// have no position at all in this app). Total squad size for a formation
// is simply the sum of its three numbers.
export function parseFormation(formation: string) {
  const parts = formation.split("-").map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) return null;
  const [row1, row2, row3] = parts;
  const total = row1 + row2 + row3;
  return { rows: [row1, row2, row3] as [number, number, number], total };
}

export function getFormationList(settings: { formations: string }) {
  return settings.formations
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

// Purely visual: splits a flat, ordered list of items into pitch rows sized
// by `rows` (e.g. [2, 2, 2] for formation "2-2-2"). Shared by the squad
// builder (editable), the read-only team detail page, and the admin squad
// editor, so all three lay a squad out on the pitch the same way.
export function distributeIntoRows<T>(rows: [number, number, number], items: T[]): (T | undefined)[][] {
  const out: (T | undefined)[][] = [];
  let cursor = 0;
  for (const count of rows) {
    const row: (T | undefined)[] = [];
    for (let i = 0; i < count; i++) {
      row.push(items[cursor]);
      cursor++;
    }
    out.push(row);
  }
  return out;
}
