import { useState, useCallback } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { generateId } from '@/lib/utils'

export interface Review {
  id: string
  listingId: string
  userId: string
  userName: string
  rating: number
  text: string
  timestamp: number
}

export function useReviews(listingId?: string) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const all = safeRead<Review[]>('theclass_reviews', [])
    return listingId ? all.filter(r => r.listingId === listingId) : all
  })

  const addReview = useCallback((data: Omit<Review, 'id' | 'timestamp'>): Review => {
    const review: Review = { ...data, id: generateId(), timestamp: Date.now() }
    const all = safeRead<Review[]>('theclass_reviews', [])
    // One review per user per listing
    const filtered = all.filter(r => !(r.listingId === data.listingId && r.userId === data.userId))
    safeWrite('theclass_reviews', [review, ...filtered])
    if (!listingId || listingId === data.listingId) {
      setReviews(prev => {
        const deduped = prev.filter(r => r.userId !== data.userId)
        return [review, ...deduped]
      })
    }
    return review
  }, [listingId])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return { reviews, addReview, avgRating }
}
