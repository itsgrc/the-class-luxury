// src/components/BrandLogo.tsx
import { motion } from 'framer-motion'
import { useState } from 'react'

interface Props { size?: number; className?: string; light?: boolean; animated?: boolean }

export function BrandLogo({ size = 32, className, light = false, animated = false }: Props) {
  const [roaring, setRoaring] = useState(false)
  const gold = '#C5A059'
  const stroke = light ? 'rgba(255,255,255,0.9)' : gold
  const maneStroke = light ? 'rgba(255,255,255,0.5)' : 'rgba(197,160,89,0.55)'

  const handleClick = () => {
    if (!animated) return
    setRoaring(true)
    setTimeout(() => setRoaring(false), 600)
  }

  return (
    <motion.svg
      viewBox="0 0 56 48"
      width={size}
      height={size * 48 / 56}
      className={className}
      onClick={handleClick}
      animate={roaring ? { scale: [1, 1.18, 0.95, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
      style={{ cursor: animated ? 'pointer' : 'default' }}
    >
      {/* Mane — radiating arcs behind head, forming a C-shape */}
      <path d="M28 8 C18 2 6 10 4 22 C2 32 8 42 18 45" stroke={maneStroke} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M28 8 C20 3 10 8 7 18" stroke={maneStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M28 8 C23 2 14 4 10 12" stroke={maneStroke} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M18 45 C22 47 26 48 28 46" stroke={maneStroke} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Main mane arc — this IS the "C" */}
      <path d="M30 6 C16 2 3 14 3 28 C3 40 12 47 24 48" stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Lion head — geometric profile */}
      <ellipse cx="36" cy="24" rx="13" ry="14" fill="none" stroke={stroke} strokeWidth="2.2" />
      {/* Ear */}
      <path d="M30 13 L27 8 L33 11" stroke={stroke} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      {/* Eye */}
      <circle cx="33" cy="20" r="2" fill={stroke} />
      <circle cx="33" cy="20" r="0.8" fill={light ? '#1C1C1C' : '#FDF9F2'} />
      {/* Nose */}
      <path d="M38 27 L36 29 L40 29 Z" fill={stroke} />
      {/* Mouth */}
      <path d="M36 29 C34 32 31 33 30 35" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M40 29 C42 32 44 33 45 35" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Jaw */}
      <path d="M30 24 C28 30 30 40 36 42 C42 44 47 38 48 32 C49 26 46 18 40 16" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="38" y1="27" x2="48" y2="25" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <line x1="38" y1="29" x2="48" y2="29" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <line x1="38" y1="27" x2="28" y2="24" stroke={stroke} strokeWidth="1" opacity="0.5" />
    </motion.svg>
  )
}
