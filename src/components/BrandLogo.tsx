import { useMemo } from 'react'

interface Props { size?: number; className?: string; light?: boolean; animated?: boolean }

function getSVGVariant(variant: 'A' | 'B' | 'C', stroke: string, _fill: string) {
  if (variant === 'A') return (
    // Sole Nascente — half circle + horizon line
    <g>
      <path d="M8 28 Q28 6 48 28" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <line x1="4" y1="28" x2="52" y2="28" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
      {/* Sun rays */}
      <line x1="28" y1="4" x2="28" y2="10" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <line x1="12" y1="12" x2="16" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="44" y1="12" x2="40" y2="16" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </g>
  )
  if (variant === 'B') return (
    // C Aperta — thick open arc 270°
    <g>
      <path d="M42 10 A20 20 0 1 0 42 46" stroke={stroke} strokeWidth="5" fill="none" strokeLinecap="round"/>
    </g>
  )
  // C — Diamante Puro
  return (
    <g>
      <polygon points="28,6 48,28 28,50 8,28" stroke={stroke} strokeWidth="2.5" fill="none"/>
      <polygon points="28,14 40,28 28,42 16,28" stroke={stroke} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <line x1="28" y1="6" x2="28" y2="14" stroke={stroke} strokeWidth="1.5" opacity="0.4"/>
      <line x1="48" y1="28" x2="40" y2="28" stroke={stroke} strokeWidth="1.5" opacity="0.4"/>
    </g>
  )
}

export function BrandLogo({ size = 32, className, light = false, animated: _animated = false }: Props) {
  const variant = useMemo<'A' | 'B' | 'C'>(() => {
    const stored = sessionStorage.getItem('theclass_logo_variant')
    if (stored === 'A' || stored === 'B' || stored === 'C') return stored
    const variants: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C']
    const picked = variants[Math.floor(Math.random() * 3)]
    sessionStorage.setItem('theclass_logo_variant', picked)
    return picked
  }, [])

  const stroke = light ? 'rgba(255,255,255,0.92)' : '#C5A059'
  const fill = light ? 'rgba(255,255,255,0.92)' : '#C5A059'

  return (
    <svg viewBox="0 0 56 56" width={size} height={size} className={className} aria-label="the Class logo">
      {getSVGVariant(variant, stroke, fill)}
    </svg>
  )
}
