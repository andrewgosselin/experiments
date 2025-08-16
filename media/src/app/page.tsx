"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileMetadata } from "@andrewgosselin/idk.file-helper";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileIcon, 
  ImageIcon, 
  VideoIcon, 
  FileTextIcon, 
  UploadIcon,
  BarChartIcon,
  ClockIcon,
  TagIcon,
  BarChart3Icon
} from "lucide-react";
import Link from "next/link";
import { IDKImage } from "@andrewgosselin/idk.media";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalFiles: number;
  totalSize: number;
  imageCount: number;
  videoCount: number;
  otherCount: number;
  recentFiles: FileMetadata[];
  totalViews: number;
  totalTags: number;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

function getFileIcon(mimeType?: string) {
  if (!mimeType) return <FileIcon className="h-6 w-6 text-muted-foreground" />;
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-6 w-6 text-muted-foreground" />;
  if (mimeType.startsWith("video/")) return <VideoIcon className="h-6 w-6 text-muted-foreground" />;
  return <FileTextIcon className="h-6 w-6 text-muted-foreground" />;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/files");
        if (!response.ok) throw new Error("Failed to fetch files");
        const files = await response.json();
        
        const totalSize = files.reduce((sum: number, file: FileMetadata) => sum + file.size, 0);
        const imageCount = files.filter((f: FileMetadata) => f.mimeType?.startsWith("image/")).length;
        const videoCount = files.filter((f: FileMetadata) => f.mimeType?.startsWith("video/")).length;
        const otherCount = files.length - imageCount - videoCount;
        
        setStats({
          totalFiles: files.length,
          totalSize,
          imageCount,
          videoCount,
          otherCount,
          recentFiles: files
            .sort((a: FileMetadata, b: FileMetadata) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5),
          totalViews: 0,
          totalTags: 0
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="px-4 sm:px-8 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-sm text-destructive/90">{error || "Failed to load dashboard data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your media library. Upload, organize, and manage your files.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalFiles}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                <BarChart3Icon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                <TagIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalTags}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Files</h2>
            <div className="space-y-4">
              {stats.recentFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    {file.mimeType?.startsWith("image/") ? (
                      <IDKImage
                        id={file.id}
                        analytics={false}
                        alt={file.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.title || file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-2">
              {/* Assuming popularTags is populated based on your data */}
              {/* Replace with actual popular tags */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {/* Replace with actual tag name */}
                  Tag {i + 1}
                  <span className="text-xs text-muted-foreground">({i + 10})</span>
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}