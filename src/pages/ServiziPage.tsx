import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin, ChevronDown, RotateCcw, Map } from 'lucide-react'
import { listings, type Category, getCategoryLabel } from '@/data/listings'
import { ServiceCard } from '@/components/ServiceCard'
import { cn } from '@/lib/utils'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'

const ALL_CATEGORIES: Category[] = ['yacht', 'jet', 'auto', 'esperienza', 'fractional', 'concierge', 'staff', 'asta']
const ALL_LOCATIONS = [...new Set(listings.map(l => l.location.split(',')[1]?.trim() || l.location))]

function MapModal({ open, onClose, listingsFiltered }: { open: boolean; onClose: () => void; listingsFiltered: typeof listings }) {
  if (!open) return null

  const categoryCounts = listingsFiltered.reduce((acc, l) => {
    const key = l.location.split(',')[0]
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Simple SVG Mediterranean map markers
  const markers = [
    { name: 'Portofino', x: 200, y: 200 },
    { name: 'Milano', x: 210, y: 155 },
    { name: 'Roma', x: 240, y: 260 },
    { name: 'Firenze', x: 220, y: 230 },
    { name: 'Venezia', x: 250, y: 175 },
    { name: 'Sardegna', x: 195, y: 300 },
    { name: 'Lago di Como', x: 200, y: 150 },
    { name: 'Dolomiti', x: 245, y: 155 },
    { name: 'Maranello', x: 220, y: 215 },
    { name: 'Ginevra', x: 170, y: 155 },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FDF9F2] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.3)] shadow-2xl max-w-2xl w-full"
        >
          <div className="px-6 py-4 border-b border-[rgba(197,160,89,0.2)] flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]">
              Mappa – {listingsFiltered.length} risultati
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(197,160,89,0.1)]">
              <X size={16} className="text-[#5A4F44]" />
            </button>
          </div>
          <div className="p-6">
            <svg viewBox="100 100 250 300" className="w-full h-72 bg-[#1C2840] rounded-xl" xmlns="http://www.w3.org/2000/svg">
              {/* Simple sea */}
              <rect x="100" y="100" width="250" height="300" fill="#1C2840" />
              {/* Italy silhouette simplified */}
              <path d="M185 130 L220 130 L240 160 L250 190 L260 230 L270 270 L265 290 L255 285 L240 260 L230 240 L220 220 L215 200 L205 180 L200 160 L185 140 Z" fill="#2A4060" opacity="0.5" />
              {/* Water label */}
              <text x="160" y="250" fill="rgba(197,160,89,0.4)" fontSize="10" fontFamily="serif">Mediterraneo</text>

              {markers.map(m => {
                const count = categoryCounts[m.name] || 0
                if (count === 0) return null
                return (
                  <g key={m.name}>
                    <circle cx={m.x} cy={m.y} r={8 + count * 2} fill="rgba(197,160,89,0.2)" />
                    <circle cx={m.x} cy={m.y} r={6} fill="#C5A059" />
                    <text x={m.x} y={m.y + 4} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">{count}</text>
                    <text x={m.x} y={m.y + 16} textAnchor="middle" fill="rgba(197,160,89,0.8)" fontSize="7">{m.name}</text>
                  </g>
                )
              })}
            </svg>
            <p className="text-xs text-[#5A4F44] text-center mt-3 font-light italic">
              I marker mostrano il numero di annunci per area geografica
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#FCFAF5] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.1)] animate-pulse">
      <div className="h-56 bg-[rgba(197,160,89,0.08)]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[rgba(197,160,89,0.08)] rounded w-3/4" />
        <div className="h-3 bg-[rgba(197,160,89,0.06)] rounded w-1/2" />
        <div className="h-4 bg-[rgba(197,160,89,0.08)] rounded w-1/3" />
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const maxPrice = 130000

  // Simulate skeleton loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const toggleCat = useCallback((cat: Category) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }, [])

  const activeFilters = selectedCats.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + (location ? 1 : 0)

  const resetFilters = () => {
    setSelectedCats([])
    setPriceRange([0, maxPrice])
    setLocation('')
  }

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (selectedCats.length > 0 && !selectedCats.includes(l.category)) return false
      if (l.price < priceRange[0] || l.price > priceRange[1]) return false
      if (location && !l.location.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
  }, [selectedCats, priceRange, location])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      {/* Header */}
      <div className="bg-[#FCFAF5] border-b border-[rgba(197,160,89,0.2)] px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-2">
            Catalogo completo
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            I nostri servizi
          </h1>
          <p className="text-[#5A4F44] font-light">
            {filtered.length} esperienze selezionate per te
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={cn(
            'lg:w-72 flex-shrink-0',
            'hidden lg:block',
          )}>
            <div className="sticky top-20 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.2)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#C5A059]" />
                  Filtri
                  {activeFilters > 0 && (
                    <span className="bg-[#C5A059] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </h3>
                {activeFilters > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#5A4F44] flex items-center gap-1 hover:text-[#C5A059] transition-colors"
                  >
                    <RotateCcw size={10} />
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Categoria</p>
                <div className="space-y-2">
                  {ALL_CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => toggleCat(cat)}
                        className={cn(
                          'w-4 h-4 rounded border flex-shrink-0 cursor-pointer transition-all duration-150 flex items-center justify-center',
                          selectedCats.includes(cat)
                            ? 'bg-[#C5A059] border-[#C5A059]'
                            : 'border-[rgba(197,160,89,0.4)] group-hover:border-[#C5A059]'
                        )}
                      >
                        {selectedCats.includes(cat) && (
                          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                            <path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-light cursor-pointer',
                          selectedCats.includes(cat) ? 'text-[#1C1C1C]' : 'text-[#5A4F44]'
                        )}
                        onClick={() => toggleCat(cat)}
                      >
                        {getCategoryLabel(cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Prezzo</p>
                <Slider.Root
                  value={priceRange}
                  onValueChange={v => setPriceRange(v as [number, number])}
                  min={0}
                  max={maxPrice}
                  step={500}
                  className="relative flex items-center select-none touch-none w-full h-5 mb-3"
                >
                  <Slider.Track className="bg-[rgba(197,160,89,0.2)] relative grow rounded-full h-0.5">
                    <Slider.Range className="absolute bg-[#C5A059] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full focus:outline-none hover:scale-110 transition-transform cursor-pointer" />
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full focus:outline-none hover:scale-110 transition-transform cursor-pointer" />
                </Slider.Root>
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44]">
                    €{priceRange[0].toLocaleString('it-IT')}
                  </span>
                  <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44]">
                    €{priceRange[1].toLocaleString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Destinazione</p>
                <div className="relative">
                  <MapPin size={12} className="absolute left-3 top-3.5 text-[#C5A059]" />
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Es: Milano, Portofino..."
                    className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl pl-8 pr-3 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                  {location && (
                    <button onClick={() => setLocation('')} className="absolute right-3 top-3">
                      <X size={12} className="text-[#5A4F44]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Listings */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#5A4F44] font-light">
                <span className="font-[family-name:var(--font-family-mono)] text-[#1C1C1C]">{filtered.length}</span> risultati
              </p>
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-2 glass px-4 py-2 rounded-full text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
              >
                <Map size={12} />
                Mostra mappa
              </button>
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filtered.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                      <p className="font-[family-name:var(--font-family-serif)] text-[#5A4F44] italic text-xl mb-2">
                        Nessun risultato trovato
                      </p>
                      <p className="text-sm text-[#5A4F44] font-light mb-4">
                        Modifica i filtri per espandere la ricerca
                      </p>
                      <button
                        onClick={resetFilters}
                        className="text-sm text-[#C5A059] underline"
                      >
                        Azzera filtri
                      </button>
                    </div>
                  ) : (
                    filtered.map((listing, i) => (
                      <ServiceCard key={listing.id} listing={listing} delay={i * 0.04} />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <MapModal open={showMap} onClose={() => setShowMap(false)} listingsFiltered={filtered} />
    </div>
  )
}
