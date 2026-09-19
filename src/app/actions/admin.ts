"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, verifyAdminLogin, createSession, destroySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isMatchStatus } from "@/lib/enums";
import { getSettings, getFormationList } from "@/lib/data";
import { validateSquadSelection } from "@/lib/squadValidation";

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/table");
  revalidatePath("/players");
  revalidatePath("/match-centre");
}

// ---------- Auth ----------

// This is bound to a <form action={...}> via the useFormState hook in
// LoginForm.tsx, which always calls actions as (previousState, formData) —
// NOT just (formData). Leaving out prevState here was the cause of the
// "formData.get is not a function" crash: React was passing the previous
// state object into the `formData` parameter, and the real FormData into an
// argument this function didn't accept.
export async function loginAction(
  _prevState: { ok: boolean; error: string },
  formData: FormData
): Promise<{ ok: boolean; error: string }> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const admin = await verifyAdminLogin(username, password);
  if (!admin) {
    return { ok: false, error: "Incorrect username or password." };
  }
  await createSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Players ----------

export async function createPlayer(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const realTeamId = String(formData.get("realTeamId") ?? "");
  const price = parseFloat(String(formData.get("price") ?? "4"));
  if (!name || !realTeamId) return { ok: false, error: "Name and team are required." };

  await prisma.player.create({
    data: { name, realTeamId, price: isNaN(price) ? 4 : price },
  });
  revalidatePath("/admin/players");
  refreshPublicPages();
  return { ok: true };
}

export async function updatePlayer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    realTeamId: String(formData.get("realTeamId") ?? ""),
    price: parseFloat(String(formData.get("price") ?? "0")),
    totalPoints: parseInt(String(formData.get("totalPoints") ?? "0"), 10),
    gwPoints: parseInt(String(formData.get("gwPoints") ?? "0"), 10),
    goals: parseInt(String(formData.get("goals") ?? "0"), 10),
    assists: parseInt(String(formData.get("assists") ?? "0"), 10),
    cleanSheets: parseInt(String(formData.get("cleanSheets") ?? "0"), 10),
    saves: parseInt(String(formData.get("saves") ?? "0"), 10),
    appearances: parseInt(String(formData.get("appearances") ?? "0"), 10),
  };
  await prisma.player.update({ where: { id }, data });
  revalidatePath("/admin/players");
  refreshPublicPages();
  return { ok: true };
}

export async function deletePlayer(id: string) {
  await requireAdmin();
  await prisma.player.delete({ where: { id } });
  revalidatePath("/admin/players");
  refreshPublicPages();
}

export async function createRealTeam(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Team name required." };
  await prisma.realTeam.create({ data: { name } });
  revalidatePath("/admin/players");
  return { ok: true };
}

// ---------- Managers ----------

export async function createManager(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name required." };
  await prisma.manager.create({ data: { name } });
  revalidatePath("/admin/managers");
  refreshPublicPages();
  return { ok: true };
}

export async function updateManager(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name required." };
  await prisma.manager.update({ where: { id }, data: { name } });
  revalidatePath("/admin/managers");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteManager(id: string) {
  await requireAdmin();
  await prisma.manager.delete({ where: { id } });
  revalidatePath("/admin/managers");
  refreshPublicPages();
}

// ---------- Squads ----------

export async function updateSquad(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const totalPoints = parseInt(String(formData.get("totalPoints") ?? "0"), 10);
  const gwPoints = parseInt(String(formData.get("gwPoints") ?? "0"), 10);
  const locked = formData.get("locked") === "on";
  const captainIdRaw = String(formData.get("captainId") ?? "");
  const captainId = captainIdRaw || null;

  if (captainId) {
    const belongsToSquad = await prisma.squadPlayer.findUnique({
      where: { squadId_playerId: { squadId: id, playerId: captainId } },
    });
    if (!belongsToSquad) return { ok: false, error: "That player isn't in this squad." };
  }

  await prisma.squad.update({ where: { id }, data: { totalPoints, gwPoints, locked, captainId } });
  revalidatePath("/admin/squads");
  refreshPublicPages();
  return { ok: true };
}


export async function adminSaveSquad(input: {
  squadId: string;
  formation: string;
  playerIds: string[];
  captainId: string | null;
  totalPoints: number;
  gwPoints: number;
  locked: boolean;
}) {
  await requireAdmin();

  const squad = await prisma.squad.findUnique({ where: { id: input.squadId } });
  if (!squad) return { ok: false, error: "Squad not found." };

  const settings = await getSettings();
  const validFormations = getFormationList(settings);

  const validation = await validateSquadSelection({
    formation: input.formation,
    playerIds: input.playerIds,
    captainId: input.captainId,
    startingBudget: settings.startingBudget,
    validFormations,
  });
  if (!validation.ok) return validation;

  const { uniqueIds, captainId, totalPrice, moneyLeft } = validation;

  await prisma.$transaction([
    prisma.squadPlayer.deleteMany({ where: { squadId: input.squadId } }),
    prisma.squadPlayer.createMany({
      data: uniqueIds.map((playerId) => ({ squadId: input.squadId, playerId })),
    }),
    prisma.squad.update({
      where: { id: input.squadId },
      data: {
        formation: input.formation,
        totalPrice,
        moneyLeft,
        totalPoints: input.totalPoints,
        gwPoints: input.gwPoints,
        captainId,
        locked: input.locked,
      },
    }),
  ]);

  revalidatePath("/admin/squads");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteSquad(id: string) {
  await requireAdmin();
  await prisma.squad.delete({ where: { id } });
  revalidatePath("/admin/squads");
  refreshPublicPages();
}

export async function recalcSquadPoints(id: string) {
  await requireAdmin();
  const squad = await prisma.squad.findUnique({ where: { id }, include: { players: { include: { player: true } } } });
  if (!squad) return;
  const totalPoints = squad.players.reduce((s, sp) => s + sp.player.totalPoints, 0);
  const gwPoints = squad.players.reduce((s, sp) => s + sp.player.gwPoints, 0);
  await prisma.squad.update({ where: { id }, data: { totalPoints, gwPoints } });
  revalidatePath("/admin/squads");
  refreshPublicPages();
}

// ---------- Gameweeks ----------

export async function createGameweek(formData: FormData) {
  await requireAdmin();
  const number = parseInt(String(formData.get("number") ?? "0"), 10);
  if (!number || number < 1) return { ok: false, error: "Enter a valid gameweek number." };
  const existing = await prisma.gameweek.findUnique({ where: { number } });
  if (existing) return { ok: false, error: "That gameweek already exists." };
  await prisma.gameweek.create({ data: { number } });
  revalidatePath("/admin/gameweeks");
  return { ok: true };
}

export async function setCurrentGameweek(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.gameweek.updateMany({ data: { isCurrent: false }, where: {} }),
    prisma.gameweek.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  revalidatePath("/admin/gameweeks");
  refreshPublicPages();
}

export async function toggleGameweekField(id: string, field: "transfersOpen" | "squadsLocked" | "scored") {
  await requireAdmin();
  const gw = await prisma.gameweek.findUnique({ where: { id } });
  if (!gw) return;
  switch (field) {
    case "transfersOpen":
      await prisma.gameweek.update({ where: { id }, data: { transfersOpen: !gw.transfersOpen } });
      break;
    case "squadsLocked":
      await prisma.gameweek.update({ where: { id }, data: { squadsLocked: !gw.squadsLocked } });
      break;
    case "scored":
      await prisma.gameweek.update({ where: { id }, data: { scored: !gw.scored } });
      break;
  }
  revalidatePath("/admin/gameweeks");
  refreshPublicPages();
}

export async function deleteGameweek(id: string) {
  await requireAdmin();
  await prisma.gameweek.delete({ where: { id } });
  revalidatePath("/admin/gameweeks");
  refreshPublicPages();
}

// ---------- Matches ----------

export async function createMatch(formData: FormData) {
  await requireAdmin();
  const date = String(formData.get("date") ?? "");
  const gameweekId = String(formData.get("gameweekId") ?? "");
  const homeTeamId = String(formData.get("homeTeamId") ?? "");
  const awayTeamId = String(formData.get("awayTeamId") ?? "");
  if (!date || !gameweekId || !homeTeamId || !awayTeamId) return { ok: false, error: "All fields are required." };
  if (homeTeamId === awayTeamId) return { ok: false, error: "Home and away teams must differ." };
  await prisma.match.create({
    data: { date: new Date(date), gameweekId, homeTeamId, awayTeamId },
  });
  revalidatePath("/admin/matches");
  refreshPublicPages();
  return { ok: true };
}

export async function updateMatch(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const statusRaw = String(formData.get("status") ?? "SCHEDULED");
  const status = isMatchStatus(statusRaw) ? statusRaw : "SCHEDULED";
  const homeScoreRaw = String(formData.get("homeScore") ?? "");
  const awayScoreRaw = String(formData.get("awayScore") ?? "");
  const date = String(formData.get("date") ?? "");
  const gameweekId = String(formData.get("gameweekId") ?? "");
  await prisma.match.update({
    where: { id },
    data: {
      status,
      date: date ? new Date(date) : undefined,
      gameweekId: gameweekId || undefined,
      homeScore: homeScoreRaw === "" ? null : parseInt(homeScoreRaw, 10),
      awayScore: awayScoreRaw === "" ? null : parseInt(awayScoreRaw, 10),
    },
  });
  revalidatePath("/admin/matches");
  refreshPublicPages();
  return { ok: true };
}

export async function deleteMatch(id: string) {
  await requireAdmin();
  await prisma.match.delete({ where: { id } });
  revalidatePath("/admin/matches");
  refreshPublicPages();
}

// ---------- Settings ----------

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const data = {
    leagueName: String(formData.get("leagueName") ?? "").trim() || "Lunchtime Football",
    season: String(formData.get("season") ?? "").trim() || "2026/27",
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    startingBudget: parseFloat(String(formData.get("startingBudget") ?? "50")) || 50,
    squadSize: parseInt(String(formData.get("squadSize") ?? "6"), 10) || 6,
    formations: String(formData.get("formations") ?? "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
      .join(","),
    transferWindowOpen: formData.get("transferWindowOpen") === "on",
    bannerOpenTitle: String(formData.get("bannerOpenTitle") ?? "").trim(),
    bannerOpenBody: String(formData.get("bannerOpenBody") ?? "").trim(),
    bannerShutTitle: String(formData.get("bannerShutTitle") ?? "").trim(),
    bannerShutBody: String(formData.get("bannerShutBody") ?? "").trim(),
  };
  await prisma.setting.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
  revalidatePath("/admin/settings");
  refreshPublicPages();
  return { ok: true };
}
