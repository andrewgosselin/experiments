"use server";

import { db } from "@/data/database";

// Types for global settings
export interface GlobalSettings {
  _id?: string;
  multiSiteEnabled: boolean;
  routingType: 'path' | 'domain';
  updatedAt: Date;
  createdAt: Date;
}

// Default settings
const DEFAULT_SETTINGS: Omit<GlobalSettings, '_id' | 'updatedAt' | 'createdAt'> = {
  multiSiteEnabled: false,
  routingType: 'path',
};

/**
 * Get global settings from the database
 * If no settings exist, returns default settings
 */
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    // Try to find existing settings
    const existingSettings = await db.findOne<GlobalSettings>('settings', {});
    
    if (existingSettings) {
      return existingSettings;
    }
    
    // If no settings exist, create default settings
    const defaultSettings = await db.create<GlobalSettings>('settings', {
      ...DEFAULT_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return defaultSettings;
  } catch (error) {
    console.error('Error getting global settings:', error);
    throw new Error('Failed to retrieve global settings');
  }
}

/**
 * Save global settings to the database
 * If settings don't exist, creates new record
 * If settings exist, updates existing record
 */
export async function saveGlobalSettings(settings: Partial<GlobalSettings>): Promise<GlobalSettings> {
  try {
    // Remove _id from settings to avoid conflicts
    const { _id, ...settingsToSave } = settings;
    
    // Check if settings already exist
    const existingSettings = await db.findOne<GlobalSettings>('settings', {});
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings = await db.updateById<GlobalSettings>(
        'settings',
        existingSettings._id!,
        {
          ...settingsToSave,
          updatedAt: new Date(),
        }
      );
      
      if (!updatedSettings) {
        throw new Error('Failed to update settings');
      }
      
      return updatedSettings;
    } else {
      // Create new settings
      const newSettings = await db.create<GlobalSettings>('settings', {
        ...DEFAULT_SETTINGS,
        ...settingsToSave,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return newSettings;
    }
  } catch (error) {
    console.error('Error saving global settings:', error);
    throw new Error('Failed to save global settings');
  }
}

/**
 * Update specific setting fields
 * This is a convenience function for updating individual settings
 */
export async function updateGlobalSettings(updates: Partial<Pick<GlobalSettings, 'multiSiteEnabled' | 'routingType'>>): Promise<GlobalSettings> {
  return saveGlobalSettings(updates);
}

/**
 * Reset settings to default values
 */
export async function resetGlobalSettings(): Promise<GlobalSettings> {
  return saveGlobalSettings(DEFAULT_SETTINGS);
} 