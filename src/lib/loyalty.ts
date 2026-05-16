// src/lib/loyalty.ts
import { safeRead } from '@/lib/errorHandler'

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface LoyaltyStatus {
  tier: LoyaltyTier
  points: number
  requestCount: number
  nextTier: LoyaltyTier | null
  pointsToNext: number | null
}

const TIERS: Record<LoyaltyTier, { label: string; minPoints: number; color: string; perks: string[] }> = {
  bronze: {
    label: 'Bronze',
    minPoints: 0,
    color: '#CD7F32',
    perks: ['Accesso al catalogo completo', 'Risposta in 4 ore', 'Newsletter esclusiva'],
  },
  silver: {
    label: 'Silver',
    minPoints: 500,
    color: '#9BA0A8',
    perks: ['Risposta prioritaria in 2 ore', 'Upgrade gratuito 1×/anno', 'Accesso early booking'],
  },
  gold: {
    label: 'Gold',
    minPoints: 2000,
    color: '#C5A059',
    perks: ['Concierge dedicato', 'Sconto 5% su tutti i servizi', 'Lounge accesso priority', 'Regalo di benvenuto'],
  },
  platinum: {
    label: 'Platinum',
    minPoints: 5000,
    color: '#E8E8E8',
    perks: ['Concierge 24/7 personale', 'Sconto 10%', 'Accesso eventi privati', 'Jet card inclusa', 'Nessun limite prenotazioni'],
  },
}

const TIER_ORDER: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum']

export function getLoyaltyStatus(email?: string): LoyaltyStatus {
  const requests = safeRead<unknown[]>('theclass_requests', [])
  const bespoke = safeRead<unknown[]>('theclass_bespoke', [])
  const concierge = safeRead<unknown[]>('theclass_concierge', [])
  const requestCount = requests.length + bespoke.length + concierge.length

  // Points: 100 per request + bonus per tier
  const points = requestCount * 100 + (email?.includes('@') ? 50 : 0)

  const tierIdx = TIER_ORDER.reduce((best, t, i) =>
    points >= TIERS[t].minPoints ? i : best, 0)
  const tier = TIER_ORDER[tierIdx]
  const nextTierIdx = tierIdx + 1
  const nextTier = nextTierIdx < TIER_ORDER.length ? TIER_ORDER[nextTierIdx] : null
  const pointsToNext = nextTier ? TIERS[nextTier].minPoints - points : null

  return { tier, points, requestCount, nextTier, pointsToNext }
}

export function getTierInfo(tier: LoyaltyTier) {
  return TIERS[tier]
}

export { TIERS, TIER_ORDER }
