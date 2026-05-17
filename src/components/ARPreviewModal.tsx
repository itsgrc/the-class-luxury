import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Scan } from 'lucide-react'

interface Props { image: string; title: string; onClose: () => void }

export function ARPreviewModal({ image, title, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#0a0806] rounded-3xl overflow-hidden"
        >
          {/* Phone frame */}
          <div className="relative">
            <div className="absolute inset-0 border-4 border-[rgba(197,160,89,0.3)] rounded-3xl z-10 pointer-events-none" />
            <img src={image} alt={title} className="w-full h-96 object-cover" />
            {/* AR overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 z-20">
              <div className="flex justify-between items-start">
                <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-xs font-medium">AR LIVE</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                  <X size={14} className="text-white" />
                </button>
              </div>
              {/* Scan corners */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[#C5A059]" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[#C5A059]" />
              <div className="absolute bottom-20 left-8 w-8 h-8 border-b-2 border-l-2 border-[#C5A059]" />
              <div className="absolute bottom-20 right-8 w-8 h-8 border-b-2 border-r-2 border-[#C5A059]" />

              <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scan size={14} className="text-[#C5A059]" />
                  <span className="text-[#C5A059] text-[10px] tracking-widest uppercase">Anteprima Realtà Aumentata</span>
                </div>
                <p className="text-white text-sm font-light">{title}</p>
                <p className="text-white/50 text-[10px] mt-1">
                  Punta la fotocamera del tuo ambiente. In futuro disponibile sull'app the Class.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-[#5A4F44]">
              <Smartphone size={14} />
              <span className="text-xs">Funzione completa disponibile sull'app mobile (2026)</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
