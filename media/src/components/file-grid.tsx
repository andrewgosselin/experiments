"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, MoreVerticalIcon, FileIcon, ImageIcon, TagIcon, VideoIcon, FileTextIcon, FilterIcon, PlusIcon, XIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUpload } from "./file-upload";
import { FileMetadata } from "@andrewgosselin/idk.file-helper";
import { UploadDialog } from "./upload-dialog";
import { FileDetails } from "./file-details";
import { FileFilters } from "./file-filters";
import { IDKImage } from "@andrewgosselin/idk.media";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

function formatFileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export interface ExtendedFileMetadata extends FileMetadata {
  description?: string;
  tags?: string[];
}

interface FileGridProps {
  mode?: "default" | "picker";
  onSelect?: (fileId: string) => void;
  selectedFileId?: string | null;
  allowedTypes?: string[];
}

type MediaFilter = "all" | "image" | "video" | "misc";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FileGrid({ mode = "default", onSelect, selectedFileId, allowedTypes = [] }: FileGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [files, setFiles] = useState<ExtendedFileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<ExtendedFileMetadata | null>(null);
  const [gridSize, setGridSize] = useState(6);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaFilter, setMediaFilter] = useState<"all" | "image" | "video" | "misc">("all");

  // Get initial state from URL
  const initialDisplayType = searchParams.get("view") as "grid" | "list" || "grid";
  const initialMediaFilter = searchParams.get("type") as MediaFilter || "all";
  const initialTags = searchParams.get("tags")?.split(",") || [];
  const initialSearchQuery = searchParams.get("search") || "";
  
  const [displayType, setDisplayType] = useState<"grid" | "list">(initialDisplayType);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  // Get unique tags from all files
  const allTags = Array.from(
    new Set(files.flatMap((file) => file.tags || []))
  ).sort();

  // Update URL when filters change
  const updateUrl = (newDisplayType?: "grid" | "list", newMediaFilter?: MediaFilter, newTags?: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newDisplayType) {
      params.set("view", newDisplayType);
    }
    if (newMediaFilter) {
      params.set("type", newMediaFilter);
    }
    if (newTags) {
      params.set("tags", newTags.join(","));
    }
    
    router.push(`?${params.toString()}`);
  };

  const getMediaType = (mimeType?: string): MediaFilter => {
    if (!mimeType) return "misc";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "misc";
  };

  const filteredFiles = files.filter((file) => {
    // Search filter
    const searchQuery = searchParams.get("search") || "";
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        file.name.toLowerCase().includes(searchLower) ||
        file.title?.toLowerCase().includes(searchLower) ||
        file.description?.toLowerCase().includes(searchLower) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Filter by allowed types if specified
    if (allowedTypes.length > 0) {
      const fileType = file.mimeType?.split('/')[0] || '';
      if (!allowedTypes.includes(fileType)) {
        return false;
      }
    }

    // Filter by media type
    if (mediaFilter !== "all") {
      const fileMediaType = getMediaType(file.mimeType);
      if (fileMediaType !== mediaFilter) {
        return false;
      }
    }

    // Filter by tags
    if (selectedTags.length === 0) return true;
    return file.tags?.some((tag) => selectedTags.includes(tag));
  });

  // Update display type with URL sync
  const handleDisplayTypeChange = (type: "grid" | "list") => {
    setDisplayType(type);
    const firstFile = filteredFiles[0];
    setSelectedFile(firstFile || null);
    updateUrl(type);
  };

  // Update media filter with URL sync
  const handleMediaFilterChange = (filter: MediaFilter) => {
    setMediaFilter(filter);
    const firstFile = filteredFiles[0];
    setSelectedFile(firstFile || null);
    updateUrl(undefined, filter);
  };

  // Update tags with URL sync
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    const firstFile = filteredFiles[0];
    setSelectedFile(firstFile || null);
    updateUrl(undefined, undefined, newTags);
  };

  // Update selected file when filtered files change
  useEffect(() => {
    if (filteredFiles.length > 0 && !selectedFile) {
      setSelectedFile(filteredFiles[0]);
    } else if (filteredFiles.length === 0) {
      setSelectedFile(null);
    } else if (selectedFile && !filteredFiles.find(f => f.id === selectedFile.id)) {
      setSelectedFile(filteredFiles[0] || null);
    }
  }, [filteredFiles, selectedFile]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to load files");
      const fileList = await response.json();
      setFiles(fileList);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setPendingFile(selectedFiles[0]);
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async (metadata: { title: string; description: string; tags: string[] }) => {
    if (!pendingFile) return;

    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("title", metadata.title);
      formData.append("description", metadata.description);
      formData.append("tags", JSON.stringify(metadata.tags));

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");
      
      await loadFiles();
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setPendingFile(null);
      setUploadDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/files?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete file");
      await loadFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleFileClick = (file: ExtendedFileMetadata) => {
    setSelectedFile(file);
    if (mode === "picker" && onSelect) {
      onSelect(file.id);
    }
    if (isMobile) {
      setIsMobileDetailsOpen(true);
    }
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setMediaFilter("all");
  };

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] w-full h-full">
        <div className="border-b lg:border-b-0 lg:border-r p-2">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
        <div className="hidden lg:block border-l p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] h-full">
      <div className="hidden lg:flex flex-col border-r p-4">
        <div className="space-y-4">
          <FileUpload onUpload={handleFileSelect} />
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Media Type</h3>
            <div className="space-y-2">
              <Button
                variant={mediaFilter === "all" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMediaFilterChange("all")}
              >
                <FileIcon className="w-4 h-4 mr-2" />
                All Files
              </Button>
              <Button
                variant={mediaFilter === "image" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMediaFilterChange("image")}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </Button>
              <Button
                variant={mediaFilter === "video" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMediaFilterChange("video")}
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                Videos
              </Button>
              <Button
                variant={mediaFilter === "misc" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleMediaFilterChange("misc")}
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Other Files
              </Button>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Filter by tags</h3>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag]);
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag));
                        }
                      }}
                    />
                    <label
                      htmlFor={tag}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || mediaFilter !== "all") && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <FileFilters
          files={files}
          displayType={displayType}
          onDisplayTypeChange={handleDisplayTypeChange}
          selectedTags={selectedTags}
          onTagSelect={setSelectedTags}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mediaFilter={mediaFilter}
          onMediaFilterChange={handleMediaFilterChange}
          allTags={allTags}
          onClearFilters={handleClearFilters}
        />
        <div className="flex-1 overflow-auto p-4">
          <motion.div
            layout
            className={cn(
              "grid gap-4",
              displayType === "grid" && {
                "grid-cols-2": gridSize === 2,
                "grid-cols-3": gridSize === 3,
                "grid-cols-4": gridSize === 4,
                "grid-cols-5": gridSize === 5,
                "grid-cols-6": gridSize === 6,
              },
              displayType === "list" && "grid-cols-1"
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-md",
                      displayType === "list" && "flex items-center gap-4"
                    )}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {file.mimeType?.startsWith("image/") ? (
                        <IDKImage
                          id={file.id}
                          alt={file.name}
                          fill
                          className="object-cover"
                          analytics={false}
                        />
                      ) : file.mimeType?.startsWith("video/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <VideoIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {file.tags.map((tag: string, index: number) => (
                              <span
                                key={`${file.id}-${tag}-${index}`}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                              >
                                <TagIcon className="w-2.5 h-2.5 mr-0.5" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(file.id);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {displayType === "grid" && (
                        <>
                          {file.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                              {file.description}
                            </p>
                          )}
                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-auto">
                              {file.tags.map((tag: string, index: number) => (
                                <span
                                  key={`${file.id}-${tag}-${index}`}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary"
                                >
                                  <TagIcon className="w-2.5 h-2.5 mr-0.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {mode === "default" && (
        <div className="border-l h-full">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key={selectedFile.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FileDetails
                  file={selectedFile}
                  onClose={() => setSelectedFile(null)}
                  onDelete={handleDelete}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex items-center justify-center text-muted-foreground"
              >
                Select a file to view details
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}