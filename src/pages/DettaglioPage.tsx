import { useState, useMemo } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Check, Heart, Sparkles } from 'lucide-react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { it } from 'date-fns/locale'
import { listings, upgradeOptions, getCategoryLabel } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { RequestModal } from '@/components/RequestModal'
import { formatPrice, cn } from '@/lib/utils'
import 'react-day-picker/style.css'

function getDisabledDates(seed: string): Date[] {
  // Deterministic pseudo-random disabled dates based on listing ID
  const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const dates: Date[] = []
  const now = new Date()
  for (let i = 1; i < 60; i++) {
    if ((hash * i) % 7 < 2) {
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
  const [dateRange, setDateRange] = useState<DateRange>()
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const { toggle, isFavorite } = useFavorites()
  const [heartAnim, setHeartAnim] = useState(false)

  const disabledDates = useMemo(() => (listing ? getDisabledDates(listing.id) : []), [id])

  if (!listing) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#1C1C1C] mb-4">
            Servizio non trovato
          </p>
          <Link to="/servizi" className="text-[#C5A059] underline text-sm">
            Torna ai servizi
          </Link>
        </div>
      </div>
    )
  }

  const fav = isFavorite(listing.id)
  const upgradeTotal = upgradeOptions.filter(u => selectedUpgrades.includes(u.id)).reduce((s, u) => s + u.price, 0)

  const handleHeart = () => {
    toggle(listing.id)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 500)
  }

  const toggleUpgrade = (id: string) => {
    setSelectedUpgrades(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      {/* Hero image */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F2] via-[#1C1C1C]/30 to-[#1C1C1C]/50" />

        {/* Back button */}
        <Link
          to="/servizi"
          className="absolute top-6 left-6 glass flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={14} />
          Tutti i servizi
        </Link>

        {/* Heart */}
        <button
          onClick={handleHeart}
          className="absolute top-6 right-6 glass w-10 h-10 flex items-center justify-center rounded-full"
        >
          <Heart
            size={16}
            className={cn(
              'transition-all',
              heartAnim && 'heart-pop',
              fav ? 'fill-[#C5A059] text-[#C5A059]' : 'text-white'
            )}
          />
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-12 pb-8">
          <span className="inline-block glass text-xs font-medium px-3 py-1 rounded-full text-[#1C1C1C] mb-3">
            {getCategoryLabel(listing.category)}
          </span>
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl md:text-5xl font-medium text-white tracking-tight">
            {listing.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="lg:col-span-2 space-y-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-[rgba(197,160,89,0.2)]">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-[#C5A059]" />
                <span className="text-sm text-[#5A4F44] font-light">{listing.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-[#C5A059] text-[#C5A059]" />
                <span className="text-sm text-[#1C1C1C] font-medium">{listing.rating}</span>
                <span className="text-sm text-[#5A4F44]">({listing.reviews} recensioni)</span>
              </div>
              {listing.trending && (
                <span className="bg-[#C5A059] text-white text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Trending
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Il servizio
              </h2>
              <p className="text-[#5A4F44] font-light leading-relaxed text-base">
                {listing.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-4">
                Caratteristiche
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border border-[#C5A059] flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-[#C5A059]" />
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
              <div className="bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.2)] p-6 flex justify-center">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={[{ before: new Date() }, ...disabledDates]}
                  locale={it}
                  showOutsideDays={false}
                  style={{
                    '--rdp-accent-color': '#C5A059',
                    '--rdp-accent-background-color': 'rgba(197,160,89,0.1)',
                  } as React.CSSProperties}
                />
              </div>
              {dateRange?.from && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[#5A4F44] mt-3 font-light"
                >
                  Selezionato: <span className="text-[#1C1C1C] font-medium">
                    {dateRange.from.toLocaleDateString('it-IT')}
                    {dateRange.to && ` – ${dateRange.to.toLocaleDateString('it-IT')}`}
                  </span>
                </motion.p>
              )}
            </div>

            {/* Upgrades */}
            <div>
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-[#C5A059]" />
                Upgrade Esclusivi
              </h2>
              <p className="text-sm text-[#5A4F44] font-light mb-5">
                Aggiungi esperienze straordinarie al tuo servizio
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upgradeOptions.map(up => {
                  const selected = selectedUpgrades.includes(up.id)
                  return (
                    <motion.div
                      key={up.id}
                      whileHover={{ y: -2 }}
                      onClick={() => toggleUpgrade(up.id)}
                      className={cn(
                        'relative cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200',
                        selected
                          ? 'border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.15)]'
                          : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)]'
                      )}
                    >
                      <div className="flex gap-4 p-4">
                        <img
                          src={up.image}
                          alt={up.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-[#1C1C1C]">{up.name}</h4>
                            <div className={cn(
                              'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                              selected ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]'
                            )}>
                              {selected && <Check size={10} className="text-white" />}
                            </div>
                          </div>
                          <p className="text-xs text-[#5A4F44] font-light mt-1">{up.description}</p>
                          <p className="font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059] mt-2">
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

          {/* Right – Booking sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.25)] p-6 shadow-[0_4px_24px_rgba(197,160,89,0.08)]">
              <div className="mb-4 pb-4 border-b border-[rgba(197,160,89,0.2)]">
                <span className="font-[family-name:var(--font-family-mono)] text-3xl text-[#1C1C1C]">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-sm text-[#5A4F44] font-light ml-2">/ {listing.priceUnit}</span>
              </div>

              {upgradeTotal > 0 && (
                <div className="mb-4 text-sm">
                  <div className="flex justify-between text-[#5A4F44] font-light">
                    <span>Prezzo base</span>
                    <span className="font-[family-name:var(--font-family-mono)]">{formatPrice(listing.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#5A4F44] font-light">
                    <span>Upgrade</span>
                    <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">+{formatPrice(upgradeTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#1C1C1C] font-medium mt-2 pt-2 border-t border-[rgba(197,160,89,0.2)]">
                    <span>Totale stimato</span>
                    <span className="font-[family-name:var(--font-family-mono)]">{formatPrice(listing.price + upgradeTotal)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setModalOpen(true)}
                className="w-full bg-[#C5A059] text-white py-4 rounded-xl font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] mb-3"
              >
                Richiedi Disponibilità
              </button>

              <p className="text-xs text-[#5A4F44] text-center font-light leading-relaxed">
                Risposta garantita entro 2 ore.
                <br />Nessun pagamento anticipato richiesto.
              </p>

              {dateRange?.from && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)]"
                >
                  <p className="text-xs text-[#5A4F44] font-light">
                    <span className="text-[#1C1C1C] font-medium block mb-0.5">Date selezionate</span>
                    {dateRange.from.toLocaleDateString('it-IT')}
                    {dateRange.to && ` – ${dateRange.to.toLocaleDateString('it-IT')}`}
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
        defaultDates={dateRange}
        selectedUpgrades={selectedUpgrades}
      />
    </div>
  )
}
