import { getSettings } from "@/lib/data";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
