import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin, RotateCcw, Map } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { listings, type Category, getCategoryLabel, ALL_CATEGORIES } from '@/data/listings'
import { ServiceCard } from '@/components/ServiceCard'
import { cn } from '@/lib/utils'
import * as Slider from '@radix-ui/react-slider'

// ── Map Modal ──
function MapModal({ open, onClose, count }: { open: boolean; onClose: () => void; count: number }) {
  if (!open) return null

  const markers = [
    { name: 'Milano', x: 212, y: 148 },
    { name: 'Portofino', x: 196, y: 196 },
    { name: 'Lago di Como', x: 200, y: 142 },
    { name: 'Venezia', x: 248, y: 170 },
    { name: 'Firenze', x: 222, y: 225 },
    { name: 'Roma', x: 238, y: 262 },
    { name: 'Napoli', x: 255, y: 302 },
    { name: 'Sardegna', x: 190, y: 295 },
    { name: 'Ginevra', x: 170, y: 148 },
    { name: 'Dolomiti', x: 240, y: 150 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.3)] shadow-[0_24px_64px_rgba(26,24,22,0.13)] max-w-lg w-full overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[rgba(197,160,89,0.2)] flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]">
            Mappa — {count} risultati
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[rgba(197,160,89,0.1)] transition-colors">
            <X size={14} className="text-[#5A4F44]" />
          </button>
        </div>
        <div className="p-5">
          <svg viewBox="100 100 250 280" className="w-full h-64 rounded-xl bg-[#1a2d4a]">
            <defs>
              <radialGradient id="sea" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3558" />
                <stop offset="100%" stopColor="#0f1e35" />
              </radialGradient>
            </defs>
            <rect x="100" y="100" width="250" height="280" fill="url(#sea)" />
            {/* Simplified Italy */}
            <path
              d="M188 128 L222 128 L242 156 L252 185 L262 225 L270 265 L268 288 L255 283 L242 258 L232 238 L220 218 L214 196 L206 175 L200 155 Z"
              fill="#2a4060" fillOpacity="0.6"
            />
            <text x="165" y="240" fill="rgba(197,160,89,0.3)" fontSize="8" fontStyle="italic">
              Mediterraneo
            </text>
            {markers.map((m, i) => (
              <g key={m.name}>
                <circle cx={m.x} cy={m.y} r={5} fill="#C5A059" fillOpacity="0.9" />
                <circle cx={m.x} cy={m.y} r={10} fill="#C5A059" fillOpacity="0.15" />
                <text x={m.x + 7} y={m.y + 4} fill="rgba(197,160,89,0.75)" fontSize="6">
                  {m.name}
                </text>
              </g>
            ))}
          </svg>
          <p className="text-xs text-[#5A4F44] text-center mt-3 font-light italic">
            Annunci attivi nelle principali destinazioni
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#FCFAF5] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.08)] animate-pulse">
      <div className="h-56 bg-[rgba(197,160,89,0.07)]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[rgba(197,160,89,0.07)] rounded w-3/4" />
        <div className="h-3 bg-[rgba(197,160,89,0.05)] rounded w-1/2" />
        <div className="h-4 bg-[rgba(197,160,89,0.07)] rounded w-1/3" />
      </div>
    </div>
  )
}

export function ServiziPage() {
  const [selectedCats, setSelectedCats] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 130000])
  const [location, setLocation] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(t)
  }, [])

  // Sync with URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cats = params.get('cats')
    if (cats) setSelectedCats(cats.split(',') as Category[])
    const min = params.get('price_min')
    const max = params.get('price_max')
    if (min || max) setPriceRange([Number(min) || 0, Number(max) || 130000])
    const loc = params.get('loc')
    if (loc) setLocation(loc)
  }, [])

  const toggleCat = useCallback((cat: Category) => {
    setSelectedCats(prev => {
      const next = prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      const params = new URLSearchParams(window.location.search)
      if (next.length) params.set('cats', next.join(','))
      else params.delete('cats')
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
      return next
    })
  }, [])

  const activeFilters =
    selectedCats.length +
    (priceRange[0] > 0 || priceRange[1] < 130000 ? 1 : 0) +
    (location ? 1 : 0)

  const resetFilters = () => {
    setSelectedCats([])
    setPriceRange([0, 130000])
    setLocation('')
    window.history.replaceState({}, '', window.location.pathname)
  }

  const filtered = useMemo(() => listings.filter(l => {
    if (selectedCats.length && !selectedCats.includes(l.category)) return false
    if (l.price < priceRange[0] || l.price > priceRange[1]) return false
    if (location && !l.location.toLowerCase().includes(location.toLowerCase())) return false
    return true
  }), [selectedCats, priceRange, location])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      <Helmet>
        <title>Servizi Luxury — Yacht, Jet, Auto, Esperienze | the Class</title>
        <meta name="description" content="Scopri il catalogo esclusivo di the Class: yacht da charter, jet privati, auto di lusso e esperienze uniche in tutto il mondo." />
      </Helmet>
      {/* Page header */}
      <div className="bg-[#FCFAF5] border-b border-[rgba(197,160,89,0.18)] px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-2">
            Catalogo completo
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-2">
            I nostri servizi
          </h1>
          <p className="text-[#5A4F44] font-light text-sm">
            {filtered.length} esperienze selezionate
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)] p-6">
              {/* Title + reset */}
              <div className="flex items-center justify-between mb-5">
                <span className="flex items-center gap-2 font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C]">
                  <SlidersHorizontal size={13} className="text-[#C5A059]" />
                  Filtri
                  {activeFilters > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#C5A059] text-white text-[9px] flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </span>
                {activeFilters > 0 && (
                  <button onClick={resetFilters} className="text-[11px] text-[#5A4F44] flex items-center gap-1 hover:text-[#C5A059] transition-colors">
                    <RotateCcw size={9} /> Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3">Categoria</p>
                <div className="space-y-2">
                  {ALL_CATEGORIES.map(cat => (
                    <label key={cat} onClick={() => toggleCat(cat)} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={cn(
                        'w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center transition-colors',
                        selectedCats.includes(cat) ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.38)] group-hover:border-[#C5A059]',
                      )}>
                        {selectedCats.includes(cat) && (
                          <svg viewBox="0 0 10 10" className="w-2 h-2">
                            <path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        'text-sm font-light',
                        selectedCats.includes(cat) ? 'text-[#1C1C1C]' : 'text-[#5A4F44]',
                      )}>
                        {getCategoryLabel(cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div className="mb-6">
                <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3">Prezzo</p>
                <Slider.Root
                  value={priceRange}
                  onValueChange={v => setPriceRange(v as [number, number])}
                  min={0} max={130000} step={1000}
                  className="relative flex items-center select-none touch-none w-full h-5 mb-3"
                >
                  <Slider.Track className="bg-[rgba(197,160,89,0.18)] relative grow rounded-full h-[2px]">
                    <Slider.Range className="absolute bg-[#C5A059] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full focus:outline-none hover:scale-110 transition-transform cursor-pointer shadow-sm" />
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full focus:outline-none hover:scale-110 transition-transform cursor-pointer shadow-sm" />
                </Slider.Root>
                <div className="flex justify-between">
                  <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-[#5A4F44]">
                    €{priceRange[0].toLocaleString('it-IT')}
                  </span>
                  <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-[#5A4F44]">
                    €{priceRange[1].toLocaleString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5">Destinazione</p>
                <div className="relative">
                  <MapPin size={11} className="absolute left-3 top-3 text-[#C5A059]" />
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Milano, Portofino..."
                    className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl pl-7.5 pr-8 py-2.5 text-xs text-[#1C1C1C] placeholder:text-[#5A4F44]/38 focus:outline-none focus:border-[#C5A059] transition-colors"
                    style={{ paddingLeft: '1.75rem' }}
                  />
                  {location && (
                    <button onClick={() => setLocation('')} className="absolute right-2.5 top-2.5">
                      <X size={11} className="text-[#5A4F44]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Grid ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#5A4F44] font-light">
                <span className="font-[family-name:var(--font-family-mono)] text-[#1C1C1C]">{filtered.length}</span> risultati
              </p>
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 glass px-3.5 py-2 rounded-full text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
              >
                <Map size={12} /> Mostra mappa
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  aria-live="polite" aria-label="Risultati filtrati"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                      <p className="font-[family-name:var(--font-family-serif)] text-[#5A4F44] italic text-xl mb-3">
                        Nessun risultato
                      </p>
                      <button onClick={resetFilters} className="text-sm text-[#C5A059] underline">
                        Azzera filtri
                      </button>
                    </div>
                  ) : (
                    filtered.map((l, i) => <ServiceCard key={l.id} listing={l} delay={i * 0.04} />)
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <MapModal open={showMap} onClose={() => setShowMap(false)} count={filtered.length} />
      </AnimatePresence>
    </div>
  )
}
