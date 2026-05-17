import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { safeRead, safeWrite } from '@/lib/errorHandler'

const SLIDES = [
  { icon: '⛵', title: 'Yacht, Jet, Auto e Ville', desc: 'Il catalogo più selezionato d\'Italia. Filtra per categoria, budget e destinazione in secondi.' },
  { icon: '✦', title: 'Sorprendimi', desc: 'Non sai cosa vuoi? Il nostro motore genera itinerari completi in base al tuo umore.' },
  { icon: '🤝', title: 'Crowd Concierge', desc: 'Hai una richiesta complessa? La community di esperti risponde in meno di 24 ore.' },
]

export function FirstVisitTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = safeRead<boolean>('theclass_tour_seen', false)
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    }
  }, [])

  const close = () => {
    safeWrite('theclass_tour_seen', true)
    setVisible(false)
  }

  const next = () => {
    if (step < SLIDES.length - 1) setStep(s => s + 1)
    else close()
  }

  if (!visible) return null

  const slide = SLIDES[step]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end md:items-center justify-center p-4"
        onClick={close}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 w-full max-w-sm text-center shadow-[0_24px_64px_rgba(26,24,22,0.18)]"
        >
          <button onClick={close} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[rgba(197,160,89,0.1)]">
            <X size={14} className="text-[#5A4F44]" />
          </button>
          <span className="text-4xl block mb-4">{slide.icon}</span>
          <p className="text-[10px] tracking-widest text-[#C5A059] uppercase font-[family-name:var(--font-family-mono)] mb-2">
            {step + 1} di {SLIDES.length}
          </p>
          <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-3">{slide.title}</h3>
          <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-6">{slide.desc}</p>
          <div className="flex gap-1.5 justify-center mb-6">
            {SLIDES.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-[#C5A059]' : 'w-1.5 bg-[rgba(197,160,89,0.3)]'}`} />
            ))}
          </div>
          <button onClick={next}
            className="w-full py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-colors">
            {step < SLIDES.length - 1 ? 'Avanti' : 'Inizia'} <ChevronRight size={14} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
