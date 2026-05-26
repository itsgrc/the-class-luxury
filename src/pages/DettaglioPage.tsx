import { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Check, Heart, Sparkles, Calendar, Share2, Gift, Scan,
  Bell, Play, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { it } from 'date-fns/locale'
import { toast } from 'sonner'
import { listings, getCategoryLabel } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { RequestModal } from '@/components/RequestModal'
import { ReviewSection } from '@/components/ReviewSection'
import { getDynamicPrice } from '@/lib/pricing'
import { downloadICS, googleCalendarUrl } from '@/lib/calendar'
import { formatPrice, cn } from '@/lib/utils'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { WeatherWidget } from '@/components/WeatherWidget'
import { GiftModal } from '@/components/GiftModal'
import { ARPreviewModal } from '@/components/ARPreviewModal'

function getDisabledDates(seed: string): Date[] {
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const dates: Date[] = []
  const now = new Date()
  for (let i = 2; i < 60; i++) {
    if ((hash * i * 13) % 7 < 2) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      dates.push(d)
    }
  }
  return dates
}

// Mock rating breakdown (5→1 stars)
const RATING_DIST = [62, 24, 8, 4, 2] // percentages for 5,4,3,2,1 stars

// Build 7×6 calendar grid for current month
function buildMonthGrid(): { date: Date; available: boolean; isCurrentMonth: boolean }[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDow = firstDay.getDay() // 0=Sun
  const cells: { date: Date; available: boolean; isCurrentMonth: boolean }[] = []
  // pad from previous month
  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, 1 - (startDow - i))
    cells.push({ date: d, available: false, isCurrentMonth: false })
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    // Random availability based on seed
    const available = date >= now && (d * 7 + 3) % 5 !== 0
    cells.push({ date, available, isCurrentMonth: true })
  }
  // pad remaining to 42
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push({ date: next, available: false, isCurrentMonth: false })
  }
  return cells
}

const MONTH_NAMES = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
const DOW_LABELS = ['D','L','M','M','G','V','S']

export function DettaglioPage() {
  const { id } = useParams({ from: '/servizi/$id' })
  const listing = listings.find(l => l.id === id)
  const [range, setRange] = useState<DateRange>()
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [giftOpen, setGiftOpen] = useState(false)
  const [arOpen, setArOpen] = useState(false)
  const { toggle, isFavorite } = useFavorites()
  const [heartAnim, setHeartAnim] = useState(false)
  const disabled = useMemo(() => (listing ? getDisabledDates(listing.id) : []), [id])

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Month grid (memoised)
  const monthGrid = useMemo(() => buildMonthGrid(), [])
  const now = new Date()

  if (!listing) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#1C1C1C] mb-4">
            Servizio non trovato
          </p>
          <Link to="/servizi" className="text-[#C5A059] text-sm underline">
            Torna ai servizi
          </Link>
        </div>
      </div>
    )
  }

  const fav = isFavorite(listing.id)
  const upgradeTotal = listing.upgrades
    .filter(u => selectedUpgrades.includes(u.id))
    .reduce((s, u) => s + u.price, 0)

  // Similar listings from same category
  const similarListings = listings
    .filter(l => l.category === listing.category && l.id !== listing.id)
    .slice(0, 3)

  // All gallery images
  const allImages = [listing.image, ...(listing.images ?? [])]

  // Check for videoUrl (future-proofed via cast)
  const videoUrl = (listing as unknown as Record<string, unknown>)['videoUrl'] as string | undefined

  const handleHeart = () => {
    toggle(listing.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 500)
  }

  const handlePriceAlert = () => {
    const alerts = JSON.parse(localStorage.getItem('theclass_price_alerts') ?? '[]')
    if (!alerts.includes(listing.id)) {
      localStorage.setItem('theclass_price_alerts', JSON.stringify([...alerts, listing.id]))
    }
    toast.success('Prezzo monitorato', { description: 'Ti avvisiamo se il prezzo scende.' })
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiato negli appunti')
    } else if (navigator.share) {
      await navigator.share({ title: listing.title, url })
    }
  }

  const toggleUpgrade = (uid: string) =>
    setSelectedUpgrades(prev =>
      prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid],
    )

  const prevImage = () =>
    setLightboxIndex(i => (i === null ? 0 : (i - 1 + allImages.length) % allImages.length))
  const nextImage = () =>
    setLightboxIndex(i => (i === null ? 0 : (i + 1) % allImages.length))

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      <Helmet>
        <title>{listing.title} — the Class</title>
        <meta name="description" content={listing.description.slice(0, 155)} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={listing.description.slice(0, 155)} />
        <meta property="og:image" content={listing.image} />
        <meta property="og:type" content="product" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':
                listing.category === 'jet'
                  ? 'Flight'
                  : listing.category === 'yacht' || listing.category === 'villa'
                  ? 'LodgingBusiness'
                  : 'Product',
              name: listing.title,
              description: listing.description.slice(0, 155),
              image: listing.image,
              offers: {
                '@type': 'Offer',
                price: listing.price,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating:
                listing.reviews > 0
                  ? {
                      '@type': 'AggregateRating',
                      ratingValue: listing.rating,
                      reviewCount: listing.reviews,
                      bestRating: 5,
                    }
                  : undefined,
              provider: {
                '@type': 'Organization',
                name: 'the Class',
                url: 'https://the-class-luxury.pages.dev',
              },
            }),
          }}
        />
      </Helmet>

      {/* Hero */}
      <div className="relative h-[52vh] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover cursor-pointer"
          loading="lazy"
          decoding="async"
          onClick={() => setLightboxIndex(0)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F2] via-[#1C1C1C]/25 to-[#1C1C1C]/55" />

        {/* Video play overlay */}
        {videoUrl && (
          <button
            className="absolute inset-0 flex items-center justify-center z-10"
            onClick={() => window.open(videoUrl, '_blank')}
          >
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm border border-white/30 hover:bg-black/70 transition-colors">
              <Play size={22} className="text-white ml-1" />
            </div>
          </button>
        )}

        <Link
          to="/servizi"
          className="absolute top-6 left-6 glass-dark flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={13} /> Tutti i servizi
        </Link>

        <button
          onClick={handleHeart}
          className="absolute top-6 right-6 glass-dark w-9 h-9 flex items-center justify-center rounded-full"
        >
          <Heart
            size={15}
            className={cn(
              'transition-all',
              heartAnim && 'heart-pop',
              fav ? 'fill-[#C5A059] text-[#C5A059]' : 'text-white',
            )}
          />
        </button>

        {/* Share button — always visible (copies URL) */}
        <button
          onClick={handleShare}
          className="absolute top-6 right-20 glass-dark w-9 h-9 flex items-center justify-center rounded-full"
        >
          <Share2 size={14} className="text-white" />
        </button>

        {/* Price alert button */}
        <button
          onClick={handlePriceAlert}
          className="absolute top-6 right-36 glass-dark w-9 h-9 flex items-center justify-center rounded-full"
          title="Avvisami se il prezzo scende"
        >
          <Bell size={14} className="text-white" />
        </button>

        <button
          onClick={() => setArOpen(true)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 glass px-3 py-2 rounded-xl text-xs text-[#1C1C1C] font-medium hover:bg-white/80 transition-colors"
        >
          <Scan size={12} className="text-[#C5A059]" />
          AR Preview
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-14 pb-8">
          <span className="glass text-[11px] font-medium px-2.5 py-1 rounded-full text-[#1C1C1C] inline-block mb-3">
            {getCategoryLabel(listing.category)}
          </span>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-white tracking-tight">
            {listing.title}
          </h1>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={18} className="text-white" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={e => { e.stopPropagation(); prevImage() }}
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <img
              src={allImages[lightboxIndex]}
              alt={listing.title}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={e => { e.stopPropagation(); nextImage() }}
            >
              <ChevronRight size={22} className="text-white" />
            </button>
            <span className="absolute bottom-4 text-white/50 text-xs font-[family-name:var(--font-family-mono)]">
              {lightboxIndex + 1} / {allImages.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <Breadcrumbs currentLabel={listing.title} className="mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-[rgba(197,160,89,0.18)]">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#C5A059]" />
                <span className="text-sm text-[#5A4F44] font-light">{listing.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={13} className="fill-[#C5A059] text-[#C5A059]" />
                <span className="text-sm text-[#1C1C1C] font-medium">{listing.rating}</span>
                <span className="text-sm text-[#5A4F44]">({listing.reviews} recensioni)</span>
              </div>
              {listing.trending && (
                <span className="bg-[#C5A059] text-white text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Trending
                </span>
              )}
              <span className="flex items-center gap-1 text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest border border-[rgba(197,160,89,0.4)] text-[#C5A059]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Verificato da The Class
              </span>
            </div>

            {/* Photo gallery strip */}
            {allImages.length > 1 && (
              <div>
                <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                  Galleria
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className="shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all hover:border-[#C5A059]"
                      style={{ borderColor: lightboxIndex === i ? '#C5A059' : 'transparent' }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Il servizio
              </h2>
              <p className="text-[#5A4F44] font-light leading-relaxed">{listing.description}</p>
            </div>

            {/* Incluso nel prezzo */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Incluso nel prezzo
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center shrink-0">
                      <Check size={9} className="text-[#C5A059]" />
                    </div>
                    <span className="text-sm text-[#5A4F44] font-light">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating breakdown */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Valutazioni
              </h2>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-family-mono)] text-4xl text-[#1C1C1C]">
                    {listing.rating.toFixed(1)}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={11}
                        className={s <= Math.round(listing.rating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[rgba(197,160,89,0.2)]'}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#5A4F44] mt-1">{listing.reviews} recensioni</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {RATING_DIST.map((pct, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#5A4F44] w-3 text-right">{5 - i}</span>
                      <Star size={9} className="text-[#C5A059] shrink-0" />
                      <div className="flex-1 h-1.5 bg-[rgba(197,160,89,0.12)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C5A059] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#5A4F44] w-6">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability calendar */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Disponibilità — {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
              </h2>
              <div className="bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)] p-5">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DOW_LABELS.map(d => (
                    <div key={d} className="text-center text-[10px] font-medium text-[#5A4F44] uppercase tracking-wider py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((cell, i) => (
                    <div
                      key={i}
                      className={cn(
                        'aspect-square flex items-center justify-center rounded-lg text-xs transition-colors',
                        !cell.isCurrentMonth && 'opacity-0 pointer-events-none',
                        cell.isCurrentMonth && cell.available && 'bg-[rgba(197,160,89,0.1)] text-[#1C1C1C] hover:bg-[rgba(197,160,89,0.2)] cursor-pointer',
                        cell.isCurrentMonth && !cell.available && 'text-[#5A4F44]/30 line-through',
                      )}
                    >
                      {cell.date.getDate()}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[rgba(197,160,89,0.12)]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[rgba(197,160,89,0.2)]" />
                    <span className="text-[10px] text-[#5A4F44]">Disponibile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.15)]" />
                    <span className="text-[10px] text-[#5A4F44]">Non disponibile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Score & Certifications */}
            {(listing.qualityScore !== undefined || listing.certifications?.length) && (
              <div className="p-6 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)]">
                <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-4">
                  Qualità & Certificazioni
                </h3>
                <div className="flex flex-wrap gap-4 items-start">
                  {listing.qualityScore !== undefined && (
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-[#C5A059] bg-white shadow-[0_4px_16px_rgba(197,160,89,0.15)]">
                      <span className="font-[family-name:var(--font-family-mono)] text-xl font-bold text-[#C5A059]">
                        {listing.qualityScore}
                      </span>
                      <span className="text-[9px] text-[#5A4F44] tracking-wide">/100</span>
                    </div>
                  )}
                  <div className="flex-1">
                    {listing.safetyRating !== undefined && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-[#5A4F44]">Sicurezza:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < (listing.safetyRating ?? 0) ? 'text-[#C5A059]' : 'text-[rgba(197,160,89,0.2)]'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {listing.certifications && (
                      <div className="flex flex-wrap gap-2">
                        {listing.certifications.map(cert => (
                          <span
                            key={cert}
                            className="px-2.5 py-1 bg-white border border-[rgba(197,160,89,0.3)] rounded-full text-[10px] text-[#5A4F44] font-medium"
                          >
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    )}
                    {listing.classApproved && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] rounded-full">
                        <span className="text-[#C5A059]">✦</span>
                        <span className="text-[11px] text-white font-medium tracking-wide">The Class Approved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* WeatherWidget */}
            <div>
              <WeatherWidget location={listing.location.split(',')[0]} />
            </div>

            {/* CO2 Offset */}
            {(listing.category === 'jet' || listing.category === 'yacht') && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-800 mb-1">🌿 Impatto CO₂ stimato</p>
                    <p className="text-xs text-emerald-700 font-light">
                      {listing.category === 'jet'
                        ? `Questa tratta produce circa ${Math.round(listing.price * 0.08)} kg CO₂.`
                        : `Questo noleggio genera circa ${Math.round(listing.price * 0.03)} kg CO₂.`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      toast.success(`+€${Math.round(listing.price * 0.05).toLocaleString('it-IT')} CO₂ offset aggiunto`)
                      if (navigator.vibrate) navigator.vibrate(40)
                    }}
                    className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
                  >
                    Compensa (+5%)
                  </button>
                </div>
              </div>
            )}

            {/* Calendar (DayPicker) */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Seleziona le date
              </h2>
              <div className="bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)] p-6 flex justify-center">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={[{ before: new Date() }, ...disabled]}
                  locale={it}
                  showOutsideDays={false}
                />
              </div>
              {range?.from && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[#5A4F44] mt-3 font-light"
                >
                  Selezionato:{' '}
                  <span className="text-[#1C1C1C] font-medium">
                    {range.from.toLocaleDateString('it-IT')}
                    {range.to ? ` — ${range.to.toLocaleDateString('it-IT')}` : ''}
                  </span>
                </motion.p>
              )}
            </div>

            {/* Reviews */}
            <ReviewSection listingId={listing.id} listingTitle={listing.title} />

            {/* Upgrades */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2 flex items-center gap-2">
                <Sparkles size={15} className="text-[#C5A059]" />
                Upgrade Esclusivi
              </h2>
              <p className="text-sm text-[#5A4F44] font-light mb-5">Aggiungi esperienze straordinarie</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.upgrades.map(up => {
                  const sel = selectedUpgrades.includes(up.id)
                  return (
                    <motion.div
                      key={up.id}
                      whileHover={{ y: -2 }}
                      onClick={() => toggleUpgrade(up.id)}
                      className={cn(
                        'cursor-pointer rounded-2xl border transition-all duration-200',
                        sel
                          ? 'border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
                          : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.4)]',
                      )}
                    >
                      <div className="flex gap-4 p-4">
                        <img
                          src={up.image}
                          alt={up.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-[#1C1C1C] leading-tight">{up.name}</h4>
                            <div
                              className={cn(
                                'w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors',
                                sel ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]',
                              )}
                            >
                              {sel && <Check size={9} className="text-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#5A4F44] font-light mt-1">{up.description}</p>
                          <p className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] mt-1.5">
                            +{formatPrice(up.price)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Similar listings */}
            {similarListings.length > 0 && (
              <div>
                <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-5">
                  Clienti che hanno visto questo hanno prenotato anche
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {similarListings.map(s => (
                    <Link key={s.id} to={`/servizi/${s.id}` as '/'} className="group block rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.18)] hover:border-[#C5A059] transition-colors">
                      <div className="h-32 overflow-hidden">
                        <img
                          src={s.image}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-[#1C1C1C] line-clamp-2">{s.title}</p>
                        <p className="text-[10px] text-[#5A4F44] mt-0.5">{s.location}</p>
                        <p className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] mt-1.5">
                          {formatPrice(s.price)} / {s.priceUnit}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.22)] p-6 shadow-[0_4px_24px_rgba(197,160,89,0.07)]">
              <div className="mb-4 pb-4 border-b border-[rgba(197,160,89,0.18)]">
                <span className="font-[family-name:var(--font-family-mono)] text-3xl text-[#1C1C1C]">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-sm text-[#5A4F44] font-light ml-2">/ {listing.priceUnit}</span>
              </div>

              {range?.from && range?.to &&
                (() => {
                  const bd = getDynamicPrice(listing, range.from, range.to, selectedUpgrades)
                  return (
                    <div className="bg-[#FCFAF5] border border-[rgba(197,160,89,0.2)] rounded-xl p-4 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between text-[#5A4F44]">
                        <span>
                          Base ({bd.nights} notti × {formatPrice(bd.baseNightly)})
                        </span>
                        <span>{formatPrice(bd.baseNightly * bd.nights)}</span>
                      </div>
                      {bd.seasonalMultiplier !== 1 && (
                        <div className="flex justify-between text-[#C5A059]">
                          <span>{bd.seasonalLabel}</span>
                          <span>×{bd.seasonalMultiplier.toFixed(2)}</span>
                        </div>
                      )}
                      {bd.upgradeTotal > 0 && (
                        <div className="flex justify-between text-[#5A4F44]">
                          <span>Upgrade</span>
                          <span>+{formatPrice(bd.upgradeTotal)}</span>
                        </div>
                      )}
                      {bd.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>{bd.discountLabel}</span>
                          <span>-{formatPrice(bd.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-[#1C1C1C] pt-1.5 border-t border-[rgba(197,160,89,0.2)]">
                        <span>Totale stimato</span>
                        <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">
                          {formatPrice(bd.total)}
                        </span>
                      </div>
                    </div>
                  )
                })()}

              {upgradeTotal > 0 && !(range?.from && range?.to) && (
                <div className="mb-4 text-sm space-y-1">
                  <div className="flex justify-between text-[#5A4F44] font-light">
                    <span>Base</span>
                    <span className="font-[family-name:var(--font-family-mono)]">{formatPrice(listing.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#5A4F44] font-light">
                    <span>Upgrade</span>
                    <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">+{formatPrice(upgradeTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#1C1C1C] font-medium pt-2 border-t border-[rgba(197,160,89,0.18)] mt-2">
                    <span>Totale stimato</span>
                    <span className="font-[family-name:var(--font-family-mono)]">{formatPrice(listing.price + upgradeTotal)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setModalOpen(true)}
                className="btn-ripple w-full bg-[#C5A059] text-white py-3.5 rounded-xl text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] mb-3"
              >
                Richiedi Disponibilità
              </button>

              <button
                onClick={() => setGiftOpen(true)}
                className="w-full flex items-center justify-center gap-2 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] py-2.5 rounded-xl text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors mb-3"
              >
                <Gift size={13} /> Regala questa esperienza
              </button>

              <p className="text-[11px] text-[#5A4F44] text-center font-light leading-relaxed mb-3">
                Risposta entro 2 ore. Nessun pagamento anticipato.
              </p>

              {range?.from && range?.to && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadICS({
                        title: listing.title,
                        description: listing.description.slice(0, 100),
                        location: listing.location,
                        start: range.from!,
                        end: range.to!,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-xs py-2.5 rounded-xl hover:border-[#C5A059] transition-colors"
                  >
                    <Calendar size={12} /> Calendario
                  </button>
                  <a
                    href={googleCalendarUrl({
                      title: listing.title,
                      details: listing.description.slice(0, 100),
                      location: listing.location,
                      start: range.from!,
                      end: range.to!,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-xs py-2.5 rounded-xl hover:border-[#C5A059] transition-colors"
                  >
                    Google Cal
                  </a>
                  <a
                    href={`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(listing.title)}&location=${encodeURIComponent(listing.location)}&body=${encodeURIComponent('Prenotazione via the Class')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-xs py-2.5 rounded-xl hover:border-[#C5A059] transition-colors"
                  >
                    Outlook
                  </a>
                </div>
              )}

              {range?.from && !range?.to && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.18)]"
                >
                  <p className="text-[11px] text-[#5A4F44] font-light">
                    <span className="text-[#1C1C1C] font-medium block mb-0.5">Data inizio selezionata</span>
                    {range.from.toLocaleDateString('it-IT')}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[rgba(197,160,89,0.2)] px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div>
          <p className="font-[family-name:var(--font-family-mono)] text-base font-bold text-[#1C1C1C]">
            {formatPrice(listing.price)}
          </p>
          <p className="text-[10px] text-[#5A4F44]">/ {listing.priceUnit}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex-1 bg-[#C5A059] text-white py-3 rounded-xl text-sm tracking-wide hover:bg-[#b8924a] transition-colors"
        >
          Richiedi
        </button>
      </div>

      <RequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        listing={listing}
        defaultDates={range}
        preselectedUpgrades={selectedUpgrades}
      />

      {giftOpen && <GiftModal listing={listing} onClose={() => setGiftOpen(false)} />}
      {arOpen && <ARPreviewModal image={listing.image} title={listing.title} onClose={() => setArOpen(false)} />}
    </div>
  )
}
