"use client";

import { FileMetadata } from "@andrewgosselin/idk.file-helper";
import { Button } from "@/components/ui/button";
import { TagIcon, DownloadIcon, ShareIcon, TrashIcon, XIcon, EditIcon, CheckIcon, BarChart3Icon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExtendedFileMetadata } from "./file-grid";
import { useState, useEffect } from "react";
import { variants } from "@/variants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TagInput } from "@/components/ui/tag-input";
import { IDKImage } from "@andrewgosselin/idk.media";

function formatFileSize(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

interface FileDetailsProps {
  file: ExtendedFileMetadata;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<FileMetadata>) => Promise<void>;
}

function FileAnalytics({ fileId }: { fileId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    recentRequests: Array<{
      id: string;
      variant: string;
      timestamp: string;
      response_time: number;
    }>;
    stats: {
      totalRequests: number;
      avgResponseTime: number;
      variants: Array<{
        variant: string;
        count: number;
      }>;
    };
  } | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics/asset/${fileId}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [fileId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-sm text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <p className="text-lg font-semibold">{analytics.stats.totalRequests}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <p className="text-lg font-semibold">{Math.round(analytics.stats.avgResponseTime)}ms</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Variant Usage</p>
        <div className="space-y-1">
          {analytics.stats.variants.map(({ variant, count }) => (
            <div key={variant} className="flex items-center justify-between text-sm">
              <Badge variant="outline">{variant}</Badge>
              <span className="text-muted-foreground">{count} requests</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Recent Requests</p>
        <div className="space-y-1">
          {analytics.recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{request.variant}</Badge>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                </span>
              </div>
              <span className="text-muted-foreground">{request.response_time}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FileDetails({ file, onClose, onDelete, onUpdate }: FileDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState('source');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(file.title || file.name);
  const [editedDescription, setEditedDescription] = useState(file.description || '');
  const [editedTags, setEditedTags] = useState<string[]>(file.tags || []);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    setEditedTitle(file.title || file.name);
    setEditedDescription(file.description || '');
    setEditedTags(file.tags || []);
    setSelectedVariant('source');
    setIsEditing(false);
  }, [file.id, file.title, file.name, file.description, file.tags]);



  const getAvailableVariants = () => {
    if (!file.mimeType?.startsWith("image/")) return [];
    
    const type = file.mimeType.split('/')[0];
    const typeVariants = variants[type] || {};
    
    return [
      { id: 'source', name: 'Original' },
      ...Object.entries(typeVariants).map(([id, config]) => ({
        id,
        name: config.name || id
      }))
    ];
  };

  const handleSave = async () => {
    if (onUpdate) {
      try {
        await onUpdate(file.id, {
          title: editedTitle,
          description: editedDescription,
          tags: editedTags
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update file:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditedTitle(file.title || file.name);
    setEditedDescription(file.description || '');
    setEditedTags(file.tags || []);
    setIsEditing(false);
  };



  const availableVariants = getAvailableVariants();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-base sm:text-lg font-semibold"
          />
        ) : (
          <h2 className="text-base sm:text-lg font-semibold truncate" title={file.title || file.name}>
            {file.title || file.name}
          </h2>
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          {isEditing ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={handleSave}>
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Changes</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={handleCancel}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setIsEditing(true)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Details</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={onClose}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <IDKImage
            id={file.id}
            analytics={false}
            variant={selectedVariant}
            alt={file.title || file.name}
            width={800}
            height={800}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {file.mimeType?.startsWith("image/") && availableVariants.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium">Variant:</span>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {availableVariants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter description"
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {file.description || "No description provided"}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                {file.mimeType || "Unknown"}
              </p>
              <p>
                <span className="text-muted-foreground">Size:</span>{" "}
                {formatFileSize(file.size)}
              </p>
              <p>
                <span className="text-muted-foreground">Extension:</span>{" "}
                .{file.ext}
              </p>
              <p>
                <span className="text-muted-foreground">Created:</span>{" "}
                {new Date(file.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Modified:</span>{" "}
                {new Date(file.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3Icon className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
                {isAnalyticsOpen ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <FileAnalytics fileId={file.id} />
            </CollapsibleContent>
          </Collapsible>

          <div>
            <h3 className="text-sm font-medium mb-1">Tags</h3>
            {isEditing ? (
              <TagInput
                tags={editedTags}
                onTagsChange={setEditedTags}
                placeholder="Add tags..."
                className="w-full"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {file.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 border-t">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="flex-1 h-8 w-8 sm:h-10 sm:w-10">
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="flex-1 h-8 w-8 sm:h-10 sm:w-10">
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-1 h-8 w-8 sm:h-10 sm:w-10 text-destructive"
                  onClick={() => onDelete(file.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
} 