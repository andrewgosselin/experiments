import { getPages } from "@/actions/pages";
import PageList from "@/components/PageList";

export default async function PagesList() {
    const pages = await getPages();
    
    return <PageList initialPages={pages} />;
} 