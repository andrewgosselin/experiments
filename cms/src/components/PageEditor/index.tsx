"use client";

import { useState } from "react";
import BlockBuilder, { sectionTypes } from "@/components/BlockBuilder";
import { Page, publishPage, savePageDraft, updatePage as updatePageAction, createPage } from "@/actions/pages";
import { APP_URL } from "@/config/general";


export default function PageEditor({ initialPage }: { initialPage: Page }) {
    const [page, setPage] = useState(initialPage);
    const [currentTab, setCurrentTab] = useState("content");
    const [route, setRoute] = useState(initialPage.route || "homepage");
    const [showFullUrl, setShowFullUrl] = useState(false);
    const [isPublished, setIsPublished] = useState(initialPage.isPublished || false);
    const [seo, setSeo] = useState(initialPage.seo || {
        title: "Homepage - YourBrand",
        description: "Transform your ideas into reality with our powerful tools and innovative solutions designed for the modern world.",
        image: "https://via.placeholder.com/600x315.png?text=Social+Preview"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => setRoute(e.target.value);
    const handleRouteBlur = () => setShowFullUrl(true);
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPage({ ...page, title: e.target.value });
    };
    const openSettings = () => alert("Open general settings");
    const viewLive = () => window.open(`${APP_URL}/${route}`, "_blank");
    
    const copyLink = () => {
        navigator.clipboard.writeText(`${APP_URL}/${route}`);
        setMessage({ type: 'success', text: 'Link copied to clipboard!' });
        setTimeout(() => setMessage(null), 3000);
    };

    const saveDraft = async () => {
        setIsLoading(true);
        try {
            let updatedPage: Page | null = null;
            
            if (!page._id) {
                // Create new page
                const newPage = await createPage({
                    title: page.title,
                    route: route,
                    sections: page.sections,
                    seo: seo
                });
                updatedPage = newPage;
                setPage(newPage); // Update local state with the new page (including ID)
            } else {
                // Update existing page
                updatedPage = await savePageDraft(page._id, {
                    title: page.title,
                    route: route,
                    sections: page.sections,
                    seo: seo
                });
                if (updatedPage) {
                    setPage(updatedPage);
                }
            }
            
            if (updatedPage) {
                setMessage({ type: 'success', text: page._id ? 'Draft saved successfully!' : 'Page created successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save page.' });
            }
        } catch (error) {
            console.error('Error saving page:', error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save page.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const publishPageAction = async () => {
        setIsLoading(true);
        try {
            let publishedPage: Page | null = null;
            
            if (!page._id) {
                // Create and publish new page
                const newPage = await createPage({
                    title: page.title,
                    route: route,
                    sections: page.sections,
                    seo: seo
                });
                
                // Then publish it
                publishedPage = await publishPage(newPage._id!);
                setPage(publishedPage || newPage);
            } else {
                // Publish existing page
                publishedPage = await publishPage(page._id);
                if (publishedPage) {
                    setPage(publishedPage);
                }
            }
            
            if (publishedPage) {
                setIsPublished(true);
                setMessage({ type: 'success', text: page._id ? 'Page published successfully!' : 'Page created and published successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to publish page.' });
            }
        } catch (error) {
            console.error('Error publishing page:', error);
            setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to publish page.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const updatePageHandler = async () => {
        if (!page._id) {
            setMessage({ type: 'error', text: 'Cannot update a page that hasn\'t been saved yet. Please save the page first.' });
            return;
        }

        // Additional validation for page ID
        if (typeof page._id !== 'string' || page._id.trim() === '') {
            setMessage({ type: 'error', text: 'Invalid page ID. Please save the page first.' });
            return;
        }

        setIsLoading(true);
        try {
            console.log('Updating page with ID:', page._id);
            console.log('Update data:', {
                title: page.title,
                route: route,
                sections: page.sections,
                seo: seo
            });

            const updatedPage = await updatePageAction(page._id, {
                title: page.title,
                route: route,
                sections: page.sections,
                seo: seo
            });
            
            if (updatedPage) {
                setPage(updatedPage);
                setMessage({ type: 'success', text: 'Page updated successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update page.' });
            }
        } catch (error) {
            console.error('Error updating page:', error);
            console.error('Page ID:', page._id);
            console.error('Page data:', page);
            
            // More specific error handling
            if (error instanceof Error) {
                if (error.message.includes('too few parameters')) {
                    setMessage({ type: 'error', text: 'Database error: Invalid page ID. Please try saving the page again.' });
                } else if (error.message.includes('Page not found')) {
                    setMessage({ type: 'error', text: 'Page not found. It may have been deleted.' });
                } else {
                    setMessage({ type: 'error', text: error.message });
                }
            } else {
                setMessage({ type: 'error', text: 'Failed to update page.' });
            }
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="h-full w-full overflow-hidden">
            {/* Message Display */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
                    message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Secondary Toolbar for Page Actions */}
            <div className="w-full flex items-center justify-between px-6 py-3 border-b border-[#232326] bg-[#101012]">
                <div className="flex items-center gap-4">
                    {/* Page Title */}
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-300">Title:</span>
                        <input
                            type="text"
                            value={page.title}
                            onChange={handleTitleChange}
                            className="px-3 py-1 bg-[#232326] border border-[#383838] rounded text-zinc-100 focus:border-blue-500 outline-none min-w-[200px]"
                            placeholder="Page title"
                        />
                    </div>
                    
                    {/* Route */}
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-300">Route:</span>
                        <div className="flex items-center bg-[#232326] rounded border border-[#383838] overflow-hidden">
                            <span className="px-2 text-zinc-400 select-none">{APP_URL}/</span>
                            <input
                                className="bg-transparent text-zinc-100 px-2 py-1 outline-none w-40"
                                value={route}
                                onChange={handleRouteChange}
                                onBlur={handleRouteBlur}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Copy link */}
                    <button
                        onClick={copyLink}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#353535] text-zinc-200 bg-transparent hover:bg-[#232326] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block" viewBox="0 0 18 18">
                            <rect x="3" y="3" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                            <path d="M9 12V6M6 9h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Copy link
                    </button>
                    {/* Save draft */}
                    <button
                        onClick={saveDraft}
                        disabled={isLoading}
                        className="px-4 py-1 rounded-full bg-[#232326] text-white font-medium border border-[#353535] hover:bg-[#353535] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save draft'
                        )}
                    </button>
                    {/* Publish */}
                    <button
                        onClick={isPublished ? updatePageHandler : publishPageAction}
                        disabled={isLoading}
                        className="px-4 py-1 rounded-full bg-white text-black font-medium border border-[#353535] hover:bg-zinc-100 transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                {isPublished ? 'Updating...' : 'Publishing...'}
                            </>
                        ) : (
                            <>
                                {isPublished ? 'Update' : 'Publish'}
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block" viewBox="0 0 16 16">
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
            {/* Top Bar (with title) */}
            <header className="w-full h-16 flex items-center border-b border-[#383838] bg-[#131315]">
                <div className="flex-1 flex items-center justify-between mx-auto px-6">
                    <div className="flex items-center gap-8">
                        <nav className="flex gap-4 text-sm">
                            <button onClick={() => setCurrentTab("content")} className={`text-zinc-100 hover:text-zinc-300 px-2 py-1 rounded border ${currentTab === "content" ? "text-white bg-[#232326] border-[#383838]" : "border-[transparent]"}`}>Content</button>
                            <button onClick={() => setCurrentTab("seo")} className={`text-zinc-100 hover:text-zinc-300 px-2 py-1 rounded border ${currentTab === "seo" ? "text-white bg-[#232326] border-[#383838]" : "border-[transparent]"}`}>SEO</button>
                        </nav>
                    </div>
                </div>
            </header>
            {currentTab === "content" && (
                <div className="flex h-full max-h-full w-full mb-16">
                    <BlockBuilder sections={page.sections} setSections={(sections: any) => setPage({ ...page, sections })} />
                </div>
            )}
            {currentTab === "seo" && (
                <div className="flex h-full max-h-full w-full mb-16 p-8 gap-8">
                    {/* Left: SEO Inputs */}
                    <div className="flex flex-col gap-6 w-1/2 max-w-md">
                        <label className="flex flex-col gap-1">
                            <span className="text-zinc-300 font-medium">SEO Title</span>
                            <input
                                className="bg-[#232326] text-zinc-100 px-3 py-2 rounded border border-[#383838] focus:border-blue-500 outline-none"
                                value={seo.title}
                                onChange={e => setSeo({ ...seo, title: e.target.value })}
                                maxLength={60}
                                placeholder="SEO Title"
                            />
                            <span className="text-xs text-zinc-500">Recommended: 50–60 characters</span>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-zinc-300 font-medium">SEO Description</span>
                            <textarea
                                className="bg-[#232326] text-zinc-100 px-3 py-2 rounded border border-[#383838] focus:border-blue-500 outline-none resize-none"
                                value={seo.description}
                                onChange={e => setSeo({ ...seo, description: e.target.value })}
                                maxLength={160}
                                rows={3}
                                placeholder="SEO Description"
                            />
                            <span className="text-xs text-zinc-500">Recommended: 50–160 characters</span>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-zinc-300 font-medium">Social Image URL</span>
                            <input
                                className="bg-[#232326] text-zinc-100 px-3 py-2 rounded border border-[#383838] focus:border-blue-500 outline-none"
                                value={seo.image}
                                onChange={e => setSeo({ ...seo, image: e.target.value })}
                                placeholder="https://..."
                            />
                            <span className="text-xs text-zinc-500">Recommended: 1200x630px</span>
                        </label>
                    </div>
                    {/* Right: Previews */}
                    <div className="flex flex-col gap-8 w-1/2">
                        {/* Google Search Preview */}
                        <div className="bg-white rounded-lg shadow p-6 max-w-xl border border-zinc-200">
                            <div className="text-blue-800 text-lg leading-tight truncate" style={{fontFamily: 'Arial, sans-serif'}}>{seo.title || 'SEO Title'}</div>
                            <div className="text-green-700 text-sm mb-1" style={{fontFamily: 'Arial, sans-serif'}}>{APP_URL}/{route}</div>
                            <div className="text-zinc-700 text-base" style={{fontFamily: 'Arial, sans-serif'}}>{seo.description || 'SEO description goes here.'}</div>
                        </div>
                        {/* Social Preview */}
                        <div className="bg-[#232326] rounded-lg shadow max-w-xl border border-[#353535] overflow-hidden">
                            <img src={seo.image} alt="Social preview" className="w-full h-48 object-cover bg-zinc-800" />
                            <div className="p-4">
                                <div className="text-white text-lg font-semibold mb-1">{seo.title || 'SEO Title'}</div>
                                <div className="text-zinc-400 text-base">{seo.description || 'SEO description goes here.'}</div>
                                <div className="text-blue-400 text-xs mt-2">{APP_URL}/{route}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}