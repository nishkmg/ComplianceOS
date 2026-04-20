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
cp apps/web/.env.example apps/web/.env.local 2>/dev/null || true
# Edit apps/web/.env.local with your DATABASE_URL and REDIS_URL

# Run database migrations
pnpm db:generate
pnpm db:migrate

# Seed default data
pnpm --filter @complianceos/db db:seed

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
apps/web/                  # Next.js 15 frontend + tRPC API + NextAuth
packages/
  db/                     # Drizzle schema, migrations, seeds
  server/                 # Command handlers, projectors, tRPC routers
  shared/                 # Types, Zod schemas, event types, GST constants
```

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=...
AUTH_SECRET=...
```

## Database

```bash
# Generate + migrate
pnpm db:generate
pnpm db:migrate

# Seed CoA templates + default data (from packages/db)
pnpm --filter @complianceos/db db:seed
```

## Deployment

 Railway CLI (`railway login` required):

```bash
railway login
railway init
railway up
```

Or with Docker:

```bash
docker build -f apps/web/Dockerfile -t complianceos-web .
docker run -p 3000:3000 --env-file apps/web/.env.local complianceos-web
```

## Setup Notes

- ESLint is not yet configured — run `pnpm --filter @complianceos/web lint` after setup
- Projector worker runs separately: `pnpm --filter @complianceos/server dev:projector`
- See `docs/superpowers/plans/2026-04-20-core-accounting-engine.md` for full implementation plan

## License

Proprietary
