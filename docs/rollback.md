# Rollback Procedures

## Code Rollback

### Web app
```bash
# 1. Revert to previous deployment
railway rollback --environment production

# 2. Verify rollback
railway status
```

### Projector worker
```bash
# 1. Stop current worker
railway service stop projector-worker

# 2. Deploy previous version
railway up --service projector-worker --detach

# 3. Verify projector resumes from last processed event
# Check logs for: "[Projector Worker] Starting"
```

## Database Migration Rollback

### Prerequisites
- Last 3 migration SQL files are in `packages/db/migrations/`
- Each migration has a corresponding `down.sql` rollback script

### Rollback a migration
```bash
# 1. Identify migration to roll back
pnpm --filter @complianceos/db db:status

# 2. Run rollback
pnpm --filter @complianceos/db db:rollback --to <target-migration>

# 3. Verify
pnpm --filter @complianceos/db db:status
```

### If no rollback script exists
```bash
# 1. Take a full backup
pg_dump $DATABASE_URL > pre-rollback-$(date +%Y%m%d).sql

# 2. Manually apply the reverse SQL
psql $DATABASE_URL -f manual-rollback-<migration-name>.sql

# 3. Update drizzle_meta table
DELETE FROM drizzle_meta WHERE migration_name = '<rolled-back-migration>';
```

## Data Corruption Recovery

### From Railway automated backup
```bash
# 1. List available backups
railway plugin postgres:backup list

# 2. Restore from backup
railway plugin postgres:backup restore <backup-id>

# 3. Re-project from event store
pnpm --filter @complianceos/server projector:rebuild
```

### Manual restore from dump
```bash
# 1. Download backup
railway plugin postgres:backup download <backup-id> ./backups/

# 2. Restore
pg_restore -d $DATABASE_URL ./backups/<backup-file>

# 3. Rebuild projections
pnpm --filter @complianceos/server projector:rebuild
```

## Escalation

- **P0 (data loss/security breach)**: Immediately escalate to engineering lead + CTO
- **P1 (partial outage)**: Post in #incidents Slack, follow runbook
- **P2 (degraded performance)**: File GitHub issue, add to next sprint
