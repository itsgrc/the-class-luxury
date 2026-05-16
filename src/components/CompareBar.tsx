import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowLeftRight } from 'lucide-react'
import type { Listing } from '@/data/listings'

interface Props {
  listings: Listing[]
  onClear: () => void
  onCompare: () => void
}

export function CompareBar({ listings, onClear, onCompare }: Props) {
  return (
    <AnimatePresence>
      {listings.length >= 2 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1C] border border-[rgba(197,160,89,0.3)] rounded-2xl shadow-[0_8px_32px_rgba(26,24,22,0.4)] px-6 py-3 flex items-center gap-4"
        >
          <span className="text-white text-sm font-light">{listings.length} selezionati</span>
          <div className="flex gap-2">
            {listings.map(l => (
              <span key={l.id} className="text-[#C5A059] text-xs bg-[rgba(197,160,89,0.1)] px-2 py-1 rounded-lg max-w-[100px] truncate">
                {l.title.split(' ').slice(0, 2).join(' ')}
              </span>
            ))}
          </div>
          <button
            onClick={onCompare}
            className="flex items-center gap-2 px-4 py-2 bg-[#C5A059] text-white rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors"
          >
            <ArrowLeftRight size={14} /> Confronta
          </button>
          <button onClick={onClear} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={14} className="text-white/60" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
