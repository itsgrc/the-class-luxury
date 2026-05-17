import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'

interface DreamContextValue {
  isDream: boolean
  toggle: () => void
}

const DreamContext = createContext<DreamContextValue | null>(null)

export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [isDream, setIsDream] = useState(() => safeRead<boolean>('theclass_dream', false))

  const toggle = useCallback(() => {
    setIsDream(prev => {
      const next = !prev
      safeWrite('theclass_dream', next)
      return next
    })
  }, [])

  useEffect(() => {
    if (isDream) {
      document.documentElement.setAttribute('data-dream', 'true')
    } else {
      document.documentElement.removeAttribute('data-dream')
    }
  }, [isDream])

  return <DreamContext.Provider value={{ isDream, toggle }}>{children}</DreamContext.Provider>
}

export function useDream() {
  const ctx = useContext(DreamContext)
  if (!ctx) throw new Error('useDream must be inside DreamProvider')
  return ctx
}
