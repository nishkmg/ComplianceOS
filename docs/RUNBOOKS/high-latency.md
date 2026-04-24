# Runbook: High API Latency

## Alert
- **Name:** ComplianceOS_High_API_Latency
- **Severity:** Warning / Critical
- **Threshold:** p95 latency > 500ms (warning) or > 2s (critical)

## Impact
- Slow user experience
- Potential timeout errors
- Reduced throughput

## Immediate Actions

### 1. Assess Scope
```bash
# Check current latency metrics
curl -s http://localhost:3000/api/health | jq '.checks'

# Check projector status
curl -s http://localhost:3100/health | jq '.'

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

### 2. Check Recent Deployments
```bash
# Check if there was a recent deployment
git log --oneline -10

# Check Railway deployment status
railway logs --environment production
```

### 3. Database Performance
```bash
# Check for slow queries
psql $DATABASE_URL -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check for locks
psql $DATABASE_URL -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check connection pool
psql $DATABASE_URL -c "SHOW max_connections;"
```

### 4. Projector Lag
```bash
# Check projector processing lag
curl -s http://localhost:3100/health

# Check event store backlog
psql $DATABASE_URL -c "SELECT COUNT(*) FROM event_store WHERE processed = false;"
```

## Mitigation Steps

### If Database is the Bottleneck
1. Kill long-running queries:
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < now() - interval '5 minutes';
```

2. Scale database connections if needed

### If Projector is the Bottleneck
1. Restart projector worker:
```bash
railway restart --service projector
```

2. Check for stuck events in event store

### If Application is the Bottleneck
1. Scale application instances:
```bash
railway scale --service web 2
```

2. Check for memory leaks:
```bash
railway logs --service web | grep -i "memory\|heap"
```

## Escalation
- If latency > 5s for > 10 minutes: Escalate to on-call engineer
- If user-facing impact: Notify customer success team

## Post-Incident
1. Document root cause
2. Update monitoring thresholds if needed
3. Create follow-up tickets for permanent fixes

---
Last updated: 2026-04-24
