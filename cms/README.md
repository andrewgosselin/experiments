# CMS Platform Demo

A demo project showing what I've learned from using various CMS solutions in business. Built to solve the common problems I've encountered - extensibility, performance, and developer experience.

## 🚀 Quick Start

```bash
git clone <repository-url>
cd experiments/cms
npm install
npm run dev
```

That's it. The demo automatically:
- Creates SQLite database at `./data/cms.db`
- Sets up all tables and schemas
- Starts server at `http://localhost:3000`
- Opens admin at `http://localhost:3000/admin`

### Commands
```bash
npm run db:backup    # Backup database
npm run db:reset     # Reset database
npm run lint         # Run ESLint
npm run build        # Build for production
```

## What This Is

**A learning project.** I've used a lot of CMS solutions in business and kept hitting the same walls - can't override core components, performance issues, complex setup. This demo shows how to solve those problems with modern web tech.

**Not production ready.** It's missing features, has no guarantees, and is mainly for learning and portfolio purposes.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (default), MongoDB support
- **Runtime**: Node.js with ES modules

## Key Features

### Multi-Site Management
- Site isolation and routing
- Dynamic site switching
- Centralized configuration

### Extensible Block System
- Custom content blocks
- Visual block builder
- Override any component
- Full TypeScript support

### Database System
- SQLite by default (zero config)
- MongoDB support
- Connection pooling and retry logic
- Race condition prevention

## Architecture

```
src/
├── app/                    # Next.js App Router
├── blocks/                # Content blocks
├── components/            # UI components
├── data/                  # Database layer
├── actions/               # Server actions
└── types/                 # TypeScript types
```

## Database

The demo includes a robust database abstraction that handles:
- Connection management
- Retry logic
- Health checks
- Multiple database types

**SQLite is default** - no setup needed. Database file auto-creates at `./data/cms.db`.

## Development

### Database Operations
```typescript
import { db } from '@/data/database';

interface Page {
  _id?: string;
  title: string;
  content: string;
  siteId: string;
  createdAt: Date;
}

// Create page
const page = await db.create<Page>('pages', {
  title: 'Homepage',
  content: '<h1>Welcome</h1>',
  siteId: 'site-1',
  createdAt: new Date()
});

// Find pages
const pages = await db.find<Page>('pages', 
  { siteId: 'site-1' }, 
  { limit: 10, sort: { createdAt: -1 } }
);
```

### Custom Blocks
```typescript
export const CustomBlock: React.FC<BlockProps> = ({ data, children }) => (
  <div className="custom-block">
    <h2>{data.title}</h2>
    <div>{children}</div>
  </div>
);

export const blockConfig = {
  name: 'CustomBlock',
  component: CustomBlock,
  fields: [{ name: 'title', type: 'text', required: true }]
};
```

## Performance Features

- Server-side rendering with Next.js
- Intelligent caching
- Image optimization
- Code splitting
- Database connection pooling

## What I Learned

This project demonstrates:
- Clean architecture principles
- Design patterns (Factory, Strategy)
- Error handling and recovery
- Connection management
- Type safety throughout

## Future Ideas

- GraphQL API
- Plugin system
- Multi-tenancy
- AI integration
- Analytics

## License

MIT License

---

**Built to learn and demonstrate modern web development techniques. Not a business solution, but shows what's possible.**
