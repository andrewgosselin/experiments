"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridIcon, ListIcon, FilterIcon, Grid2x2Icon, Grid3x3Icon } from "lucide-react";
import { ExtendedFileMetadata } from "./file-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FileIcon, ImageIcon, VideoIcon, FileTextIcon, TagIcon } from "lucide-react";

interface FileFiltersProps {
  files: ExtendedFileMetadata[];
  displayType: "grid" | "list";
  onDisplayTypeChange: (type: "grid" | "list") => void;
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
  gridSize?: number;
  onGridSizeChange?: (size: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mediaFilter: "all" | "image" | "video" | "misc";
  onMediaFilterChange: (filter: "all" | "image" | "video" | "misc") => void;
  allTags: string[];
  onClearFilters: () => void;
}

export function FileFilters({
  files,
  displayType,
  onDisplayTypeChange,
  selectedTags,
  onTagSelect,
  gridSize = 6,
  onGridSizeChange,
  searchQuery,
  setSearchQuery,
  mediaFilter,
  onMediaFilterChange,
  allTags,
  onClearFilters,
}: FileFiltersProps) {
  const [localGridSize, setLocalGridSize] = useState(gridSize);

  useEffect(() => {
    // Load grid size from localStorage on mount
    const savedGridSize = localStorage.getItem("fileGridSize");
    if (savedGridSize) {
      const size = parseInt(savedGridSize, 10);
      setLocalGridSize(size);
      onGridSizeChange?.(size);
    }
  }, []);

  const handleGridSizeChange = (size: number) => {
    setLocalGridSize(size);
    onGridSizeChange?.(size);
    localStorage.setItem("fileGridSize", size.toString());
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      onTagSelect([...selectedTags, tag]);
    } else {
      onTagSelect(selectedTags.filter((t) => t !== tag));
    }
  };

  return (
    <div className="border-b p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={displayType === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onDisplayTypeChange("grid")}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={displayType === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onDisplayTypeChange("list")}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          {displayType === "grid" && onGridSizeChange && (
            <div className="flex items-center gap-1">
              <Button
                variant={localGridSize === 2 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleGridSizeChange(2)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Grid2x2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={localGridSize === 3 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleGridSizeChange(3)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Grid3x3Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={localGridSize === 4 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleGridSizeChange(4)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Grid3x3Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={localGridSize === 5 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleGridSizeChange(5)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Grid3x3Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={localGridSize === 6 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleGridSizeChange(6)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <Grid3x3Icon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 sm:h-10"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Media Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={mediaFilter === "all"}
                onCheckedChange={() => onMediaFilterChange("all")}
              >
                <FileIcon className="w-4 h-4 mr-2" />
                All Files
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={mediaFilter === "image"}
                onCheckedChange={() => onMediaFilterChange("image")}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={mediaFilter === "video"}
                onCheckedChange={() => onMediaFilterChange("video")}
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                Videos
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={mediaFilter === "misc"}
                onCheckedChange={() => onMediaFilterChange("misc")}
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Other Files
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[200px] overflow-y-auto">
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={(checked) => handleTagToggle(tag, checked)}
                  >
                    <TagIcon className="w-4 h-4 mr-2" />
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              {(selectedTags.length > 0 || mediaFilter !== "all") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={onClearFilters}
                  >
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 