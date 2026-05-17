import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MOODS = ['Romantico 🌹', 'Avventuroso ⛵', 'Business 💼', 'Relax 🧘', 'Festivo 🥂']

const ITINERARIES = [
  {
    mood: 'Romantico 🌹',
    title: 'Fuga dei Sensi — Costa Amalfitana',
    days: [
      { icon: '⛵', label: 'Giorno 1 — Arrivo', desc: 'Riva Aquarama da Napoli a Positano. Cena stellata a Villa Cimbrone.' },
      { icon: '🚁', label: 'Giorno 2 — Capri', desc: 'Elicottero privato. Pranzo da Paolino tra limoni. Grotta Azzurra in barca.' },
      { icon: '🍾', label: 'Giorno 3 — Ritorno', desc: 'Colazione sulla terrazza. Bentley GT Speed a Napoli. Lounge VIP.' },
    ],
    includes: ['Yacht Riva — 1 giorno', 'Suite Palazzo Avino', 'Cena stellata × 2', 'Champagne Krug', 'Transfer GT'],
    price: 12400,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&q=80',
  },
  {
    mood: 'Avventuroso ⛵',
    title: 'Sardegna Off-Map — Costa Smeralda',
    days: [
      { icon: '🛥️', label: 'Giorno 1 — Olbia', desc: 'Azimut 60 da Olbia. Ancorare a Cala Corsara. Pesca con lo skipper.' },
      { icon: '🏖️', label: 'Giorno 2 — Isole', desc: 'Spargi, Budelli (spiaggia rosa). Immersione con bombole. BBQ a bordo.' },
      { icon: '⛺', label: 'Giorno 3 — La Maddalena', desc: 'Porto Cervo a piedi. Cena privata in masseria. Notte stellata a prua.' },
    ],
    includes: ['Azimut 60 — 3 giorni', 'Equipaggio 3 pers.', 'Immersioni incluse', 'Chef privato', 'Jeep 4x4 a terra'],
    price: 18900,
    image: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1200&q=80',
  },
  {
    mood: 'Business 💼',
    title: 'Power Week — Milano → Londra → Dubai',
    days: [
      { icon: '✈️', label: 'Lunedì — Milano', desc: 'G700 da Malpensa. Meeting Canary Wharf. Cena privata con CEO.' },
      { icon: '🚗', label: 'Mercoledì — Londra', desc: 'Rolls Cullinan. Offices mayfair. Pranzo Claridges. Serata esclusiva.' },
      { icon: '🏨', label: 'Giovedì — Dubai', desc: 'A330 VVIP. Burj Al Arab. Meeting DIFC. Chiusura su elicottero.' },
    ],
    includes: ['G700 intercontinentale', 'Rolls Cullinan × 3', 'Suite 5★ × 3', 'PA dedicata', 'Fast-track VIP'],
    price: 84000,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
  },
]

interface Props { onClose: () => void }

export function SurpriseModal({ onClose }: Props) {
  const [mood, setMood] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [saved, setSaved] = useState(false)
  const [autoMode, setAutoMode] = useState(false)

  const itinerary = ITINERARIES[idx % ITINERARIES.length]

  useEffect(() => {
    if (!autoMode) return
    const t = setInterval(() => {
      setIdx(i => (i + 1) % ITINERARIES.length)
    }, 8000)
    return () => clearInterval(t)
  }, [autoMode])

  const regenerate = useCallback(() => {
    setIdx(i => (i + 1) % ITINERARIES.length)
    setSaved(false)
  }, [])

  const save = useCallback(() => {
    setSaved(true)
    toast.success('Itinerario salvato nei preferiti!')
    if (navigator.vibrate) navigator.vibrate(40)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full md:max-w-2xl bg-[#0a0806] rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Hero image */}
        <div className="relative h-52 shrink-0">
          <img src={itinerary.image} alt={itinerary.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0806] via-[#0a0806]/40 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
            <X size={14} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-5">
            <p className="text-[#C5A059] text-[10px] tracking-widest uppercase mb-1">✦ Itinerario Esclusivo</p>
            <h2 className="font-[family-name:var(--font-family-display)] text-xl text-white font-medium leading-tight">{itinerary.title}</h2>
          </div>
        </div>

        {/* Mood selector */}
        {!mood && (
          <div className="px-5 pt-4 pb-2 shrink-0">
            <p className="text-[#b8a8cc] text-xs mb-3">Seleziona il tuo umore:</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className="px-3 py-1.5 rounded-full border border-[rgba(197,160,89,0.3)] text-xs text-[#C5A059] hover:bg-[rgba(197,160,89,0.1)] transition-colors">
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {itinerary.days.map(day => (
            <div key={day.label} className="flex gap-3">
              <span className="text-xl shrink-0">{day.icon}</span>
              <div>
                <p className="text-[#C5A059] text-[11px] font-medium mb-0.5">{day.label}</p>
                <p className="text-[#b8a8cc] text-xs font-light leading-relaxed">{day.desc}</p>
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 bg-[rgba(197,160,89,0.08)] rounded-xl border border-[rgba(197,160,89,0.15)]">
            <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2">Include</p>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.includes.map(i => (
                <span key={i} className="text-[10px] text-[#C5A059] bg-[rgba(197,160,89,0.1)] px-2 py-0.5 rounded-full">{i}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(197,160,89,0.15)] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] text-[#5A4F44]">stimato da</p>
            <p className="font-[family-name:var(--font-family-display)] text-xl text-[#C5A059]">
              €{itinerary.price.toLocaleString('it-IT')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoMode(v => !v)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs border transition-colors',
                autoMode ? 'bg-[rgba(197,160,89,0.15)] border-[#C5A059] text-[#C5A059]' : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44]'
              )}
            >
              {autoMode ? '⏸ Auto' : '▶ Auto'}
            </button>
            <button onClick={regenerate} className="p-2.5 rounded-xl border border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:text-[#C5A059] transition-colors">
              <RefreshCw size={15} />
            </button>
            <button onClick={save} className={cn(
              'p-2.5 rounded-xl border transition-colors',
              saved ? 'border-[#C5A059] text-[#C5A059] bg-[rgba(197,160,89,0.1)]' : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:text-[#C5A059]'
            )}>
              <Heart size={15} className={saved ? 'fill-[#C5A059]' : ''} />
            </button>
            <button onClick={() => toast('Link copiato!')}
              className="p-2.5 rounded-xl border border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:text-[#C5A059] transition-colors">
              <Share2 size={15} />
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-[#C5A059] text-white text-sm font-medium hover:bg-[#b8924a] transition-colors">
              Prenota
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export { AnimatePresence }
