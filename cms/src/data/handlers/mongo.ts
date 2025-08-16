import { MongoClient, Db, Collection, ObjectId, Filter, UpdateFilter, FindOptions as MongoFindOptions, UpdateOptions as MongoUpdateOptions, CountDocumentsOptions, Document } from 'mongodb';
import { DatabaseHandler, FindOptions, FindOneOptions, UpdateOptions } from '../database';

export class MongoHandler implements DatabaseHandler {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;

  constructor() {
    // MongoDB connection configuration from environment variables
    const mongoUri = process.env.CMS_MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.CMS_MONGO_DB || 'cms';
    
    this.client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnecting) {
      return;
    }

    if (this.db) {
      return;
    }

    try {
      this.isConnecting = true;
      await this.client!.connect();
      this.db = this.client!.db(process.env.CMS_MONGO_DB || 'cms');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  public isConnected(): boolean {
    return this.db !== null && this.client !== null;
  }

  private getCollection(collectionName: string): Collection {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection(collectionName);
  }

  private convertId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch (error) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }
  }

  public async find<T = any>(collection: string, query: any = {}, options: FindOptions = {}): Promise<T[]> {
    const coll = this.getCollection(collection);
    const mongoOptions: MongoFindOptions = {};
    
    if (options.limit) mongoOptions.limit = options.limit;
    if (options.skip) mongoOptions.skip = options.skip;
    if (options.sort) mongoOptions.sort = options.sort;
    if (options.projection) mongoOptions.projection = options.projection;

    const cursor = coll.find(query as Filter<Document>, mongoOptions);
    const results = await cursor.toArray();
    return results as T[];
  }

  public async findOne<T = any>(collection: string, query: any = {}, options: FindOneOptions = {}): Promise<T | null> {
    const coll = this.getCollection(collection);
    const mongoOptions: MongoFindOptions = {};
    
    if (options.projection) mongoOptions.projection = options.projection;

    const result = await coll.findOne(query as Filter<Document>, mongoOptions);
    return result as T | null;
  }

  public async findById<T = any>(collection: string, id: string, options: FindOneOptions = {}): Promise<T | null> {
    const coll = this.getCollection(collection);
    const mongoOptions: MongoFindOptions = {};
    
    if (options.projection) mongoOptions.projection = options.projection;

    const result = await coll.findOne({ _id: this.convertId(id) } as Filter<Document>, mongoOptions);
    return result as T | null;
  }

  public async create<T = any>(collection: string, data: T): Promise<T> {
    const coll = this.getCollection(collection);
    const result = await coll.insertOne(data as Document);
    
    // Return the created document with the generated _id
    return {
      ...data,
      _id: result.insertedId
    } as T;
  }

  public async createMany<T = any>(collection: string, data: T[]): Promise<T[]> {
    const coll = this.getCollection(collection);
    const result = await coll.insertMany(data as Document[]);
    
    // Return the created documents with their generated _ids
    return data.map((item, index) => ({
      ...item,
      _id: result.insertedIds[index]
    })) as T[];
  }

  public async update<T = any>(collection: string, query: any, data: Partial<T>, options: UpdateOptions = {}): Promise<number> {
    const coll = this.getCollection(collection);
    const mongoOptions: MongoUpdateOptions = {};
    
    if (options.upsert) mongoOptions.upsert = options.upsert;

    const result = await coll.updateMany(
      query as Filter<Document>,
      { $set: data } as UpdateFilter<Document>,
      mongoOptions
    );

    return result.modifiedCount;
  }

  public async updateById<T = any>(collection: string, id: string, data: Partial<T>, options: UpdateOptions = {}): Promise<T | null> {
    const coll = this.getCollection(collection);
    const mongoOptions: MongoUpdateOptions = {};
    
    if (options.upsert) mongoOptions.upsert = options.upsert;

    // First update the document
    await coll.updateOne(
      { _id: this.convertId(id) } as Filter<Document>,
      { $set: data } as UpdateFilter<Document>,
      mongoOptions
    );

    // Then find and return the updated document
    const result = await coll.findOne({ _id: this.convertId(id) } as Filter<Document>);
    return result as T | null;
  }

  public async delete(collection: string, query: any): Promise<number> {
    const coll = this.getCollection(collection);
    const result = await coll.deleteMany(query as Filter<Document>);
    return result.deletedCount;
  }

  public async deleteById(collection: string, id: string): Promise<boolean> {
    const coll = this.getCollection(collection);
    const result = await coll.deleteOne({ _id: this.convertId(id) } as Filter<Document>);
    return result.deletedCount > 0;
  }

  public async count(collection: string, query: any = {}): Promise<number> {
    const coll = this.getCollection(collection);
    const options: CountDocumentsOptions = {};
    return await coll.countDocuments(query as Filter<Document>, options);
  }

  public async exists(collection: string, query: any): Promise<boolean> {
    const coll = this.getCollection(collection);
    const count = await coll.countDocuments(query as Filter<Document>, { limit: 1 });
    return count > 0;
  }

  public async aggregate<T = any>(collection: string, pipeline: any[]): Promise<T[]> {
    const coll = this.getCollection(collection);
    const cursor = coll.aggregate(pipeline);
    const results = await cursor.toArray();
    return results as T[];
  }

  // MongoDB-specific utility methods
  public async createIndex(collection: string, indexSpec: any, options?: any): Promise<string> {
    const coll = this.getCollection(collection);
    return await coll.createIndex(indexSpec, options);
  }

  public async dropIndex(collection: string, indexName: string): Promise<void> {
    const coll = this.getCollection(collection);
    await coll.dropIndex(indexName);
  }

  public async listIndexes(collection: string): Promise<any[]> {
    const coll = this.getCollection(collection);
    const cursor = coll.listIndexes();
    return await cursor.toArray();
  }

  public async distinct<T>(collection: string, field: string, query?: any): Promise<T[]> {
    const coll = this.getCollection(collection);
    return await coll.distinct(field, query as Filter<Document>);
  }

  public async bulkWrite(collection: string, operations: any[]): Promise<any> {
    const coll = this.getCollection(collection);
    return await coll.bulkWrite(operations);
  }
}
