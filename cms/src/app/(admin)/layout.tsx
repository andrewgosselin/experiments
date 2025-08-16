import React from "react";
import { getGlobalSettings, type GlobalSettings } from "@/actions/settings";
import { getSites, type Site } from "@/actions/sites";
import AdminLayout from "@/components/AdminLayout";
import { db } from "@/data/database";

export default async function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Initialize database connection first with retry logic
  let retries = 3;
  let lastError: Error | null = null;
  
  while (retries > 0) {
    try {
      console.log(`Initializing database connection... (attempt ${4 - retries}/3)`);
      await db.initialize();
      
      // Verify the connection is healthy
      const health = await db.healthCheck();
      if (health.status === 'unhealthy') {
        console.error('Database health check failed:', health.details);
        throw new Error(`Database health check failed: ${health.details.message}`);
      }
      
      console.log('Database connection verified and healthy');
      break; // Success, exit retry loop
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries--;
      console.error(`Database initialization attempt failed, ${retries} retries remaining:`, lastError);
      
      if (retries === 0) {
        console.error('All database initialization attempts failed');
        throw new Error(`Database initialization failed after 3 attempts: ${lastError.message}`);
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Fetch data on the server
  const [globalSettings, sites] = await Promise.all([
    getGlobalSettings(),
    getSites({ sort: 'name' })
  ]);

  // Set current site to default site or first available site
  const currentSite = sites.length > 0 
    ? sites.find(site => site.isDefault) || sites[0]
    : null;

  return (
    <AdminLayout 
      globalSettings={globalSettings}
      sites={sites}
      currentSite={currentSite}
    >
      {children}
    </AdminLayout>
  );
} 