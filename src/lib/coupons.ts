import { safeRead, safeWrite } from '@/lib/errorHandler'

export interface Coupon {
  code: string
  type: 'percent' | 'fixed'
  value: number // percent 0-100 or fixed EUR amount
  description: string
  maxUses: number
  singleUse: boolean // per user
}

// Built-in coupon catalog (in production would come from backend)
const CATALOG: Coupon[] = [
  { code: 'LUXURY10', type: 'percent', value: 10, description: '-10% su tutto', maxUses: 999, singleUse: false },
  { code: 'WELCOME20', type: 'percent', value: 20, description: '-20% benvenuto', maxUses: 1, singleUse: true },
  { code: 'SUMMER500', type: 'fixed', value: 500, description: '-€500 estate 2025', maxUses: 50, singleUse: false },
  { code: 'VIP15', type: 'percent', value: 15, description: '-15% clienti VIP', maxUses: 999, singleUse: false },
  { code: 'YACHT5', type: 'percent', value: 5, description: '-5% su tutti gli yacht', maxUses: 999, singleUse: false },
]

interface CouponUsage {
  code: string
  usedBy: string[] // emails
  usedAt: number[]
}

function getUsages(): CouponUsage[] {
  return safeRead<CouponUsage[]>('theclass_coupon_usage', [])
}

export interface CouponResult {
  valid: boolean
  coupon?: Coupon
  discountAmount?: number // computed EUR discount on a given total
  error?: string
}

export function validateCoupon(code: string, total: number, userEmail?: string): CouponResult {
  const normalized = code.trim().toUpperCase()
  const coupon = CATALOG.find(c => c.code === normalized)
  if (!coupon) return { valid: false, error: 'Codice non valido' }

  const usages = getUsages()
  const usage = usages.find(u => u.code === normalized)
  const timesUsed = usage?.usedBy.length ?? 0

  if (timesUsed >= coupon.maxUses) return { valid: false, error: 'Codice esaurito' }

  if (coupon.singleUse && userEmail && usage?.usedBy.includes(userEmail)) {
    return { valid: false, error: 'Hai già usato questo codice' }
  }

  const discountAmount = coupon.type === 'percent'
    ? Math.round(total * coupon.value / 100)
    : Math.min(coupon.value, total)

  return { valid: true, coupon, discountAmount }
}

export function redeemCoupon(code: string, userEmail: string): void {
  const normalized = code.trim().toUpperCase()
  const usages = getUsages()
  const existing = usages.find(u => u.code === normalized)
  if (existing) {
    existing.usedBy.push(userEmail)
    existing.usedAt.push(Date.now())
  } else {
    usages.push({ code: normalized, usedBy: [userEmail], usedAt: [Date.now()] })
  }
  safeWrite('theclass_coupon_usage', usages)
}

export function getCouponStats(): Array<Coupon & { used: number }> {
  const usages = getUsages()
  return CATALOG.map(c => ({
    ...c,
    used: usages.find(u => u.code === c.code)?.usedBy.length ?? 0,
  }))
}
