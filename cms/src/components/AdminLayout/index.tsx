"use client";

import React, { useState } from "react";
import { GlobalSettings } from "@/actions/settings";
import { Site } from "@/actions/sites";

type SidebarChild = { label: string; href?: string; active?: boolean };
type SidebarSection = {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  type: "accordion" | "link";
  href?: string;
  children?: SidebarChild[];
};

const sidebarSections: SidebarSection[] = [
  {
    label: "Pages",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="12" height="8" rx="2" /><path d="M3 10h12" /></svg>
    ),
    type: "accordion",
    children: [
      { label: "All Pages", href: "/admin/pages", active: true },
      { label: "Add New", href: "/admin/pages/manage" },
    ],
  },
  {
    label: "Media",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="12" height="10" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M15 15l-4-4" /></svg>
    ),
    disabled: true,
    href: "/admin/media",
    type: "accordion",
    children: [
      { label: "All Media", href: "/admin/media" },
      { label: "Upload", href: "/admin/media/manage" },
    ],
  },
];

function isAccordionActive(section: SidebarSection) {
  return section.children && section.children.some((child) => child.active);
}

interface AdminLayoutProps {
  children: React.ReactNode;
  globalSettings: GlobalSettings;
  sites: Site[];
  currentSite: Site | null;
}

export default function AdminLayout({ 
  children, 
  globalSettings, 
  sites, 
  currentSite: initialCurrentSite 
}: AdminLayoutProps) {
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({ Pages: true });
  const [currentSite, setCurrentSite] = useState<Site | null>(initialCurrentSite);
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

  const toggleAccordion = (label: string) => {
    setOpenAccordions((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#232326] text-[#F3F3F6] font-sans">
      {/* Content below top bar */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 bg-[#18181A] flex flex-col">
          <div className="h-16 items-center flex justify-center border-[#383838] border-r border-[#383838]">
            <div className="text-xl font-bold">andrew CMS</div>
          </div>
          
          {/* Site Selector - Only show if multi-site is enabled and sites exist */}
          {globalSettings?.multiSiteEnabled && sites.length > 0 && currentSite && (
            <div className="px-3 py-3 border-b border-r border-[#383838]">
              <div className="relative">
                <button
                  onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#232326] border border-[#383838] rounded-lg text-sm text-[#F3F3F6] hover:bg-[#2A2A2D] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#A1A1AA]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">{currentSite.name}</div>
                      <div className="text-xs text-[#A1A1AA]">
                        {globalSettings.routingType === 'domain' 
                          ? currentSite.domain 
                          : `/${currentSite.domain.split('.')[0]}`
                        }
                      </div>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-[#A1A1AA] transition-transform ${isSiteDropdownOpen ? "rotate-180" : "rotate-0"}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                
                {isSiteDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#232326] border border-[#383838] rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {sites.map((site) => (
                        <button
                          key={site._id}
                          onClick={() => {
                            setCurrentSite(site);
                            setIsSiteDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2A2A2D] transition-colors ${
                            currentSite._id === site._id ? "bg-[#2A2A2D] text-white" : "text-[#F3F3F6]"
                          }`}
                        >
                          <div className="font-medium flex items-center gap-2">
                            {site.name}
                            {site.isDefault && (
                              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <div className="text-xs text-[#A1A1AA]">
                            {globalSettings.routingType === 'domain' 
                              ? site.domain 
                              : `/${site.domain.split('.')[0]}`
                            }
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#383838] px-3 py-2">
                      <a
                        href="/admin/sites"
                        className="w-full text-left text-sm text-blue-400 hover:text-blue-300 transition-colors block"
                      >
                        + Add New Site
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <nav className="flex-1 flex flex-col gap-0 border-r border-[#383838] px-3 py-3">
            {sidebarSections.map((section: SidebarSection, idx: number) => {
              const active = section.type === "accordion" && isAccordionActive(section);
              return (
                <div
                  key={section.label}
                  className={`mb-1 pb-2 ${section.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {section.type === "accordion" && !section.disabled ? (
                    <>
                      <button
                        className={`flex items-center w-full px-2 py-2 rounded text-sm font-semibold transition group
                          ${active ? "text-white font-bold bg-[#232326] border border-[#383838]" : "text-[#F3F3F6] hover:bg-[#232326]"}`}
                        onClick={() => toggleAccordion(section.label)}
                      >
                        <span className="mr-2 w-5 h-5 flex items-center justify-center text-[#A1A1AA]">{section.icon}</span>
                        <span className="flex-1 text-left">{section.label}</span>
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="#A1A1AA"
                          strokeWidth="2"
                          className={`ml-2 transition-transform ${openAccordions[section.label] ? "rotate-90" : "rotate-0"}`}
                        >
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </button>
                      {openAccordions[section.label] && section.children && section.children.length > 0 && (
                        <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-[#232326] pl-5">
                          {section.children.map((child: SidebarChild) => (
                            <a
                              key={child.label}
                              href={child.href || "#"}
                              className={`flex items-center gap-2 py-1 text-sm relative ${child.active ? "font-bold text-white" : "text-[#A1A1AA] hover:text-white"}`}
                            >
                              {child.active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5.5 w-0.5 h-3 bg-white"></div>
                              )}
                              <span>{child.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={section.disabled ? "#" : section.href || "#"}
                      className={`flex items-center px-2 py-2 gap-2 rounded text-sm font-semibold text-[#F3F3F6] hover:bg-[#232326] transition ${section.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-[#A1A1AA]">{section.icon}</span>
                      <span>{section.label}</span>
                      {section.disabled && <span className="text-xs text-[#A1A1AA]">Coming Soon</span>}
                    </a>
                  )}
                </div>
              );
            })}
            
            {/* Sites Section - Only show if multi-site is enabled */}
            {globalSettings?.multiSiteEnabled && (
              <div className="mb-1 pb-2">
                <a
                  href="/admin/sites"
                  className="flex items-center px-2 py-2 rounded text-sm font-semibold text-[#F3F3F6] hover:bg-[#232326] transition"
                >
                  <span className="mr-2 w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                  </span>
                  <span>Sites</span>
                </a>
              </div>
            )}
            
            {/* Global Settings Link */}
            <div className="mt-auto pt-4 border-t border-[#383838]">
              <a
                href="/admin/settings"
                className="flex items-center px-2 py-2 rounded text-sm font-semibold text-[#F3F3F6] hover:bg-[#232326] transition"
              >
                <span className="mr-2 w-5 h-5 flex items-center justify-center text-[#A1A1AA]">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span>Global Settings</span>
              </a>
            </div>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="bg-[#232328] h-full w-full overflow-x-hidden overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  );
} 