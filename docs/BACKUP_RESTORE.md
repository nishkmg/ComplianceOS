# ComplianceOS Backup & Restore Procedures

## Overview

This document describes the backup and restore procedures for ComplianceOS production deployments.

## Backup Strategy

### Database Backups

ComplianceOS uses PostgreSQL 16 as the primary data store. All critical business data including:
- Tenant configurations
- Chart of accounts
- Journal entries and event store
- Invoices, payments, receivables
- Payroll records
- GST and ITR filings

#### Automated Backups (Railway)

If deployed on Railway:
1. Navigate to your project in Railway dashboard
2. Go to PostgreSQL service → Backups
3. Enable automated backups (daily recommended)
4. Retention: 7 days minimum, 30 days recommended

#### Manual Backup Command

```bash
# Full database backup
pg_dump $DATABASE_URL > complianceos-backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > complianceos-backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Redis Backups

Redis is used for caching and session management. Data is ephemeral and can be regenerated.

```bash
# Redis snapshot (if using RDB)
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb backup-location/
```

### Application Backups

Application code is version-controlled in Git. No additional backup needed.

## Restore Procedures

### RPO (Recovery Point Objective)

- Target: 24 hours (dependent on backup frequency)
- Maximum data loss: Transactions since last backup

### RTO (Recovery Time Objective)

- Target: 2 hours
- Includes: Database restore, application redeploy, verification

### Database Restore

```bash
# Stop application to prevent writes
# Railway: Scale to 0 or pause

# Restore from backup
psql $DATABASE_URL < complianceos-backup-YYYYMMDD-HHMMSS.sql

# Or from compressed backup
gunzip -c complianceos-backup-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tenants;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM journal_entries;"

# Restart application
# Railway: Scale up or unpause
```

### Verification Checklist

After restore, verify:

- [ ] Application starts without errors
- [ ] Login page accessible
- [ ] Demo user can authenticate (if applicable)
- [ ] Tenant data visible in dashboard
- [ ] Journal entries queryable
- [ ] Recent transactions present
- [ ] GST/ITR data intact
- [ ] No foreign key constraint violations

### Point-in-Time Recovery

For PostgreSQL on Railway with continuous backups:

1. Contact Railway support with target timestamp
2. Specify: Database name, target time, timezone
3. Railway creates new database instance at point-in-time
4. Update `DATABASE_URL` to new instance
5. Verify data integrity
6. Switch application to restored database

## Disaster Recovery Scenarios

### Scenario 1: Single Tenant Data Corruption

```sql
-- Identify affected tenant
SELECT id, name FROM tenants WHERE id = 'affected-tenant-uuid';

-- Export tenant data for analysis
pg_dump -t journal_entries -t accounts -t invoices \
  --where="tenant_id='affected-uuid'" \
  $DATABASE_URL > tenant-export.sql

-- Restore from backup if needed
```

### Scenario 2: Full Database Corruption

1. Deploy new PostgreSQL instance
2. Restore from latest backup
3. Update `DATABASE_URL` environment variable
4. Redeploy application
5. Run verification checklist

### Scenario 3: Region Failure

1. Deploy infrastructure in secondary region
2. Restore from S3/GCS backup
3. Update DNS to new region
4. Notify stakeholders

## Backup Testing Schedule

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Restore drill | Monthly | DevOps |
| Point-in-time recovery | Quarterly | DevOps |
| Full DR failover | Annually | Engineering |

## Monitoring Alerts

Configure alerts for:

- Backup failures (immediate)
- Backup age > 25 hours (warning)
- Disk space < 20% (warning)
- Replication lag > 5 minutes (warning)

## Contact

For backup/restore issues:
- Primary: DevOps team
- Escalation: CTO
- Railway support: support@railway.app

---

Last updated: 2026-04-24
Next review: 2026-07-24
