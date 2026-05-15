import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@/lib/utils'

export interface ConciergeRequest {
  id: string
  prompt: string
  timestamp: number
  status: 'pending' | 'handled'
}

export function useConcierge() {
  const [requests, setRequests] = useState<ConciergeRequest[]>(() => {
    try {
      const stored = localStorage.getItem('theclass_concierge')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('theclass_concierge', JSON.stringify(requests))
  }, [requests])

  const addRequest = useCallback((prompt: string): string => {
    const id = generateId()
    const request: ConciergeRequest = { id, prompt, timestamp: Date.now(), status: 'pending' }
    setRequests(prev => [request, ...prev])
    return id
  }, [])

  const updateStatus = useCallback((id: string, status: ConciergeRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }, [])

  const deleteRequest = useCallback((id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }, [])

  const deleteAll = useCallback(() => setRequests([]), [])

  return { requests, addRequest, updateStatus, deleteRequest, deleteAll }
}
