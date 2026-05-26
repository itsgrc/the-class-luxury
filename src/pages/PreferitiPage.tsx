import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Package, Share2, Printer, ArrowUpDown, StickyNote, Bell, Columns2, Lock, TrendingUp, TrendingDown, Minus, Edit3, Check, X, Download, Map } from 'lucide-react'
import { toast } from 'sonner'
import { listings } from '@/data/listings'
import type { Category } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { ServiceCard } from '@/components/ServiceCard'
import { RequestModal } from '@/components/RequestModal'
import { formatPrice, cn } from '@/lib/utils'
import { safeRead, safeWrite } from '@/lib/errorHandler'

// ─── Price trend (deterministic per listing id) ───────────────────────────────
function priceTrend(id: string): { dir: 'up' | 'down' | 'flat'; pct: number } {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const mod = hash % 3
  if (mod === 0) return { dir: 'up', pct: 5 + (hash % 15) }
  if (mod === 1) return { dir: 'down', pct: 3 + (hash % 12) }
  return { dir: 'flat', pct: 0 }
}

// ─── Category distribution donut (CSS bars) ──────────────────────────────────
function CategoryBreakdown({ cats }: { cats: Partial<Record<Category, number>> }) {
  const COLORS: Record<string, string> = {
    yacht: '#3b82f6', jet: '#8b5cf6', auto: '#f59e0b',
    villa: '#10b981', esperienza: '#ec4899', fractional: '#6366f1',
    concierge: '#14b8a6', staff: '#f97316', asta: '#ef4444',
  }
  const entries = Object.entries(cats) as [Category, number][]
  if (entries.length === 0) return null
  const total = entries.reduce((s, [, v]) => s + v, 0)

  return (
    <div className="mb-8 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)]">
      <p className="text-[10px] uppercase tracking-wider text-[#5A4F44] mb-4">Distribuzione per categoria</p>
      <div className="space-y-2">
        {entries.map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="text-[10px] text-[#5A4F44] w-20 capitalize">{cat}</span>
            <div className="flex-1 h-2 bg-[rgba(197,160,89,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(count / total) * 100}%`, background: COLORS[cat] ?? '#C5A059' }}
              />
            </div>
            <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] w-4 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'recent'

const CATEGORY_LABELS: Record<Category, string> = {
  yacht: 'Yacht',
  jet: 'Jet',
  auto: 'Automobili',
  villa: 'Ville',
  esperienza: 'Esperienze',
  fractional: 'Fractional',
  concierge: 'Concierge',
  staff: 'Staff',
  asta: 'Aste',
}

const CATEGORY_ORDER: Category[] = ['yacht', 'jet', 'auto', 'villa', 'esperienza', 'fractional', 'concierge', 'staff', 'asta']

export function PreferitiPage() {
  const { favorites, clear } = useFavorites()
  const navigate = useNavigate()
  const [bulkModal, setBulkModal] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [sharedIds, setSharedIds] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [notes, setNotes] = useState<Record<string, string>>(() => safeRead('theclass_notes', {}))
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [priceAlerts, setPriceAlerts] = useState<string[]>(() => safeRead('theclass_price_alerts', []))

  // ── New feature states ──────────────────────────────────────────────────────
  const [wishlistPrivate, setWishlistPrivate] = useState<boolean>(() => safeRead('theclass_wishlist_private', false))
  const [wishlistName, setWishlistName] = useState<string>(() => safeRead('theclass_wishlist_name', 'La mia selezione'))
  const [editingName, setEditingName] = useState(false)
  const [availabilityAlerts, setAvailabilityAlerts] = useState<string[]>(() => safeRead('theclass_avail_alerts', []))
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Saved dates for each item
  const savedDates = useMemo(() => {
    const map: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('theclass_saved_dates_')) {
        const lid = k.replace('theclass_saved_dates_', '')
        map[lid] = localStorage.getItem(k) ?? ''
      }
    }
    return map
  }, [favorites])

  const favListings = listings.filter(l => favorites.includes(l.id))
  const totalValue = favListings.reduce((s, l) => s + l.price, 0)

  // Smart suggestion from quiz profile
  const quizProfile: string | null = safeRead('theclass_quiz_profile', null)
  const profileCategoryMap: Record<string, Category> = {
    adventurer: 'yacht',
    relaxer: 'villa',
    explorer: 'esperienza',
    business: 'jet',
  }
  const suggestedCategory = quizProfile ? profileCategoryMap[quizProfile] : null
  const suggestedListings = suggestedCategory
    ? listings.filter(l => l.category === suggestedCategory && !favorites.includes(l.id)).slice(0, 3)
    : []

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const share = params.get('share')
    if (share) {
      try {
        const data = JSON.parse(atob(share))
        if (data.exp > Date.now()) {
          setSharedIds(data.ids as string[])
        }
      } catch {}
    }
  }, [])

  const shareWishlist = () => {
    if (favListings.length === 0) return
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
    const encoded = btoa(JSON.stringify({ ids: favorites, exp: expiry }))
    const url = `${window.location.origin}/preferiti?share=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiato! Valido per 7 giorni.')
    })
  }

  const displayListings = useMemo(() => {
    const base = sharedIds.length > 0
      ? listings.filter(l => sharedIds.includes(l.id))
      : favListings
    switch (sortKey) {
      case 'price-asc': return [...base].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...base].sort((a, b) => b.price - a.price)
      case 'recent': return [...base].sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id))
      default: return base
    }
  }, [favListings, sharedIds, sortKey, favorites])

  // Group by category
  const grouped = useMemo(() => {
    const map: Partial<Record<Category, typeof displayListings>> = {}
    displayListings.forEach(l => {
      if (!map[l.category]) map[l.category] = []
      map[l.category]!.push(l)
    })
    return map
  }, [displayListings])

  const saveNote = (id: string, text: string) => {
    const next = { ...notes, [id]: text }
    setNotes(next)
    safeWrite('theclass_notes', next)
    setEditingNote(null)
    toast.success('Nota salvata')
  }

  const togglePriceAlert = (id: string) => {
    const next = priceAlerts.includes(id)
      ? priceAlerts.filter(x => x !== id)
      : [...priceAlerts, id]
    setPriceAlerts(next)
    safeWrite('theclass_price_alerts', next)
    toast(next.includes(id) ? '🔔 Avviso prezzo attivato!' : 'Avviso prezzo rimosso')
  }

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) {
        toast.error('Puoi confrontare massimo 2 servizi')
        return prev
      }
      return [...prev, id]
    })
  }

  const comparePair = compareIds.length === 2
    ? listings.filter(l => compareIds.includes(l.id))
    : []

  // Random 3 suggestions for empty state
  const randomSuggestions = useMemo(() => {
    const shuffled = [...listings].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }, [])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>I Miei Preferiti — the Class</title>
      <meta name="description" content="La tua selezione personale di yacht, jet, auto ed esperienze luxury. Richiedi un preventivo combinato con un click." />
      <div className="max-w-7xl mx-auto px-6">

        {/* Hero Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-[#C5A059]" />
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase">
              La tua selezione
            </p>
          </div>

          {/* ── 9. Wishlist naming ── */}
          <div className="flex items-center gap-2 mb-3">
            {editingName ? (
              <>
                <input
                  ref={nameInputRef}
                  value={wishlistName}
                  onChange={e => setWishlistName(e.target.value)}
                  className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] bg-transparent border-b-2 border-[#C5A059] outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    safeWrite('theclass_wishlist_name', wishlistName)
                    setEditingName(false)
                    toast.success('Nome aggiornato')
                  }}
                  className="p-1 rounded-lg bg-[#C5A059] text-white"
                >
                  <Check size={12} />
                </button>
                <button onClick={() => setEditingName(false)} className="p-1 text-[#5A4F44]">
                  <X size={12} />
                </button>
              </>
            ) : (
              <>
                <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight">
                  {wishlistName}
                </h1>
                <button onClick={() => setEditingName(true)} className="text-[#5A4F44]/50 hover:text-[#C5A059] transition-colors mt-2">
                  <Edit3 size={14} />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              {favListings.length > 0 && (
                <p className="text-[#5A4F44] font-light text-sm">
                  {favListings.length} {favListings.length === 1 ? 'servizio salvato' : 'servizi salvati'}
                </p>
              )}
            </div>
            {favListings.length > 0 && (
              <div className="text-right bg-[rgba(197,160,89,0.07)] border border-[rgba(197,160,89,0.2)] rounded-2xl px-6 py-4">
                <p className="text-[10px] text-[#5A4F44]/60 uppercase tracking-wider mb-1">Valore wishlist</p>
                <p className="font-[family-name:var(--font-family-display)] text-3xl text-[#C5A059] font-medium">
                  {formatPrice(totalValue)}
                </p>
                <p className="text-[10px] text-[#5A4F44]/50 mt-0.5">stima cumulativa</p>
              </div>
            )}
          </div>
        </div>

        {sharedIds.length > 0 && (
          <div className="mb-6 p-4 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-xl">
            <p className="text-sm text-[#5A4F44] font-light">
              Stai visualizzando una wishlist condivisa con {displayListings.length} servizi.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {displayListings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full border border-[rgba(197,160,89,0.28)] flex items-center justify-center mb-6">
                <Heart size={26} className="text-[rgba(197,160,89,0.4)]" />
              </div>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
                Nessun preferito
              </h2>
              <p className="text-[#5A4F44] font-light mb-8 max-w-md text-sm">
                Esplora il catalogo e salva i servizi che ti incuriosiscono.
              </p>
              <Link
                to="/servizi"
                className="bg-[#C5A059] text-white px-8 py-3 rounded-full text-sm tracking-wide hover:bg-[#b8924a] transition-colors mb-12"
              >
                Esplora i servizi
              </Link>

              {/* Suggested listings for empty state */}
              <div className="w-full">
                <p className="text-[11px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">
                  Potrebbe piacerti
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {randomSuggestions.map((l, i) => (
                    <ServiceCard key={l.id} listing={l} delay={i * 0.06} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <button
                  onClick={() => setBulkModal(true)}
                  className="btn-ripple flex items-center gap-2 bg-[#C5A059] text-white px-5 py-2.5 rounded-full text-sm hover:bg-[#b8924a] transition-colors"
                >
                  <Package size={13} />
                  Richiedi preventivo per tutti
                </button>

                {sharedIds.length === 0 && (
                  <button
                    onClick={() => {
                      if (wishlistPrivate) {
                        toast.error('Rendi pubblica la wishlist per condividere')
                      } else {
                        shareWishlist()
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 border px-5 py-2.5 rounded-full text-sm font-light transition-colors',
                      wishlistPrivate
                        ? 'border-[rgba(197,160,89,0.15)] text-[#5A4F44]/40 cursor-not-allowed'
                        : 'border-[rgba(197,160,89,0.28)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]',
                    )}
                    title={wishlistPrivate ? 'Rendi pubblica per condividere' : 'Condividi wishlist'}
                  >
                    {wishlistPrivate ? <Lock size={13} /> : <Share2 size={13} />}
                    Condividi
                  </button>
                )}

                {/* ── 2. Wishlist privacy toggle ── */}
                <button
                  onClick={() => {
                    const next = !wishlistPrivate
                    setWishlistPrivate(next)
                    safeWrite('theclass_wishlist_private', next)
                    toast(next ? '🔒 Wishlist privata' : '🌐 Wishlist condivisibile')
                  }}
                  className={cn(
                    'flex items-center gap-2 border px-5 py-2.5 rounded-full text-sm font-light transition-colors',
                    wishlistPrivate
                      ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                      : 'border-[rgba(197,160,89,0.28)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]',
                  )}
                >
                  <Lock size={13} />
                  {wishlistPrivate ? 'Privata' : 'Pubblica'}
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Printer size={13} />
                  Esporta PDF
                </button>

                {/* ── 1. Export as SVG "image" ── */}
                <button
                  onClick={() => {
                    const titles = favListings.map(l => l.title).join('\n')
                    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="${100 + favListings.length * 28}" viewBox="0 0 400 ${100 + favListings.length * 28}"><rect width="400" height="${100 + favListings.length * 28}" fill="#FDF9F2"/><text x="20" y="36" font-family="serif" font-size="18" fill="#C5A059">La mia selezione The Class</text><line x1="20" y1="48" x2="380" y2="48" stroke="#C5A059" stroke-opacity="0.3"/>${titles.split('\n').map((t, i) => `<text x="20" y="${72 + i * 28}" font-size="13" fill="#1C1C1C">${t.slice(0, 48)}</text>`).join('')}<text x="20" y="${88 + favListings.length * 28}" font-size="9" fill="#5A4F44" font-style="italic">the-class-luxury.pages.dev</text></svg>`
                    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'wishlist-the-class.svg'
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success('Immagine SVG scaricata')
                  }}
                  className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Download size={13} />
                  Condividi come immagine
                </button>

                {/* ── 3. Build itinerary CTA ── */}
                <button
                  onClick={() => {
                    const cats = [...new Set(favListings.map(l => l.category))].join(',')
                    void navigate({ to: '/itinerari', search: { suggest: cats } as Record<string, string> })
                  }}
                  className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Map size={13} />
                  Costruisci itinerario
                </button>

                <button
                  onClick={() => { setCompareMode(v => !v); setCompareIds([]) }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light border transition-colors ${
                    compareMode
                      ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                      : 'border-[rgba(197,160,89,0.28)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]'
                  }`}
                >
                  <Columns2 size={13} />
                  {compareMode ? 'Esci da confronto' : 'Confronta'}
                </button>

                {/* Sort */}
                <div className="flex items-center gap-2 ml-auto">
                  <ArrowUpDown size={13} className="text-[#5A4F44]" />
                  <select
                    value={sortKey}
                    onChange={e => setSortKey(e.target.value as SortKey)}
                    className="border border-[rgba(197,160,89,0.28)] text-[#5A4F44] text-sm rounded-full px-3 py-2 bg-transparent outline-none hover:border-[#C5A059] transition-colors"
                  >
                    <option value="default">Ordine di default</option>
                    <option value="price-asc">Prezzo (basso→alto)</option>
                    <option value="price-desc">Prezzo (alto→basso)</option>
                    <option value="recent">Recenti</option>
                  </select>
                </div>

                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                    Svuota tutto
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5A4F44]">Sicuro?</span>
                    <button
                      onClick={() => { clear(); setConfirmClear(false) }}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      Svuota
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="text-xs border border-[rgba(197,160,89,0.3)] text-[#5A4F44] px-3 py-1.5 rounded-full"
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </div>

              {/* Compare mode: select 2 */}
              {compareMode && (
                <div className="mb-6 p-4 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-xl text-sm text-[#5A4F44] font-light">
                  Seleziona 2 servizi per confrontarli. Selezionati: {compareIds.length}/2
                </div>
              )}

              {/* Comparison table */}
              {compareMode && comparePair.length === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 border border-[rgba(197,160,89,0.2)] rounded-2xl overflow-hidden"
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[rgba(197,160,89,0.08)]">
                        <th className="text-left p-4 text-[#5A4F44] font-medium w-1/3">Caratteristica</th>
                        {comparePair.map(l => (
                          <th key={l.id} className="text-left p-4 text-[#1C1C1C] font-medium">{l.title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(197,160,89,0.1)]">
                      {[
                        ['Prezzo', ...comparePair.map(l => `${formatPrice(l.price)} / ${l.priceUnit}`)],
                        ['Categoria', ...comparePair.map(l => l.category)],
                        ['Posizione', ...comparePair.map(l => l.location)],
                        ['Rating', ...comparePair.map(l => `${l.rating} ★ (${l.reviews} rec.)`)],
                      ].map(([label, ...vals]) => (
                        <tr key={label}>
                          <td className="p-4 text-[#5A4F44] font-medium">{label}</td>
                          {vals.map((v, i) => (
                            <td key={i} className="p-4 text-[#1C1C1C]">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {/* ── 5. Category breakdown ── */}
              {(() => {
                const catCounts: Partial<Record<Category, number>> = {}
                favListings.forEach(l => { catCounts[l.category] = (catCounts[l.category] ?? 0) + 1 })
                return Object.keys(catCounts).length > 1 ? <CategoryBreakdown cats={catCounts} /> : null
              })()}

              {/* ── 4. Estimated trip builder ── */}
              {favListings.length > 0 && (
                <div className="mb-8 p-5 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.18)] rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider text-[#C5A059] mb-2">Viaggio ideale con i tuoi preferiti</p>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#5A4F44]">Durata stimata</p>
                      <p className="text-sm font-medium text-[#1C1C1C]">
                        {favListings.length === 1 ? '3 giorni' : favListings.length === 2 ? '5 giorni' : '7+ giorni'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A4F44]">Prezzo totale</p>
                      <p className="font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059]">
                        {formatPrice(favListings.reduce((s, l) => s + l.price, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#5A4F44]">Destinazione suggerita</p>
                      <p className="text-sm font-medium text-[#1C1C1C]">
                        {favListings[0]?.location?.split(',')[0] ?? 'Mediterraneo'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBulkModal(true)}
                    className="text-xs px-4 py-2 bg-[#C5A059] text-white rounded-full hover:bg-[#b8924a] transition-colors"
                  >
                    Richiedi preventivo combinato →
                  </button>
                </div>
              )}

              {/* Grouped by category */}
              {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(cat => (
                <div key={cat} className="mb-12">
                  <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-6 flex items-center gap-3">
                    <span>{CATEGORY_LABELS[cat]}</span>
                    <span className="text-sm text-[#C5A059] font-light font-[family-name:var(--font-family-mono)]">
                      {grouped[cat]!.length}
                    </span>
                    <span className="flex-1 h-px bg-[rgba(197,160,89,0.15)]" />
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grouped[cat]!.map((l, i) => (
                      <div key={l.id}>
                        {/* Compare checkbox */}
                        {compareMode && (
                          <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={compareIds.includes(l.id)}
                              onChange={() => toggleCompare(l.id)}
                              className="accent-[#C5A059]"
                            />
                            <span className="text-xs text-[#5A4F44]">Seleziona per confronto</span>
                          </label>
                        )}

                        <div className="relative">
                          {l.lastMinute && (
                            <div className="absolute -top-2 left-3 z-10">
                              <span className="bg-red-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Ultimi posti
                              </span>
                            </div>
                          )}
                          <ServiceCard listing={l} delay={i * 0.05} />
                        </div>

                        {/* ── 6. Saved date ── */}
                        <p className="mt-2 text-[10px] text-[#5A4F44]/60 pl-1">
                          {savedDates[l.id]
                            ? `Salvato il ${savedDates[l.id]}`
                            : 'Salvato recentemente'}
                        </p>

                        {/* ── 7. Price trend + ── 8. Availability alert ── */}
                        {(() => {
                          const trend = priceTrend(l.id)
                          const inAvailAlert = availabilityAlerts.includes(l.id)
                          return (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              {/* Price trend */}
                              <span className={cn(
                                'flex items-center gap-1 text-[10px] font-medium',
                                trend.dir === 'up' ? 'text-red-500' : trend.dir === 'down' ? 'text-emerald-600' : 'text-[#5A4F44]',
                              )}>
                                {trend.dir === 'up' ? <TrendingUp size={10} /> : trend.dir === 'down' ? <TrendingDown size={10} /> : <Minus size={10} />}
                                {trend.dir !== 'flat' ? `${trend.dir === 'up' ? '+' : '-'}${trend.pct}% ultima settimana` : 'Prezzo stabile'}
                              </span>

                              {/* Availability alert */}
                              <button
                                onClick={() => {
                                  const next = inAvailAlert
                                    ? availabilityAlerts.filter(x => x !== l.id)
                                    : [...availabilityAlerts, l.id]
                                  setAvailabilityAlerts(next)
                                  safeWrite('theclass_avail_alerts', next)
                                  toast(next.includes(l.id) ? '🔔 Avviso disponibilità attivato' : 'Avviso rimosso')
                                }}
                                className={cn(
                                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] border transition-colors',
                                  inAvailAlert
                                    ? 'border-[#C5A059] bg-[rgba(197,160,89,0.1)] text-[#C5A059]'
                                    : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059]',
                                )}
                              >
                                <Bell size={9} />
                                {inAvailAlert ? 'Avviso attivo' : 'Avvisami se disponibile'}
                              </button>
                            </div>
                          )
                        })()}

                        {/* Note + Price alert row */}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => togglePriceAlert(l.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border transition-colors ${
                              priceAlerts.includes(l.id)
                                ? 'bg-[rgba(197,160,89,0.12)] border-[#C5A059] text-[#C5A059]'
                                : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059]'
                            }`}
                          >
                            <Bell size={10} />
                            {priceAlerts.includes(l.id) ? 'Avviso attivo' : 'Avviso prezzo'}
                          </button>
                          <button
                            onClick={() => setEditingNote(editingNote === l.id ? null : l.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] border border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059] transition-colors"
                          >
                            <StickyNote size={10} />
                            {notes[l.id] ? 'Modifica nota' : 'Aggiungi nota'}
                          </button>
                        </div>

                        {/* Note input */}
                        {editingNote === l.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                            <NoteInput
                              initialValue={notes[l.id] ?? ''}
                              onSave={(text) => saveNote(l.id, text)}
                              onCancel={() => setEditingNote(null)}
                            />
                          </motion.div>
                        )}
                        {notes[l.id] && editingNote !== l.id && (
                          <p className="mt-1.5 text-xs text-[#5A4F44] italic pl-1 border-l-2 border-[rgba(197,160,89,0.3)]">
                            {notes[l.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Smart suggestion based on quiz */}
              {suggestedListings.length > 0 && quizProfile && (
                <div className="mt-16 pt-10 border-t border-[rgba(197,160,89,0.15)]">
                  <p className="text-[11px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">
                    Basato sul tuo profilo
                  </p>
                  <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-6">
                    Potresti amare anche…
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedListings.map((l, i) => (
                      <ServiceCard key={l.id} listing={l} delay={i * 0.06} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {bulkModal && favListings[0] && (
        <RequestModal
          open={bulkModal}
          onOpenChange={setBulkModal}
          listing={{
            ...favListings[0],
            title: `Preventivo combinato (${favListings.length} servizi)`,
            price: totalValue,
            priceUnit: 'totale stimato',
          }}
        />
      )}
    </div>
  )
}

// Small inline note input component
function NoteInput({ initialValue, onSave, onCancel }: {
  initialValue: string
  onSave: (text: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Scrivi una nota personale..."
        className="w-full text-xs text-[#1C1C1C] border border-[rgba(197,160,89,0.3)] rounded-xl px-3 py-2 resize-none outline-none focus:border-[#C5A059] bg-white h-16"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(value)}
          className="px-4 py-1.5 bg-[#C5A059] text-white rounded-full text-[11px] hover:bg-[#b8924a] transition-colors"
        >
          Salva
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] rounded-full text-[11px] hover:border-[#C5A059] transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}
