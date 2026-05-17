import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Share2, Link2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'

interface ItineraryState {
  transport: string[]
  experiences: string[]
  extras: string[]
}

const transportOptions = [
  { id: 'yacht-28', label: 'Yacht 28m – Ionio & Grecia', price: 22000, icon: '⚓' },
  { id: 'jet-phenom', label: 'Jet Phenom 300E – Transfer', price: 12000, icon: '✈️' },
  { id: 'rolls-driver', label: 'Rolls-Royce con Autista', price: 3500, icon: '🚗' },
  { id: 'elicottero', label: 'Elicottero Privato', price: 8000, icon: '🚁' },
]

const experienceOptions = [
  { id: 'degustation', label: 'Degustazione Pinchiorri', price: 2400, icon: '🍽️' },
  { id: 'spa-villa', label: 'Spa Privata in Villa', price: 1800, icon: '💆' },
  { id: 'sailing', label: 'Regata Velica Esclusiva', price: 3200, icon: '🌊' },
  { id: 'art-tour', label: 'Tour Arte Privato Firenze', price: 900, icon: '🎨' },
]

const extraOptions = [
  { id: 'chef', label: 'Chef Stellato a Bordo', price: 4500, icon: '👨‍🍳' },
  { id: 'security', label: 'Security Team (3 giorni)', price: 2800, icon: '🛡️' },
  { id: 'photographer', label: 'Fotografo Professionale', price: 1200, icon: '📸' },
  { id: 'sommelier', label: 'Sommelier Personale', price: 950, icon: '🍷' },
]

const steps = [
  { id: 1, label: 'Trasporto', sublabel: 'Come vuoi muoverti' },
  { id: 2, label: 'Esperienze', sublabel: 'Cosa vuoi vivere' },
  { id: 3, label: 'Extra', sublabel: 'Servizi aggiuntivi' },
]

function OptionButton({
  id, label, price, icon, selected, onToggle,
}: {
  id: string; label: string; price: number; icon: string; selected: boolean; onToggle: () => void
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        'w-full text-left p-4 rounded-2xl border transition-all duration-200',
        selected
          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.06)] shadow-[0_4px_20px_rgba(197,160,89,0.1)]'
          : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)] bg-[#FCFAF5]'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1C1C1C]">{label}</p>
          <p className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] mt-0.5">
            {formatPrice(price)}
          </p>
        </div>
        <div className={cn(
          'w-5 h-5 rounded border flex-shrink-0 transition-all flex items-center justify-center',
          selected ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]'
        )}>
          {selected && <Check size={10} className="text-white" />}
        </div>
      </div>
    </motion.button>
  )
}

function getTotal(state: ItineraryState): number {
  const allOptions = [...transportOptions, ...experienceOptions, ...extraOptions]
  const selectedIds = [...state.transport, ...state.experiences, ...state.extras]
  return allOptions.filter(o => selectedIds.includes(o.id)).reduce((s, o) => s + o.price, 0)
}

function encodeState(state: ItineraryState): string {
  return btoa(JSON.stringify(state))
}

function decodeState(encoded: string): ItineraryState | null {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return null
  }
}

export function ItinerariPage() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<ItineraryState>({
    transport: [],
    experiences: [],
    extras: [],
  })

  // Restore from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('it')
    if (encoded) {
      const decoded = decodeState(encoded)
      if (decoded) {
        setState(decoded)
        toast.success('Itinerario ripristinato!', { description: 'Il tuo itinerario salvato è stato caricato.' })
      }
    }
  }, [])

  const toggle = (section: keyof ItineraryState, id: string) => {
    setState(prev => ({
      ...prev,
      [section]: prev[section].includes(id)
        ? prev[section].filter(i => i !== id)
        : [...prev[section], id],
    }))
  }

  const shareItinerary = () => {
    const encoded = encodeState(state)
    const url = `${window.location.origin}/itinerari?it=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiato!', { description: 'Condividi il link con chi vuoi.' })
    })
  }

  const total = getTotal(state)
  const selectedCount = state.transport.length + state.experiences.length + state.extras.length

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Pianifica il Tuo Itinerario — the Class</title>
      <meta name="description" content="Costruisci il tuo itinerario luxury perfetto: scegli trasporti esclusivi, esperienze e plus, poi condividilo o richiedilo al concierge." />
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-3">
            Crea il tuo viaggio perfetto
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight">
            Costruisci il tuo itinerario
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 text-sm',
                  step === s.id
                    ? 'bg-[#C5A059] text-white shadow-[0_4px_16px_rgba(197,160,89,0.3)]'
                    : step > s.id
                      ? 'border border-[#C5A059] text-[#C5A059] bg-[rgba(197,160,89,0.06)]'
                      : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44]'
                )}
              >
                {step > s.id ? (
                  <Check size={12} />
                ) : (
                  <span className="font-[family-name:var(--font-family-mono)] text-xs">{String(s.id).padStart(2, '0')}</span>
                )}
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-[rgba(197,160,89,0.4)]" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-6">
                    Come vuoi muoverti?
                  </h2>
                  {transportOptions.map(opt => (
                    <OptionButton
                      key={opt.id}
                      {...opt}
                      selected={state.transport.includes(opt.id)}
                      onToggle={() => toggle('transport', opt.id)}
                    />
                  ))}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-6">
                    Cosa vuoi vivere?
                  </h2>
                  {experienceOptions.map(opt => (
                    <OptionButton
                      key={opt.id}
                      {...opt}
                      selected={state.experiences.includes(opt.id)}
                      onToggle={() => toggle('experiences', opt.id)}
                    />
                  ))}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-6">
                    Aggiungi servizi extra
                  </h2>
                  {extraOptions.map(opt => (
                    <OptionButton
                      key={opt.id}
                      {...opt}
                      selected={state.extras.includes(opt.id)}
                      onToggle={() => toggle('extras', opt.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="px-6 py-2.5 rounded-full border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm font-light disabled:opacity-30 hover:border-[#C5A059] transition-colors"
              >
                Indietro
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:bg-[#b8924a] transition-colors"
                >
                  Avanti
                </button>
              ) : (
                <button
                  onClick={shareItinerary}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:bg-[#b8924a] transition-colors"
                >
                  <Share2 size={14} />
                  Condividi itinerario
                </button>
              )}
            </div>
          </div>

          {/* Sidebar summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.25)] p-6">
              <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-4 pb-4 border-b border-[rgba(197,160,89,0.2)]">
                Riepilogo
              </h3>

              {selectedCount === 0 ? (
                <p className="text-sm text-[#5A4F44] font-light italic">
                  Nessun elemento selezionato
                </p>
              ) : (
                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Trasporto', ids: state.transport, options: transportOptions },
                    { label: 'Esperienze', ids: state.experiences, options: experienceOptions },
                    { label: 'Extra', ids: state.extras, options: extraOptions },
                  ].map(section => {
                    const selected = section.options.filter(o => section.ids.includes(o.id))
                    if (!selected.length) return null
                    return (
                      <div key={section.label}>
                        <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5">{section.label}</p>
                        {selected.map(o => (
                          <div key={o.id} className="flex justify-between items-center text-sm mb-1">
                            <span className="text-[#1C1C1C] font-light flex items-center gap-1.5">
                              <span>{o.icon}</span>
                              <span className="truncate">{o.label.split('–')[0].trim()}</span>
                            </span>
                            <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44]">
                              {formatPrice(o.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}

              {total > 0 && (
                <div className="border-t border-[rgba(197,160,89,0.2)] pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-[#5A4F44]">Totale stimato</span>
                    <span className="font-[family-name:var(--font-family-mono)] text-xl text-[#C5A059]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              )}

              {selectedCount > 0 && (
                <button
                  onClick={shareItinerary}
                  className="w-full mt-4 flex items-center justify-center gap-2 border border-[rgba(197,160,89,0.4)] text-[#5A4F44] py-2.5 rounded-xl text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Link2 size={12} />
                  Copia link itinerario
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
