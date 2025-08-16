import { getGlobalSettings, type GlobalSettings } from "@/actions/settings";
import SettingsPageClient from "./SettingsPageClient";

export default async function GlobalSettingsPage() {
  // Fetch settings on the server
  const settings = await getGlobalSettings();
  
  return <SettingsPageClient initialSettings={settings} />;
} 