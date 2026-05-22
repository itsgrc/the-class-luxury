import { useState, useEffect, useCallback } from 'react'
import { generateId } from '@/lib/utils'

export type ReminderPriority = 'urgent' | 'medium' | 'low'
export type ReminderCategory = 'fiscal' | 'personal' | 'travel' | 'service' | 'bureaucratic'

export interface Reminder {
  id: string
  title: string
  description?: string
  dueDate: string // ISO date string YYYY-MM-DD
  priority: ReminderPriority
  category: ReminderCategory
  completed: boolean
  createdAt: number
}

export interface FiscalDeadline {
  id: string
  title: string
  description: string
  month: number // 1-12
  day: number
  category: 'iva' | 'irpef' | 'imu' | 'inps' | 'dichiarazione' | 'altro'
}

export const FISCAL_DEADLINES: FiscalDeadline[] = [
  { id: 'f1', title: 'F24 INPS mensile', description: 'Versamento contributi INPS mensili', month: 1, day: 15, category: 'inps' },
  { id: 'f2', title: 'IVA mensile dicembre', description: 'Liquidazione IVA mensile dicembre anno precedente', month: 1, day: 16, category: 'iva' },
  { id: 'f3', title: 'IVA mensile gennaio', description: 'Liquidazione IVA mensile gennaio', month: 2, day: 16, category: 'iva' },
  { id: 'f4', title: 'CU — Certificazione Unica', description: 'Invio telematico Certificazione Unica all\'Agenzia delle Entrate', month: 3, day: 31, category: 'dichiarazione' },
  { id: 'f5', title: 'IVA mensile febbraio', description: 'Liquidazione IVA mensile febbraio', month: 3, day: 16, category: 'iva' },
  { id: 'f6', title: 'IVA mensile marzo', description: 'Liquidazione IVA mensile marzo', month: 4, day: 16, category: 'iva' },
  { id: 'f7', title: '730 precompilato — scadenza CAF', description: 'Presentazione 730 tramite CAF o professionista', month: 4, day: 30, category: 'dichiarazione' },
  { id: 'f8', title: 'IVA mensile aprile', description: 'Liquidazione IVA mensile aprile', month: 5, day: 16, category: 'iva' },
  { id: 'f9', title: 'Dichiarazione IVA annuale', description: 'Presentazione dichiarazione IVA annuale', month: 5, day: 30, category: 'dichiarazione' },
  { id: 'f10', title: 'IMU — prima rata', description: 'Versamento prima rata IMU sugli immobili', month: 6, day: 16, category: 'imu' },
  { id: 'f11', title: 'IRPEF — saldo + 1° acconto', description: 'Saldo IRPEF anno precedente e primo acconto anno corrente', month: 6, day: 30, category: 'irpef' },
  { id: 'f12', title: 'Redditi PF — persone fisiche', description: 'Presentazione Modello Redditi Persone Fisiche', month: 9, day: 30, category: 'dichiarazione' },
  { id: 'f13', title: 'IMU — acconto seconda rata', description: 'Acconto seconda rata IMU', month: 10, day: 31, category: 'imu' },
  { id: 'f14', title: 'IRPEF — 2° acconto', description: 'Secondo acconto IRPEF', month: 11, day: 30, category: 'irpef' },
  { id: 'f15', title: 'IRAP — secondo acconto', description: 'Secondo acconto IRAP', month: 11, day: 30, category: 'inps' },
  { id: 'f16', title: 'IMU — saldo seconda rata', description: 'Saldo seconda rata IMU sugli immobili', month: 12, day: 16, category: 'imu' },
]

export function useFactotum() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const stored = localStorage.getItem('theclass_factotum')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('theclass_factotum', JSON.stringify(reminders))
  }, [reminders])

  const addReminder = useCallback((data: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => {
    const reminder: Reminder = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
      completed: false,
    }
    setReminders(prev => [reminder, ...prev])
    return reminder.id
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
  }, [])

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }, [])

  const getUpcomingFiscalDeadlines = useCallback((year: number, monthsAhead = 3): Array<FiscalDeadline & { date: Date; daysLeft: number }> => {
    const today = new Date()
    return FISCAL_DEADLINES
      .map(d => {
        let date = new Date(year, d.month - 1, d.day)
        if (date < today) date = new Date(year + 1, d.month - 1, d.day)
        const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86400000)
        return { ...d, date, daysLeft }
      })
      .filter(d => d.daysLeft >= 0 && d.daysLeft <= monthsAhead * 30)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [])

  return { reminders, addReminder, toggleComplete, deleteReminder, getUpcomingFiscalDeadlines }
}
