import { NextResponse } from 'next/server';
import { getRecentAnalytics, getMostRequestedAssets } from '@/lib/analytics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [recentAnalytics] = await Promise.all([
      getRecentAnalytics(),
      getMostRequestedAssets(),
    ]);

    // Filter analytics for the specific asset
    const assetAnalytics = recentAnalytics.filter(
      (request) => request.asset_id === id
    );

    // Calculate statistics
    const totalRequests = assetAnalytics.length;
    const avgResponseTime =
      assetAnalytics.reduce((sum, req) => sum + req.response_time, 0) /
      totalRequests;

    // Group by variant
    const variantMap = new Map<string, number>();
    assetAnalytics.forEach((request) => {
      const count = variantMap.get(request.variant) || 0;
      variantMap.set(request.variant, count + 1);
    });

    const variants = Array.from(variantMap.entries()).map(([variant, count]) => ({
      variant,
      count,
    }));

    return NextResponse.json({
      recentRequests: assetAnalytics.slice(0, 5), // Show last 5 requests
      stats: {
        totalRequests,
        avgResponseTime: avgResponseTime || 0,
        variants,
      },
    });
  } catch (error) {
    console.error('Error fetching asset analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset analytics' },
      { status: 500 }
    );
  }
} 