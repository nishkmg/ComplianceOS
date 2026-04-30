FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=@complianceos/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/db/drizzle.config.ts ./packages/db/drizzle.config.ts
COPY --from=builder /app/packages/db/migrations ./packages/db/migrations
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
EXPOSE 3000
CMD node -e "
  const { execSync } = require('child_process');
  try {
    execSync('npx drizzle-kit migrate', {
      cwd: '/app/packages/db',
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
" && node apps/web/server.js