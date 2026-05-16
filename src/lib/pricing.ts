import type { Listing } from '@/data/listings'

export interface PriceBreakdown {
  nights: number
  baseNightly: number
  seasonalMultiplier: number
  seasonalLabel: string
  upgradeTotal: number
  subtotal: number
  discount: number
  discountLabel: string
  total: number
}

export function getDynamicPrice(
  listing: Listing,
  from: Date,
  to: Date,
  upgradeIds: string[] = [],
): PriceBreakdown {
  const msDay = 1000 * 60 * 60 * 24
  const nights = Math.max(1, Math.round((to.getTime() - from.getTime()) / msDay))

  // Seasonal multiplier: use midpoint of stay
  let multiplier = 1
  let seasonalLabel = ''
  if (listing.seasonalPricing?.length) {
    const mid = new Date((from.getTime() + to.getTime()) / 2)
    const month = mid.getMonth() + 1 // 1-12
    for (const sp of listing.seasonalPricing) {
      if (sp.months.includes(month) && sp.multiplier > multiplier) {
        multiplier = sp.multiplier
        seasonalLabel = sp.label
      }
    }
  }

  const baseNightly = listing.price * multiplier
  const subtotal = baseNightly * nights

  // Long-stay discount
  let discount = 0
  let discountLabel = ''
  if (nights >= 14) { discount = 0.10; discountLabel = '-10% lungo soggiorno (14+ notti)' }
  else if (nights >= 7) { discount = 0.05; discountLabel = '-5% settimana (7+ notti)' }

  const upgradeTotal = listing.upgrades
    .filter(u => upgradeIds.includes(u.id))
    .reduce((s, u) => s + u.price, 0)

  const total = Math.round(subtotal * (1 - discount) + upgradeTotal)

  return {
    nights,
    baseNightly,
    seasonalMultiplier: multiplier,
    seasonalLabel,
    upgradeTotal,
    subtotal: Math.round(subtotal),
    discount,
    discountLabel,
    total,
  }
}
