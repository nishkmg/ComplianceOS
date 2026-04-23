# ComplianceOS Deployment Guide

**Production deployment instructions for staging and live environments.**

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Comparison](#environment-comparison)
3. [Railway Deployment](#railway-deployment)
4. [Docker Deployment](#docker-deployment)
5. [VPS Deployment](#vps-deployment)
6. [Database Migration](#database-migration)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing: `pnpm test`
- [ ] Typecheck passing: `pnpm typecheck`
- [ ] Lint passing: `pnpm lint`
- [ ] Build successful: `pnpm build`
- [ ] No console errors in browser dev tools
- [ ] Demo data removed from production: `pnpm db:seed:demo:clean`

### Security

- [ ] `.env` file NOT committed to git
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] Database credentials rotated from defaults
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on API routes
- [ ] HTTPS enforced (no HTTP fallback)

### Infrastructure

- [ ] PostgreSQL 16+ provisioned
- [ ] Redis 7+ provisioned
- [ ] Domain configured (for production)
- [ ] SSL certificate installed
- [ ] Backup strategy configured (daily DB backups)
- [ ] Monitoring enabled (error tracking, performance)

### Data

- [ ] Database migrations run: `pnpm db:migrate`
- [ ] Opening balances entered (if migrating from legacy)
- [ ] Chart of accounts seeded
- [ ] Fiscal year created (2026-27)
- [ ] GST config configured
- [ ] ITR config configured
- [ ] Admin user created

---

## Environment Comparison

| Setting | Development | Staging | Production |
|---------|-------------|---------|------------|
| **Database** | Local PostgreSQL | Railway PostgreSQL (shared) | Railway PostgreSQL (dedicated) |
| **Redis** | Local Redis | Railway Redis (shared) | Railway Redis (dedicated) |
| **Domain** | localhost:3000 | staging.complianceos.com | app.complianceos.com |
| **Auth** | Magic link only | Magic link + Google OAuth | Magic link + Google + Microsoft |
| **Email** | Mailhog (local) | Mailgun (sandbox) | Mailgun (production) |
| **File Storage** | Local `/tmp` | Railway volume | AWS S3 / Cloudflare R2 |
| **Monitoring** | Console logs | Railway logs | Railway + Sentry + LogRocket |
| **Backups** | Manual | Daily (7-day retention) | Hourly (30-day retention) |
| **SSL** | None | Auto (Let's Encrypt) | Auto (Let's Encrypt) + HSTS |

---

## Railway Deployment

### Prerequisites

- Railway account (free tier available)
- GitHub account
- Domain name (for production, optional for staging)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Project

```bash
cd /Volumes/CrucialSSD/Projects/ComplianceOS
railway init
```

Select "Empty project" → Name: `complianceos-staging` or `complianceos-production`

### Step 3: Add PostgreSQL

```bash
railway add --database postgres
```

**Note the `DATABASE_URL`** — automatically added to environment variables.

### Step 4: Add Redis

```bash
railway add --database redis
```

**Note the `REDIS_URL`** — automatically added to environment variables.

### Step 5: Configure Environment Variables

```bash
# Generate NextAuth secret
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set production URL
railway variables set NEXTAUTH_URL=https://staging.complianceos.com
# OR for production:
railway variables set NEXTAUTH_URL=https://app.complianceos.com

# Email configuration (Mailgun)
railway variables set MAIL_HOST=smtp.mailgun.org
railway variables set MAIL_PORT=587
railway variables set MAIL_USER=postmaster@mg.complianceos.com
railway variables set MAIL_PASS=your-mailgun-password
railway variables set MAIL_FROM=noreply@complianceos.com

# File storage (S3-ready)
railway variables set UPLOAD_DIR=/tmp/complianceos/uploads
railway variables set AWS_ACCESS_KEY_ID=your-key
railway variables set AWS_SECRET_ACCESS_KEY=your-secret
railway variables set AWS_S3_BUCKET=complianceos-uploads
railway variables set AWS_REGION=ap-south-1

# Projector worker
railway variables set PROJECTOR_PORT=3100
```

### Step 6: Deploy

```bash
# Deploy web app + API
railway up

# Deploy projector worker (separate service)
railway worker --start "pnpm --filter @complianceos/server dev:projector"
```

### Step 7: Run Migrations

```bash
# One-time migration
railway run pnpm db:migrate
```

### Step 8: Create Admin User

```bash
# Access database via Railway CLI
railway postgresql

# In psql:
INSERT INTO users (id, email, name) 
VALUES (gen_random_uuid(), 'admin@complianceos.com', 'Admin User');

INSERT INTO user_tenants (user_id, tenant_id, role)
SELECT id, 'YOUR_TENANT_ID', 'owner'
FROM users WHERE email = 'admin@complianceos.com';
```

### Step 9: Configure Domain (Production Only)

```bash
# Add custom domain
railway domain add app.complianceos.com

# Update DNS (Railway provides CNAME)
# CNAME your-domain.com → up.railway.app
```

### Step 10: Verify Deployment

```bash
# Check deployment status
railway status

# View logs
railway logs

# Open in browser
railway open
```

---

## Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose 2.20+

### Step 1: Build Images

```bash
docker build -t complianceos:latest .
```

### Step 2: Configure Environment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    image: complianceos:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/complianceos
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://your-domain.com
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=complianceos

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  projector:
    image: complianceos:latest
    command: pnpm --filter @complianceos/server dev:projector
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/complianceos
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Start Services

```bash
docker-compose up -d
```

### Step 4: Run Migrations

```bash
docker-compose exec app pnpm db:migrate
```

### Step 5: Verify

```bash
docker-compose ps
docker-compose logs -f app
```

Access: http://localhost:3000

---

## VPS Deployment (Ubuntu 22.04+)

### Step 1: Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL 16
apt install -y postgresql-16 postgresql-contrib

# Install Redis 7
apt install -y redis-server

# Install Nginx
apt install -y nginx

# Install PM2
npm install -g pm2
```

### Step 2: Clone Repository

```bash
cd /var/www
git clone https://github.com/your-org/complianceos.git
cd complianceos
pnpm install
pnpm build
```

### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit with production values.

### Step 4: Configure PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE complianceos;
CREATE USER compliance WITH ENCRYPTED PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE complianceos TO compliance;
\q
```

### Step 5: Configure Redis

```bash
nano /etc/redis/redis.conf
# Set: bind 127.0.0.1
# Set: protected-mode yes

systemctl restart redis
```

### Step 6: Run Migrations

```bash
pnpm db:migrate
```

### Step 7: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'complianceos-web',
      script: 'pnpm',
      args: 'start',
      cwd: '/var/www/complianceos/apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'complianceos-projector',
      script: 'pnpm',
      args: '--filter @complianceos/server dev:projector',
      cwd: '/var/www/complianceos',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

Start services:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Copy-paste the sudo command output
```

### Step 8: Configure Nginx

```bash
nano /etc/nginx/sites-available/complianceos
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /tmp/complianceos/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/complianceos /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 9: SSL Certificate

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## Database Migration

### From Development to Staging

```bash
# Export from development (DO NOT include demo data)
pg_dump -h localhost -U postgres complianceos_dev \
  --exclude-table-data=users \
  --exclude-table-data=tenants \
  --exclude-table-data=journal_entries \
  --exclude-table-data=invoices \
  > schema-only.sql

# Import to staging
psql -h staging-db.railway.app -U postgres -d complianceos < schema-only.sql
```

### From Staging to Production

```bash
# Use Railway's built-in fork feature
railway project clone --from staging --to production

# Or manual export/import
pg_dump -h staging-db.railway.app -U postgres complianceos > production-backup.sql
psql -h production-db.railway.app -U postgres -d complianceos < production-backup.sql
```

### Migration Best Practices

- ✅ Always backup before migrations
- ✅ Test migrations on staging first
- ✅ Run migrations during low-traffic periods
- ✅ Keep migration scripts idempotent
- ✅ Document schema changes in changelog

---

## Post-Deployment

### Verification Checklist

- [ ] Homepage loads (HTTPS)
- [ ] Login works (magic link received)
- [ ] Dashboard renders without errors
- [ ] All 8 modules accessible
- [ ] Database migrations applied
- [ ] Projector worker running (check port 3100)
- [ ] Email sending (test invoice email)
- [ ] File uploads working (test invoice PDF)
- [ ] Redis caching working (sessions persist)
- [ ] Error tracking configured (Sentry)

### Monitoring Setup

#### Railway Logs

```bash
# View real-time logs
railway logs

# Filter by service
railway logs --service web
railway logs --service projector
```

#### Health Check Endpoint

```bash
curl https://your-domain.com/api/health
# Expected: {"status":"ok","timestamp":"2026-04-22T..."}
```

#### Projector Health Check

```bash
curl http://localhost:3100
# Expected: {"status":"ok","projectors":[...]}
```

### Backup Configuration

#### Railway (Automatic)

- PostgreSQL: Daily backups (7-day retention on hobby, 30-day on pro)
- Redis: Not backed up (ephemeral cache)

#### Manual Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/complianceos"

# Database backup
pg_dump -h localhost -U postgres complianceos | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# File uploads backup
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz /tmp/complianceos/uploads

# Keep last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup complete: $DATE"
```

Add to crontab:

```bash
0 2 * * * /var/www/complianceos/scripts/backup.sh
```

---

## Monitoring & Maintenance

### Daily Tasks

- [ ] Check error logs (Railway dashboard or `railway logs`)
- [ ] Verify backups completed
- [ ] Check disk space (`df -h`)
- [ ] Monitor response times (Railway metrics)

### Weekly Tasks

- [ ] Review slow queries (PostgreSQL logs)
- [ ] Check for dependency updates (`pnpm outdated`)
- [ ] Verify SSL certificate expiry
- [ ] Test backup restoration (staging environment)

### Monthly Tasks

- [ ] Security audit (dependency vulnerabilities)
- [ ] Performance review (database indexes, query optimization)
- [ ] Cost review (Railway bill, optimize if needed)
- [ ] Update documentation (changelog, deployment guide)

### Alerts Configuration

Configure alerts for:

- **Database:** CPU > 80%, Disk > 90%, Connection errors
- **App:** Error rate > 1%, Response time > 2s, Downtime
- **Projector:** Not running, Event backlog > 1000

---

## Troubleshooting

### Database Connection Errors

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql $DATABASE_URL

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### Redis Connection Errors

```bash
# Check Redis is running
redis-cli ping

# Test connection
redis-cli -u $REDIS_URL
```

### App Not Starting

```bash
# Check Node.js version
node --version  # Should be v20+

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm build

# Check logs
railway logs
# OR for VPS:
pm2 logs complianceos-web
```

### Projector Not Processing Events

```bash
# Check projector status
curl http://localhost:3100

# Restart projector
railway restart projector
# OR for VPS:
pm2 restart complianceos-projector

# Check event backlog
SELECT count(*) FROM event_store 
WHERE sequence > (
  SELECT last_processed_sequence 
  FROM projector_state 
  WHERE projector_name = 'account_balance'
);
```

### Migration Failures

```bash
# Check current migration state
pnpm drizzle-kit status

# Reset last migration (careful!)
pnpm drizzle-kit undo

# Re-run migrations
pnpm db:migrate
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit  # VPS
# OR
railway status  # Railway

# Increase Railway plan or optimize queries
# Add database indexes for slow queries
```

---

## Rollback Procedure

### Code Rollback

```bash
# Revert to previous commit
git revert HEAD
git push

# Deploy reverted code
railway up
```

### Database Rollback

```bash
# Restore from backup
pg_restore -h production-db.railway.app -U postgres -d complianceos latest-backup.dump
```

### Full Rollback (Nuclear Option)

```bash
# 1. Stop all services
railway stop

# 2. Restore database from backup
# 3. Redeploy previous version
git checkout previous-tag
railway up

# 4. Restart services
railway start
```

---

## Support Contacts

| Issue | Contact |
|-------|---------|
| Deployment issues | devops@complianceos.com |
| Database issues | dba@complianceos.com |
| Security issues | security@complianceos.com |
| General support | support@complianceos.com |

---

**Last Updated:** April 2026  
**Version:** 1.0.0
