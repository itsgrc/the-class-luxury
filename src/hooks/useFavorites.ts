import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserId } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'

function favKey() {
  return `theclass_favorites_${getCurrentUserId()}`
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Migrate legacy key on first load
    const legacy = localStorage.getItem('theclass_favorites')
    const key = favKey()
    if (legacy && !localStorage.getItem(key)) {
      localStorage.setItem(key, legacy)
    }
    return safeRead<string[]>(key, [])
  })

  useEffect(() => {
    safeWrite(favKey(), favorites)
  }, [favorites])

  const toggle = useCallback((id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])
  const clear = useCallback(() => setFavorites([]), [])

  return { favorites, toggle, isFavorite, clear, count: favorites.length }
}
