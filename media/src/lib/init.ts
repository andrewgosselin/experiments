import { initDb } from './db';
import fs from 'fs';
import path from 'path';

// Initialize database when the app starts
export async function initialize() {
  try {
    // Delete the existing database file if it exists
    const dbPath = path.join(process.cwd(), 'analytics.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }

    // Initialize the database with the new schema
    await initDb();
    console.log('Analytics database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize analytics database:', error);
  }
} 