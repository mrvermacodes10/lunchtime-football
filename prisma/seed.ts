import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed roster comes straight from the brief (Section 5). Prices below are
// just sensible starting points — everything is editable from /admin the
// moment the app is running. Players have no position — they're just
// players.
//
// NOTE: there are genuinely two different players both called "Kabir" on
// Team 1 (the brief calls them "Kabir 1" and "Kabir 2"). They are kept as
// two separate Player rows with independent ids, prices, points and stats —
// the admin can rename either of them from the Players page if that's
// clearer day-to-day (e.g. "Kabir S" / "Kabir T").
const TEAM_1 = [
  { name: "Neel", price: 6.0 },
  { name: "Naman", price: 5.0 },
  { name: "Nishil", price: 7.0 },
  { name: "Amay", price: 4.5 },
  { name: "Ishaan", price: 5.5 },
  { name: "Kabir", price: 4.5 }, // Kabir 1
  { name: "Zahaan", price: 6.5 },
  { name: "Chouha", price: 4.0 },
  { name: "Kabir", price: 4.5 }, // Kabir 2 — deliberately a separate player
  { name: "Vivaan Parekh", price: 5.0 },
  { name: "Aditya", price: 4.0 },
];

const TEAM_2 = [
  { name: "Kiyaan", price: 4.5 },
  { name: "Ganeri", price: 7.0 },
  { name: "Raghav", price: 5.5 },
  { name: "Kuku", price: 4.0 },
  { name: "Mohak", price: 4.5 },
  { name: "Shetty", price: 5.0 },
  { name: "Giri", price: 4.0 },
  { name: "Nandi", price: 6.0 },
  { name: "Khanna", price: 4.5 },
];

async function seedTeam(teamName: string, roster: typeof TEAM_1) {
  const team = await prisma.realTeam.upsert({
    where: { name: teamName },
    update: {},
    create: { name: teamName },
  });

  // Idempotency is handled per-team (not per-player-name) on purpose: two
  // players can legitimately share a name (the two Kabirs), so "does a
  // player with this name already exist" is the wrong check. Instead, if
  // this team already has any players at all, assume it's been seeded
  // before and leave it alone rather than risk creating duplicates.
  const existingCount = await prisma.player.count({ where: { realTeamId: team.id } });
  if (existingCount > 0) {
    console.log(`${teamName} already has ${existingCount} players — skipping roster insert.`);
    return team;
  }

  for (const p of roster) {
    await prisma.player.create({ data: { ...p, realTeamId: team.id } });
  }
  console.log(`Seeded ${roster.length} players for ${teamName}.`);
  return team;
}

async function main() {
  console.log("Seeding Lunchtime Football...");

  const team1 = await seedTeam("Team 1", TEAM_1);
  const team2 = await seedTeam("Team 2", TEAM_2);

  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const gw1 = await prisma.gameweek.upsert({
    where: { number: 1 },
    update: {},
    create: { number: 1, isCurrent: true, transfersOpen: true },
  });

  const matchCount = await prisma.match.count({ where: { gameweekId: gw1.id } });
  if (matchCount === 0) {
    await prisma.match.create({
      data: {
        date: new Date(),
        status: "SCHEDULED",
        gameweekId: gw1.id,
        homeTeamId: team1.id,
        awayTeamId: team2.id,
      },
    });
    console.log("Seeded an opening Team 1 vs Team 2 fixture for GW1.");
  }

  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: {},
    create: { username: adminUsername, passwordHash },
  });

  console.log("");
  console.log("=================================================");
  console.log(`Admin login  ->  username: "${adminUsername}"   password: "${adminPassword}"`);
  console.log("=================================================");
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
