import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Package } from 'lucide-react'
import { listings } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { ServiceCard } from '@/components/ServiceCard'
import { RequestModal } from '@/components/RequestModal'
import { formatPrice } from '@/lib/utils'

export function PreferitiPage() {
  const { favorites, clear } = useFavorites()
  const [bulkModal, setBulkModal] = useState(false)
  const favListings = listings.filter(l => favorites.includes(l.id))
  const totalValue = favListings.reduce((s, l) => s + l.price, 0)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
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

        <AnimatePresence mode="wait">
          {favListings.length === 0 ? (
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
                <button
                  onClick={clear}
                  className="flex items-center gap-2 border border-[rgba(197,160,89,0.28)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Trash2 size={13} />
                  Svuota tutto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favListings.map((l, i) => (
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
