import { prisma } from "./prisma";
import { parseFormation } from "./formations";

// The single source of truth for "is this a legal squad?" — used by the
// public squad builder (src/app/actions/squad.ts) and by the admin squad
// editor (src/app/actions/admin.ts). Keeping this in one place means both
// surfaces always enforce the exact same rules: right number of players for
// the formation, no duplicates, every player must exist, budget respected,
// and a captain that's actually one of the selected players.
//
// This does NOT check gameweek/transfer-window/lock state — those are
// caller-specific (the public builder respects them, the admin editor
// intentionally bypasses them, same as it already bypasses them for the
// existing "points" and "locked" edits).
export async function validateSquadSelection({
  formation,
  playerIds,
  captainId,
  startingBudget,
  validFormations,
}: {
  formation: string;
  playerIds: string[];
  captainId: string | null;
  startingBudget: number;
  validFormations: string[];
}) {
  if (!validFormations.includes(formation)) {
    return { ok: false as const, error: "Choose a valid formation." };
  }

  const shape = parseFormation(formation);
  if (!shape) {
    return { ok: false as const, error: "Invalid formation." };
  }

  const uniqueIds = Array.from(new Set(playerIds));
  if (uniqueIds.length !== playerIds.length) {
    return { ok: false as const, error: "You can't pick the same player twice." };
  }
  if (uniqueIds.length !== shape.total) {
    return { ok: false as const, error: `Pick exactly ${shape.total} players for a ${formation} formation.` };
  }

  const players = await prisma.player.findMany({ where: { id: { in: uniqueIds } } });
  if (players.length !== uniqueIds.length) {
    return { ok: false as const, error: "One of the selected players no longer exists." };
  }

  const resolvedCaptainId = captainId || null;
  if (resolvedCaptainId && !uniqueIds.includes(resolvedCaptainId)) {
    return { ok: false as const, error: "The captain has to be one of the selected players." };
  }
  if (!resolvedCaptainId) {
    return { ok: false as const, error: "Choose a captain for the squad before saving." };
  }

  const totalPrice = players.reduce((sum, p) => sum + p.price, 0);
  if (totalPrice > startingBudget + 1e-9) {
    return {
      ok: false as const,
      error: `That squad costs £${totalPrice.toFixed(1)}m — over the £${startingBudget.toFixed(1)}m budget.`,
    };
  }
  const moneyLeft = startingBudget - totalPrice;
  const totalPoints = players.reduce((sum, p) => sum + p.totalPoints, 0) + (players.find((p) => p.id === resolvedCaptainId)?.totalPoints ?? 0);
  const gwPoints = players.reduce((sum, p) => sum + p.gwPoints, 0) + (players.find((p) => p.id === resolvedCaptainId)?.gwPoints ?? 0);

  return {
    ok: true as const,
    uniqueIds,
    players,
    captainId: resolvedCaptainId,
    totalPrice,
    moneyLeft,
    totalPoints,
    gwPoints,
  };
}
