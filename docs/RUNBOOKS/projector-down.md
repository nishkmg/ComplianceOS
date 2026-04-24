# Runbook: Projector Worker Down

## Alert
- **Name:** ComplianceOS_Projector_Down
- **Severity:** Critical
- **Threshold:** Projector health check fails for > 1 minute

## Impact
- Financial reports will show stale data
- Account balances not updating
- Journal entry views not reflecting latest transactions
- GST/ITR projections outdated

## Immediate Actions

### 1. Verify Alert
```bash
# Check projector health endpoint
curl -v http://localhost:3100/health

# Check if process is running
ps aux | grep projector

# Check Railway service status
railway status --service projector
```

### 2. Check Logs
```bash
# Recent logs
railway logs --service projector --lines 100

# Search for errors
railway logs --service projector | grep -i "error\|exception\|fatal"

# Check for OOM kills
railway logs --service projector | grep -i "memory\|oom"
```

### 3. Check Dependencies
```bash
# Database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Redis connectivity  
redis-cli ping

# Check event store for unprocessed events
psql $DATABASE_URL -c "SELECT COUNT(*) FROM event_store WHERE sequence > (SELECT last_processed_sequence FROM projector_state LIMIT 1);"
```

## Mitigation Steps

### Step 1: Restart Projector
```bash
# Railway restart
railway restart --service projector

# Wait for health check
sleep 30
curl http://localhost:3100/health
```

### Step 2: Check Processing Resume
```bash
# Verify projector is processing events
watch -n 5 'psql $DATABASE_URL -c "SELECT projector_name, last_processed_sequence, updated_at FROM projector_state ORDER BY updated_at DESC LIMIT 5;"'
```

### Step 3: Manual Event Processing (if auto-recovery fails)
```bash
# Check for stuck events
psql $DATABASE_URL -c "SELECT * FROM event_store WHERE sequence > (SELECT MAX(last_processed_sequence::bigint) FROM projector_state) ORDER BY sequence LIMIT 10;"

# If specific event is causing issues, check projector logs for error details
```

### Step 4: Scale Resources (if OOM)
```bash
# Increase memory allocation
railway variables set PROJECTOR_MEMORY=2048 --service projector

# Restart with new resources
railway restart --service projector
```

## Data Integrity Check

After recovery, verify data consistency:

```bash
# Check account balances match journal entries
psql $DATABASE_URL -c "
  SELECT 
    (SELECT SUM(debit - credit) FROM journal_entry_lines) as je_total,
    (SELECT SUM(debit_total - credit_total) FROM account_balances) as balance_total;
"

# Check latest journal entry is projected
psql $DATABASE_URL -c "
  SELECT MAX(sequence) FROM event_store;
  SELECT MAX(last_processed_sequence::bigint) FROM projector_state;
"
```

## Escalation
- If projector doesn't recover within 15 minutes: Escalate to backend team
- If data inconsistency detected: Escalate to database team
- If > 1 hour of events backlogged: Notify finance team of reporting delays

## Post-Incident
1. Review projector logs for root cause
2. Check if event payload caused crash
3. Update error handling if needed
4. Consider adding circuit breaker pattern

---
Last updated: 2026-04-24
