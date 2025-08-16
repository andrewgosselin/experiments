# Database System

This directory contains a flexible database abstraction layer that supports multiple database types through a unified interface.

## 🚀 Quick Start

The CMS works out-of-the-box with **SQLite** - no configuration required!

```typescript
import { db } from './data/database';

// Just start using the database - it automatically connects to SQLite
const users = await db.find('users', { active: true });
```

**What happens automatically:**
- ✅ SQLite database created at `./data/cms.db`
- ✅ All tables and schemas automatically created
- ✅ Connection management and retry logic handled
- ✅ Zero configuration required

## Architecture

The database system consists of:

- **`database.ts`** - Base interface and factory class that selects the appropriate database handler
- **`handlers/mongo.ts`** - MongoDB implementation of the database interface
- **`example.ts`** - Usage examples and patterns

## Configuration

### Environment Variables

The database system uses the following environment variables:

```bash
# Database type selection
CMS_DB_TYPE=sqlite  # Default: sqlite (Options: sqlite, mongo, mongodb)

# SQLite specific configuration (default - no setup required)
CMS_SQLITE_PATH=./data/cms.db           # SQLite database file path

# MongoDB specific configuration (optional - only if switching from SQLite)
CMS_MONGO_URI=mongodb://localhost:27017  # MongoDB connection string
CMS_MONGO_DB=cms                        # Database name
```

### Default Values

- `CMS_DB_TYPE`: `sqlite` (default)
- `CMS_SQLITE_PATH`: `./data/cms.db` (auto-created)
- `CMS_MONGO_URI`: `mongodb://localhost:27017`
- `CMS_MONGO_DB`: `cms`

**Note**: SQLite is the default database and requires no setup. The database file will be automatically created in the specified path.

## Usage

### Basic Usage

```typescript
import { db } from './data/database';

// The database automatically connects when first used
const users = await db.find('users', { active: true });
```

### Type-Safe Operations

```typescript
interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// Create a user
const user = await db.create<User>('users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  createdAt: new Date()
});

// Find users with type safety
const users = await db.find<User>('users', { age: { $gte: 18 } });

// Find by ID
const foundUser = await db.findById<User>('users', user._id!);

// Update user
const updatedUser = await db.updateById<User>('users', user._id!, { age: 31 });

// Delete user
const deleted = await db.deleteById('users', user._id!);
```

### Query Options

```typescript
// Find with options
const users = await db.find<User>('users', 
  { active: true }, 
  { 
    limit: 10,
    skip: 20,
    sort: { createdAt: -1 },
    projection: { name: 1, email: 1, _id: 0 }
  }
);

// Find one with projection
const user = await db.findOne<User>('users', 
  { email: 'john@example.com' },
  { projection: { password: 0 } }
);
```

### Bulk Operations

```typescript
// Create multiple documents
const users = await db.createMany<User>('users', [
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob', email: 'bob@example.com', age: 30 }
]);

// Update multiple documents
const updatedCount = await db.update<User>('users', 
  { age: { $lt: 18 } }, 
  { status: 'minor' }
);

// Delete multiple documents
const deletedCount = await db.delete('users', { active: false });
```

### Utility Operations

```typescript
// Count documents
const userCount = await db.count('users', { active: true });

// Check if document exists
const exists = await db.exists('users', { email: 'john@example.com' });

// Aggregate pipeline
const pipeline = [
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
];
const results = await db.aggregate('users', pipeline);

// Get distinct values
const uniqueEmails = await db.distinct<string>('users', 'email');
const activeUserEmails = await db.distinct<string>('users', 'email', { active: true });
```

### MongoDB-Specific Features

The MongoDB handler provides additional MongoDB-specific methods:

```typescript
import { MongoHandler } from './handlers/mongo';

const mongoHandler = new MongoHandler();
await mongoHandler.connect();

// Create indexes
await mongoHandler.createIndex('users', { email: 1 }, { unique: true });

// List indexes
const indexes = await mongoHandler.listIndexes('users');

// Drop index
await mongoHandler.dropIndex('users', 'email_1');

// Bulk write operations
const operations = [
  { insertOne: { document: { name: 'Alice', email: 'alice@example.com' } } },
  { updateOne: { filter: { email: 'john@example.com' }, update: { $set: { status: 'active' } } } },
  { deleteOne: { filter: { email: 'old@example.com' } } }
];
const result = await mongoHandler.bulkWrite('users', operations);
```

### SQLite-Specific Features

The SQLite handler provides additional SQLite-specific methods:

```typescript
import { SqliteHandler } from './handlers/sqlite';

const sqliteHandler = new SqliteHandler();
await sqliteHandler.connect();

// Create indexes on JSON fields
await sqliteHandler.createIndex('users', { email: 1 }, { unique: true });

// List indexes
const indexes = await sqliteHandler.listIndexes('users');

// Drop index
await sqliteHandler.dropIndex('users', 'users_email_idx');

// Database maintenance
await sqliteHandler.vacuum(); // Reclaim space and optimize database

// Create backup
await sqliteHandler.backup('./backup/cms_backup.db');
```

## Error Handling

```typescript
try {
  const user = await db.findById<User>('users', 'invalid-id');
  if (!user) {
    console.log('User not found');
  }
} catch (error) {
  if (error.message.includes('Invalid ObjectId')) {
    console.log('Invalid ID format');
  } else {
    console.error('Database error:', error);
  }
}
```

## Connection Management

The database automatically manages connections:

```typescript
// Connection is established automatically on first use
await db.find('users');

// Manually disconnect when done
await db.disconnect();
```

## Adding New Database Handlers

To add support for a new database type:

1. Create a new handler in `handlers/` directory
2. Implement the `DatabaseHandler` interface
3. Add the handler to the factory in `database.ts`

Example:

```typescript
// handlers/postgres.ts
export class PostgresHandler implements DatabaseHandler {
  // Implement all required methods...
}

// In database.ts, add to the switch statement:
case 'postgres':
  this.handler = new PostgresHandler();
  break;
```

## Best Practices

1. **Use TypeScript interfaces** for your data models to get type safety
2. **Handle errors appropriately** - database operations can fail
3. **Use projections** to limit data transfer when you don't need all fields
4. **Use indexes** for frequently queried fields
5. **Use bulk operations** when working with multiple documents
6. **Disconnect** from the database when your application shuts down

## Performance Considerations

- Use `limit` and `skip` for pagination
- Use `projection` to select only needed fields
- Create indexes on frequently queried fields
- Use `aggregate` for complex queries instead of multiple simple queries
- Use `bulkWrite` for multiple write operations

## Testing

The database system is designed to be easily testable. You can:

- Mock the `DatabaseHandler` interface
- Use a test database instance
- Use the singleton pattern to inject test handlers

```typescript
// Test example
import { DatabaseHandler } from './database';

class MockHandler implements DatabaseHandler {
  // Implement methods for testing...
}

// In your tests, you can inject the mock handler
``` 