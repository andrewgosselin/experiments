import { MongoHandler } from './handlers/mongo';
import { SqliteHandler } from './handlers/sqlite';

// Database handler interface that all database implementations must follow
export interface DatabaseHandler {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Basic CRUD operations
  find<T = any>(collection: string, query?: any, options?: FindOptions): Promise<T[]>;
  findOne<T = any>(collection: string, query?: any, options?: FindOneOptions): Promise<T | null>;
  findById<T = any>(collection: string, id: string, options?: FindOneOptions): Promise<T | null>;
  
  // Write operations
  create<T = any>(collection: string, data: T): Promise<T>;
  createMany<T = any>(collection: string, data: T[]): Promise<T[]>;
  update<T = any>(collection: string, query: any, data: Partial<T>, options?: UpdateOptions): Promise<number>;
  updateById<T = any>(collection: string, id: string, data: Partial<T>, options?: UpdateOptions): Promise<T | null>;
  delete(collection: string, query: any): Promise<number>;
  deleteById(collection: string, id: string): Promise<boolean>;
  
  // Utility operations
  count(collection: string, query?: any): Promise<number>;
  exists(collection: string, query: any): Promise<boolean>;
  aggregate<T = any>(collection: string, pipeline: any[]): Promise<T[]>;
  distinct<T = any>(collection: string, field: string, query?: any): Promise<T[]>;
}

// Options interfaces
export interface FindOptions {
  limit?: number;
  skip?: number;
  sort?: any;
  projection?: any;
}

export interface FindOneOptions {
  projection?: any;
}

export interface UpdateOptions {
  upsert?: boolean;
  multi?: boolean;
}

// Database factory class that selects the appropriate handler based on environment
export class Database {
  private static instance: Database | null = null;
  private handler: DatabaseHandler | null = null;
  private dbType: string;
  private connecting: boolean = false;
  private connectionPromise: Promise<DatabaseHandler> | null = null;
  private connectionLock: Promise<void> | null = null;

  private constructor() {
    this.dbType = process.env.CMS_DB_TYPE || 'sqlite';
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async getHandler(): Promise<DatabaseHandler> {
    // If we already have a handler and it's connected, return it
    if (this.handler && this.handler.isConnected()) {
      return this.handler;
    }

    // If we're already connecting, wait for that connection to complete
    if (this.connecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // If we have a handler but it's not connected, try to reconnect
    if (this.handler && !this.handler.isConnected()) {
      try {
        await this.handler.connect();
        return this.handler;
      } catch (error) {
        console.error('Failed to reconnect to database:', error);
        // Fall through to create a new handler
      }
    }

    // Use connection lock to prevent multiple simultaneous connection attempts
    if (!this.connectionLock) {
      this.connectionLock = this.performConnection();
    }
    
    return this.connectionLock.then(() => this.handler!);
  }

  private async performConnection(): Promise<void> {
    try {
      // Start a new connection
      this.connecting = true;
      this.connectionPromise = this.createHandler();
      
      const handler = await this.connectionPromise;
      this.handler = handler;
      this.connecting = false;
      this.connectionPromise = null;
      this.connectionLock = null;
    } catch (error) {
      this.connecting = false;
      this.connectionPromise = null;
      this.connectionLock = null;
      throw error;
    }
  }

  private async createHandler(): Promise<DatabaseHandler> {
    let handler: DatabaseHandler;
    
    switch (this.dbType.toLowerCase()) {
      case 'sqlite':
        handler = new SqliteHandler();
        break;
      case 'mongo':
      case 'mongodb':
        handler = new MongoHandler();
        break;
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
    
    // Add retry logic for connection
    let retries = 3;
    while (retries > 0) {
      try {
        await handler.connect();
        console.log(`Successfully connected to ${this.dbType} database`);
        return handler;
      } catch (error) {
        retries--;
        console.error(`Connection attempt failed, ${retries} retries remaining:`, error);
        if (retries === 0) {
          throw new Error(`Failed to connect to database after 3 attempts: ${error}`);
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Failed to create database handler');
  }

  // Proxy methods that delegate to the current handler
  public async find<T = any>(collection: string, query?: any, options?: FindOptions): Promise<T[]> {
    try {
      const handler = await this.getHandler();
      return handler.find<T>(collection, query, options);
    } catch (error) {
      console.error(`Error in database find operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async findOne<T = any>(collection: string, query?: any, options?: FindOneOptions): Promise<T | null> {
    try {
      const handler = await this.getHandler();
      return handler.findOne<T>(collection, query, options);
    } catch (error) {
      console.error(`Error in database findOne operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async findById<T = any>(collection: string, id: string, options?: FindOneOptions): Promise<T | null> {
    try {
      const handler = await this.getHandler();
      return handler.findById<T>(collection, id, options);
    } catch (error) {
      console.error(`Error in database findById operation for collection ${collection}, id ${id}:`, error);
      throw error;
    }
  }

  public async create<T = any>(collection: string, data: T): Promise<T> {
    try {
      const handler = await this.getHandler();
      return handler.create<T>(collection, data);
    } catch (error) {
      console.error(`Error in database create operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async createMany<T = any>(collection: string, data: T[]): Promise<T[]> {
    try {
      const handler = await this.getHandler();
      return handler.createMany<T>(collection, data);
    } catch (error) {
      console.error(`Error in database createMany operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async update<T = any>(collection: string, query: any, data: Partial<T>, options?: UpdateOptions): Promise<number> {
    try {
      const handler = await this.getHandler();
      return handler.update<T>(collection, query, data, options);
    } catch (error) {
      console.error(`Error in database update operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async updateById<T = any>(collection: string, id: string, data: Partial<T>, options?: UpdateOptions): Promise<T | null> {
    try {
      console.log('Database.updateById called with:', { collection, id, data, options });
      
      if (!collection || typeof collection !== 'string') {
        throw new Error('Invalid collection name provided');
      }
      
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid ID provided');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided');
      }
      
      const handler = await this.getHandler();
      console.log('Calling handler.updateById with:', { collection, id, data, options });
      return handler.updateById<T>(collection, id, data, options);
    } catch (error) {
      console.error(`Error in database updateById operation for collection ${collection}, id ${id}:`, error);
      throw error;
    }
  }

  public async delete(collection: string, query: any): Promise<number> {
    try {
      const handler = await this.getHandler();
      return handler.delete(collection, query);
    } catch (error) {
      console.error(`Error in database delete operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async deleteById(collection: string, id: string): Promise<boolean> {
    try {
      const handler = await this.getHandler();
      return handler.deleteById(collection, id);
    } catch (error) {
      console.error(`Error in database deleteById operation for collection ${collection}, id ${id}:`, error);
      throw error;
    }
  }

  public async count(collection: string, query?: any): Promise<number> {
    try {
      const handler = await this.getHandler();
      return handler.count(collection, query);
    } catch (error) {
      console.error(`Error in database count operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async exists(collection: string, query: any): Promise<boolean> {
    try {
      const handler = await this.getHandler();
      return handler.exists(collection, query);
    } catch (error) {
      console.error(`Error in database exists operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async aggregate<T = any>(collection: string, pipeline: any[]): Promise<T[]> {
    try {
      const handler = await this.getHandler();
      return handler.aggregate<T>(collection, pipeline);
    } catch (error) {
      console.error(`Error in database aggregate operation for collection ${collection}:`, error);
      throw error;
    }
  }

  public async distinct<T = any>(collection: string, field: string, query?: any): Promise<T[]> {
    try {
      const handler = await this.getHandler();
      return handler.distinct<T>(collection, field, query);
    } catch (error) {
      console.error(`Error in database distinct operation for collection ${collection}, field ${field}:`, error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.handler) {
      await this.handler.disconnect();
      this.handler = null;
    }
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down database...');
    
    try {
      if (this.handler) {
        // Check if the handler has a shutdown method
        if ('shutdown' in this.handler && typeof this.handler.shutdown === 'function') {
          await (this.handler as any).shutdown();
        } else {
          await this.handler.disconnect();
        }
        this.handler = null;
      }
      
      // Reset connection state
      this.connecting = false;
      this.connectionPromise = null;
      this.connectionLock = null;
      
      console.log('Database shutdown complete');
    } catch (error) {
      console.error('Error during database shutdown:', error);
      throw error;
    }
  }

  // Method to pre-initialize the database connection
  public async initialize(): Promise<void> {
    try {
      await this.getHandler();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Method to check database health
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      const handler = await this.getHandler();
      if (handler.isConnected()) {
        // For SQLite handler, also test the actual connection
        if ('testConnection' in handler && typeof handler.testConnection === 'function') {
          const connectionTest = await (handler as any).testConnection();
          if (connectionTest) {
            return { status: 'healthy', details: { message: 'Database connection is working' } };
          } else {
            return { status: 'unhealthy', details: { message: 'Database handler reports connected but connection test failed' } };
          }
        }
        return { status: 'healthy', details: { message: 'Database connection is working' } };
      } else {
        return { status: 'unhealthy', details: { message: 'Database handler exists but not connected' } };
      }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        details: { 
          message: 'Database health check failed', 
          error: error instanceof Error ? error.message : String(error) 
        } 
      };
    }
  }

  // Method to reset connection state and force a new connection
  public async resetConnection(): Promise<void> {
    console.log('Resetting database connection state...');
    
    // Disconnect existing handler
    if (this.handler) {
      await this.disconnect();
    }
    
    // Reset all connection state
    this.handler = null;
    this.connecting = false;
    this.connectionPromise = null;
    this.connectionLock = null;
    
    console.log('Database connection state reset complete');
  }
}

// Export a singleton instance for easy use throughout the application
export const db = Database.getInstance();
