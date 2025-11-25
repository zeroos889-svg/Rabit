// Simple in-memory rate limit (per IP + path) for demonstration.
// NOTE: Replace with Redis or production store for horizontal scaling.

type Bucket = { count: number; reset: number }
const WINDOW_MS = 60_000
const MAX = 100
const buckets = new Map<string, Bucket>()

export function rateLimit(key: string): { ok: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.reset < now) {
    const fresh: Bucket = { count: 1, reset: now + WINDOW_MS }
    buckets.set(key, fresh)
    return { ok: true, remaining: MAX - 1, resetMs: fresh.reset - now }
  }
  bucket.count++
  const ok = bucket.count <= MAX
  return { ok, remaining: Math.max(0, MAX - bucket.count), resetMs: bucket.reset - now }
}

export function formatRetryAfter(ms: number) {
  return Math.ceil(ms / 1000)
}