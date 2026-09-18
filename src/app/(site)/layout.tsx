import { getSettings, getCurrentGameweek, getLeagueTable } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import TransferBanner from "@/components/TransferBanner";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, gw, managerCount, table] = await Promise.all([
    getSettings(),
    getCurrentGameweek(),
    prisma.manager.count(),
    getLeagueTable(),
  ]);
  const leader = table[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        leagueName={settings.leagueName}
        season={settings.season}
        managerCount={managerCount}
        gwNumber={gw?.number ?? null}
        leaderName={leader ? leader.managerName : null}
        leaderPoints={leader ? leader.totalPoints : 0}
      />
      <TransferBanner
        open={settings.transferWindowOpen}
        openTitle={settings.bannerOpenTitle}
        openBody={settings.bannerOpenBody}
        shutTitle={settings.bannerShutTitle}
        shutBody={settings.bannerShutBody}
      />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 text-xs text-[#8a8471]">
        Lunchtime Football Fantasy League · Admin: <a href="/admin/login" className="underline hover:text-[#10201A]">/admin</a>
      </footer>
    </div>
  );
}
