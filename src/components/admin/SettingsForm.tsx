"use client";

import { useTransition, useState } from "react";
import { updateSettings } from "@/app/actions/admin";

type Settings = {
  leagueName: string;
  season: string;
  subtitle: string;
  startingBudget: number;
  squadSize: number;
  formations: string;
  transferWindowOpen: boolean;
  bannerOpenTitle: string;
  bannerOpenBody: string;
  bannerShutTitle: string;
  bannerShutBody: string;
};

const inputCls = "mt-1.5 w-full rounded-md border border-[#cfc7b2] px-3 py-2 text-sm";
const labelCls = "text-xs font-semibold uppercase tracking-wide text-[#8a8471]";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await updateSettings(fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        })
      }
      className="space-y-6 max-w-2xl"
    >
      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold">League identity</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>League name</label>
            <input name="leagueName" defaultValue={settings.leagueName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Season</label>
            <input name="season" defaultValue={settings.season} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Subtitle</label>
          <input name="subtitle" defaultValue={settings.subtitle} className={inputCls} />
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold">Squad rules</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Starting budget (£m)</label>
            <input name="startingBudget" type="number" step="0.5" defaultValue={settings.startingBudget} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Squad size (reference only)</label>
            <input name="squadSize" type="number" defaultValue={settings.squadSize} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Formations (comma separated, e.g. 2-2-2 — a pitch layout only, not player positions)</label>
          <input name="formations" defaultValue={settings.formations} className={inputCls} />
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-display font-semibold">Transfer window</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="transferWindowOpen" defaultChecked={settings.transferWindowOpen} />
          Transfer window is open
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Open banner title</label>
            <input name="bannerOpenTitle" defaultValue={settings.bannerOpenTitle} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Open banner body</label>
            <input name="bannerOpenBody" defaultValue={settings.bannerOpenBody} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Shut banner title</label>
            <input name="bannerShutTitle" defaultValue={settings.bannerShutTitle} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Shut banner body</label>
            <input name="bannerShutBody" defaultValue={settings.bannerShutBody} className={inputCls} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={isPending}>
          {isPending ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm text-[#2B5A2B]">Saved.</span>}
      </div>
    </form>
  );
}
