import { NextRequest, NextResponse } from "next/server";
import { FileService } from "@/lib/file-service";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const variant = searchParams.get("v") ?? "default";

    if (id) {
      const file = await FileService.getFileVariant(id, variant);
      if (!file) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(file);
    }

    const files = await FileService.getFiles();
    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to get files:", error);
    return NextResponse.json(
      { error: "Failed to get files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = JSON.parse(formData.get("tags") as string || "[]");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await FileService.uploadFile(
      buffer,
      file.name,
      file.type || "application/octet-stream",
      file.size,
      {
        title: title || path.parse(file.name).name,
        description,
        tags,
      }
    );

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "No file ID provided" },
        { status: 400 }
      );
    }

    await FileService.deleteFile(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
} 