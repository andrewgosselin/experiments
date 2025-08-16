import Database from 'better-sqlite3';
import { DatabaseHandler, FindOptions, FindOneOptions, UpdateOptions } from '../database';
import { promises as fs } from 'fs';
import path from 'path';

export class SqliteHandler implements DatabaseHandler {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // SQLite database path from environment variables
    this.dbPath = process.env.CMS_SQLITE_PATH || './data/cms.db';
  }

  public async connect(): Promise<void> {
    if (this.db && this.db.open) {
      console.log('Database already connected and open');
      return;
    }

    console.log('Attempting to connect to SQLite database at:', this.dbPath);
    
    try {
      // Ensure the directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });
      console.log('Database directory ensured:', dbDir);
      
      // Check if the database file exists and is accessible
      try {
        await fs.access(this.dbPath);
        console.log('Database file exists and is accessible');
      } catch (accessError) {
        console.log('Database file does not exist or is not accessible, will create new one');
      }
      
      this.db = new Database(this.dbPath);
      console.log('SQLite database instance created');
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      console.log('WAL mode enabled');
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      console.log('Foreign keys enabled');
      
      // Verify the connection is working
      this.db.prepare('SELECT 1').get();
      console.log('Database connection verified with test query');
      
      console.log('Successfully connected to SQLite database');
    } catch (error) {
      console.error('Failed to connect to SQLite database:', error);
      
      // Provide more specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('database is locked')) {
          throw new Error('Database is locked. This usually means another process is using it or there was an unclean shutdown.');
        } else if (error.message.includes('unable to open database file')) {
          throw new Error('Unable to open database file. Check file permissions and ensure the directory is writable.');
        } else if (error.message.includes('database disk image is malformed')) {
          throw new Error('Database file appears to be corrupted. You may need to restore from backup or delete the file to recreate it.');
        }
      }
      
      this.db = null;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      try {
        // Close any open statements
        this.db.pragma('optimize');
        console.log('Database optimized before disconnect');
        
        this.db.close();
        console.log('SQLite database connection closed');
      } catch (error) {
        console.error('Error closing SQLite database:', error);
      }
      this.db = null;
      console.log('Disconnected from SQLite database');
    }
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down SQLite database...');
    
    try {
      if (this.db && this.db.open) {
        // Finalize any remaining statements
        this.db.pragma('wal_checkpoint(TRUNCATE)');
        console.log('WAL checkpoint completed');
      }
    } catch (error) {
      console.error('Error during WAL checkpoint:', error);
    }
    
    await this.disconnect();
    console.log('SQLite database shutdown complete');
  }

  public isConnected(): boolean {
    return this.db !== null && this.db.open;
  }

  public getStatus(): { connected: boolean; dbPath: string; hasDb: boolean; isOpen: boolean } {
    return {
      connected: this.isConnected(),
      dbPath: this.dbPath,
      hasDb: !!this.db,
      isOpen: this.db?.open || false
    };
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        return false;
      }
      
      // Try to execute a simple query
      const db = this.getDatabase();
      const result = db.prepare('SELECT 1 as test').get() as any;
      return result && result.test === 1;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  private getDatabase(): Database.Database {
    console.log('getDatabase called, db state:', {
      hasDb: !!this.db,
      isOpen: this.db?.open,
      dbPath: this.dbPath
    });
    
    if (!this.db) {
      throw new Error('Database instance not created');
    }
    
    if (!this.db.open) {
      throw new Error('Database connection is not open');
    }
    
    return this.db;
  }

  private async ensureDatabaseReady(): Promise<void> {
    if (!this.isConnected()) {
      console.log('Database not connected, attempting to connect...');
      let retries = 3;
      while (retries > 0) {
        try {
          await this.connect();
          console.log('Database connection established successfully');
          return;
        } catch (error) {
          retries--;
          console.error(`Database connection attempt failed, ${retries} retries remaining:`, error);
          if (retries === 0) {
            console.error('All connection attempts failed, current status:', this.getStatus());
            throw new Error(`Failed to connect to database after 3 attempts: ${error}`);
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } else {
      console.log('Database already connected and ready');
    }
  }

  private ensureTable(collection: string): void {
    try {
      console.log(`Ensuring table exists for collection: ${collection}`);
      const db = this.getDatabase();
      const tableName = this.sanitizeTableName(collection);
      console.log(`Sanitized table name: ${tableName}`);
      
      // Create table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      console.log(`Executing SQL: ${createTableSQL}`);
      db.exec(createTableSQL);
      console.log(`Table ${tableName} ensured successfully`);
    } catch (error) {
      console.error(`Error ensuring table ${collection}:`, error);
      console.error('Database status:', this.getStatus());
      throw new Error(`Failed to ensure table ${collection}: ${error}`);
    }
  }

  private sanitizeTableName(name: string): string {
    // Sanitize table name to prevent SQL injection
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private transformData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.transformData(item));
      } else {
        const transformed: any = {};
        for (const [key, value] of Object.entries(data)) {
          transformed[key] = this.transformData(value);
        }
        return transformed;
      }
    }
    
    // Convert ISO date strings back to Date objects
    // Only convert strings that are actually ISO date strings (not booleans or other values)
    if (typeof data === 'string' && 
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(data) && 
        !isNaN(Date.parse(data))) {
      return new Date(data);
    }
    
    // Convert integers (0/1) back to booleans for known boolean fields
    // This is a simple heuristic - in a real app you might want a more sophisticated approach
    if (typeof data === 'number' && (data === 0 || data === 1)) {
      // For now, we'll assume any 0/1 value in the data could be a boolean
      // In a production app, you might want to maintain a schema or use TypeScript types
      return data === 1;
    }
    
    return data;
  }

  private sanitizeQueryParams(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeQueryParams(item));
      } else {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this.sanitizeQueryParams(value);
        }
        return sanitized;
      }
    }
    
    // Convert Date objects to ISO strings for SQLite queries
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Convert boolean values to integers for SQLite compatibility
    if (typeof data === 'boolean') {
      return data ? 1 : 0;
    }
    
    return data;
  }

  private buildWhereClause(query: any): { sql: string; params: any[] } {
    // Sanitize query parameters to ensure they're compatible with SQLite
    const sanitizedQuery = this.sanitizeQueryParams(query);
    
    if (!sanitizedQuery || Object.keys(sanitizedQuery).length === 0) {
      return { sql: '1=1', params: [] };
    }

    const conditions: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(sanitizedQuery)) {
      if (key === '_id') {
        if (typeof value === 'object' && value !== null) {
          // Handle MongoDB-style operators for _id field
          for (const [operator, operatorValue] of Object.entries(value)) {
            switch (operator) {
              case '$eq':
                conditions.push(`id = ?`);
                // Convert string ID to integer for SQLite comparison
                params.push(typeof operatorValue === 'string' ? parseInt(operatorValue, 10) : operatorValue);
                break;
              case '$ne':
                conditions.push(`id != ?`);
                // Convert string ID to integer for SQLite comparison
                params.push(typeof operatorValue === 'string' ? parseInt(operatorValue, 10) : operatorValue);
                break;
              case '$gt':
                conditions.push(`id > ?`);
                params.push(operatorValue);
                break;
              case '$gte':
                conditions.push(`id >= ?`);
                params.push(operatorValue);
                break;
              case '$lt':
                conditions.push(`id < ?`);
                params.push(operatorValue);
                break;
              case '$lte':
                conditions.push(`id <= ?`);
                params.push(operatorValue);
                break;
              case '$in':
                const placeholders = (operatorValue as any[]).map(() => '?').join(',');
                conditions.push(`id IN (${placeholders})`);
                // Convert string IDs to integers for SQLite comparison
                params.push(...(operatorValue as any[]).map((v: any) => typeof v === 'string' ? parseInt(v, 10) : v));
                break;
              default:
                // Default to equality
                conditions.push(`id = ?`);
                // Convert string ID to integer for SQLite comparison
                params.push(typeof value === 'string' ? parseInt(value, 10) : value);
            }
          }
        } else {
          // Simple equality for _id
          conditions.push(`id = ?`);
          // Convert string ID to integer for SQLite comparison
          params.push(typeof value === 'string' ? parseInt(value, 10) : value);
        }
      } else if (typeof value === 'object' && value !== null) {
        // Handle MongoDB-style operators for other fields
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$eq':
              conditions.push(`json_extract(data, '$.${key}') = ?`);
              // Don't JSON.stringify for equality comparisons - json_extract returns the actual value
              params.push(operatorValue);
              break;
            case '$ne':
              conditions.push(`json_extract(data, '$.${key}') != ?`);
              params.push(operatorValue);
              break;
            case '$gt':
              conditions.push(`json_extract(data, '$.${key}') > ?`);
              params.push(operatorValue);
              break;
            case '$gte':
              conditions.push(`json_extract(data, '$.${key}') >= ?`);
              params.push(operatorValue);
              break;
            case '$lt':
              conditions.push(`json_extract(data, '$.${key}') < ?`);
              params.push(operatorValue);
              break;
            case '$lte':
              conditions.push(`json_extract(data, '$.${key}') <= ?`);
              params.push(operatorValue);
              break;
            case '$in':
              const placeholders = (operatorValue as any[]).map(() => '?').join(',');
              conditions.push(`json_extract(data, '$.${key}') IN (${placeholders})`);
              params.push(...(operatorValue as any[]));
              break;
            case '$regex':
              conditions.push(`json_extract(data, '$.${key}') LIKE ?`);
              params.push(`%${operatorValue}%`);
              break;
            default:
              // Default to equality
              conditions.push(`json_extract(data, '$.${key}') = ?`);
              params.push(value);
          }
        }
      } else {
        // Simple equality for other fields
        conditions.push(`json_extract(data, '$.${key}') = ?`);
        // Don't JSON.stringify for equality comparisons - json_extract returns the actual value
        params.push(value);
      }
    }

    return {
      sql: conditions.join(' AND '),
      params
    };
  }

  private buildOrderClause(sort: any): string {
    if (!sort) return '';

    const orderParts: string[] = [];
    for (const [key, direction] of Object.entries(sort)) {
      const order = direction === -1 ? 'DESC' : 'ASC';
      if (key === '_id') {
        orderParts.push(`id ${order}`);
      } else {
        orderParts.push(`json_extract(data, '$.${key}') ${order}`);
      }
    }

    return orderParts.length > 0 ? `ORDER BY ${orderParts.join(', ')}` : '';
  }

  private buildProjection(projection: any): string {
    if (!projection) return '*';

    const fields: string[] = ['id'];
    for (const [key, value] of Object.entries(projection)) {
      if (value === 1 || value === true) {
        fields.push(`json_extract(data, '$.${key}') as ${key}`);
      }
    }

    return fields.join(', ');
  }

  public async find<T = any>(collection: string, query: any = {}, options: FindOptions = {}): Promise<T[]> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query);
    const orderSQL = this.buildOrderClause(options.sort);
    const projection = this.buildProjection(options.projection);
    
    let sql = `SELECT ${projection} FROM ${tableName} WHERE ${whereSQL}`;
    if (orderSQL) sql += ` ${orderSQL}`;
    if (options.limit) sql += ` LIMIT ${options.limit}`;
    if (options.skip) sql += ` OFFSET ${options.skip}`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(...whereParams) as any[];

    return rows.map(row => {
      if (projection === '*') {
        const data = JSON.parse(row.data);
        const transformedData = this.transformData(data);
        return { _id: row.id.toString(), ...transformedData } as T;
      } else {
        // Handle projection
        const result: any = { _id: row.id.toString() };
        for (const [key, value] of Object.entries(row as Record<string, any>)) {
          if (key !== 'id') {
            result[key] = this.transformData(value);
          }
        }
        return result as T;
      }
    });
  }

  public async findOne<T = any>(collection: string, query: any = {}, options: FindOneOptions = {}): Promise<T | null> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query);
    const projection = this.buildProjection(options.projection);
    
    const sql = `SELECT ${projection} FROM ${tableName} WHERE ${whereSQL} LIMIT 1`;
    const stmt = db.prepare(sql);
    const row = stmt.get(...whereParams) as any;

    if (!row) return null;

    if (projection === '*') {
      const data = JSON.parse(row.data);
      const transformedData = this.transformData(data);
      return { _id: row.id.toString(), ...transformedData } as T;
    } else {
      // Handle projection
      const result: any = { _id: row.id.toString() };
      for (const [key, value] of Object.entries(row as Record<string, any>)) {
        if (key !== 'id') {
          result[key] = this.transformData(value);
        }
      }
      return result as T;
    }
  }

  public async findById<T = any>(collection: string, id: string, options: FindOneOptions = {}): Promise<T | null> {
    return this.findOne<T>(collection, { _id: id }, options);
  }

  public async create<T = any>(collection: string, data: T): Promise<T> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const sql = `INSERT INTO ${tableName} (data) VALUES (?)`;
    const stmt = db.prepare(sql);
    const result = stmt.run(JSON.stringify(data));
    
    return { _id: result.lastInsertRowid.toString(), ...data } as T;
  }

  public async createMany<T = any>(collection: string, data: T[]): Promise<T[]> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const sql = `INSERT INTO ${tableName} (data) VALUES (?)`;
    const stmt = db.prepare(sql);
    
    const insert = db.transaction((items: T[]) => {
      return items.map(item => {
        const result = stmt.run(JSON.stringify(item));
        return { _id: result.lastInsertRowid.toString(), ...item } as T;
      });
    });
    
    return insert(data);
  }

  public async update<T = any>(collection: string, query: any, data: Partial<T>, options: UpdateOptions = {}): Promise<number> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    console.log('=== UPDATE DEBUG ===');
    console.log('Collection:', collection);
    console.log('Input query:', JSON.stringify(query, null, 2));
    console.log('Input data:', JSON.stringify(data, null, 2));
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query);
    
    console.log('Generated SQL:', whereSQL);
    console.log('Generated params:', whereParams);
    console.log('Param types:', whereParams.map((p, i) => ({ index: i, value: p, type: typeof p, isDate: p instanceof Date, isNaN: typeof p === 'number' && isNaN(p) })));
    
    // First get all matching records
    const selectSQL = `SELECT id, data FROM ${tableName} WHERE ${whereSQL}`;
    console.log('Final SQL:', selectSQL);
    console.log('Final params:', whereParams);
    
    const selectStmt = db.prepare(selectSQL);
    const rows = selectStmt.all(...whereParams);
    
    if (rows.length === 0) {
      if (options.upsert) {
        // Create new record if upsert is enabled
        await this.create(collection, data as T);
        return 1;
      }
      return 0;
    }
    
    // Update each matching record
    const updateSQL = `UPDATE ${tableName} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const updateStmt = db.prepare(updateSQL);
    
    const update = db.transaction((items: any[]) => {
      return items.map(item => {
        const currentData = JSON.parse(item.data);
        const transformedCurrentData = this.transformData(currentData);
        const updatedData = { ...transformedCurrentData, ...data };
        return updateStmt.run(JSON.stringify(updatedData), item.id);
      });
    });
    
    const results = update(rows);
    return results.reduce((sum, result) => sum + result.changes, 0);
  }

  public async updateById<T = any>(collection: string, id: string, data: Partial<T>, options: UpdateOptions = {}): Promise<T | null> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    // First get the current record
    const selectSQL = `SELECT data FROM ${tableName} WHERE id = ?`;
    const selectStmt = db.prepare(selectSQL);
    const row = selectStmt.get(id) as any;
    
    if (!row) {
      if (options.upsert) {
        // Create new record if upsert is enabled
        return await this.create(collection, data as T);
      }
      return null;
    }
    
    // Update the record
    const currentData = JSON.parse(row.data);
    const transformedCurrentData = this.transformData(currentData);
    const updatedData = { ...transformedCurrentData, ...data };
    const updateSQL = `UPDATE ${tableName} SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const updateStmt = db.prepare(updateSQL);
    updateStmt.run(JSON.stringify(updatedData), id);
    
    return { _id: id, ...updatedData } as T;
  }

  public async delete(collection: string, query: any): Promise<number> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query);
    const sql = `DELETE FROM ${tableName} WHERE ${whereSQL}`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...whereParams) as any;
    
    return result.changes;
  }

  public async deleteById(collection: string, id: string): Promise<boolean> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const sql = `DELETE FROM ${tableName} WHERE id = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.run(id) as any;
    
    return result.changes > 0;
  }

  public async count(collection: string, query: any = {}): Promise<number> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query);
    const sql = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereSQL}`;
    const stmt = db.prepare(sql);
    const result = stmt.get(...whereParams) as any;
    
    return result.count;
  }

  public async exists(collection: string, query: any): Promise<boolean> {
    const count = await this.count(collection, query);
    return count > 0;
  }

  public async aggregate<T = any>(collection: string, pipeline: any[]): Promise<T[]> {
    // SQLite doesn't have native aggregation like MongoDB
    // This is a simplified implementation that supports basic operations
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    // For now, return all documents and let the application handle aggregation
    // In a real implementation, you'd parse the pipeline and convert to SQL
    const sql = `SELECT data FROM ${tableName}`;
    const stmt = db.prepare(sql);
    const rows = stmt.all() as any[];
    
    const documents = rows.map(row => JSON.parse(row.data));
    
    // Simple pipeline processing (very basic)
    let result = documents;
    for (const stage of pipeline) {
      if (stage.$group) {
        // Basic grouping implementation
        const groups: any = {};
        const groupKey = stage.$group._id;
        const groupFields = Object.keys(stage.$group).filter(key => key !== '_id');
        
        for (const doc of result) {
          const key = groupKey.startsWith('$') ? doc[groupKey.slice(1)] : groupKey;
          if (!groups[key]) {
            groups[key] = { _id: key };
            for (const field of groupFields) {
              const fieldConfig = stage.$group[field];
              if (fieldConfig.$sum) {
                groups[key][field] = 0;
              } else if (fieldConfig.$count) {
                groups[key][field] = 0;
              }
            }
          }
          
          for (const field of groupFields) {
            const fieldConfig = stage.$group[field];
            if (fieldConfig.$sum) {
              const sumField = fieldConfig.$sum === 1 ? 1 : doc[fieldConfig.$sum.slice(1)];
              groups[key][field] += sumField || 0;
            } else if (fieldConfig.$count) {
              groups[key][field]++;
            }
          }
        }
        result = Object.values(groups);
      } else if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const sortOrder = stage.$sort[sortKey];
        result.sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          return sortOrder === -1 ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
        });
      }
    }
    
    return result as T[];
  }

  public async distinct<T = any>(collection: string, field: string, query?: any): Promise<T[]> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const { sql: whereSQL, params: whereParams } = this.buildWhereClause(query || {});
    const sql = `SELECT DISTINCT json_extract(data, '$.${field}') as value FROM ${tableName} WHERE ${whereSQL}`;
    const stmt = db.prepare(sql);
    const rows = stmt.all(...whereParams) as any[];
    
    return rows.map(row => row.value).filter(value => value !== null) as T[];
  }

  // SQLite-specific utility methods
  public async createIndex(collection: string, indexSpec: any, options?: any): Promise<string> {
    await this.ensureDatabaseReady();
    this.ensureTable(collection);
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const indexName = `${tableName}_${Object.keys(indexSpec).join('_')}_idx`;
    const columns = Object.keys(indexSpec).map(key => `json_extract(data, '$.${key}')`).join(', ');
    const unique = options?.unique ? 'UNIQUE' : '';
    
    const sql = `CREATE ${unique} INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns})`;
    db.exec(sql);
    
    return indexName;
  }

  public async dropIndex(collection: string, indexName: string): Promise<void> {
    const db = this.getDatabase();
    const sql = `DROP INDEX IF EXISTS ${indexName}`;
    db.exec(sql);
  }

  public async listIndexes(collection: string): Promise<any[]> {
    const db = this.getDatabase();
    const tableName = this.sanitizeTableName(collection);
    
    const sql = `SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ?`;
    const stmt = db.prepare(sql);
    const rows = stmt.all(tableName) as any[];
    
    return rows.map(row => ({ name: row.name }));
  }

  public async vacuum(): Promise<void> {
    const db = this.getDatabase();
    db.exec('VACUUM');
  }

  public async backup(backupPath: string): Promise<void> {
    const db = this.getDatabase();
    const backup = new Database(backupPath);
    db.backup(backup as any);
    backup.close();
  }
}