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
