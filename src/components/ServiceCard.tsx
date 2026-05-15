import { useState, useCallback } from 'react'
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

export function ServiceCard({ listing, delay = 0 }: ServiceCardProps) {
  const { toggle, isFavorite } = useFavorites()
  const [heartAnim, setHeartAnim] = useState(false)
  const fav = isFavorite(listing.id)

  const handleHeart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(listing.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 500)
  }, [toggle, listing.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to="/servizi/$id" params={{ id: listing.id }} className="block">
        <div className="relative bg-[#FCFAF5] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm transition-all duration-300 hover:border-[rgba(197,160,89,0.5)] hover:shadow-[0_8px_40px_rgba(197,160,89,0.12)] card-shine">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 img-overlay" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="glass text-xs font-[family-name:var(--font-family-sans)] font-medium px-2.5 py-1 rounded-full text-[#1C1C1C]">
                {getCategoryLabel(listing.category)}
              </span>
              {listing.trending && (
                <span className="bg-[#C5A059] text-white text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Trending
                </span>
              )}
            </div>

            {/* Heart */}
            <button
              onClick={handleHeart}
              className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center transition-transform duration-200 hover:scale-110"
              aria-label={fav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              <Heart
                size={14}
                className={cn(
                  'transition-all duration-200',
                  heartAnim && 'heart-pop',
                  fav ? 'fill-[#C5A059] text-[#C5A059]' : 'text-white'
                )}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] leading-snug line-clamp-2">
                {listing.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <MapPin size={12} className="text-[#C5A059]" />
              <span className="text-xs text-[#5A4F44] font-light">{listing.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-[family-name:var(--font-family-mono)] text-base text-[#1C1C1C] font-medium">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-xs text-[#5A4F44] font-light ml-1">/ {listing.priceUnit}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-[#C5A059] text-[#C5A059]" />
                <span className="text-xs font-[family-name:var(--font-family-mono)] text-[#1C1C1C]">
                  {listing.rating}
                </span>
                <span className="text-xs text-[#5A4F44]">({listing.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
