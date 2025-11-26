# Backend Architecture Overview

_Last updated: 2025-11-27_

> This document summarizes how the Rabit HR backend is structured today, the core runtime pipeline, and the most important cross-cutting concerns (security, reliability, observability). Use it as a quick on-boarding primer before touching the server codebase.

## 1. High-level system map

- **Runtime**: Node.js + Express server bootstrapped from `server/_core/index.ts`. tRPC powers type-safe procedures that are consumed by the React SPA and background workers.
- **Transport surfaces**:
  - `/api/trpc/*` — primary API exposed through tRPC (see `server/routers.ts`).
  - `/api/webhooks/*` — signed payment/webhook endpoints with raw-body parsing + dedicated rate limits.
  - `/metrics`, `/health`, `/health/detailed`, `/health/redis` — observability endpoints.
  - WebSocket gateway configured in `server/_core/websocket.ts` for real-time updates.
- **Data layer**: Drizzle ORM (see `drizzle/schema.ts` and `server/db/*`) with Redis as a multi-purpose cache/rate-limit store.
- **Cross-cutting middleware**: request tracing, structured logging, API versioning, smart timeouts, CSRF for state-changing routes, and layered rate limiting (general, Redis-backed, per-endpoint, webhook-specific, and tRPC-level guards).

## 2. Request lifecycle (HTTP)

1. **Boot phase**
   - `.env` is parsed/validated via `server/_core/env.ts` which now enforces a Zod schema and disallows missing secrets in production.
   - OpenTelemetry tracing, Prometheus metrics, Sentry, Redis, and graceful-shutdown hooks are initialized before the HTTP server starts listening.
2. **Edge/security envelope**
   - Proxy headers trusted, dynamic CORS allow-list checked per request.
   - Request IDs + performance timers + tracing contexts are attached immediately so every downstream log/metric can be correlated.
   - Helmet applies CSP/HSTS; compression enabled for payloads >1KB.
   - Multiple rate-limiters: generic `/api`, webhook-specific (Redis-aware), and procedure-level guards via `trpcRedisRateLimitMiddleware`/`rateLimiters`.
   - CSRF double-submit + cookie parser for authenticated forms.
3. **Routing**
   - JSON/urlencoded bodies parsed with generous limits (50 MB) for document uploads.
   - Health/metrics endpoints short-circuit without touching application routers.
   - `/api/trpc` uses `createExpressMiddleware` with context resolved in `server/_core/context.ts` (reads session cookie/Bearer token, pulls user from DB, attaches to `ctx`).
4. **Response & error path**
   - Structured loggers capture request/response metadata (slow payloads, large bodies, errors) and feed metrics.
   - Centralized error handler normalizes operational vs programmer errors and wires Sentry traces.
   - Graceful shutdown closes WebSocket connections, cache, tracing exporters.

## 3. Authentication & session model

- **Session cookies**: `verifySessionToken` (`server/_core/jwt.ts`) validates jose-signed tokens stored in `COOKIE_NAME`. Tokens include `userId`, `email`, `role`, `jti`, and a subject/audience to prevent token confusion.
- **Bearer tokens**: Authorization headers reuse the same verifier, enabling API clients/WS handshakes without duplicating logic.
- **Revocation hooks**: `jwt.ts` exposes `revokeSessionToken` / `isSessionTokenRevoked` backed by Redis so expired or manually revoked tokens can be invalidated before their natural TTL.
- **Context resolution**: `server/_core/context.ts` hydrates the authenticated user (via `db.getUserById`) and exposes it to every tRPC procedure. Errors during verification degrade gracefully to anonymous requests.

## 4. Environment & configuration management

- `ENV` is the single source of configuration truth, exporting typed flags (e.g., `isProduction`, `redisUrl`, `appUrl`).
- Secrets (`JWT_SECRET`, `SESSION_SECRET`, payment webhooks, SMTP creds, etc.) have **no defaults**; production boot fails fast if they are missing or too weak (<32 chars).
- Non-secret values supply safe defaults (local URLs, ports, feature toggles) so local development remains simple.
- `checkEnv()` logs missing/weak vars in development and terminates the process in production/`ENFORCE_ENV_STRICT=true` environments.

## 5. Observability stack

| Concern | Implementation |
| --- | --- |
| Tracing | `initializeTracing()` wires OpenTelemetry SDK before any middleware so every request/DB call can be correlated. |
| Metrics | `initializeMetrics()` exposes Prometheus counters + histograms. Cache hits/misses and rate-limit events feed into dashboards. |
| Logging | `server/_core/logger.ts` centralizes pino-style structured logs with contextual metadata (request IDs, user, route). |
| Health checks | `/health` (fast DB ping), `/health/detailed` (checks Redis, queue, migrations), `/health/redis` and `/metrics`. |

## 6. Service layering & performance notes

- **Routers**: `server/routers.ts` composes domain routers (auth, dashboard, consulting, notifications, reports, etc.). Each procedure uses `protectedProcedure` to ensure session enforcement and typed inputs via Zod.
- **Services**: For frequently-requested aggregates (e.g., dashboard metrics) a new `server/services/dashboardService.ts` centralizes DB calls and caches responses through `CacheManager` (Redis/In-memory fallback). The router merely orchestrates access & invalidation.
- **Caching**: `CacheManager` provides `getOrSet`, namespace-aware metrics, and invalidation helpers. Keys are namespaced per tenant/user to avoid leakage.
- **Data access**: Drizzle ORM queries live under `server/db` and `drizzle/schema`. Long-running operations (reports, analytics) should route through dedicated service modules to keep routers slim and reusable.

## 7. Current bottlenecks & mitigations

| Area | Risk | Current Mitigation | Follow-up Ideas |
| --- | --- | --- | --- |
| Oversized routers (`routers.ts`) | Difficult to reason about and optimize, duplicated validation | Start extracting services (dashboard service is first), document layering standards | Continue carving routers into domain modules under `server/routes/*` or `server/services/*`, enforce boundaries during code review |
| Environment drift | Secrets missing or too short could slip into prod | Zod-backed schema + strict mode prevents boot without valid secrets | Add `npm run env:check` CI job and share `.env.example` generated from schema |
| Recomputing dashboard aggregates | High DB pressure during traffic bursts | Redis cache via `CacheManager.getOrSet` with tenant-aware TTL | Warm cache after writes, expose manual invalidation endpoints |
| Token misuse / leaked JWTs | Previous fallback secret + duplicate implementations risked weak tokens | Single jose-based implementation with `jti` + revocation store + WebSocket/HTTP reuse | Periodically purge revoked JTIs, add admin UI for forced logout |
| Frontend bundle weight | Browser had to parse chat widget, PWA prompts, keyboard shortcuts immediately | Deferred lazy loading + Vite manual chunks reduce TTI | Track Lighthouse scores per release, break out additional route groups if needed |

## 8. How to extend safely

1. Add new env vars to the Zod schema first, including documentation and defaults.
2. Implement domain logic in a service module; export skinny procedures from routers to keep type inference fast.
3. Prefer `protectedProcedure` + granular rate limiters for any state-changing action.
4. Record cache usage through `CacheManager` (keys should include tenant/user IDs) and invalidate on writes.
5. Update this document whenever a new subsystem (queue, cron, etc.) is added so onboarding stays accurate.
