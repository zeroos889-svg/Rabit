import { PrismaClient } from '@prisma/client'
import { log } from './logging'

declare global {
  // allow global prisma during dev to avoid multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient()

// Performance & monitoring middleware (basic): logs query duration.
if (!(global as any).__PRISMA_INSTRUMENTED) {
  try {
    prisma.$use(async (params, next) => {
      const start = process.hrtime.bigint()
      const result = await next(params)
      const end = process.hrtime.bigint()
      const ms = Number(end - start) / 1_000_000
      const threshold = Number(process.env.PERF_SLOW_QUERY_MS ?? '200')
      const level: 'debug' | 'warn' = ms >= threshold ? 'warn' : 'debug'
      log[level]('prisma.query', { model: params.model, action: params.action, ms })
      return result
    })
    ;(global as any).__PRISMA_INSTRUMENTED = true
  } catch (e) {
    log.error('Failed to register prisma middleware', { error: (e as Error).message })
  }
}

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
