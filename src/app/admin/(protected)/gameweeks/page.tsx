import { prisma } from "@/lib/prisma";
import GameweeksAdmin from "@/components/admin/GameweeksAdmin";

export default async function AdminGameweeksPage() {
  const gameweeks = await prisma.gameweek.findMany({ orderBy: { number: "asc" } });
  return <GameweeksAdmin gameweeks={gameweeks} />;
}
