import fs from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(ANALYTICS_FILE))) {
  fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
}

// Initialize analytics file if it doesn't exist
if (!fs.existsSync(ANALYTICS_FILE)) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({
    requests: [],
    lastUpdated: new Date().toISOString()
  }));
}

interface AnalyticsRequest {
  id: string;
  asset_id: string;
  variant: string;
  timestamp: string;
  response_time: number;
}

interface AnalyticsData {
  requests: AnalyticsRequest[];
  lastUpdated: string;
}

export function recordAnalytics(assetId: string, variant: string, responseTime: number) {
  const data = getAnalyticsData();
  
  const newRequest: AnalyticsRequest = {
    id: crypto.randomUUID(),
    asset_id: assetId,
    variant,
    timestamp: new Date().toISOString(),
    response_time: responseTime
  };

  data.requests.push(newRequest);
  data.lastUpdated = new Date().toISOString();

  // Keep only the last 1000 requests
  if (data.requests.length > 1000) {
    data.requests = data.requests.slice(-1000);
  }

  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

function getAnalyticsData(): AnalyticsData {
  const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getRecentAnalytics(limit = 10) {
  const data = getAnalyticsData();
  return data.requests
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getMostRequestedAssets(limit = 10) {
  const data = getAnalyticsData();
  const assetMap = new Map<string, { count: number; totalTime: number }>();

  data.requests.forEach(request => {
    const key = `${request.asset_id}_${request.variant}`;
    const current = assetMap.get(key) || { count: 0, totalTime: 0 };
    assetMap.set(key, {
      count: current.count + 1,
      totalTime: current.totalTime + request.response_time
    });
  });

  return Array.from(assetMap.entries())
    .map(([key, stats]) => {
      const [asset_id, variant] = key.split('_');
      return {
        asset_id,
        variant,
        request_count: stats.count,
        avg_response_time: stats.totalTime / stats.count
      };
    })
    .sort((a, b) => b.request_count - a.request_count)
    .slice(0, limit);
} 