"use client";

import { blockRegistry } from "@/blocks/registry";
import { useState } from "react";

export default function BlockBuilder({ sections, setSections }: { sections: any, setSections: any }) {
    const [currentSection, setCurrentSection] = useState(0);
    const [viewMode, setViewMode] = useState<'separated' | 'page'>('separated');
    const [showAddBlock, setShowAddBlock] = useState(false);

    const moveSection = (index: number, direction: number) => {
        const newSections = [...sections];
        if (direction === -1 && index === 0) {
            // Move first to last
            const [first] = newSections.splice(0, 1);
            newSections.push(first);
            setSections(newSections);
            setCurrentSection(newSections.length - 1);
        } else if (direction === 1 && index === newSections.length - 1) {
            // Move last to first
            const [last] = newSections.splice(index, 1);
            newSections.unshift(last);
            setSections(newSections);
            setCurrentSection(0);
        } else {
            const temp = newSections[index];
            newSections[index] = newSections[index + direction];
            newSections[index + direction] = temp;
            setSections(newSections);
            setCurrentSection(index + direction);
        }
    }

    const deleteSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    }

    const addSection = (type: string) => {
        const newSection = {
            type,
            title: blockRegistry[type as keyof typeof blockRegistry].title,
            ...Object.fromEntries(
                blockRegistry[type as keyof typeof blockRegistry].fields.map((field: any) => [
                    field.slug,
                    field.type === 'select' ? field.options?.[0]?.value : ''
                ])
            )
        };
        
        const newSections = [...sections, newSection];
        setSections(newSections);
        setCurrentSection(newSections.length - 1);
        setShowAddBlock(false);
    }

    return (
        <>
            {/* Left Side (Sidebar/Navigation) */}
            <div className="w-[70%] h-full overflow-y-auto bg-zinc-900 border-r border-[#383838] p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddBlock(!showAddBlock)}
                            className="px-3 py-1 text-xs font-medium rounded border border-[#383838] bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            title="Add new block"
                        >
                            ➕ Add Block
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'separated' ? 'page' : 'separated')}
                            className="px-3 py-1 text-xs font-medium rounded border border-[#383838] bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            title={`Switch to ${viewMode === 'separated' ? 'page' : 'separated'} view`}
                        >
                            {viewMode === 'separated' ? '📄 Separated' : '🔲 Page'}
                        </button>
                    </div>
                </div>

                {/* Add Block Dropdown */}
                {showAddBlock && (
                    <div className="mb-4 p-4 bg-zinc-800 border border-[#383838] rounded-lg">
                        <h4 className="text-sm font-semibold mb-3 text-zinc-200">Select Block Type:</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(blockRegistry).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => addSection(key)}
                                    className="p-2 text-xs text-left bg-zinc-700 hover:bg-zinc-600 rounded border border-[#383838] transition-colors"
                                >
                                    <div className="font-medium text-zinc-200">{section.title}</div>
                                    <div className="text-zinc-400 text-xs mt-1">
                                        {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowAddBlock(false)}
                            className="mt-3 w-full px-3 py-1 text-xs font-medium rounded border border-[#383838] bg-zinc-700 hover:bg-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className={`flex flex-col ${viewMode === 'separated' ? 'gap-4' : ''}`}>
                    {sections.map((section: any, index: number) => (
                        <div className={`relative flex flex-col ${viewMode === 'separated' ? 'gap-2 mt-2' : ''}`} onClick={() => setCurrentSection(index)} key={`${section.type}-${index}`}>
                            <div className={`bg-zinc-900 overflow-hidden ${viewMode === 'separated' ? 'rounded-lg border border-[#383838]' : ''} ${currentSection === index ? (viewMode === 'separated' ? "border-white" : "border-2 border-blue-500") : ""}`}>
                                {blockRegistry[section.type as keyof typeof blockRegistry].render(section)}
                            </div>
                            {viewMode === 'separated' && (
                                <div className="absolute top-0 left-0 w-full h-full z-90">
                                    <span className="absolute left-4 top-0 -translate-y-1/2 bg-zinc-900 px-2 text-xs font-semibold border border-[#383838] rounded z-20">{blockRegistry[section.type as keyof typeof blockRegistry].title} - {section.title} ({index + 1})</span>
                                    <div className="absolute right-4 top-0 -translate-y-1/2 flex gap-x-2 z-20">
                                        <span
                                            className="bg-zinc-900 px-2 text-xs font-semibold border border-[#383838] rounded cursor-pointer"
                                            onClick={() => moveSection(index, -1)}
                                            title="Move up"
                                        >▲</span>
                                        <span
                                            className="bg-zinc-900 px-2 text-xs font-semibold border border-[#383838] rounded cursor-pointer"
                                            onClick={() => moveSection(index, 1)}
                                            title="Move down"
                                        >▼</span>
                                        <span
                                            className="bg-zinc-900 px-2 text-xs font-semibold border border-[#383838] rounded cursor-pointer"
                                            onClick={() => deleteSection(index)}
                                            title="Delete"
                                        >X</span>
                                    </div>
                                </div>
                            )}
                            {viewMode === 'page' && currentSection === index && (
                                <div className="absolute top-0 right-0 flex flex-col items-end p-2 z-90">
                                    <div className="bg-zinc-900 px-2 py-1 text-xs font-semibold border border-[#383838] rounded mb-2 whitespace-nowrap">
                                        {blockRegistry[section.type as keyof typeof blockRegistry].title} - {section.title} ({index + 1})
                                    </div>
                                    <div className="flex gap-1">
                                        <span
                                            className="bg-zinc-900 px-2 py-1 text-xs font-semibold border border-[#383838] rounded cursor-pointer hover:bg-zinc-800 transition-colors"
                                            onClick={() => moveSection(index, -1)}
                                            title="Move up"
                                        >▲</span>
                                        <span
                                            className="bg-zinc-900 px-2 py-1 text-xs font-semibold border border-[#383838] rounded cursor-pointer hover:bg-zinc-800 transition-colors"
                                            onClick={() => moveSection(index, 1)}
                                            title="Move down"
                                        >▼</span>
                                        <span
                                            className="bg-zinc-900 px-2 py-1 text-xs font-semibold border border-[#383838] rounded cursor-pointer hover:bg-zinc-800 transition-colors"
                                            onClick={() => deleteSection(index)}
                                            title="Delete"
                                        >X</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Right Side (Main Content) */}
            <div className="flex-1 h-full overflow-y-auto bg-zinc-950">
                {/* Settings Panel UI */}
                <div className="h-full bg-zinc-900 shadow-lg text-zinc-100 transition-all duration-300 ease-in-out">
                    <div className="px-6 pt-6 transition-all duration-300 ease-in-out">
                        <h2 className="text-lg font-semibold mb-4 transition-all duration-300 ease-in-out">
                            Section: {sections[currentSection]?.title}
                        </h2>
                    </div>
                    <div className="transition-all duration-300 ease-in-out">
                        {blockRegistry[sections[currentSection]?.type as keyof typeof blockRegistry]?.fields.map((field: any, fieldIndex: number) => (
                            <div 
                                className="border-b border-[#383838] px-6 py-6 transition-all duration-300 ease-in-out hover:bg-zinc-800/50" 
                                key={`${sections[currentSection]?.type}-${field.slug}`}
                                style={{
                                    animationDelay: `${fieldIndex * 50}ms`,
                                    animation: 'fadeInUp 0.3s ease-out forwards'
                                }}
                            >
                                <h3 className="text-md font-semibold mb-4 transition-all duration-200 ease-in-out">{field.title}</h3>
                                {field.type === "select" ? (
                                    <select 
                                        className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-zinc-600"
                                        value={sections[currentSection][field.slug] || field.options?.[0]?.value || ""}
                                        onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[currentSection][field.slug] = e.target.value;
                                            setSections(newSections);
                                        }}
                                    >
                                        {field.options?.map((option: any) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === "color" ? (
                                    <div className="flex items-center space-x-3 transition-all duration-200 ease-in-out">
                                        <input 
                                            type="color" 
                                            className="w-16 h-10 rounded border border-zinc-700 bg-zinc-800 cursor-pointer transition-all duration-200 ease-in-out hover:border-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            value={sections[currentSection][field.slug] || "#ffffff"}
                                            onChange={(e) => {
                                                const newSections = [...sections];
                                                newSections[currentSection][field.slug] = e.target.value;
                                                setSections(newSections);
                                            }}
                                        />
                                        <input 
                                            type="text" 
                                            className="flex-1 px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-zinc-600"
                                            placeholder="rgba(255, 255, 255, 0.9) or #ffffff"
                                            value={sections[currentSection][field.slug] || ""}
                                            onChange={(e) => {
                                                const newSections = [...sections];
                                                newSections[currentSection][field.slug] = e.target.value;
                                                setSections(newSections);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <input 
                                        type="text" 
                                        className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-zinc-600" 
                                        value={sections[currentSection][field.slug] || ""} 
                                        onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[currentSection][field.slug] = e.target.value;
                                            setSections(newSections);
                                        }} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* CSS Animations */}
                <style jsx>{`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </>
    );
}