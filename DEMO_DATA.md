# ComplianceOS Demo Data

Quick setup for testing/demo purposes with sample business data.

## What Gets Created

### Tenant & User
- **Tenant:** Demo Business Pvt Ltd (PAN: ABCDE1234F, GSTIN: 27ABCDE1234F1Z5)
- **User:** demo@complianceos.test (Demo User, Owner role)
- **FY:** 2026-27 (Apr 2026 - Mar 2027)

### Modules Configured
- ✅ Accounting
- ✅ Invoicing
- ✅ Inventory
- ✅ Payroll
- ✅ GST (Regular, ITC eligible)
- ✅ ITR (New regime, TDS applicable)

### Sample Data
- **Products:** 2 services (Consulting, Software License)
- **Employees:** 1 (John Doe, Senior Consultant)

## Setup

### Prerequisites
1. PostgreSQL 16+ running locally or accessible
2. Node.js 20+, pnpm 9+
3. Database created: `CREATE DATABASE complianceos_demo;`

### Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Update .env with your database URL
# Edit DATABASE_URL in .env file

# 3. Run migrations
pnpm db:migrate

# 4. Seed demo data
pnpm --filter @complianceos/db db:seed:demo

# 5. Start development server
pnpm dev
```

### Access

- **URL:** http://localhost:3000
- **Email:** demo@complianceos.test
- **Password:** (Use magic link or set up NextAuth providers)

## Cleanup

To remove all demo data:

```bash
pnpm --filter @complianceos/db db:seed:demo:clean
```

This deletes:
- Demo tenant and user
- All related transactions, invoices, payroll
- Products, employees
- Fiscal year, GST/ITR config

## Testing Checklist

### Accounting
- [ ] View chart of accounts
- [ ] Create journal entry
- [ ] View trial balance
- [ ] View profit & loss
- [ ] View balance sheet

### Invoicing
- [ ] Create sales invoice
- [ ] Generate invoice PDF
- [ ] Record payment
- [ ] View receivables aging

### Inventory
- [ ] View products
- [ ] Create purchase receipt
- [ ] Create sales delivery
- [ ] View stock summary

### Payroll
- [ ] View employee list
- [ ] Create salary structure
- [ ] Process payroll
- [ ] Generate payslip

### GST
- [ ] View GST ledgers (Cash/ITC/Liability)
- [ ] Generate GSTR-1
- [ ] Generate GSTR-3B
- [ ] ITC reconciliation

### ITR
- [ ] View ITR returns
- [ ] Compute income (5 heads)
- [ ] Tax computation (Old vs New regime)
- [ ] Advance tax installments

## Troubleshooting

### Database connection error
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Create database if not exists
createdb complianceos_demo
```

### Migration errors
```bash
# Reset and re-run
pnpm db:generate
pnpm db:migrate
```

### Demo data already exists
```bash
# Clean and re-seed
pnpm --filter @complianceos/db db:seed:demo:clean
pnpm --filter @complianceos/db db:seed:demo
```

## Production Warning

⚠️ **DO NOT use demo data in production!**

- Demo credentials are public
- Demo data uses placeholder PAN/GSTIN
- Remove demo data before going live

```bash
pnpm --filter @complianceos/db db:seed:demo:clean
```
