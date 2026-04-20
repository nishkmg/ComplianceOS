# ComplianceOS

Double-entry accounting engine with event sourcing for multi-tenant compliance management.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5
- **API:** tRPC v11
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Auth:** NextAuth.js v5
- **Monorepo:** pnpm + Turborepo
- **Infra:** Railway

## Architecture

- Event-sourced command handlers → append-only event store
- Node.js projector worker (SKIP LOCKED) → projection tables
- PostgreSQL RLS enforces multi-tenant isolation
- Snapshot every 10 events per aggregate

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16
- Redis 7

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and REDIS_URL

# Run database migrations
pnpm db:generate
pnpm db:migrate

# Seed default data
pnpm db:seed

# Start development
pnpm dev
```

### Development

```bash
# Web app
pnpm --filter @complianceos/web dev

# Projector worker (separate terminal)
pnpm --filter @complianceos/server dev:projector
```

### Production

```bash
# Build all packages
pnpm build

# Run with PM2
pm2 start ecosystem.config.cjs

# Or with Docker
docker build -f apps/web/Dockerfile -t complianceos-web .
docker run -p 3000:3000 complianceos-web
```

## Project Structure

```
apps/
  web/                    # Next.js frontend + tRPC API
packages/
  db/                     # Drizzle schema, migrations, seeds
  server/                 # Command handlers, projectors, tRPC routers
  shared/                 # Types, Zod schemas, constants
```

## License

Proprietary
