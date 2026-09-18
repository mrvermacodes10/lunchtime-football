"use server";

import { prisma } from "@/lib/prisma";
import { getSettings, getCurrentGameweek, parseFormation, getFormationList } from "@/lib/data";
import { revalidatePath } from "next/cache";

export async function loadManagerSquad(managerName: string) {
  const name = managerName.trim();
  if (!name) return { squad: null };

  const gw = await getCurrentGameweek();
  if (!gw) return { squad: null };

  const manager = await prisma.manager.findUnique({ where: { name } });
  if (!manager) return { squad: null };

  const squad = await prisma.squad.findUnique({
    where: { managerId_gameweek: { managerId: manager.id, gameweek: gw.number } },
    include: { players: { include: { player: true } } },
  });

  if (!squad) return { squad: null };

  return {
    squad: {
      formation: squad.formation,
      locked: squad.locked,
      playerIds: squad.players.map((sp) => sp.playerId),
      captainId: squad.captainId,
      totalPrice: squad.totalPrice,
      moneyLeft: squad.moneyLeft,
    },
  };
}

export async function saveSquad(input: {
  managerName: string;
  formation: string;
  playerIds: string[];
  captainId?: string | null;
}) {
  const managerName = input.managerName.trim();
  if (!managerName) return { ok: false, error: "Enter your name before saving." };
  if (managerName.length > 60) return { ok: false, error: "Name is too long." };

  const settings = await getSettings();
  const validFormations = getFormationList(settings);
  if (!validFormations.includes(input.formation)) {
    return { ok: false, error: "Choose a valid formation." };
  }

  const gw = await getCurrentGameweek();
  if (!gw) return { ok: false, error: "No gameweek is set up yet — ask the admin to create one." };
  if (!settings.transferWindowOpen) {
    return { ok: false, error: "The transfer window is shut. Squads can't be changed right now." };
  }
  if (gw.squadsLocked) {
    return { ok: false, error: "Squads are locked for this gameweek." };
  }

  const shape = parseFormation(input.formation);
  if (!shape) return { ok: false, error: "Invalid formation." };

  const uniqueIds = Array.from(new Set(input.playerIds));
  if (uniqueIds.length !== input.playerIds.length) {
    return { ok: false, error: "You can't pick the same player twice." };
  }
  if (uniqueIds.length !== shape.total) {
    return { ok: false, error: `Pick exactly ${shape.total} players for a ${input.formation} formation.` };
  }

  const players = await prisma.player.findMany({ where: { id: { in: uniqueIds } } });
  if (players.length !== uniqueIds.length) {
    return { ok: false, error: "One of the selected players no longer exists." };
  }

  // Captain: must be one of the players actually in this squad. Every
  // complete squad needs exactly one — if the manager transferred their old
  // captain out, the UI clears the selection client-side, so a missing
  // captainId here just means "please choose one" rather than a silent
  // fallback to no captain.
  const captainId = input.captainId || null;
  if (captainId && !uniqueIds.includes(captainId)) {
    return { ok: false, error: "Your captain has to be one of your selected players." };
  }
  if (!captainId) {
    return { ok: false, error: "Choose a captain for your squad before saving." };
  }

  const totalPrice = players.reduce((sum, p) => sum + p.price, 0);
  if (totalPrice > settings.startingBudget + 1e-9) {
    return { ok: false, error: `That squad costs £${totalPrice.toFixed(1)}m — over the £${settings.startingBudget.toFixed(1)}m budget.` };
  }
  const moneyLeft = settings.startingBudget - totalPrice;

  const totalPoints = players.reduce((sum, p) => sum + p.totalPoints, 0);
  const gwPoints = players.reduce((sum, p) => sum + p.gwPoints, 0);

  const manager = await prisma.manager.upsert({
    where: { name: managerName },
    update: {},
    create: { name: managerName },
  });

  const existing = await prisma.squad.findUnique({
    where: { managerId_gameweek: { managerId: manager.id, gameweek: gw.number } },
  });
  if (existing?.locked) {
    return { ok: false, error: "Your squad is locked for this gameweek." };
  }

  const squad = await prisma.squad.upsert({
    where: { managerId_gameweek: { managerId: manager.id, gameweek: gw.number } },
    update: { formation: input.formation, totalPrice, moneyLeft, totalPoints, gwPoints, captainId },
    create: {
      managerId: manager.id,
      gameweek: gw.number,
      formation: input.formation,
      totalPrice,
      moneyLeft,
      totalPoints,
      gwPoints,
      captainId,
    },
  });

  await prisma.squadPlayer.deleteMany({ where: { squadId: squad.id } });
  await prisma.squadPlayer.createMany({
    data: uniqueIds.map((playerId) => ({ squadId: squad.id, playerId })),
  });

  revalidatePath("/");
  revalidatePath("/table");
  revalidatePath("/players");

  return { ok: true, gameweek: gw.number, moneyLeft, totalPrice };
}
