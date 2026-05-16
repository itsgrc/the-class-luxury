import { useState, useRef, useCallback, memo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin } from 'lucide-react'
import type { Listing } from '@/data/listings'
import { getCategoryLabel } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { formatPrice, cn } from '@/lib/utils'

interface ServiceCardProps {
  listing: Listing
  delay?: number
}

// MODIFICATO: particelle oro al click del cuore
function spawnParticles(btn: HTMLElement) {
  const rect = btn.getBoundingClientRect()
  const cx = btn.offsetLeft + btn.offsetWidth / 2
  const cy = btn.offsetTop + btn.offsetHeight / 2
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('span')
    p.classList.add('gold-particle')
    const angle = (i / 6) * Math.PI * 2
    const dist = 16 + Math.random() * 10
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`)
    p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`)
    p.style.left = `${cx}px`
    p.style.top = `${cy}px`
    btn.parentElement?.appendChild(p)
    setTimeout(() => p.remove(), 550)
  }
  void rect // avoid unused warning
}

function ServiceCardInner({ listing, delay = 0 }: ServiceCardProps) {
  const { toggle, isFavorite } = useFavorites()
  const [heartAnim, setHeartAnim] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const fav = isFavorite(listing.id)

  // Magnetic mousemove: max 4px translate
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 4
    const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 4
    card.style.transform = `translate(${dx}px, ${dy}px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) cardRef.current.style.transform = ''
  }, [])

  const handleHeart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(listing.id)
    setHeartAnim(true)
    if (heartRef.current) spawnParticles(heartRef.current)
    setTimeout(() => setHeartAnim(false), 500)
  }, [toggle, listing.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
    >
      <Link to="/servizi/$id" params={{ id: listing.id }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transition: 'transform 0.3s cubic-bezier(0.2,0.9,0.4,1.1), box-shadow 0.5s cubic-bezier(0.25,0.46,0.45,0.94)' }}
          className="group relative bg-[#FCFAF5] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-[0_2px_8px_rgba(26,24,22,0.06)] hover:border-[rgba(197,160,89,0.55)] hover:shadow-[0_12px_32px_rgba(197,160,89,0.14)] card-shine cursor-pointer"
        >
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={listing.image}
              alt={`${listing.title} — ${listing.location}`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-110"
              loading="lazy"
            />
            <div className="absolute inset-0 img-overlay" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              <span className="glass text-[11px] font-medium px-2.5 py-1 rounded-full text-[#1C1C1C]">
                {getCategoryLabel(listing.category)}
              </span>
              {listing.trending && (
                <span className="bg-[#C5A059] text-white text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Trending
                </span>
              )}
            </div>

            {/* Heart – MODIFICATO: ref per particelle oro */}
            <button
              ref={heartRef}
              onClick={handleHeart}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform duration-200"
            >
              <Heart
                size={13}
                className={cn(
                  'transition-all',
                  heartAnim && 'heart-pop',
                  fav ? 'fill-[#C5A059] text-[#C5A059]' : 'text-white',
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-[family-name:var(--font-family-display)] text-[15px] font-medium text-[#1C1C1C] leading-snug line-clamp-2 mb-2">
              {listing.title}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <MapPin size={11} className="text-[#C5A059] shrink-0" />
              <span className="text-xs text-[#5A4F44] font-light truncate">{listing.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-family-mono)] text-base text-[#1C1C1C]">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-[11px] text-[#5A4F44] font-light">/ {listing.priceUnit}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-[#C5A059] text-[#C5A059]" />
                <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#1C1C1C]">
                  {listing.rating}
                </span>
                <span className="text-[11px] text-[#5A4F44]">({listing.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export const ServiceCard = memo(ServiceCardInner)
