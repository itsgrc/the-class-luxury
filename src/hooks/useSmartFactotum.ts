import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { FISCAL_DEADLINES, type FiscalDeadline } from './useFactotum'
import { generateId } from '@/lib/utils'

export interface SmartSuggestion {
  id: string
  type: 'fiscal' | 'travel' | 'lifestyle' | 'event'
  icon: string
  title: string
  description: string
  cta: string
  urgency: 'high' | 'medium' | 'low'
}

const TRAVEL_SEASONS: Record<number, { destination: string; icon: string; category: string }[]> = {
  1:  [{ destination: 'Maldive', icon: '🌴', category: 'Yacht' }],
  2:  [{ destination: 'Dubai', icon: '✈️', category: 'Jet' }],
  3:  [{ destination: 'Costiera Amalfitana', icon: '⚓', category: 'Yacht' }],
  4:  [{ destination: 'Toscana', icon: '🏡', category: 'Villa' }],
  5:  [{ destination: 'Ibiza', icon: '🌊', category: 'Yacht' }],
  6:  [{ destination: 'Sardegna', icon: '🏖️', category: 'Yacht' }],
  7:  [{ destination: 'Capri', icon: '⛵', category: 'Yacht' }, { destination: 'Santorini', icon: '🌅', category: 'Villa' }],
  8:  [{ destination: 'Montenegro', icon: '🛥️', category: 'Yacht' }, { destination: 'Formentera', icon: '🏝️', category: 'Villa' }],
  9:  [{ destination: 'Monaco (Gran Premio)', icon: '🏎️', category: 'Esperienza' }],
  10: [{ destination: 'Marrakech', icon: '🕌', category: 'Villa' }],
  11: [{ destination: 'Dubai (airshow)', icon: '✈️', category: 'Jet' }],
  12: [{ destination: 'Lapland', icon: '❄️', category: 'Esperienza' }, { destination: 'Cortina d\'Ampezzo', icon: '⛷️', category: 'Villa' }],
}

function getUpcomingFiscal(monthsAhead = 2): Array<FiscalDeadline & { daysLeft: number }> {
  const today = new Date()
  const year = today.getFullYear()
  return FISCAL_DEADLINES
    .map(d => {
      let date = new Date(year, d.month - 1, d.day)
      if (date < today) date = new Date(year + 1, d.month - 1, d.day)
      const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86400000)
      return { ...d, daysLeft }
    })
    .filter(d => d.daysLeft >= 0 && d.daysLeft <= monthsAhead * 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2)
}

export function useSmartFactotum() {
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('theclass_dismissed_suggestions')
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  })

  const suggestions = useMemo<SmartSuggestion[]>(() => {
    const month = new Date().getMonth() + 1
    const results: SmartSuggestion[] = []

    // Fiscal suggestions
    const upcoming = getUpcomingFiscal()
    upcoming.forEach(d => {
      results.push({
        id: `fiscal-${d.id}`,
        type: 'fiscal',
        icon: d.category === 'imu' ? '🏠' : d.category === 'iva' ? '📋' : '💼',
        title: d.title,
        description: `Scade tra ${d.daysLeft} giorni — ${d.description}`,
        cta: 'Aggiungi promemoria',
        urgency: d.daysLeft <= 7 ? 'high' : d.daysLeft <= 20 ? 'medium' : 'low',
      })
    })

    // Seasonal travel suggestions
    const seasonal = TRAVEL_SEASONS[month] ?? []
    seasonal.slice(0, 2).forEach(s => {
      results.push({
        id: `travel-${month}-${s.destination}`,
        type: 'travel',
        icon: s.icon,
        title: `${s.category} — ${s.destination}`,
        description: `Alta stagione in corso. Disponibilità limitata per ${s.destination}.`,
        cta: 'Prenota ora',
        urgency: 'medium',
      })
    })

    // Lifestyle nudge
    results.push({
      id: `lifestyle-${month}`,
      type: 'lifestyle',
      icon: '✨',
      title: 'Itinerario su misura',
      description: 'Hai idee per il prossimo viaggio? Il Factotum le organizza per te.',
      cta: 'Pianifica',
      urgency: 'low',
    })

    return results.filter(s => !dismissed.has(s.id))
  }, [dismissed])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('theclass_dismissed_suggestions', JSON.stringify([...next]))
      return next
    })
  }, [])

  const addToFactotum = useCallback((suggestion: SmartSuggestion) => {
    if (suggestion.type !== 'fiscal') return
    const today = new Date()
    const existing = (() => { try { return JSON.parse(localStorage.getItem('theclass_factotum') ?? '[]') } catch { return [] } })()
    existing.push({
      id: generateId(),
      title: suggestion.title,
      description: suggestion.description,
      dueDate: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString().slice(0, 10),
      priority: suggestion.urgency === 'high' ? 'urgent' : suggestion.urgency === 'medium' ? 'medium' : 'low',
      category: 'fiscal',
      completed: false,
      createdAt: Date.now(),
    })
    localStorage.setItem('theclass_factotum', JSON.stringify(existing))
    toast.success('Promemoria aggiunto al Factotum')
    dismiss(suggestion.id)
  }, [dismiss])

  return { suggestions, dismiss, addToFactotum }
}
