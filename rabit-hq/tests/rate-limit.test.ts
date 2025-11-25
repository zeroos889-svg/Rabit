import { describe, it, expect } from 'vitest'
import { rateLimit } from '../lib/rate-limit'

describe('rateLimit', () => {
  it('allows first request', () => {
    const r = rateLimit('test-key')
    expect(r.ok).toBe(true)
    expect(r.remaining).toBeGreaterThan(0)
  })

  it('blocks after exceeding window', () => {
    let blocked = false
    for (let i = 0; i < 105; i++) {
      const r = rateLimit('spam-key')
      if (!r.ok) {
        blocked = true
        break
      }
    }
    expect(blocked).toBe(true)
  })
})