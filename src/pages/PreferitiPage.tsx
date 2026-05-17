import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Package, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { listings } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { ServiceCard } from '@/components/ServiceCard'
import { RequestModal } from '@/components/RequestModal'
import { formatPrice } from '@/lib/utils'

export function PreferitiPage() {
  const { favorites, clear } = useFavorites()
  const [bulkModal, setBulkModal] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [sharedIds, setSharedIds] = useState<string[]>([])
  const favListings = listings.filter(l => favorites.includes(l.id))
  const totalValue = favListings.reduce((s, l) => s + l.price, 0)

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

  const displayListings = sharedIds.length > 0
    ? listings.filter(l => sharedIds.includes(l.id))
    : favListings

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>I Miei Preferiti — the Class</title>
      <meta name="description" content="La tua selezione personale di yacht, jet, auto ed esperienze luxury. Richiedi un preventivo combinato con un click." />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-[#C5A059]" />
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase">
              La tua selezione
            </p>
          </div>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-2">
            Preferiti
          </h1>
          {favListings.length > 0 && (
            <p className="text-[#5A4F44] font-light text-sm">
              {favListings.length} {favListings.length === 1 ? 'servizio salvato' : 'servizi salvati'}
              {' — '}valore stimato:{' '}
              <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">
                {formatPrice(totalValue)}
              </span>
            </p>
          )}
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
              className="flex flex-col items-center justify-center py-24 text-center"
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
                className="bg-[#C5A059] text-white px-8 py-3 rounded-full text-sm tracking-wide hover:bg-[#b8924a] transition-colors"
              >
                Esplora i servizi
              </Link>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                    onClick={shareWishlist}
                    className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                  >
                    <Share2 size={13} />
                    Condividi wishlist
                  </button>
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayListings.map((l, i) => (
                  <ServiceCard key={l.id} listing={l} delay={i * 0.05} />
                ))}
              </div>
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
