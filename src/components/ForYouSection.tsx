// src/components/ForYouSection.tsx
import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { listings } from '@/data/listings'
import { safeRead } from '@/lib/errorHandler'
import { formatPrice } from '@/lib/utils'

export function ForYouSection() {
  const { favorites } = useFavorites()

  const recommended = useMemo(() => {
    const requests = safeRead<Array<{ listingId?: string }>>('theclass_requests', [])
    const seenIds = new Set([...favorites, ...requests.map(r => r.listingId).filter(Boolean) as string[]])

    // Find categories the user interacted with
    const likedCats = listings
      .filter(l => seenIds.has(l.id))
      .map(l => l.category)

    // Score listings: +2 if liked category, +1 if trending, avoid already seen
    const scored = listings
      .filter(l => !seenIds.has(l.id))
      .map(l => ({
        ...l,
        score: (likedCats.includes(l.category) ? 2 : 0) + (l.trending ? 1 : 0) + l.rating / 5,
      }))
      .sort((a, b) => b.score - a.score)

    // If no interactions, show top-rated trending
    if (seenIds.size === 0) {
      return listings.filter(l => l.trending).slice(0, 3)
    }
    return scored.slice(0, 3)
  }, [favorites])

  if (recommended.length === 0) return null

  return (
    <section className="py-20 px-6 lg:px-8 max-w-7xl mx-auto reveal">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles size={18} className="text-[#C5A059]" />
        <div>
          <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">
            Selezionati per te
          </h2>
          <p className="text-xs text-[#5A4F44] font-light mt-0.5">
            Basati sui tuoi preferiti e sulla tua cronologia
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommended.map((listing, i) => (
          <Link key={listing.id} to="/servizi/$id" params={{ id: listing.id }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden card-shine hover:shadow-[0_8px_40px_rgba(197,160,89,0.12)] hover:border-[rgba(197,160,89,0.3)] transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={listing.image}
                  alt={`${listing.title} — ${listing.location}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {listing.trending && (
                  <span className="absolute top-3 right-3 text-[9px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Trending
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1C1C1C] leading-snug mb-1 group-hover:text-[#C5A059] transition-colors">
                  {listing.title}
                </p>
                <p className="text-xs text-[#5A4F44] mb-2">{listing.location}</p>
                <p className="font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059]">
                  {formatPrice(listing.price)}<span className="text-[10px] text-[#5A4F44]">/{listing.priceUnit}</span>
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  )
}
