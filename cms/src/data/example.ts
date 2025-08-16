import { db } from './database';

// Example interface for a user document
interface User {
  _id?: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

// Example interface for a post document
interface Post {
  _id?: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Example usage of the database system
export class ExampleUsage {
  
  // Create a new user
  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user: Omit<User, '_id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    return await db.create<User>('users', user);
  }

  // Find all users
  static async getAllUsers(): Promise<User[]> {
    return await db.find<User>('users', {}, { sort: { createdAt: -1 } });
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<User | null> {
    return await db.findOne<User>('users', { email });
  }

  // Find user by ID
  static async findUserById(id: string): Promise<User | null> {
    return await db.findById<User>('users', id);
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    return await db.updateById<User>('users', id, updateData);
  }

  // Delete user
  static async deleteUser(id: string): Promise<boolean> {
    return await db.deleteById('users', id);
  }

  // Create a new post
  static async createPost(postData: Omit<Post, '_id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = new Date();
    const post: Omit<Post, '_id'> = {
      ...postData,
      createdAt: now,
      updatedAt: now
    };
    
    return await db.create<Post>('posts', post);
  }

  // Find published posts
  static async getPublishedPosts(): Promise<Post[]> {
    return await db.find<Post>('posts', { published: true }, { 
      sort: { createdAt: -1 },
      limit: 10 
    });
  }

  // Find posts by author
  static async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return await db.find<Post>('posts', { authorId }, { sort: { createdAt: -1 } });
  }

  // Search posts by title
  static async searchPostsByTitle(searchTerm: string): Promise<Post[]> {
    return await db.find<Post>('posts', { 
      title: { $regex: searchTerm, $options: 'i' } 
    }, { sort: { createdAt: -1 } });
  }

  // Count posts by tag
  static async countPostsByTag(tag: string): Promise<number> {
    return await db.count('posts', { tags: tag });
  }

  // Check if user exists
  static async userExists(email: string): Promise<boolean> {
    return await db.exists('users', { email });
  }

  // Bulk create users
  static async bulkCreateUsers(users: Omit<User, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<User[]> {
    const now = new Date();
    const usersWithTimestamps = users.map(user => ({
      ...user,
      createdAt: now,
      updatedAt: now
    }));
    
    return await db.createMany<User>('users', usersWithTimestamps);
  }

  // Aggregate example: Get post count by author
  static async getPostCountByAuthor(): Promise<Array<{ _id: string; count: number }>> {
    const pipeline = [
      { $group: { _id: '$authorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    
    return await db.aggregate<{ _id: string; count: number }>('posts', pipeline);
  }

  // Complex query example: Find users with posts
  static async findUsersWithPosts(): Promise<User[]> {
    // First get all author IDs from posts
    const authorIds = await db.distinct<string>('posts', 'authorId');
    
    // Then find users with those IDs
    return await db.find<User>('users', { _id: { $in: authorIds } });
  }
}

// Example of how to use the database in an API route or service
export async function exampleUsage() {
  try {
    // Create a user
    const user = await ExampleUsage.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
    console.log('Created user:', user);

    // Create a post for the user
    const post = await ExampleUsage.createPost({
      title: 'My First Post',
      content: 'This is the content of my first post.',
      authorId: user._id!,
      published: true,
      tags: ['first', 'introduction']
    });
    console.log('Created post:', post);

    // Find the user by email
    const foundUser = await ExampleUsage.findUserByEmail('john@example.com');
    console.log('Found user:', foundUser);

    // Update the user
    const updatedUser = await ExampleUsage.updateUser(user._id!, { age: 31 });
    console.log('Updated user:', updatedUser);

    // Get all published posts
    const publishedPosts = await ExampleUsage.getPublishedPosts();
    console.log('Published posts:', publishedPosts);

    // Check if user exists
    const exists = await ExampleUsage.userExists('john@example.com');
    console.log('User exists:', exists);

    // Get post count by author
    const postCounts = await ExampleUsage.getPostCountByAuthor();
    console.log('Post counts by author:', postCounts);

  } catch (error) {
    console.error('Error in example usage:', error);
  }
} 