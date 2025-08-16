import { NextResponse } from "next/server";
import { FileService } from "@/lib/file-service";
import { FileMetadata } from "@andrewgosselin/idk.file-helper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    const files = await FileService.getFiles();
    
    if (!query) {
      return NextResponse.json([]);
    }

    const searchLower = query.toLowerCase();
    const results = files
      .filter((file: FileMetadata) => {
        return (
          file.name.toLowerCase().includes(searchLower) ||
          file.title?.toLowerCase().includes(searchLower) ||
          file.description?.toLowerCase().includes(searchLower) ||
          file.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      })
      .slice(0, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search files" }, { status: 500 });
  }
} 