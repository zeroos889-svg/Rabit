# Cache Operations Runbook

This runbook explains how the analytics/search cache behaves after the Phase 5 rollout, how to invalidate keys safely, and how to observe cache health through the new telemetry series. Keep it handy during releases or when debugging stale dashboards.

## 1. Cache Surface Area

| Feature | Cache Key | TTL Tier | Details |
| --- | --- | --- | --- |
| Analytics overview widget | `report:overview:<rangeHash>` | `CACHE_TTL.FREQUENT` (15m) | Backed by `reportsRouter.overview`. Range hash is a SHA1 of the `[from,to]` tuple (or `all`). |
| Analytics KPI cards | `report:kpis:<rangeHash>` | `CACHE_TTL.FREQUENT` (15m) | Same hash logic as overview so warming either covers both endpoints. |
| Analytics trend chart | `report:timeseries:<rangeHash>` | `CACHE_TTL.LONG` (1h) | Returns deterministic time buckets; safe to reuse across tenants. |
| Analytics distribution panels | `report:distribution:<rangeHash>` | `CACHE_TTL.LONG` (1h) | Includes hiring/support/chat breakdowns. |
| CSV exports | `report:export:<reportType>:<rangeHash>` | `CACHE_TTL.LONG` (1h) | `reportType` ∈ `hiring / support / engagement`. Data is base64 CSV payload. |
| Dashboard recommended jobs | `search:jobs:<hash>` | `CACHE_TTL.TEMPORARY` (30s) | Existing search cache; reference for TTL tiers. |

> **Range hash helper** – `rangeHash = sha1("<from-or-min>:<to-or-max>")`. When no range is provided, the literal `all` string is used before hashing so cache hits align for the default view.

## 2. Invalidating Analytics Cache

1. **Targeted delete**
   - Use the Redis CLI or the existing cache utility:
     ```bash
     pnpm tsx scripts/cache-tools.ts delete report:overview:*
     pnpm tsx scripts/cache-tools.ts delete report:export:hiring:*
     ```
   - Pattern deletion is safe because keys follow the `report:<section>:<hash>` convention and the script guards against overly broad globs.
2. **Programmatic bust**
   - From application code/tests you can call `cache.deletePattern('report:overview:*')`.
   - For an ad-hoc date range you can compute the hash via Node REPL:
     ```bash
     node -e "const { createHash } = require('crypto'); console.log(createHash('sha1').update('2024-01-01:2024-03-31').digest('hex'))"
     ```
3. **Full reset**
   - Only during incidents: `pnpm tsx scripts/cache-tools.ts clear` (this wipes dashboard/search caches too).

Always invalidate the export key alongside its data key if you need to reseed CSV payloads.

## 3. Telemetry and Alerting

A new Prometheus counter tracks lookup results by TTL tier:

- Metric: `rabit_hr_cache_lookups_total`
- Labels: `cache_key_prefix`, `ttl_tier`, `result`
  - `cache_key_prefix` is the first token before `:` (e.g., `report`, `search`).
  - `ttl_tier` currently resolves to `temporary`, `realtime`, `short`, `frequent`, `medium`, `long`, `very_long`, or `custom`.
  - `result` ∈ `hit|miss`.

Example PromQL to monitor analytics cache efficacy:

```promql
sum(rate(rabit_hr_cache_lookups_total{cache_key_prefix="report", ttl_tier="long", result="miss"}[5m]))
  /
sum(rate(rabit_hr_cache_lookups_total{cache_key_prefix="report", ttl_tier="long"}[5m]))
```

Pair the new series with the existing `rabit_hr_cache_hits_total` / `rabit_hr_cache_misses_total` to validate that total counts remain in sync.

## 4. Verification Checklist

1. **Cold start** – call `/api/trpc/reports.overview` twice with the same range; second call should return instantly and Prometheus should record a `result="hit"` for the `report` namespace.
2. **CSV parity** – request `reports.exportCSV` before and after invalidation to confirm the `report:export:*` key repopulates and that the payload hash changes when the underlying data changes.
3. **TTL behavior** – monitor `cache_lookups_total` for `report` keys after one hour; miss rate should rise as entries expire. If not, ensure TTL constants weren’t overridden in env vars.
4. **Alert wiring** – dashboard panels should alert if `result="miss"` ratio exceeds 40% for more than 10 minutes (edit Grafana panel `Cache - Analytics TTL`).

## 5. Release Notes

- Reports router now wraps every analytics handler with `cache.getOrSet`, guaranteeing deterministic cache keys across tenants.
- CSV exports reuse the same hashed date-range key, so warming `reports.overview` primes exports too.
- Telemetry now records lookup outcomes per TTL tier; update your monitoring dashboards to include `rabit_hr_cache_lookups_total`.

Keeping this runbook up to date ensures on-call engineers can diagnose stale analytics quickly and proves cache health in post-deploy reviews.
