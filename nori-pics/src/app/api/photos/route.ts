import { NextRequest, NextResponse } from 'next/server';
import { getNoriPhotosPaginated } from '@/data/nori-photos';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const result = await getNoriPhotosPaginated(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
