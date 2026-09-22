import { prisma } from "./prisma";

export async function getSettings() {
  const settings = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
}

// Re-exported from lib/formations.ts (a prisma-free module) so every
// existing "@/lib/data" import of these keeps working unchanged, while
// client components can import the same functions from "@/lib/formations"
// directly without pulling prisma into the browser bundle.
export { parseFormation, getFormationList, distributeIntoRows } from "./formations";

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

export async function getLeagueTable() {
  const managers = await prisma.manager.findMany({
    include: {
      squads: {
        orderBy: { gameweek: "desc" },
        include: { captain: true, players: { include: { player: true } } },
      },
    },
  });

  const rows = managers.map((m) => {
    // The captain multiplier lives entirely here, at display time — it
    // never touches Squad.totalPoints/gwPoints (which stay a plain sum of
    // that squad's players, exactly as before) or Player.totalPoints (which
    // is never doubled and is identical for every manager who owns that
    // player). It's purely "this manager's fantasy score counts their
    // captain's points a second time", using the captain's current points
    // so it's always up to date even if the underlying squad snapshot is
    // stale.
    const totalPoints = m.squads.reduce(
      (sum, s) =>
        sum +
        (s.pointsOverride ??
          (s.players.reduce((playerSum, sp) => playerSum + sp.player.totalPoints, 0) +
            (s.captain?.totalPoints ?? 0))),
      0
    );
    const latest = m.squads[0];
    const gwPoints = latest
      ? latest.players.reduce((sum, sp) => sum + sp.player.gwPoints, 0) +
        (latest.captain?.gwPoints ?? 0)
      : 0;
    return {
      managerId: m.id,
      managerName: m.name,
      gwPoints,
      totalPoints,
      squadsSaved: m.squads.length,
    };
  });

  rows.sort((a, b) => b.totalPoints - a.totalPoints || a.managerName.localeCompare(b.managerName));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
