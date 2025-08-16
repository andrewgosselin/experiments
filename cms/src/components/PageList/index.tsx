"use client";

import { useState } from "react";
import Link from "next/link";
import { Page } from "@/actions/pages";

const ITEMS_PER_PAGE = 8;

interface PageListProps {
    initialPages: Page[];
}

export default function PageList({ initialPages }: PageListProps) {
    const [pages] = useState<Page[]>(initialPages);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "cards" | "grid">("list");
    const [sortBy, setSortBy] = useState("lastModified");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter and search logic
    const filteredPages = pages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            page.route.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || 
                            (statusFilter === "published" && page.isPublished) ||
                            (statusFilter === "draft" && page.isDraft);
        return matchesSearch && matchesStatus;
    });

    // Sort logic
    const sortedPages = [...filteredPages].sort((a, b) => {
        switch (sortBy) {
            case "title":
                return a.title.localeCompare(b.title);
            case "lastModified":
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            case "created":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "route":
                return a.route.localeCompare(b.route);
            default:
                return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedPages.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPages = sortedPages.slice(startIndex, endIndex);

    // Reset to first page when filters change
    const handleFilterChange = (newFilter: string) => {
        setStatusFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (newSearch: string) => {
        setSearchTerm(newSearch);
        setCurrentPage(1);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setCurrentPage(1);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadge = (page: Page) => {
        if (page.isPublished) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                    Published
                </span>
            );
        } else if (page.isDraft) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    Draft
                </span>
            );
        } else {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-500/10 text-gray-400 border-gray-500/20">
                    Archived
                </span>
            );
        }
    };

    const generateScreenshot = (page: Page) => {
        // Generate a placeholder screenshot based on page title
        const colors = ['4F46E5', '059669', 'DC2626', '7C3AED', 'EA580C', '16A34A', '0891B2', 'BE185D', '9333EA', '6B7280'];
        const color = colors[Math.abs(page.title.length) % colors.length];
        return `https://via.placeholder.com/300x200/${color}/FFFFFF?text=${encodeURIComponent(page.title)}`;
    };

    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            
            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }
            
            return pages;
        };

        return (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#383838] bg-[#131315]">
                <div className="text-sm text-zinc-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedPages.length)} of {sortedPages.length} pages
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-[#232326] text-white rounded border border-[#383838] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#383838] transition"
                    >
                        Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            disabled={page === '...'}
                            className={`px-3 py-1 rounded border transition ${
                                page === currentPage
                                    ? 'bg-white text-black border-white'
                                    : page === '...'
                                    ? 'bg-transparent text-zinc-400 border-transparent cursor-default'
                                    : 'bg-[#232326] text-white border-[#383838] hover:bg-[#383838]'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-[#232326] text-white rounded border border-[#383838] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#383838] transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#0A0A0B]">
            {/* Header */}
            <header className="w-full h-16 flex items-center border-b border-[#383838] bg-[#131315] flex-shrink-0">
                <div className="flex-1 flex items-center justify-between mx-auto px-6">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-semibold text-white">Pages</h1>
                        <span className="text-zinc-400 text-sm">{filteredPages.length} pages</span>
                    </div>
                    <Link
                        href="/admin/pages/manage"
                        className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition"
                    >
                        Create New Page
                    </Link>
                </div>
            </header>

            {/* Filters and Search */}
            <div className="p-6 border-b border-[#383838] bg-[#131315] flex-shrink-0">
                <div className="flex items-center justify-between gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[#232326] border border-[#383838] rounded-lg text-white placeholder-zinc-400 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="px-3 py-2 bg-[#232326] border border-[#383838] rounded-lg text-white focus:border-blue-500 outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-3 py-2 bg-[#232326] border border-[#383838] rounded-lg text-white focus:border-blue-500 outline-none"
                        >
                            <option value="lastModified">Last Modified</option>
                            <option value="title">Title</option>
                            <option value="created">Created</option>
                            <option value="route">Route</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-[#232326] border border-[#383838] rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded ${viewMode === "list" ? "bg-[#383838] text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h8M4 10h8M4 14h8" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode("cards")}
                                className={`p-2 rounded ${viewMode === "cards" ? "bg-[#383838] text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                                    <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="10" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="2" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="10" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded ${viewMode === "grid" ? "bg-[#383838] text-white" : "text-zinc-400 hover:text-white"}`}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 16 16">
                                    <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="14" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="14" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="2" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="8" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                    <rect x="14" y="14" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto p-6">
                    {viewMode === "list" && (
                        <div className="bg-[#131315] rounded-lg border border-[#383838] overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-[#1A1A1C] border-b border-[#383838] sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Page</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Last Modified</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#383838]">
                                    {paginatedPages.map((page) => (
                                        <tr key={page._id} className="hover:bg-[#1A1A1C] transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={generateScreenshot(page)}
                                                        alt={page.title}
                                                        className="w-16 h-12 object-cover rounded border border-[#383838]"
                                                    />
                                                    <div>
                                                        <div className="text-white font-medium">{page.title}</div>
                                                        <div className="text-zinc-400 text-sm">{page.route}</div>
                                                        <div className="text-zinc-500 text-xs">
                                                            {page.sections.length} sections
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(page)}</td>
                                            <td className="px-6 py-4 text-zinc-300">{formatDate(page.updatedAt)}</td>
                                            <td className="px-6 py-4 text-zinc-300">{formatDate(page.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/pages/manage?id=${page._id}`}
                                                        className="px-3 py-1 bg-[#232326] text-white text-sm rounded hover:bg-[#383838] transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button className="px-3 py-1 bg-[#232326] text-white text-sm rounded hover:bg-[#383838] transition">
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {viewMode === "cards" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedPages.map((page) => (
                                <div key={page._id} className="bg-[#131315] rounded-lg border border-[#383838] overflow-hidden hover:border-[#4F4F4F] transition">
                                    <img
                                        src={generateScreenshot(page)}
                                        alt={page.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-white font-semibold text-lg">{page.title}</h3>
                                            {getStatusBadge(page)}
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-4">{page.route}</p>
                                        <div className="text-sm text-zinc-400 mb-4">
                                            {page.sections.length} sections
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                                            <span>Created {formatDate(page.createdAt)}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500 mb-4">
                                            Modified {formatDate(page.updatedAt)}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/pages/manage?id=${page._id}`}
                                                className="flex-1 px-3 py-2 bg-[#232326] text-white text-sm rounded text-center hover:bg-[#383838] transition"
                                            >
                                                Edit
                                            </Link>
                                            <button className="flex-1 px-3 py-2 bg-[#232326] text-white text-sm rounded hover:bg-[#383838] transition">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {viewMode === "grid" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {paginatedPages.map((page) => (
                                <div key={page._id} className="bg-[#131315] rounded-lg border border-[#383838] overflow-hidden hover:border-[#4F4F4F] transition group">
                                    <div className="relative">
                                        <img
                                            src={generateScreenshot(page)}
                                            alt={page.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/pages/manage?id=${page._id}`}
                                                    className="px-2 py-1 bg-white text-black text-xs rounded hover:bg-zinc-100 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button className="px-2 py-1 bg-white text-black text-xs rounded hover:bg-zinc-100 transition">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-medium text-sm truncate">{page.title}</h3>
                                            {getStatusBadge(page)}
                                        </div>
                                        <p className="text-zinc-400 text-xs mb-2">{page.route}</p>
                                        <div className="text-xs text-zinc-500">
                                            {page.sections.length} sections
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {paginatedPages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-zinc-400 text-lg">No pages found</div>
                            <div className="text-zinc-500 text-sm mt-2">
                                {pages.length === 0 ? "Create your first page to get started" : "Try adjusting your search or filters"}
                            </div>
                            {pages.length === 0 && (
                                <Link
                                    href="/admin/pages/manage"
                                    className="inline-block mt-4 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition"
                                >
                                    Create Your First Page
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination />
            </div>
        </div>
    );
} 
