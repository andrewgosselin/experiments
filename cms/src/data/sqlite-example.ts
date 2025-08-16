import { db } from './database';

// Define interfaces for our data types
interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  createdAt?: Date;
}

// Example of using SQLite with the database system
export async function sqliteExample() {
  // Set environment variable to use SQLite
  // process.env.CMS_DB_TYPE = 'sqlite';
  // process.env.CMS_SQLITE_PATH = './data/cms.db';

  try {
    console.log('Using SQLite database...');

    // Create a user
    const user = await db.create<User>('users', {
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: 28,
      createdAt: new Date()
    });
    console.log('Created user:', user);

    // Find user by email
    const foundUser = await db.findOne<User>('users', { email: 'jane@example.com' });
    console.log('Found user:', foundUser);

    // Update user
    const updatedUser = await db.updateById<User>('users', user._id!, { age: 29 });
    console.log('Updated user:', updatedUser);

    // Create multiple users
    const users = await db.createMany<User>('users', [
      { name: 'Alice', email: 'alice@example.com', age: 25 },
      { name: 'Bob', email: 'bob@example.com', age: 30 },
      { name: 'Charlie', email: 'charlie@example.com', age: 35 }
    ]);
    console.log('Created multiple users:', users.length);

    // Find users with age greater than 25
    const olderUsers = await db.find<User>('users', { age: { $gt: 25 } });
    console.log('Users older than 25:', olderUsers.length);

    // Count users
    const userCount = await db.count('users');
    console.log('Total users:', userCount);

    // Check if user exists
    const exists = await db.exists('users', { email: 'jane@example.com' });
    console.log('User exists:', exists);

    // Get distinct ages
    const ages = await db.distinct<number>('users', 'age');
    console.log('Distinct ages:', ages);

    // Simple aggregation (count by age)
    const ageGroups = await db.aggregate<{ _id: number; count: number }>('users', [
      { $group: { _id: '$age', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('Age groups:', ageGroups);

    // Delete a user
    const deleted = await db.deleteById('users', user._id!);
    console.log('User deleted:', deleted);

    console.log('SQLite example completed successfully!');

  } catch (error) {
    console.error('Error in SQLite example:', error);
  }
}

// Example of SQLite-specific features
export async function sqliteSpecificFeatures() {
  try {
    // Import the SQLite handler directly for specific features
    const { SqliteHandler } = await import('./handlers/sqlite');
    const sqliteHandler = new SqliteHandler();
    await sqliteHandler.connect();

    // Create an index on the email field
    const indexName = await sqliteHandler.createIndex('users', { email: 1 }, { unique: true });
    console.log('Created index:', indexName);

    // List all indexes
    const indexes = await sqliteHandler.listIndexes('users');
    console.log('Indexes:', indexes);

    // Optimize the database
    await sqliteHandler.vacuum();
    console.log('Database optimized');

    // Create a backup
    await sqliteHandler.backup('./backup/cms_backup.db');
    console.log('Backup created');

    await sqliteHandler.disconnect();

  } catch (error) {
    console.error('Error in SQLite specific features:', error);
  }
}

// Example of switching between databases
export async function databaseSwitchingExample() {
  try {
    // Start with MongoDB
    process.env.CMS_DB_TYPE = 'mongo';
    console.log('Using MongoDB...');
    
    const mongoUser = await db.create<User>('users', {
      name: 'Mongo User',
      email: 'mongo@example.com',
      age: 30
    });
    console.log('Created MongoDB user:', mongoUser._id);

    // Switch to SQLite
    process.env.CMS_DB_TYPE = 'sqlite';
    console.log('Switching to SQLite...');
    
    // Note: You'll need to reconnect for the change to take effect
    // In a real application, you'd restart the process or implement reconnection logic
    
    const sqliteUser = await db.create<User>('users', {
      name: 'SQLite User',
      email: 'sqlite@example.com',
      age: 25
    });
    console.log('Created SQLite user:', sqliteUser._id);

  } catch (error) {
    console.error('Error in database switching example:', error);
  }
} 