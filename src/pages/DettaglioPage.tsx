import { useState, useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Check, Heart, Sparkles, Calendar, Share2 } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { it } from 'date-fns/locale'
import { listings, getCategoryLabel } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { RequestModal } from '@/components/RequestModal'
import { ReviewSection } from '@/components/ReviewSection'
import { getDynamicPrice } from '@/lib/pricing'
import { downloadICS, googleCalendarUrl } from '@/lib/calendar'
import { formatPrice, cn } from '@/lib/utils'

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

export function DettaglioPage() {
  const { id } = useParams({ from: '/servizi/$id' })
  const listing = listings.find(l => l.id === id)
  const [range, setRange] = useState<DateRange>()
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const { toggle, isFavorite } = useFavorites()
  const [heartAnim, setHeartAnim] = useState(false)
  const disabled = useMemo(() => (listing ? getDisabledDates(listing.id) : []), [id])

  if (!listing) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#1C1C1C] mb-4">
            Servizio non trovato
          </p>
          <Link to="/servizi" className="text-[#C5A059] text-sm underline">Torna ai servizi</Link>
        </div>
      </div>
    )
  }

  const fav = isFavorite(listing.id)
  const upgradeTotal = listing.upgrades
    .filter(u => selectedUpgrades.includes(u.id))
    .reduce((s, u) => s + u.price, 0)

  const handleHeart = () => {
    toggle(listing.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 500)
  }

  const toggleUpgrade = (id: string) =>
    setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      {/* Hero */}
      <div className="relative h-[52vh] overflow-hidden">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F2] via-[#1C1C1C]/25 to-[#1C1C1C]/55" />

        <Link to="/servizi"
          className="absolute top-6 left-6 glass-dark flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs hover:bg-white/20 transition-colors">
          <ArrowLeft size={13} /> Tutti i servizi
        </Link>

        <button onClick={handleHeart}
          className="absolute top-6 right-6 glass-dark w-9 h-9 flex items-center justify-center rounded-full">
          <Heart size={15} className={cn('transition-all', heartAnim && 'heart-pop', fav ? 'fill-[#C5A059] text-[#C5A059]' : 'text-white')} />
        </button>

        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={() => navigator.share({ title: listing.title, url: window.location.href })}
            className="absolute top-6 right-20 glass-dark w-9 h-9 flex items-center justify-center rounded-full"
          >
            <Share2 size={14} className="text-white" />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-14 pb-8">
          <span className="glass text-[11px] font-medium px-2.5 py-1 rounded-full text-[#1C1C1C] inline-block mb-3">
            {getCategoryLabel(listing.category)}
          </span>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-white tracking-tight">
            {listing.title}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
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
            </div>

            {/* Description */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Il servizio
              </h2>
              <p className="text-[#5A4F44] font-light leading-relaxed">{listing.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Caratteristiche
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border border-[#C5A059] flex items-center justify-center shrink-0">
                      <Check size={9} className="text-[#C5A059]" />
                    </div>
                    <span className="text-sm text-[#5A4F44] font-light">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
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
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
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
              <p className="text-sm text-[#5A4F44] font-light mb-5">
                Aggiungi esperienze straordinarie
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.upgrades.map(up => {
                  const sel = selectedUpgrades.includes(up.id)
                  return (
                    <motion.div
                      key={up.id} whileHover={{ y: -2 }}
                      onClick={() => toggleUpgrade(up.id)}
                      className={cn(
                        'cursor-pointer rounded-2xl border transition-all duration-200',
                        sel ? 'border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.12)]' : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.4)]',
                      )}
                    >
                      <div className="flex gap-4 p-4">
                        <img src={up.image} alt={up.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-[#1C1C1C] leading-tight">{up.name}</h4>
                            <div className={cn(
                              'w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors',
                              sel ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]',
                            )}>
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

              {range?.from && range?.to && (() => {
                const bd = getDynamicPrice(listing, range.from, range.to, selectedUpgrades)
                return (
                  <div className="bg-[#FCFAF5] border border-[rgba(197,160,89,0.2)] rounded-xl p-4 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between text-[#5A4F44]">
                      <span>Base ({bd.nights} notti × {formatPrice(bd.baseNightly)})</span>
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
                      <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">{formatPrice(bd.total)}</span>
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

              <p className="text-[11px] text-[#5A4F44] text-center font-light leading-relaxed mb-3">
                Risposta entro 2 ore. Nessun pagamento anticipato.
              </p>

              {range?.from && range?.to && (
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadICS({
                      title: listing.title,
                      description: listing.description.slice(0, 100),
                      location: listing.location,
                      start: range.from!,
                      end: range.to!,
                    })}
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
                </div>
              )}

              {range?.from && !range?.to && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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

      <RequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        listing={listing}
        defaultDates={range}
        preselectedUpgrades={selectedUpgrades}
      />
    </div>
  )
}
