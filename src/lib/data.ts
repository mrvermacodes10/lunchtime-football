import { prisma } from "./prisma";

export async function getSettings() {
  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
}

export function getFormationList(settings: { formations: string }) {
  return settings.formations
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
}

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

export async function getCurrentGameweek() {
  let gw = await prisma.gameweek.findFirst({ where: { isCurrent: true } });
  if (!gw) {
    gw = await prisma.gameweek.findFirst({ orderBy: { number: "desc" } });
  }
  return gw;
}

// Every manager's most recently saved squad (by gameweek), with its players
// and captain loaded. This is the same "current squad" definition the
// league table already uses for a manager's latest points (m.squads[0]
// ordered by gameweek desc) — reused here so the team detail page and the
// player selection-percentage stats agree with what the rest of the site
// already treats as "current".
export async function getManagersWithCurrentSquad() {
  const managers = await prisma.manager.findMany({
    include: {
      squads: {
        orderBy: { gameweek: "desc" },
        take: 1,
        include: {
          players: { include: { player: true } },
          captain: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return managers.map((m) => ({
    id: m.id,
    name: m.name,
    squad: m.squads[0] ?? null,
  }));
}

// For each player, how many managers currently have them in their squad —
// used by the Players page's "Selected by X%" column. Calculated fresh from
// the database every call (no caching, no hardcoding), so transfers are
// reflected immediately.
export async function getPlayerSelectionStats() {
  const managers = await getManagersWithCurrentSquad();
  const totalManagers = managers.length;
  const counts = new Map<string, number>();

  for (const m of managers) {
    if (!m.squad) continue;
    for (const sp of m.squad.players) {
      counts.set(sp.playerId, (counts.get(sp.playerId) ?? 0) + 1);
    }
  }

  function forPlayer(playerId: string) {
    const count = counts.get(playerId) ?? 0;
    const percent = totalManagers > 0 ? Math.round((count / totalManagers) * 100) : 0;
    return { count, totalManagers, percent };
  }

  return { totalManagers, counts, forPlayer };
}

// Purely visual: splits a flat, ordered list of items into pitch rows sized
// by `rows` (e.g. [2, 2, 2] for formation "2-2-2"). Shared by the squad
// builder (editable) and the read-only team detail page, so both lay a
// squad out on the pitch the same way.
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

export async function getLeagueTable() {
  const managers = await prisma.manager.findMany({
    include: {
      squads: {
        orderBy: { gameweek: "desc" },
      },
    },
  });

  const rows = managers.map((m) => {
    const totalPoints = m.squads.reduce((sum, s) => sum + s.totalPoints, 0);
    const latest = m.squads[0];
    return {
      managerId: m.id,
      managerName: m.name,
      gwPoints: latest?.gwPoints ?? 0,
      totalPoints,
      squadsSaved: m.squads.length,
    };
  });

  rows.sort((a, b) => b.totalPoints - a.totalPoints || a.managerName.localeCompare(b.managerName));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
