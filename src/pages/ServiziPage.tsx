import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin, RotateCcw, Map, LayoutGrid, List as ListIcon, ArrowUpDown, ChevronDown, Clock, Search, Package } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { listings, type Category, getCategoryLabel, ALL_CATEGORIES } from '@/data/listings'
import { ServiceCard } from '@/components/ServiceCard'
import { cn } from '@/lib/utils'
import * as Slider from '@radix-ui/react-slider'
import { useComparison } from '@/hooks/useComparison'
import { CompareBar } from '@/components/CompareBar'
import { CompareModal } from '@/components/CompareModal'
import { List } from 'react-window'
import type { CSSProperties } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { Link } from '@tanstack/react-router'

// ─── Currency rates ───────────────────────────────────────────────────────────
type CurrencyKey = 'EUR' | 'USD' | 'GBP' | 'CHF'
const CURRENCY_RATES: Record<CurrencyKey, number> = { EUR: 1, USD: 1.08, GBP: 0.86, CHF: 0.97 }
const CURRENCY_SYMBOLS: Record<CurrencyKey, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }

// ─── Deterministic social proof numbers ──────────────────────────────────────
function seenCount(id: string): number {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 3 + (hash % 45)
}

// ─── New listings (first 3 by index) ─────────────────────────────────────────
const NEW_LISTING_IDS = new Set(listings.slice(0, 3).map(l => l.id))

// ─── Instant booking IDs (simulate 3) ────────────────────────────────────────
const INSTANT_IDS = new Set(listings.slice(3, 6).map(l => l.id))

// ─── Certified IDs (5 listings) ──────────────────────────────────────────────
const CERTIFIED_IDS = new Set(listings.slice(0, 5).map(l => l.id))

// ─── Types ───────────────────────────────────────────────────────────────────
type SortKey = 'default' | 'price_asc' | 'price_desc' | 'rating' | 'trending'
type ViewMode = 'grid' | 'list'
type ListingItem = (typeof listings)[number]

// ─── Quick Preview Hover Card ─────────────────────────────────────────────────
function QuickPreview({ listing, onClose }: { listing: ListingItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute z-40 top-0 left-full ml-3 w-72 bg-white rounded-2xl border border-[rgba(197,160,89,0.25)] shadow-[0_12px_40px_rgba(26,24,22,0.15)] overflow-hidden pointer-events-auto"
      onMouseLeave={onClose}
    >
      <div className="h-40 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/288x160/1a2d4a/C5A059?text=The+Class' }}
        />
      </div>
      <div className="p-4">
        <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-1 leading-tight">
          {listing.title}
        </h4>
        <p className="text-[11px] text-[#5A4F44] font-light line-clamp-2 mb-3">{listing.description}</p>
        {listing.features.slice(0, 3).map(f => (
          <div key={f} className="flex items-center gap-1.5 mb-1">
            <span className="w-1 h-1 rounded-full bg-[#C5A059] shrink-0" />
            <span className="text-[10px] text-[#5A4F44]">{f}</span>
          </div>
        ))}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(197,160,89,0.15)]">
          <span className="font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059]">
            €{listing.price.toLocaleString('it-IT')}
          </span>
          <Link
            to="/servizi/$id"
            params={{ id: listing.id }}
            className="text-[10px] px-3 py-1.5 rounded-full bg-[#C5A059] text-white hover:bg-[#b8924a] transition-colors"
          >
            Dettagli →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Card with hover preview wrapper ─────────────────────────────────────────
function CardWithPreview({ listing, compareSelected, onCompareToggle, currency }: {
  listing: ListingItem
  compareSelected: boolean
  onCompareToggle: () => void
  currency: CurrencyKey
}) {
  const [showPreview, setShowPreview] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [packageIds, setPackageIds] = useState<string[]>(() => safeRead<string[]>('theclass_custom_package', []))

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setShowPreview(true), 400)
  }
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShowPreview(false)
  }

  const inPackage = packageIds.includes(listing.id)
  const togglePackage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = inPackage
      ? packageIds.filter(id => id !== listing.id)
      : [...packageIds, listing.id]
    setPackageIds(next)
    safeWrite('theclass_custom_package', next)
  }

  const rate = CURRENCY_RATES[currency]
  const sym = CURRENCY_SYMBOLS[currency]
  const displayPrice = Math.round(listing.price * rate).toLocaleString('it-IT')

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {NEW_LISTING_IDS.has(listing.id) && (
          <span className="bg-emerald-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Nuovo
          </span>
        )}
        {INSTANT_IDS.has(listing.id) && (
          <span className="bg-blue-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            ⚡ Prenota subito
          </span>
        )}
        {CERTIFIED_IDS.has(listing.id) && (
          <span
            className="bg-[#C5A059] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            title="Verificato dal team The Class"
          >
            ✓ Certificato
          </span>
        )}
      </div>

      <ServiceCard
        listing={listing}
        delay={0}
        compareSelected={compareSelected}
        onCompareToggle={onCompareToggle}
      />

      {/* Social proof */}
      <p className="mt-1 text-[10px] text-[#5A4F44]/60 text-center">
        {seenCount(listing.id)} persone lo hanno visto questa settimana
      </p>

      {/* Currency-adjusted price pill */}
      {currency !== 'EUR' && (
        <div className="mt-1 text-center">
          <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059]">
            ≈ {sym}{displayPrice}
          </span>
        </div>
      )}

      {/* Add to package button */}
      <button
        onClick={togglePackage}
        className={cn(
          'mt-2 w-full text-[10px] py-1.5 rounded-full border transition-colors',
          inPackage
            ? 'border-[#C5A059] bg-[rgba(197,160,89,0.1)] text-[#C5A059]'
            : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]',
        )}
      >
        {inPackage ? '✓ Nel pacchetto' : '+ Aggiungi a pacchetto'}
      </button>

      {/* Quick preview on hover (desktop only) */}
      <AnimatePresence>
        {showPreview && (
          <QuickPreview listing={listing} onClose={() => setShowPreview(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Recently Viewed ─────────────────────────────────────────────────────────
const RV_KEY = 'theclass_recently_viewed'

function getRecentlyViewed(): string[] {
  return safeRead<string[]>(RV_KEY, [])
}

// ─── Map Modal ────────────────────────────────────────────────────────────────
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
            <path
              d="M188 128 L222 128 L242 156 L252 185 L262 225 L270 265 L268 288 L255 283 L242 258 L232 238 L220 218 L214 196 L206 175 L200 155 Z"
              fill="#2a4060" fillOpacity="0.6"
            />
            <text x="165" y="240" fill="rgba(197,160,89,0.3)" fontSize="8" fontStyle="italic">
              Mediterraneo
            </text>
            {markers.map((m) => (
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

// ─── Skeleton Card ────────────────────────────────────────────────────────────
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

// ─── List-view row ────────────────────────────────────────────────────────────
function ListingRow({ listing, compareSelected, onCompareToggle }: {
  listing: ListingItem
  compareSelected: boolean
  onCompareToggle: () => void
}) {
  return (
    <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl flex overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-40 shrink-0 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/160x120/1a2d4a/C5A059?text=The+Class' }}
        />
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-medium">{getCategoryLabel(listing.category)}</span>
              <h3 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mt-0.5 leading-tight">{listing.title}</h3>
            </div>
            <p className="font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059] shrink-0">
              €{listing.price.toLocaleString('it-IT')}
            </p>
          </div>
          <p className="text-xs text-[#5A4F44] font-light mt-1 line-clamp-2">{listing.description}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#5A4F44] flex items-center gap-1">
              <MapPin size={10} /> {listing.location}
            </span>
            <span className="text-[11px] text-[#C5A059]">★ {listing.rating}</span>
            <span className="text-[11px] text-[#5A4F44]">{listing.reviews} rec.</span>
          </div>
          <button
            onClick={onCompareToggle}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border transition-colors',
              compareSelected
                ? 'border-[#C5A059] bg-[rgba(197,160,89,0.1)] text-[#C5A059]'
                : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:border-[#C5A059]',
            )}
          >
            {compareSelected ? '✓ Confronta' : '+ Confronta'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Virtual Grid ─────────────────────────────────────────────────────────────
const CARD_HEIGHT = 380
const COLS = 3

interface RowCellProps {
  items: ListingItem[]
  compareSelected: (id: string) => boolean
  onCompareToggle: (id: string) => void
}

function VirtualListRow({
  index,
  style,
  items,
  compareSelected,
  onCompareToggle,
}: {
  index: number
  style: CSSProperties
  items: ListingItem[]
  compareSelected: (id: string) => boolean
  onCompareToggle: (id: string) => void
}) {
  const startIdx = index * COLS
  const rowItems = items.slice(startIdx, startIdx + COLS)
  return (
    <div style={style} className="flex gap-6 pb-6">
      {rowItems.map(l => (
        <div key={l.id} className="flex-1 min-w-0">
          <ServiceCard
            listing={l}
            delay={0}
            compareSelected={compareSelected(l.id)}
            onCompareToggle={() => onCompareToggle(l.id)}
          />
        </div>
      ))}
      {rowItems.length < COLS && Array.from({ length: COLS - rowItems.length }).map((_, i) => (
        <div key={`empty-${i}`} className="flex-1 min-w-0" />
      ))}
    </div>
  )
}

function VirtualGrid({ items, compareSelected, onCompareToggle }: RowCellProps) {
  const rowCount = Math.ceil(items.length / COLS)
  const visibleHeight = Math.min(rowCount * (CARD_HEIGHT + 24), window.innerHeight * 1.8)

  return (
    <List
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT + 24}
      rowComponent={({
        index,
        style,
      }: {
        index: number
        style: CSSProperties
        ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' }
      }) => (
        <VirtualListRow
          index={index}
          style={style}
          items={items}
          compareSelected={compareSelected}
          onCompareToggle={onCompareToggle}
        />
      )}
      rowProps={{}}
      style={{ height: visibleHeight, overflowX: 'hidden' }}
    />
  )
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Consigliati' },
  { key: 'price_asc', label: 'Prezzo ↑' },
  { key: 'price_desc', label: 'Prezzo ↓' },
  { key: 'rating', label: 'Rating' },
  { key: 'trending', label: 'Trending' },
]

// ─── Recently Viewed Strip ────────────────────────────────────────────────────
function RecentlyViewedStrip() {
  const ids = getRecentlyViewed().slice(0, 5)
  const items = ids.map(id => listings.find(l => l.id === id)).filter(Boolean) as ListingItem[]
  if (items.length === 0) return null

  return (
    <div className="mb-8">
      <p className="text-[10px] uppercase tracking-wider text-[#5A4F44] mb-3 flex items-center gap-1.5">
        <Clock size={10} className="text-[#C5A059]" /> Visti di recente
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map(item => (
          <Link
            key={item.id}
            to="/servizi/$id" params={{ id: item.id }}
            className="shrink-0 w-36 rounded-xl border border-[rgba(197,160,89,0.15)] overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-20 object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/144x80/1a2d4a/C5A059?text=TC' }}
            />
            <div className="p-2">
              <p className="text-[10px] font-medium text-[#1C1C1C] line-clamp-2 leading-tight">{item.title}</p>
              <p className="text-[10px] text-[#C5A059] font-[family-name:var(--font-family-mono)] mt-0.5">
                €{item.price.toLocaleString('it-IT')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── AI Search Bar ────────────────────────────────────────────────────────────
function AISearchBar({ onResults }: { onResults: (ids: string[] | null) => void }) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (!query.trim()) { onResults(null); return }
    const q = query.toLowerCase()
    const keywords = q.split(/\s+/)
    const matched = listings.filter(l => {
      const text = `${l.title} ${l.description} ${l.category} ${l.location}`.toLowerCase()
      return keywords.some(k => text.includes(k))
    })
    onResults(matched.map(l => l.id))
  }

  return (
    <div className="mb-6">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-3 text-[#C5A059]" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); if (!e.target.value.trim()) onResults(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Es. 'villa con piscina per 8 persone'"
            className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors shadow-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-[#C5A059] text-white text-sm rounded-xl hover:bg-[#b8924a] transition-colors shrink-0"
        >
          Cerca
        </button>
        {query && (
          <button onClick={() => { setQuery(''); onResults(null) }} className="text-[#5A4F44] hover:text-[#C5A059]">
            <X size={14} />
          </button>
        )}
      </div>
      <p className="text-[10px] text-[#5A4F44]/50 mt-1.5 ml-1">Cerca con parole tue: yacht, coppie, piscina, Roma…</p>
    </div>
  )
}

// ─── Recommendation strip ─────────────────────────────────────────────────────
function RecommendationStrip() {
  const profile = safeRead<string | null>('theclass_quiz_profile', null)
  const [dismissed, setDismissed] = useState(false)
  const profileCategoryMap: Record<string, Category> = {
    adventurer: 'yacht', relaxer: 'villa', explorer: 'esperienza', business: 'jet',
  }
  if (!profile || dismissed) return null
  const cat = profileCategoryMap[profile]
  if (!cat) return null
  const recommended = listings.filter(l => l.category === cat).slice(0, 3)

  return (
    <div className="mb-6 p-4 bg-[rgba(197,160,89,0.07)] border border-[rgba(197,160,89,0.2)] rounded-2xl relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-[#5A4F44] hover:text-[#C5A059] transition-colors"
      >
        <X size={12} />
      </button>
      <p className="text-[10px] uppercase tracking-wider text-[#C5A059] mb-2">In base al tuo profilo:</p>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {recommended.map(l => (
          <Link
            key={l.id}
            to="/servizi/$id"
            params={{ id: l.id }}
            className="shrink-0 flex items-center gap-2.5 bg-white border border-[rgba(197,160,89,0.15)] rounded-xl px-3 py-2 hover:border-[#C5A059] transition-colors"
          >
            <img src={l.image} alt={l.title} className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <p className="text-[10px] font-medium text-[#1C1C1C] line-clamp-1">{l.title}</p>
              <p className="text-[9px] text-[#C5A059]">€{l.price.toLocaleString('it-IT')}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Package sidebar badge ────────────────────────────────────────────────────
function PackageSidebarBadge() {
  const [ids, setIds] = useState<string[]>(() => safeRead<string[]>('theclass_custom_package', []))

  useEffect(() => {
    const interval = setInterval(() => {
      setIds(safeRead<string[]>('theclass_custom_package', []))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (ids.length === 0) return null

  return (
    <div className="mt-6 p-4 bg-[rgba(197,160,89,0.07)] border border-[rgba(197,160,89,0.2)] rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Package size={12} className="text-[#C5A059]" />
        <p className="text-[10px] font-medium text-[#1C1C1C]">Il tuo pacchetto</p>
        <span className="w-4 h-4 rounded-full bg-[#C5A059] text-white text-[9px] flex items-center justify-center">
          {ids.length}
        </span>
      </div>
      <p className="text-[10px] text-[#5A4F44] mb-3">{ids.length} {ids.length === 1 ? 'servizio' : 'servizi'} selezionati</p>
      <Link
        to="/richiesta-su-misura"
        className="block text-center text-[10px] px-3 py-2 rounded-lg bg-[#C5A059] text-white hover:bg-[#b8924a] transition-colors"
      >
        Richiedi preventivo pacchetto →
      </Link>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ServiziPage() {
  const [selectedCats, setSelectedCats] = useState<Category[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 130000])
  const [location, setLocation] = useState('')
  const [minQuality, setMinQuality] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCompare, setShowCompare] = useState(false)
  const [generatedLoaded, setGeneratedLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [sortOpen, setSortOpen] = useState(false)
  const [currency, setCurrency] = useState<CurrencyKey>('EUR')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [aiFilterIds, setAiFilterIds] = useState<string[] | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const currencyRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const { comparing, toggle: toggleCompare, clear: clearCompare, isSelected } = useComparison()

  // 1s skeleton loading on mount + wishlist count
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    // Count wishlist items
    let count = 0
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('theclass_favorites_')) {
        const arr = safeRead<string[]>(k, [])
        count += arr.length
      }
    }
    setWishlistCount(count)
    return () => clearTimeout(t)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
    (location ? 1 : 0) +
    (minQuality > 0 ? 1 : 0)

  const resetFilters = () => {
    setSelectedCats([])
    setPriceRange([0, 130000])
    setLocation('')
    setMinQuality(0)
    window.history.replaceState({}, '', window.location.pathname)
  }

  const removeFilter = (type: 'cat' | 'price' | 'location' | 'quality', value?: Category) => {
    if (type === 'cat' && value) toggleCat(value)
    if (type === 'price') setPriceRange([0, 130000])
    if (type === 'location') setLocation('')
    if (type === 'quality') setMinQuality(0)
  }

  const filtered = useMemo(() => {
    let result = listings.filter(l => {
      if (aiFilterIds !== null && !aiFilterIds.includes(l.id)) return false
      if (selectedCats.length && !selectedCats.includes(l.category)) return false
      if (l.price < priceRange[0] || l.price > priceRange[1]) return false
      if (location && !l.location.toLowerCase().includes(location.toLowerCase())) return false
      if (minQuality > 0 && (l.qualityScore ?? 0) < minQuality) return false
      return true
    })
    if (sortKey === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortKey === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)
    else if (sortKey === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    else if (sortKey === 'trending') result = [...result].sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0))
    return result
  }, [selectedCats, priceRange, location, minQuality, sortKey, aiFilterIds])

  const comparingListings = listings.filter(l => comparing.includes(l.id))

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'Consigliati'

  // Active filter chips
  const filterChips: Array<{ label: string; onRemove: () => void }> = [
    ...selectedCats.map(cat => ({
      label: getCategoryLabel(cat),
      onRemove: () => removeFilter('cat', cat),
    })),
    ...(priceRange[0] > 0 || priceRange[1] < 130000
      ? [{ label: `€${priceRange[0].toLocaleString('it-IT')} – €${priceRange[1].toLocaleString('it-IT')}`, onRemove: () => removeFilter('price') }]
      : []),
    ...(location ? [{ label: `📍 ${location}`, onRemove: () => removeFilter('location') }] : []),
    ...(minQuality > 0 ? [{ label: `Qualità ≥ ${minQuality}`, onRemove: () => removeFilter('quality') }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16">
      <Helmet>
        <title>Servizi Luxury — Yacht, Jet, Auto, Esperienze | the Class</title>
        <meta name="description" content="Scopri il catalogo esclusivo di the Class: yacht da charter, jet privati, auto di lusso e esperienze uniche in tutto il mondo." />
      </Helmet>

      {/* ── 1. Hero section fullwidth con titolo animato ── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1600&q=80"
          alt="Servizi luxury"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ filter: 'brightness(0.45)' }}
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/1600x640/0f1e35/C5A059?text=The+Class' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3"
          >
            Catalogo completo
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-[family-name:var(--font-family-display)] text-5xl md:text-6xl font-medium text-white tracking-tight mb-4"
          >
            I nostri servizi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-white/70 font-light text-sm"
          >
            {listings.length} esperienze selezionate per te
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── 10. Sticky sidebar filtri su desktop ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)] p-6 scrollbar-hide">
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

              {/* ── 7. Price range slider ── */}
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

              {/* Quality filter */}
              <div className="mt-6">
                <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3">Qualità minima</p>
                <Slider.Root
                  value={[minQuality]}
                  onValueChange={v => setMinQuality(v[0])}
                  min={0} max={100} step={5}
                  className="relative flex items-center select-none touch-none w-full h-5 mb-2"
                >
                  <Slider.Track className="bg-[rgba(197,160,89,0.18)] relative grow rounded-full h-[2px]">
                    <Slider.Range className="absolute bg-[#C5A059] rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full focus:outline-none hover:scale-110 transition-transform cursor-pointer shadow-sm" />
                </Slider.Root>
                <div className="flex justify-between">
                  <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-[#5A4F44]">
                    {minQuality > 0 ? `≥ ${minQuality}` : 'Tutti'}
                  </span>
                  <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-[#5A4F44]">100</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Grid ── */}
          <div className="flex-1">

            {/* ── 9. Visti di recente ── */}
            <RecentlyViewedStrip />

            {/* ── 4. Active filter chips ── */}
            {filterChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filterChips.map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-[11px] px-2.5 py-1 rounded-full"
                  >
                    {chip.label}
                    <button onClick={chip.onRemove} className="hover:text-[#C5A059] transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#5A4F44] hover:text-[#C5A059] transition-colors underline"
                >
                  Azzera tutti
                </button>
              </div>
            )}

            {/* Toolbar: count + view toggle + sort + map */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <p className="text-sm text-[#5A4F44] font-light flex-1">
                <span className="font-[family-name:var(--font-family-mono)] text-[#1C1C1C]">{filtered.length}</span> risultati
              </p>

              {/* ── 3. Sort dropdown ── */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(v => !v)}
                  className="flex items-center gap-1.5 glass px-3.5 py-2 rounded-full text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
                >
                  <ArrowUpDown size={11} />
                  {currentSortLabel}
                  <ChevronDown size={10} className={cn('transition-transform', sortOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute right-0 top-full mt-2 bg-white border border-[rgba(197,160,89,0.2)] rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => { setSortKey(opt.key); setSortOpen(false) }}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[rgba(197,160,89,0.07)]',
                            sortKey === opt.key ? 'text-[#C5A059] font-medium' : 'text-[#5A4F44]',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── 2. View toggle Grid/Lista ── */}
              <div className="flex items-center bg-[rgba(197,160,89,0.08)] rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-full transition-colors',
                    viewMode === 'grid' ? 'bg-white shadow-sm text-[#C5A059]' : 'text-[#5A4F44] hover:text-[#C5A059]',
                  )}
                  title="Vista griglia"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-full transition-colors',
                    viewMode === 'list' ? 'bg-white shadow-sm text-[#C5A059]' : 'text-[#5A4F44] hover:text-[#C5A059]',
                  )}
                  title="Vista lista"
                >
                  <ListIcon size={13} />
                </button>
              </div>

              {/* ── 6. Map toggle ── */}
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 glass px-3.5 py-2 rounded-full text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
              >
                <Map size={12} /> Vedi sulla mappa
              </button>
            </div>

            {/* ── 5. Skeleton loading 1s ── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  aria-live="polite" aria-label="Risultati filtrati">
                  {filtered.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="font-[family-name:var(--font-family-serif)] text-[#5A4F44] italic text-xl mb-3">
                        Nessun risultato
                      </p>
                      <button onClick={resetFilters} className="text-sm text-[#C5A059] underline">
                        Azzera filtri
                      </button>
                    </div>
                  ) : viewMode === 'list' ? (
                    /* ── 2. Lista view ── */
                    <div className="space-y-3">
                      {filtered.map(l => (
                        <ListingRow
                          key={l.id}
                          listing={l}
                          compareSelected={isSelected(l.id)}
                          onCompareToggle={() => toggleCompare(l.id)}
                        />
                      ))}
                    </div>
                  ) : filtered.length > 30 ? (
                    <VirtualGrid
                      items={filtered}
                      compareSelected={isSelected}
                      onCompareToggle={toggleCompare}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filtered.map((l, i) => (
                        <ServiceCard
                          key={l.id}
                          listing={l}
                          delay={i * 0.04}
                          compareSelected={isSelected(l.id)}
                          onCompareToggle={() => toggleCompare(l.id)}
                        />
                      ))}
                    </div>
                  )}
                  {!generatedLoaded && viewMode === 'grid' && (
                    <div className="text-center pt-8">
                      <button
                        onClick={() => setGeneratedLoaded(true)}
                        className="px-8 py-3 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                      >
                        Carica altri 200 servizi
                      </button>
                    </div>
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

      {/* ── 8. Compare bar & modal ── */}
      <CompareBar listings={comparingListings} onClear={clearCompare} onCompare={() => setShowCompare(true)} />
      {showCompare && <CompareModal listings={comparingListings} onClose={() => setShowCompare(false)} />}
    </div>
  )
}

// Export helper for other pages to record viewed listings
export function recordRecentlyViewed(id: string) {
  const existing = safeRead<string[]>(RV_KEY, [])
  const next = [id, ...existing.filter(i => i !== id)].slice(0, 5)
  safeWrite(RV_KEY, next)
}
