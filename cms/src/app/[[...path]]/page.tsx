import PageEditor from "@/components/PageEditor";
import { getPage, getPageByRoute, getPages, Page } from "@/actions/pages";
import { blockRegistry } from "@/blocks/registry";
import { getGlobalSettings } from "@/actions/settings";
import { headers } from "next/headers";
import { getSiteByDomain, getSiteDomainMapping } from "@/actions/sites";

export default async function MainRoute({ params }: { params: { path: string[] } }) {
    const { path } = await params;
    const requestHeaders = await headers();

    const globalSettings = await getGlobalSettings();
        
    // Handle empty path (homepage)
    const route = path.length === 0 ? "" : path.join("/");

    let siteId = undefined;

    if(globalSettings.multiSiteEnabled) {
        if(globalSettings.routingType === "domain") {
            const siteDomainMapping = await getSiteDomainMapping();
            // get current domain (server-side)
            const url = new URL(requestHeaders.get("x-request-url") || "");
            const domain = url.hostname;
            const site = siteDomainMapping.find((mapping) => mapping.domain === domain);
            if(site) {
                siteId = site.siteId;
            }

        } else if(globalSettings.routingType === "path") {
        }
    }
    
    // Get the page data for this route
    const page = await getPageByRoute(route, siteId);
    if (!page) {
        return <div>Page not found</div>;
    }
    return (
        <>
            {page.sections.map((section) => (
                blockRegistry[section.type as keyof typeof blockRegistry].render(section)
            ))}
        </>
    );
}
