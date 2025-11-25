// Generic performance helpers (not Prisma-specific)
import { log } from './logging'

export async function timed<T>(label: string, fn: () => Promise<T> | T): Promise<{ value: T; ms: number }> {
  const start = performance.now()
  let value: T
  try {
    value = await fn()
  } catch (e) {
    const ms = performance.now() - start
    log.error('timed.error', { label, ms, error: (e as Error).message })
    throw e
  }
  const ms = performance.now() - start
  log.debug('timed.done', { label, ms })
  return { value, ms }
}

export function timeSync<T>(label: string, fn: () => T): { value: T; ms: number } {
  const start = performance.now()
  let value: T
  try {
    value = fn()
  } catch (e) {
    const ms = performance.now() - start
    log.error('timeSync.error', { label, ms, error: (e as Error).message })
    throw e
  }
  const ms = performance.now() - start
  log.debug('timeSync.done', { label, ms })
  return { value, ms }
}