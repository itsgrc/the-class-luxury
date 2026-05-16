// src/context/CurrencyContext.tsx
import { createContext, useContext, useState } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF'

// Mock rates relative to EUR (close to real)
export const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.085,
  GBP: 0.855,
  CHF: 0.965,
}

export const SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF ',
}

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  convert: (amountEur: number) => number
  format: (amountEur: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() =>
    safeRead<Currency>('theclass_currency', 'EUR'),
  )

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    safeWrite('theclass_currency', c)
  }

  const convert = (eur: number) => Math.round(eur * RATES[currency])

  const format = (eur: number) => {
    const converted = convert(eur)
    const symbol = SYMBOLS[currency]
    return `${symbol}${converted.toLocaleString('it-IT')}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider')
  return ctx
}
