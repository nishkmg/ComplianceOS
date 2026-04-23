# ComplianceOS Deployment Guide

## Quick Deploy to Railway

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Create New Project

```bash
cd ComplianceOS
railway init
```

Select "Empty project" and name it "complianceos".

### 3. Provision PostgreSQL

```bash
railway add --database postgres
```

### 4. Provision Redis

```bash
railway add --database redis
```

### 5. Set Environment Variables

```bash
# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Set your production URL (update with your actual domain)
railway variables set NEXTAUTH_URL="https://complianceos-production.up.railway.app"

# Database and Redis URLs are auto-set by Railway
```

### 6. Deploy

```bash
railway up
```

### 7. Run Migrations & Seed

After deployment, run migrations via Railway shell:

```bash
railway run --shell
pnpm db:migrate
pnpm --filter @complianceos/db db:seed:demo
exit
```

### 8. Access Your App

Your app will be available at: `https://complianceos-production.up.railway.app`

**Demo Login:** demo@complianceos.test

---

## Estimated Costs

| Service | Railway Cost |
|---------|--------------|
| PostgreSQL | ~$5/month |
| Redis | ~$2/month |
| App (web) | ~$5/month |
| **Total** | **~$12/month** |

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection (auto-set by Railway) | `postgresql://...` |
| `REDIS_URL` | Redis connection (auto-set by Railway) | `redis://...` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Random 32-char base64 |
| `NEXTAUTH_URL` | Your production URL | `https://your-domain.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIL_HOST` | SMTP host for invoice emails | - |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | SMTP username | - |
| `MAIL_PASS` | SMTP password | - |
| `MAIL_FROM` | Email sender address | `noreply@complianceos.com` |

---

## Manual VPS Deployment (Ubuntu 22.04+)

### 1. Install Dependencies

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql-16 redis-server nginx git
curl -fsSL https://pnpm.io/install.sh | bash -
```

### 2. Clone & Setup

```bash
git clone https://github.com/nishkmg/ComplianceOS.git
cd ComplianceOS
pnpm install
pnpm build
```

### 3. Configure PM2

```bash
npm install -g pm2
pm2 start pnpm --name "complianceos-web" -- filter @complianceos/web start
pm2 save
pm2 startup
```

### 4. Configure Nginx

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Database Backup

### Automated Backups (Railway)

Railway provides automatic daily backups for PostgreSQL. Access via Railway dashboard.

### Manual Backup

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-$(date +%Y%m%d).sql
```

---

## Monitoring

### Health Check Endpoint

The app responds to health checks at `/api/health` (create if needed).

### Logs

```bash
# Railway
railway logs

# PM2
pm2 logs complianceos-web
```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules .next
pnpm install
pnpm build
```

### Database Connection Issues

```bash
# Test connection
railway run --shell
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```
