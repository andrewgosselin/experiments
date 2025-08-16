import { getSites, type Site } from "@/actions/sites";
import { getGlobalSettings, type GlobalSettings } from "@/actions/settings";
import SiteList from "@/components/SiteList";

export default async function SitesPage() {
  // Fetch data on the server
  const [sites, globalSettings] = await Promise.all([
    getSites({ sort: 'name' }),
    getGlobalSettings()
  ]);
  
  return <SiteList initialSites={sites} initialGlobalSettings={globalSettings} />;
} 