"use server";

import { db } from "@/data/database";

// Site interface
export interface Site {
  _id?: string;
  name: string;
  domain: string;
  description?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create site input (without auto-generated fields)
export interface CreateSiteInput {
  name: string;
  domain: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Update site input (all fields optional except _id)
export interface UpdateSiteInput {
  name?: string;
  domain?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Query options for finding sites
export interface SiteQueryOptions {
  isActive?: boolean;
  isDefault?: boolean;
  limit?: number;
  skip?: number;
  sort?: 'newest' | 'oldest' | 'name' | 'domain';
}

/**
 * Create a new site
 */
export async function createSite(siteData: CreateSiteInput): Promise<Site> {
  try {
    // Check if a site with the same domain already exists
    const existingSite = await db.findOne<Site>('sites', { domain: siteData.domain });
    if (existingSite) {
      throw new Error('A site with this domain already exists');
    }

    // If this is the first site, make it default
    const siteCount = await db.count('sites', {});
    const isDefault = siteCount === 0 ? true : siteData.isDefault || false;

    // If setting this site as default, unset any existing default
    if (isDefault) {
      await db.update<Site>('sites', { isDefault: true }, { isDefault: false });
    }

    const newSite = await db.create<Site>('sites', {
      ...siteData,
      isActive: siteData.isActive ?? true,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newSite;
  } catch (error) {
    console.error('Error creating site:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create site');
  }
}

/**
 * Get a single site by ID
 */
export async function getSite(id: string): Promise<Site | null> {
  try {
    const site = await db.findById<Site>('sites', id);
    return site;
  } catch (error) {
    console.error('Error getting site:', error);
    throw new Error('Failed to retrieve site');
  }
}

/**
 * Get a site by domain
 */
export async function getSiteByDomain(domain: string): Promise<Site | null> {
  try {
    const site = await db.findOne<Site>('sites', { domain });
    return site;
  } catch (error) {
    console.error('Error getting site by domain:', error);
    throw new Error('Failed to retrieve site');
  }
}

export async function getSiteDomainMapping(): Promise<{ domain: string, siteId: string }[]> {
  try {
    const sites = await db.find<Site>('sites', {});
    return sites.map((site) => ({ domain: site.domain, siteId: site._id || "" }));
  } catch (error) {
    console.error('Error getting site domain mapping:', error);
    throw new Error('Failed to retrieve site domain mapping');
  }
}

/**
 * Get the default site
 */
export async function getDefaultSite(): Promise<Site | null> {
  try {
    const site = await db.findOne<Site>('sites', { isDefault: true });
    return site;
  } catch (error) {
    console.error('Error getting default site:', error);
    throw new Error('Failed to retrieve default site');
  }
}

/**
 * Get all sites with optional filtering
 */
export async function getSites(options: SiteQueryOptions = {}): Promise<Site[]> {
  try {
    const { isActive, isDefault, limit, skip, sort } = options;
    
    // Build query
    const query: any = {};
    if (isActive !== undefined) query.isActive = isActive;
    if (isDefault !== undefined) query.isDefault = isDefault;

    // Build sort options
    let sortOptions: any = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'domain':
        sortOptions = { domain: 1 };
        break;
      default:
        sortOptions = { name: 1 }; // Default sort by name
    }

    const sites = await db.find<Site>('sites', query, {
      limit,
      skip,
      sort: sortOptions,
    });

    return sites;
  } catch (error) {
    console.error('Error getting sites:', error);
    throw new Error('Failed to retrieve sites');
  }
}

/**
 * Update an existing site
 */
export async function updateSite(id: string, updates: UpdateSiteInput): Promise<Site | null> {
  try {
    // Validate inputs
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid site ID provided');
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates object provided');
    }

    // If domain is being updated, check for conflicts
    if (updates.domain) {
      const existingSite = await db.findOne<Site>('sites', { 
        domain: updates.domain,
        _id: { $ne: id } // Exclude current site
      });
      if (existingSite) {
        throw new Error('A site with this domain already exists');
      }
    }

    // If setting this site as default, unset any existing default
    if (updates.isDefault) {
      await db.update<Site>('sites', { isDefault: true }, { isDefault: false });
    }

    const updatedSite = await db.updateById<Site>('sites', id, {
      ...updates,
      updatedAt: new Date(),
    });

    return updatedSite;
  } catch (error) {
    console.error('Error updating site:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update site');
  }
}

/**
 * Delete a site
 */
export async function deleteSite(id: string): Promise<boolean> {
  try {
    // Check if this is the default site
    const site = await getSite(id);
    if (site?.isDefault) {
      throw new Error('Cannot delete the default site');
    }

    // Check if there are any pages associated with this site
    const pageCount = await db.count('pages', { siteId: id });
    if (pageCount > 0) {
      throw new Error('Cannot delete site that has pages. Please delete or move all pages first.');
    }

    const deleted = await db.deleteById('sites', id);
    return deleted;
  } catch (error) {
    console.error('Error deleting site:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete site');
  }
}

/**
 * Set a site as default
 */
export async function setDefaultSite(id: string): Promise<Site | null> {
  try {
    // Unset any existing default site
    await db.update<Site>('sites', { isDefault: true }, { isDefault: false });
    
    // Set the new default site
    const updatedSite = await db.updateById<Site>('sites', id, {
      isDefault: true,
      updatedAt: new Date(),
    });

    return updatedSite;
  } catch (error) {
    console.error('Error setting default site:', error);
    throw new Error('Failed to set default site');
  }
}

/**
 * Get site count for statistics
 */
export async function getSiteCount(options: { isActive?: boolean } = {}): Promise<number> {
  try {
    const query: any = {};
    if (options.isActive !== undefined) query.isActive = options.isActive;

    const count = await db.count('sites', query);
    return count;
  } catch (error) {
    console.error('Error getting site count:', error);
    throw new Error('Failed to get site count');
  }
}

/**
 * Initialize default site if no sites exist
 */
export async function initializeDefaultSite(): Promise<Site> {
  try {
    const siteCount = await db.count('sites', {});
    
    if (siteCount === 0) {
      // Create a default site
      const defaultSite = await createSite({
        name: 'Main Site',
        domain: 'example.com',
        description: 'Default site created automatically',
        isActive: true,
        isDefault: true,
      });
      
      return defaultSite;
    }
    
    // Return the existing default site
    const defaultSite = await getDefaultSite();
    if (!defaultSite) {
      throw new Error('No default site found');
    }
    
    return defaultSite;
  } catch (error) {
    console.error('Error initializing default site:', error);
    throw new Error('Failed to initialize default site');
  }
} 