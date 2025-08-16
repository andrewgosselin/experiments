import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Initialize database connection
async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'analytics.db'),
    driver: sqlite3.Database
  });
}

// Initialize the database with required tables
export async function initDb() {
  const db = await getDb();
  
  // Drop the existing table if it exists
  await db.exec(`DROP TABLE IF EXISTS asset_analytics`);
  
  // Create the table with the new schema
  await db.exec(`
    CREATE TABLE asset_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id TEXT NOT NULL,
      variant TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      user_agent TEXT,
      referer TEXT,
      response_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

// Store analytics data
export async function storeAnalytics(data: {
  assetId: string;
  variant: string;
  timestamp: string;
  userAgent: string | null;
  referer: string | null;
  responseTime: number;
}) {
  const db = await getDb();
  await db.run(
    `INSERT INTO asset_analytics (asset_id, variant, timestamp, user_agent, referer, response_time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.assetId, data.variant, data.timestamp, data.userAgent, data.referer, data.responseTime]
  );
}

// Get recent analytics
export async function getRecentAnalytics(limit = 100) {
  const db = await getDb();
  return db.all(`
    SELECT 
      id,
      asset_id,
      variant,
      timestamp,
      user_agent,
      referer,
      response_time,
      created_at
    FROM asset_analytics
    ORDER BY created_at DESC
    LIMIT ?
  `, [limit]);
}

// Get most requested assets
export async function getMostRequestedAssets(limit = 10) {
  const db = await getDb();
  return db.all(`
    SELECT 
      asset_id,
      variant,
      COUNT(*) as request_count,
      AVG(response_time) as avg_response_time
    FROM asset_analytics
    GROUP BY asset_id, variant
    ORDER BY request_count DESC
    LIMIT ?
  `, [limit]);
} 