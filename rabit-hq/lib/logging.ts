// Minimal structured logger wrapper; expandable to external service later.
type Level = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: Level
  msg: string
  ts: string
  context?: Record<string, unknown>
}

function emit(entry: LogEntry) {
  const line = JSON.stringify(entry)
  if (entry.level === 'error') console.error(line)
  else if (entry.level === 'warn') console.warn(line)
  else console.log(line)
}

export const log = {
  info(msg: string, context?: Record<string, unknown>) {
    emit({ level: 'info', msg, ts: new Date().toISOString(), context })
  },
  warn(msg: string, context?: Record<string, unknown>) {
    emit({ level: 'warn', msg, ts: new Date().toISOString(), context })
  },
  error(msg: string, context?: Record<string, unknown>) {
    emit({ level: 'error', msg, ts: new Date().toISOString(), context })
  },
  debug(msg: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') emit({ level: 'debug', msg, ts: new Date().toISOString(), context })
  }
}