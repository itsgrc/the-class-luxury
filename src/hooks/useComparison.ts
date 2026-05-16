import { useState, useCallback } from 'react'

export function useComparison() {
  const [comparing, setComparing] = useState<string[]>([])

  const toggle = useCallback((id: string) => {
    setComparing(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }, [])

  const clear = useCallback(() => setComparing([]), [])
  const isSelected = useCallback((id: string) => comparing.includes(id), [comparing])

  return { comparing, toggle, clear, isSelected }
}
