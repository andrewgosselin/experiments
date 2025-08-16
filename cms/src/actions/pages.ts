"use server";

import { db } from "@/data/database";

// Types for page sections
export interface PageSection {
  title: string;
  type: string;
  [key: string]: any; // Allow additional properties based on section type
}

// Types for SEO metadata
export interface PageSEO {
  title: string;
  description: string;
  image: string;
}

// Main page interface
export interface Page {
  _id?: string;
  title: string;
  route: string;
  sections: PageSection[];
  seo: PageSEO;
  isPublished: boolean;
  isDraft: boolean;
  siteId?: string; // For multi-site support
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Create page input (without auto-generated fields)
export interface CreatePageInput {
  title: string;
  route: string;
  sections: PageSection[];
  seo: PageSEO;
  siteId?: string;
}

// Update page input (all fields optional except _id)
export interface UpdatePageInput {
  title?: string;
  route?: string;
  sections?: PageSection[];
  seo?: PageSEO;
  isPublished?: boolean;
  isDraft?: boolean;
  siteId?: string;
}

// Query options for finding pages
export interface PageQueryOptions {
  siteId?: string;
  isPublished?: boolean;
  isDraft?: boolean;
  limit?: number;
  skip?: number;
  sort?: 'newest' | 'oldest' | 'title' | 'route';
}

/**
 * Create a new page
 */
export async function createPage(pageData: CreatePageInput): Promise<Page> {
  try {
    // Check if a page with the same route already exists
    const existingPage = await db.findOne<Page>('pages', { route: pageData.route });
    if (existingPage) {
      throw new Error('A page with this route already exists');
    }

    const newPage = await db.create<Page>('pages', {
      ...pageData,
      isPublished: false,
      isDraft: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newPage;
  } catch (error) {
    console.error('Error creating page:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create page');
  }
}

/**
 * Get a single page by ID
 */
export async function getPage(id: string): Promise<Page | null> {
  try {
    const page = await db.findById<Page>('pages', id);
    return page;
  } catch (error) {
    console.error('Error getting page:', error);
    throw new Error('Failed to retrieve page');
  }
}

/**
 * Get a page by route
 */
export async function getPageByRoute(route: string, siteId?: string): Promise<Page | null> {
  try {
    const query: any = { route };
    if (siteId) {
      query.siteId = siteId;
    }
    
    const page = await db.findOne<Page>('pages', query);
    return page;
  } catch (error) {
    console.error('Error getting page by route:', error);
    throw new Error('Failed to retrieve page');
  }
}

/**
 * Get all pages with optional filtering
 */
export async function getPages(options: PageQueryOptions = {}): Promise<Page[]> {
  try {
    const { siteId, isPublished, isDraft, limit, skip, sort } = options;
    
    // Build query
    const query: any = {};
    if (siteId !== undefined) query.siteId = siteId;
    if (isPublished !== undefined) query.isPublished = isPublished;
    if (isDraft !== undefined) query.isDraft = isDraft;

    // Build sort options
    let sortOptions: any = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'route':
        sortOptions = { route: 1 };
        break;
      default:
        sortOptions = { updatedAt: -1 };
    }

    const pages = await db.find<Page>('pages', query, {
      limit,
      skip,
      sort: sortOptions,
    });

    return pages;
  } catch (error) {
    console.error('Error getting pages:', error);
    throw new Error('Failed to retrieve pages');
  }
}

/**
 * Update an existing page
 */
export async function updatePage(id: string, updates: UpdatePageInput): Promise<Page | null> {
  try {
    console.log('updatePage called with:', { id, updates });
    
    // Validate inputs
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid page ID provided');
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid updates object provided');
    }

    // If route is being updated, check for conflicts
    if (updates.route) {
      const existingPage = await db.findOne<Page>('pages', { 
        route: updates.route,
        _id: { $ne: id } // Exclude current page
      });
      if (existingPage) {
        throw new Error('A page with this route already exists');
      }
    }

    console.log('Calling db.updateById with:', { collection: 'pages', id, data: { ...updates, updatedAt: new Date() } });

    const updatedPage = await db.updateById<Page>('pages', id, {
      ...updates,
      updatedAt: new Date(),
      // Update publishedAt if publishing for the first time
      ...(updates.isPublished && { publishedAt: new Date() }),
    });

    console.log('updatePage result:', updatedPage);

    return updatedPage;
  } catch (error) {
    console.error('Error updating page:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update page');
  }
}

/**
 * Delete a page
 */
export async function deletePage(id: string): Promise<boolean> {
  try {
    const deleted = await db.deleteById('pages', id);
    return deleted;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw new Error('Failed to delete page');
  }
}

/**
 * Publish a page
 */
export async function publishPage(id: string): Promise<Page | null> {
  try {
    const page = await getPage(id);
    if (!page) {
      throw new Error('Page not found');
    }

    const updatedPage = await db.updateById<Page>('pages', id, {
      isPublished: true,
      isDraft: false,
      updatedAt: new Date(),
      publishedAt: new Date(),
    });

    return updatedPage;
  } catch (error) {
    console.error('Error publishing page:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to publish page');
  }
}

/**
 * Unpublish a page
 */
export async function unpublishPage(id: string): Promise<Page | null> {
  try {
    const updatedPage = await db.updateById<Page>('pages', id, {
      isPublished: false,
      updatedAt: new Date(),
    });

    return updatedPage;
  } catch (error) {
    console.error('Error unpublishing page:', error);
    throw new Error('Failed to unpublish page');
  }
}

/**
 * Save page as draft
 */
export async function savePageDraft(id: string, updates: UpdatePageInput): Promise<Page | null> {
  try {
    const updatedPage = await db.updateById<Page>('pages', id, {
      ...updates,
      isDraft: true,
      updatedAt: new Date(),
    });

    return updatedPage;
  } catch (error) {
    console.error('Error saving page draft:', error);
    throw new Error('Failed to save page draft');
  }
}

/**
 * Duplicate a page
 */
export async function duplicatePage(id: string, newTitle?: string): Promise<Page> {
  try {
    const originalPage = await getPage(id);
    if (!originalPage) {
      throw new Error('Page not found');
    }

    // Generate new route
    const baseRoute = originalPage.route;
    let newRoute = `${baseRoute}-copy`;
    let counter = 1;
    
    // Check if route exists and generate unique one
    while (await getPageByRoute(newRoute, originalPage.siteId)) {
      newRoute = `${baseRoute}-copy-${counter}`;
      counter++;
    }

    const duplicatedPage = await db.create<Page>('pages', {
      title: newTitle || `${originalPage.title} (Copy)`,
      route: newRoute,
      sections: originalPage.sections,
      seo: originalPage.seo,
      isPublished: false,
      isDraft: true,
      siteId: originalPage.siteId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return duplicatedPage;
  } catch (error) {
    console.error('Error duplicating page:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to duplicate page');
  }
}

/**
 * Get page count for statistics
 */
export async function getPageCount(options: { siteId?: string; isPublished?: boolean } = {}): Promise<number> {
  try {
    const query: any = {};
    if (options.siteId !== undefined) query.siteId = options.siteId;
    if (options.isPublished !== undefined) query.isPublished = options.isPublished;

    const count = await db.count('pages', query);
    return count;
  } catch (error) {
    console.error('Error getting page count:', error);
    throw new Error('Failed to get page count');
  }
} 