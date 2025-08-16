"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadIcon, ImageIcon, TagIcon, FileTextIcon } from "lucide-react";
import { IDKImage } from "@andrewgosselin/idk.media";
import { TagInput } from "@/components/ui/tag-input";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      // Set initial title from filename without extension
      const filename = files[0].name;
      const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", JSON.stringify(tags));

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");
      
      router.push("/files");
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Upload File</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>File</Label>
                <FileUpload onUpload={handleFileSelect} />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput
                  tags={tags}
                  onTagsChange={setTags}
                  placeholder="Add tags..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/files")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFile || isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Preview</h2>
            <div className="space-y-6">
              {selectedFile ? (
                <>
                  <div className="aspect-video bg-muted/50 rounded-lg overflow-hidden">
                    {selectedFile.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt={selectedFile.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Variants</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/50 rounded-md">
                          <p className="text-sm font-medium">Original</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {selectedFile.type.startsWith("image/") && (
                          <>
                            <div className="p-2 bg-muted/50 rounded-md">
                              <p className="text-sm font-medium">Thumbnail</p>
                              <p className="text-xs text-muted-foreground">150x150</p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded-md">
                              <p className="text-sm font-medium">Medium</p>
                              <p className="text-xs text-muted-foreground">800x800</p>
                            </div>
                            <div className="p-2 bg-muted/50 rounded-md">
                              <p className="text-sm font-medium">Large</p>
                              <p className="text-xs text-muted-foreground">1200x1200</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {description && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                        <p className="text-sm">{description}</p>
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag, index) => (
                            <span
                              key={`${tag}-${index}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Select a file to preview</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 