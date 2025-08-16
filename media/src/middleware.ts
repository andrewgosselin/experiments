import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { after } from 'next/server';
import { APP_URL } from "@/config/general";

// Image rendering flow
// 1. Image variant is requested - /assets/{id}?v={variant}
// 2. Middleware validates asset response
// 3. If asset is not found, middleware calls generate endpoint
// 4. Middleware rewrites to generated asset location

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Check if the request is for an asset
  const assetMatch = request.nextUrl.pathname.match(/^\/assets\/([^\/]+)$/);
  if (assetMatch) {
    const id = assetMatch[1];
    const variant = request.nextUrl.searchParams.get('v') ?? 'original';
    const analytics = request.nextUrl.searchParams.get('analytics') !== 'false';
    const asset = await fetch(`${APP_URL}/api/files?id=${id}&v=${variant}`, {next: {revalidate: 0}});
    const assetData = await asset.json();
    console.log(assetData);
    const assetUrl = new URL(assetData.path.split("/public")[1], request.url);
    // const assetUrl = new URL(`/uploads/${id}/${id}.${variant}.avif`, request.url);
    // Check if the asset exists
    const assetCheck = await fetch(assetUrl);
    if (!assetCheck.ok) {
      // call /api/files?id=${id}&v=${variant} to generate the asset
      await fetch(`${APP_URL}/api/files?id=${id}&v=${variant}`);
    }
    
    const response = NextResponse.rewrite(assetUrl);
    
    // Use after to record analytics after the response is sent
    if (analytics) {
      after(async () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          await fetch('http://localhost:3000/api/analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              asset_id: id,
              variant: variant,
              response_time: responseTime
            })
          });
        } catch (error) {
          console.error('Failed to record analytics:', error);
        }
      });
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/assets/:id*",
}; 