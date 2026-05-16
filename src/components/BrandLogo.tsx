// src/components/BrandLogo.tsx
import { cn } from '@/lib/utils'

interface Props {
  size?: number
  className?: string
  light?: boolean  // light variant for dark backgrounds
}

export function BrandLogo({ size = 32, className, light = false }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="50%" stopColor="#C5A059" />
          <stop offset="100%" stopColor="#9E7A3A" />
        </linearGradient>
      </defs>
      <path
        d="M36 9 C28 4, 10 4, 8 18 C6 30, 14 42, 28 43 C34 43.5, 40 41, 42 37"
        stroke="url(#brandGrad)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M12 28 Q18 24 24 28 Q30 32 36 28"
        stroke={light ? 'rgba(255,255,255,0.5)' : 'url(#brandGrad)'}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}
