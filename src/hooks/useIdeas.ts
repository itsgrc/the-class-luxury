import { useState, useCallback } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'

const KEY = 'theclass_ideas'

export function useIdeas() {
  const [ideas, setIdeas] = useState<string[]>(() => safeRead<string[]>(KEY, []))

  const toggle = useCallback((id: string) => {
    setIdeas(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      safeWrite(KEY, next)
      return next
    })
  }, [])

  const isIdea = useCallback((id: string) => ideas.includes(id), [ideas])
  return { ideas, toggle, isIdea, count: ideas.length }
}
