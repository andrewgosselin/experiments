import { NextResponse } from 'next/server';
import { recordAnalytics, getRecentAnalytics, getMostRequestedAssets } from '@/lib/analytics';

// GET /api/analytics - Retrieve analytics data
export async function GET() {
  try {
    const [recentAnalytics, mostRequested] = await Promise.all([
      getRecentAnalytics(),
      getMostRequestedAssets(),
    ]);

    return NextResponse.json({
      recentAnalytics,
      mostRequested,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Record new analytics data
export async function POST(request: Request) {
  try {
    const { asset_id, variant, response_time } = await request.json();
    
    if (!asset_id || !variant || typeof response_time !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    recordAnalytics(asset_id, variant, response_time);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording analytics:', error);
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
} 