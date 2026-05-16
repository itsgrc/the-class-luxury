import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Listing } from '@/data/listings'
import { getCategoryLabel } from '@/data/listings'
import { formatPrice } from '@/lib/utils'

interface Props { listings: Listing[]; onClose: () => void }

export function CompareModal({ listings, onClose }: Props) {
  const rows: Array<{ label: string; key: (l: Listing) => string }> = [
    { label: 'Categoria', key: l => getCategoryLabel(l.category) },
    { label: 'Prezzo', key: l => `${formatPrice(l.price)} / ${l.priceUnit}` },
    { label: 'Località', key: l => l.location },
    { label: 'Rating', key: l => `${l.rating} ★ (${l.reviews} rec.)` },
    { label: 'Qualità', key: l => l.qualityScore !== undefined ? `${l.qualityScore}/100` : '—' },
    { label: 'Sicurezza', key: l => l.safetyRating !== undefined ? '★'.repeat(l.safetyRating) : '—' },
    { label: 'Certificazioni', key: l => l.certifications?.join(', ') ?? '—' },
    { label: 'The Class', key: l => l.classApproved ? '✦ Approved' : '—' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] shadow-[0_24px_64px_rgba(26,24,22,0.18)] w-full max-w-3xl max-h-[85vh] overflow-auto"
        >
          <div className="sticky top-0 bg-[#FDF9F2] px-6 py-4 border-b border-[rgba(197,160,89,0.18)] flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
              Confronto Servizi
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(197,160,89,0.1)] transition-colors">
              <X size={16} className="text-[#5A4F44]" />
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left w-32 pb-4"></th>
                  {listings.map(l => (
                    <th key={l.id} className="pb-4 px-3">
                      <img src={l.image} alt={l.title} className="w-full h-32 object-cover rounded-xl mb-2" />
                      <p className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] text-left line-clamp-2">
                        {l.title}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.label} className="border-t border-[rgba(197,160,89,0.12)]">
                    <td className="py-3 text-[11px] text-[#5A4F44] uppercase tracking-wider font-medium pr-4">
                      {row.label}
                    </td>
                    {listings.map(l => (
                      <td key={l.id} className="py-3 px-3 text-sm text-[#1C1C1C]">
                        {row.key(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
