import PageEditor from "@/components/PageEditor";
import { getPage, Page } from "@/actions/pages";

export default async function PagesManage({ searchParams }: { searchParams: { id: string } }) {
    const { id } = await searchParams;
    let page: Page | null = null;
    if (id) {
        page = await getPage(id);
    }
    return <PageEditor initialPage={page || {
        title: "",
        route: "",
        sections: [],
        seo: {
            title: "",
            description: "",
            image: ""
        },
        isPublished: false,
        isDraft: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }} />
}
