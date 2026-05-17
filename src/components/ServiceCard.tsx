import { useState, useRef, useCallback, memo, useMemo, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Lightbulb, Bell, Camera } from 'lucide-react'
import type { Listing } from '@/data/listings'
import { getCategoryLabel } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { useIdeas } from '@/hooks/useIdeas'
import { formatPrice, cn, getABVariant } from '@/lib/utils'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { toast } from 'sonner'
import { toPng } from 'html-to-image'

interface ServiceCardProps {
  listing: Listing
  delay?: number
  compareSelected?: boolean
  onCompareToggle?: () => void
}

function useViewerCount(id: string): number {
  return useMemo(() => {
    // Stable random per listing ID (changes every 5 minutes)
    const seed = Math.floor(Date.now() / 300000) + id.charCodeAt(3)
    return 3 + (seed % 14)
  }, [id])
}

function useCountdown(active: boolean): string {
  const [seconds, setSeconds] = useState(() =>
    active ? Math.floor(Math.random() * 7200) + 1800 : 0
  )
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [active])
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
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

function usePriceAlert(listingId: string) {
  const STORAGE_KEY = 'theclass_price_alerts'
  const [subscribed, setSubscribed] = useState(() => {
    const alerts = safeRead<string[]>(STORAGE_KEY, [])
    return alerts.includes(listingId)
  })

  const toggle = useCallback(() => {
    const alerts = safeRead<string[]>(STORAGE_KEY, [])
    if (alerts.includes(listingId)) {
      safeWrite(STORAGE_KEY, alerts.filter(id => id !== listingId))
      setSubscribed(false)
    } else {
      safeWrite(STORAGE_KEY, [...alerts, listingId])
      setSubscribed(true)
      toast('🔔 Ti avviseremo se il prezzo scende!', { duration: 3000 })
    }
  }, [listingId])

  return { subscribed, toggle }
}

function ServiceCardInner({ listing, delay = 0, compareSelected, onCompareToggle }: ServiceCardProps) {
  const { toggle, isFavorite } = useFavorites()
  const { toggle: toggleIdea, isIdea } = useIdeas()
  const [heartAnim, setHeartAnim] = useState(false)
  const [preview, setPreview] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const fav = isFavorite(listing.id)
  const isIdeaSaved = isIdea(listing.id)
  const variant = getABVariant()
  const viewerCount = useViewerCount(listing.id)
  const countdown = useCountdown(listing.lastMinute ?? false)
  const { subscribed: priceAlertSubscribed, toggle: togglePriceAlert } = usePriceAlert(listing.id)
  const isLowAvailability = listing.reviews < 5

  const handleScreenshot = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current)
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast('📸 Immagine copiata negli appunti!')
    } catch {
      toast.error('Screenshot non supportato')
    }
  }, [])

  const handleBell = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    togglePriceAlert()
  }, [togglePriceAlert])

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
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setPreview(false)
  }, [])

  const handleMouseEnterCard = useCallback(() => {
    hoverTimer.current = setTimeout(() => setPreview(true), 200)
  }, [])

  const handleHeart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const wasFav = fav
    toggle(listing.id)
    setHeartAnim(true)
    if (heartRef.current) spawnParticles(heartRef.current)
    setTimeout(() => setHeartAnim(false), 500)
    // Check for discount unlock after adding (not removing)
    if (!wasFav) {
      setTimeout(() => {
        const allFavs = safeRead<string[]>('theclass_favorites_guest', [])
        if (allFavs.length >= 3 && !safeRead<boolean>('theclass_discount3_shown', false)) {
          safeWrite('theclass_discount3_shown', true)
          setTimeout(() => {
            toast('🎁 Hai sbloccato WELCOME10!', {
              description: 'Sconto del 10% sulla prima prenotazione.',
              duration: 6000,
            })
          }, 600)
        }
      }, 100)
    }
  }, [toggle, listing.id, fav])

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
          onMouseEnter={handleMouseEnterCard}
          style={{ transition: 'transform 0.3s cubic-bezier(0.2,0.9,0.4,1.1), box-shadow 0.5s cubic-bezier(0.25,0.46,0.45,0.94)' }}
          className="group relative bg-[#FCFAF5] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-[0_2px_8px_rgba(26,24,22,0.06)] hover:border-[rgba(197,160,89,0.55)] hover:shadow-[0_12px_32px_rgba(197,160,89,0.14)] card-shine cursor-pointer"
        >
          {/* Hover preview tooltip */}
          {preview && (
            <div className="absolute -top-2 left-full ml-3 z-20 w-48 bg-white border border-[rgba(197,160,89,0.2)] rounded-xl p-3 shadow-[0_8px_24px_rgba(26,24,22,0.12)] hidden lg:block">
              <p className="text-[10px] text-[#5A4F44] mb-1">Qualità</p>
              <div className="w-full h-1 bg-[rgba(197,160,89,0.15)] rounded-full mb-2">
                <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${listing.qualityScore ?? 90}%` }} />
              </div>
              <p className="text-[10px] text-[#5A4F44]">📍 {listing.location.split(',')[0]}</p>
              <p className="text-[10px] text-[#5A4F44]">⭐ {listing.rating} ({listing.reviews} rec.)</p>
              {listing.classApproved && <p className="text-[9px] text-[#C5A059] mt-1">✦ The Class Approved</p>}
            </div>
          )}
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
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <div className="flex gap-2">
                <span className="glass text-[11px] font-medium px-2.5 py-1 rounded-full text-[#1C1C1C]">
                  {getCategoryLabel(listing.category)}
                </span>
                {listing.trending && (
                  <span className="bg-[#C5A059] text-white text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest">
                    Trending
                  </span>
                )}
              </div>
              {listing.lastMinute && (
                <span className="bg-red-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit">
                  Last Minute −20%
                </span>
              )}
              {listing.classApproved && (
                <span className="bg-[#1C1C1C] text-[#C5A059] text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-[0.12em] flex items-center gap-1 w-fit">
                  ✦ The Class Approved
                </span>
              )}
            </div>

            {/* Social proof */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 glass px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-[#1C1C1C] font-medium">{viewerCount} ora</span>
            </div>

            {/* Screenshot button */}
            <button
              onClick={handleScreenshot}
              className="absolute top-3 right-[5.5rem] z-10 w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform duration-200"
              aria-label="Screenshot"
            >
              <Camera size={13} className="text-white" />
            </button>

            {/* Idea button */}
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); toggleIdea(listing.id) }}
              className="absolute top-3 right-12 z-10 w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform duration-200"
              aria-label="Salva come idea"
            >
              <Lightbulb size={13} className={isIdeaSaved ? 'fill-yellow-400 text-yellow-400' : 'text-white'} />
            </button>

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

            {/* High demand badge */}
            {listing.reviews > 40 && !listing.lastMinute && (
              <div className="absolute bottom-3 right-3 z-10">
                <span className="bg-amber-500/90 text-white text-[8px] font-semibold px-2 py-0.5 rounded-full animate-pulse">
                  🔥 Alta richiesta
                </span>
              </div>
            )}
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
              <div className="flex items-center gap-2">
                {/* Bell button */}
                <button
                  onClick={handleBell}
                  className="p-1 rounded-full hover:bg-[rgba(197,160,89,0.1)] transition-colors"
                  aria-label={priceAlertSubscribed ? 'Rimuovi avviso prezzo' : 'Aggiungi avviso prezzo'}
                >
                  <Bell
                    size={13}
                    className={priceAlertSubscribed ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#5A4F44]'}
                  />
                </button>
                <div className="flex items-center gap-1">
                  <Star size={11} className="fill-[#C5A059] text-[#C5A059]" />
                  <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#1C1C1C]">
                    {listing.rating}
                  </span>
                  <span className="text-[11px] text-[#5A4F44]">({listing.reviews})</span>
                </div>
              </div>
            </div>

            {/* Last spot badge */}
            {isLowAvailability && (
              <motion.p
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-1.5 text-[10px] italic font-medium"
                style={{ background: 'linear-gradient(90deg, #ef4444, #C5A059)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                ⚡ Solo 2 posti — prenotato 8 min fa
              </motion.p>
            )}

            {listing.lastMinute && (
              <div className="mt-2 flex items-center justify-between px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-[10px] text-red-700 font-medium">⚡ Offerta lampo –20%</span>
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-red-600">{countdown}</span>
              </div>
            )}

            {listing.qualityScore !== undefined && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-[rgba(197,160,89,0.15)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${listing.qualityScore}%` }} />
                </div>
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#5A4F44]">
                  {listing.qualityScore}/100
                </span>
              </div>
            )}

            {onCompareToggle && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onCompareToggle() }}
                className={cn(
                  'mt-2 w-full py-1.5 rounded-xl text-[11px] font-medium transition-colors border',
                  compareSelected
                    ? `${variant === 'B' ? 'bg-[rgba(138,154,170,0.15)] border-[#8A9AAA] text-[#8A9AAA]' : 'bg-[rgba(197,160,89,0.15)] border-[#C5A059] text-[#C5A059]'}`
                    : `bg-transparent border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]`,
                )}
              >
                {compareSelected ? '✓ Selezionato' : '+ Confronta'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export const ServiceCard = memo(ServiceCardInner)
