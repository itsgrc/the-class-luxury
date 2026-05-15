import { useState, useEffect, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tc_favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('tc_favorites', JSON.stringify(favorites))
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
