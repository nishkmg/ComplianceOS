# ComplianceOS

**Indian Business Compliance Platform** — Double-entry accounting with event sourcing, GST returns, ITR generation, payroll, inventory, and OCR document scanning.

---

## 🚀 Quick Start

### Prerequisites

| Software | Version | Install |
|----------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9+ | `npm i -g pnpm` |
| PostgreSQL | 16+ | [postgresql.org](https://postgresql.org) |
| Redis | 7+ | [redis.io](https://redis.io) |

### Local Development (5 minutes)

```bash
# 1. Clone & Install
git clone https://github.com/nishkmg/ComplianceOS.git
cd ComplianceOS
pnpm install

# 2. Start Infrastructure (macOS)
brew services start postgresql@16
brew services start redis@7

# 3. Create Database
createdb complianceos_dev

# 4. Configure Environment
cp .env.example .env
# Edit .env with your database URL

# 5. Migrate & Seed Demo Data
pnpm db:migrate
pnpm --filter @complianceos/db db:seed:demo

# 6. Start Development
pnpm dev
```

**Access:** http://localhost:3000  
**Demo Login:** demo@complianceos.test (no password required in dev)

---

## 📦 Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Backend** | tRPC v11, Node.js |
| **Database** | PostgreSQL 16, Drizzle ORM |
| **Cache** | Redis 7 (sessions, email queue) |
| **Auth** | NextAuth.js v5 |
| **Styling** | Tailwind CSS 4, Shadcn/UI |
| **Monorepo** | pnpm + Turborepo |
| **Infra** | Railway (recommended), Docker-ready |

### Monorepo Structure

```
complianceos/
├── apps/
│   └── web/              # Next.js frontend + tRPC API
├── packages/
│   ├── db/               # Drizzle schema, migrations, seeds
│   ├── server/           # Commands, projectors, tRPC routers
│   └── shared/           # Types, Zod schemas, constants
└── docs/
    └── superpowers/      # Implementation plans & specs
```

### Key Features

| Module | Status | Description |
|--------|--------|-------------|
| **Core Accounting** | ✅ | Double-entry ledger, event sourcing, financial statements |
| **Invoicing** | ✅ | Sales/purchase invoices, PDF generation, email, credit notes |
| **Receivables** | ✅ | Payment allocation, aging reports (0-30 to 90+ days) |
| **Inventory** | ✅ | FIFO valuation, COGS calculation, stock movements |
| **Payroll** | ✅ | Salary structures, payslips (PDF), statutory (PF/ESI/TDS) |
| **GST** | ✅ | GSTR-1/2B/3B, ITC reconciliation, challan, payment |
| **ITR** | ✅ | ITR-3/ITR-4, tax computation (Old/New), advance tax |
| **OCR** | ✅ | Invoice/receipt scanning (Tesseract.js), auto-JE creation |
| **Onboarding** | ✅ | Business setup, CoA customization, opening balances |

---

## 🏗️ Deployment

### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --database postgres

# Add Redis
railway add --database redis

# Set environment variables
railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_URL=https://your-domain.com

# Deploy
railway up
```

**Estimated Cost:** ~$20/month (PostgreSQL + Redis + App)

### Option B: Docker

```bash
# Build
docker build -t complianceos .

# Run with docker-compose
docker-compose up -d
```

See `docker-compose.yml` for full configuration.

### Option C: VPS (Manual)

1. **Provision server** (Ubuntu 22.04+, 2GB RAM, 2 vCPU)
2. **Install dependencies:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs postgresql-16 redis-server nginx
   ```
3. **Clone & setup:**
   ```bash
   git clone https://github.com/your-org/complianceos.git
   cd complianceos
   pnpm install
   pnpm build
   ```
4. **Configure PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```
5. **Configure Nginx** (see `docs/deployment/nginx.conf`)

---

## 📋 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `https://app.complianceos.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIL_HOST` | SMTP host for email | - |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | SMTP username | - |
| `MAIL_PASS` | SMTP password | - |
| `MAIL_FROM` | Email sender address | `noreply@complianceos.com` |
| `UPLOAD_DIR` | File upload directory | `/tmp/complianceos/uploads` |
| `PROJECTOR_PORT` | Projector worker health check port | `3100` |

See `.env.example` for full template.

---

## 🧪 Testing

### Demo Data

```bash
# Seed demo data (tenant, user, products, employee)
pnpm --filter @complianceos/db db:seed:demo

# Remove demo data
pnpm --filter @complianceos/db db:seed:demo:clean
```

### Test Suite

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### End-to-End Checklist

See `DEMO_DATA.md` for comprehensive testing checklist covering all 8 modules.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | This file — overview & quick start |
| `DEMO_DATA.md` | Demo data setup & testing checklist |
| `DEPLOYMENT.md` | Detailed deployment guide (staging/production) |
| `ARCHITECTURE.md` | Technical architecture & design decisions |
| `docs/superpowers/` | Implementation plans & specifications |

---

## 🔐 Security

- **Multi-tenant isolation:** PostgreSQL Row Level Security (RLS)
- **Authentication:** NextAuth.js with magic link / OAuth
- **Authorization:** Role-based (owner, accountant, manager, employee)
- **Data encryption:** TLS in transit, encryption at rest (database-level)
- **Audit trail:** Append-only event store for all transactions

---

## 🇮🇳 India Compliance

### GST
- **Returns:** GSTR-1 (outward), GSTR-2B (ITC), GSTR-3B (summary)
- **Rates:** 5%, 12%, 18%, 28% + cess
- **ITC Utilization:** Section 49 mandated order (IGST → CGST → SGST)

### Income Tax
- **Returns:** ITR-3 (business/profession), ITR-4 (presumptive 44AD/44ADA)
- **Regimes:** Old regime (with deductions) + New regime (115BAC, default)
- **Advance Tax:** 4 installments (15%/45%/75%/100%)
- **Presumptive:** 44AD (8%/6%), 44ADA (50%), 44AE (transport)

### Payroll
- **Provident Fund (PF):** 12% employee + 12% employer
- **Employee State Insurance (ESI):** 0.75% employee + 3.25% employer
- **Professional Tax:** State-wise (max ₹2,500/year)
- **TDS:** Section 192 (salary), Section 194J (professional fees)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- **Caveman mode:** Terse communication (see `AGENTS.md`)
- **Conventional commits:** `feat:`, `fix:`, `chore:`, `docs:`, etc.
- **TypeScript:** Strict mode, no `any` types
- **Testing:** TDD for commands/projectors, integration tests for routers

---

## 📄 License

MIT License — see `LICENSE` file for details.

---

## 🆘 Support

- **Documentation:** `/docs` directory
- **Issues:** GitHub Issues
- **Email:** support@complianceos.com

---

## 🎯 Current Status

**Version:** 1.0.0 (Production Ready)  
**Last Updated:** April 2026  
**Completion:** 8/8 sub-projects (100%)

| Sub-project | Status | Tests |
|-------------|--------|-------|
| Core Accounting Engine | ✅ Complete | Passing |
| Invoicing & Receivables | ✅ Complete | Passing |
| Inventory & Warehousing | ✅ Complete | Passing |
| OCR Scan | ✅ Complete | Passing |
| Onboarding & Business Setup | ✅ Complete | Passing |
| Payroll Management | ✅ Complete | Passing |
| GST Returns | ✅ Complete | Passing |
| ITR Generation | ✅ Complete | Passing |

---

**Built in India 🇮🇳 for Indian businesses**
