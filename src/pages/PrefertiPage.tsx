import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Package } from 'lucide-react'
import { listings } from '@/data/listings'
import { useFavorites } from '@/hooks/useFavorites'
import { ServiceCard } from '@/components/ServiceCard'
import { RequestModal } from '@/components/RequestModal'

export function PrefertiPage() {
  const { favorites, clear } = useFavorites()
  const [bulkModal, setBulkModal] = useState(false)

  const favListings = listings.filter(l => favorites.includes(l.id))

  // Fake listing for bulk request
  const bulkListing = favListings[0] || listings[0]

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-[#C5A059]" />
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase">
              La tua selezione
            </p>
          </div>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            Preferiti
          </h1>
          {favListings.length > 0 && (
            <p className="text-[#5A4F44] font-light">
              {favListings.length} {favListings.length === 1 ? 'servizio salvato' : 'servizi salvati'}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {favListings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-full border border-[rgba(197,160,89,0.3)] flex items-center justify-center mb-6">
                <Heart size={28} className="text-[rgba(197,160,89,0.5)]" />
              </div>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
                Nessun preferito
              </h2>
              <p className="text-[#5A4F44] font-light mb-8 max-w-md">
                Esplora il nostro catalogo e salva i servizi che ti incuriosiscono. Li ritroverai tutti qui.
              </p>
              <Link
                to="/servizi"
                className="bg-[#C5A059] text-white px-8 py-3 rounded-full font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all hover:bg-[#b8924a]"
              >
                Esplora i servizi
              </Link>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Actions */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setBulkModal(true)}
                  className="flex items-center gap-2 bg-[#C5A059] text-white px-5 py-2.5 rounded-full text-sm font-[family-name:var(--font-family-sans)] transition-all hover:bg-[#b8924a]"
                >
                  <Package size={14} />
                  Richiedi preventivo per tutti
                </button>
                <button
                  onClick={clear}
                  className="flex items-center gap-2 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] px-5 py-2.5 rounded-full text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Trash2 size={14} />
                  Svuota tutto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favListings.map((listing, i) => (
                  <ServiceCard key={listing.id} listing={listing} delay={i * 0.05} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {bulkModal && bulkListing && (
        <RequestModal
          open={bulkModal}
          onOpenChange={setBulkModal}
          listing={{
            ...bulkListing,
            title: `Preventivo combinato (${favListings.length} servizi)`,
          }}
        />
      )}
    </div>
  )
}
