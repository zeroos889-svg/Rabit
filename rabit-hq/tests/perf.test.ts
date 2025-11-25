import { describe, it, expect } from 'vitest'
import { timed, timeSync } from '../lib/perf'

describe('perf helpers', () => {
  it('timed resolves and returns ms', async () => {
    const { value, ms } = await timed('fast-op', async () => 42)
    expect(value).toBe(42)
    expect(ms).toBeGreaterThanOrEqual(0)
  })

  it('timeSync returns value and ms', () => {
    const { value, ms } = timeSync('sync-op', () => 'ok')
    expect(value).toBe('ok')
    expect(ms).toBeGreaterThanOrEqual(0)
  })
})