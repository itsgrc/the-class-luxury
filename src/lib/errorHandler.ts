import { toast } from 'sonner'

export function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    console.warn(`[theclass] Corrupted key: ${key}`)
    return fallback
  }
}

export function safeWrite<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      toast.error('Storage pieno', { description: 'Libera spazio nel browser.' })
    } else {
      console.error(`[theclass] Write failed: ${key}`, err)
    }
    return false
  }
}

export function safeAppend<T>(key: string, item: T): boolean {
  const existing = safeRead<T[]>(key, [])
  // Deduplicate by id if present
  const withId = item as T & { id?: string }
  const filtered = withId.id ? existing.filter((e: unknown) => (e as { id?: string }).id !== withId.id) : existing
  return safeWrite(key, [item, ...filtered])
}

export function handleError(err: unknown, context = '') {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[theclass]${context ? ` [${context}]` : ''} ${msg}`)
  toast.error('Errore', { description: msg })
}

export function deduplicateById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true })
}
