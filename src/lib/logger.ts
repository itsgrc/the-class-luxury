interface LogEntry { level: 'error' | 'warn' | 'info'; message: string; data?: unknown; ts: number }

export const logger = {
  error(message: string, data?: unknown) {
    const entry: LogEntry = { level: 'error', message, data, ts: Date.now() }
    console.error('[TheClass]', message, data)
    try {
      const log = JSON.parse(localStorage.getItem('theclass_error_log') ?? '[]') as LogEntry[]
      log.unshift(entry)
      localStorage.setItem('theclass_error_log', JSON.stringify(log.slice(0, 50)))
    } catch {}
  },
  warn(message: string, data?: unknown) {
    console.warn('[TheClass]', message, data)
  },
  info(message: string, data?: unknown) {
    console.info('[TheClass]', message, data)
  },
}
