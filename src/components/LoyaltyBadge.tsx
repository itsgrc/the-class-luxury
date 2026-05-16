// src/components/LoyaltyBadge.tsx
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { getLoyaltyStatus, getTierInfo } from '@/lib/loyalty'
import { cn } from '@/lib/utils'

interface Props {
  email?: string
  compact?: boolean
}

export function LoyaltyBadge({ email, compact = false }: Props) {
  const status = getLoyaltyStatus(email)
  const info = getTierInfo(status.tier)

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium"
        style={{ color: info.color, borderColor: `${info.color}40`, background: `${info.color}10` }}
      >
        <Crown size={9} />
        {info.label}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown size={16} style={{ color: info.color }} />
          <span className={cn('font-[family-name:var(--font-family-display)] text-base font-medium')} style={{ color: info.color }}>
            {info.label}
          </span>
        </div>
        <span className="font-[family-name:var(--font-family-mono)] text-lg text-[#1C1C1C]">{status.points} pt</span>
      </div>

      {/* Progress to next tier */}
      {status.nextTier && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-[#5A4F44] mb-1">
            <span>{info.label}</span>
            <span>{getTierInfo(status.nextTier).label} ({status.pointsToNext} pt mancanti)</span>
          </div>
          <div className="h-1.5 bg-[rgba(197,160,89,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                background: info.color,
                width: `${Math.min(100, (status.points / (status.points + (status.pointsToNext ?? 1))) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        {info.perks.slice(0, 3).map(p => (
          <p key={p} className="text-[11px] text-[#5A4F44] flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: info.color }} />
            {p}
          </p>
        ))}
      </div>
    </motion.div>
  )
}
