import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Clock, Zap, Star, ArrowRight, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { generateId, addRipple, cn } from '@/lib/utils'

const URGENCY = [
  { value: 'low', label: 'Flessibile', desc: 'Entro 7 giorni', Icon: Clock },
  { value: 'medium', label: 'Normale', desc: 'Entro 48 ore', Icon: Star },
  { value: 'high', label: 'Urgente', desc: 'Entro 4 ore', Icon: Zap },
] as const

type Urgency = (typeof URGENCY)[number]['value']

const QUICK_TEMPLATES = [
  {
    label: 'Compleanno VIP',
    text: 'Compleanno importante per 20 persone. Ho in mente un\'isola privata, chef stellato, musica live e fuochi d\'artificio. Luglio 2026.',
    occasion: 'compleanno',
  },
  {
    label: 'Anniversario romantico',
    text: 'Anniversario di matrimonio per 2 persone. Cena a lume di candela su uno yacht nel Mediterraneo, suite presidenziale con vista mare, rose e champagne all\'arrivo.',
    occasion: 'anniversario',
  },
  {
    label: 'Evento aziendale',
    text: 'Evento aziendale per 50 persone: team building su superyacht, catering premium, AV setup per presentazioni, transfer privati da Milano. Settembre 2026.',
    occasion: 'business',
  },
  {
    label: 'Honeymoon',
    text: 'Luna di miele da sogno: villa privata alle Maldive, jet privato andata/ritorno, butler dedicato, cena romantica in spiaggia ogni sera. 10 notti.',
    occasion: 'honeymoon',
  },
] as const

const OCCASION_OPTIONS = [
  { value: '', label: 'Seleziona occasione' },
  { value: 'compleanno', label: 'Compleanno' },
  { value: 'anniversario', label: 'Anniversario' },
  { value: 'business', label: 'Evento Aziendale' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'altro', label: 'Altro' },
] as const

const BUDGET_MIN = 5000
const BUDGET_MAX = 500000

function formatBudget(val: number) {
  if (val >= 1000) return `€${(val / 1000).toFixed(0)}k`
  return `€${val}`
}

const DRAFT_KEY = 'theclass_bespoke_draft'

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const SUCCESS_STEPS = [
  { n: 1, title: 'Ricezione', desc: 'La tua richiesta è già nel nostro sistema.' },
  { n: 2, title: 'Analisi del team', desc: 'I nostri esperti luxury valutano ogni dettaglio.' },
  { n: 3, title: 'Proposta personalizzata', desc: 'Ricevi un\'offerta su misura direttamente via email.' },
]

export function RichiestaSuMisuraPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: 50000,
    urgency: 'medium' as Urgency,
    people: 2,
    dateFrom: '',
    dateTo: '',
    occasion: '',
  })
  const [images, setImages] = useState<Array<{ preview: string; name: string }>>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [successId, setSuccessId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  // Restore draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setForm(prev => ({ ...prev, ...draft }))
      toast.info('Bozza ripristinata', { description: 'Abbiamo recuperato la tua richiesta precedente.' })
    }
  }, [])

  // Auto-save draft on form change
  useEffect(() => {
    if (status !== 'idle') return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        description: form.description,
        budget: form.budget,
        urgency: form.urgency,
        people: form.people,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        occasion: form.occasion,
      }))
    } catch {}
  }, [form, status])

  const applyTemplate = (tpl: (typeof QUICK_TEMPLATES)[number]) => {
    setForm(prev => ({ ...prev, description: tpl.text, occasion: tpl.occasion }))
    toast.success(`Template "${tpl.label}" applicato`)
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .slice(0, 5 - images.length)
      .map(f => ({ preview: URL.createObjectURL(f), name: f.name }))
    setImages(prev => [...prev, ...added])
  }

  const removeImage = (i: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, j) => j !== i)
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.description.trim()) {
      toast.error('Descrivi la tua richiesta')
      return
    }
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1000))

    const id = generateId()
    const payload = {
      id,
      ...form,
      imageCount: images.length,
      timestamp: Date.now(),
    }
    const existing = JSON.parse(localStorage.getItem('theclass_bespoke') ?? '[]')
    localStorage.setItem('theclass_bespoke', JSON.stringify([payload, ...existing]))
    localStorage.removeItem(DRAFT_KEY)

    setSuccessId(id)
    setStatus('success')
    toast.success('Richiesta su misura inviata!', {
      description: `Risposta a ${form.email} — ${form.urgency === 'high' ? 'entro 4 ore' : form.urgency === 'medium' ? 'entro 48 ore' : 'entro 7 giorni'}`,
    })
  }

  const urgencyResponseTime =
    form.urgency === 'high' ? '4 ore' : form.urgency === 'medium' ? '48 ore' : '7 giorni'

  const descLength = form.description.length
  const DESC_MAX = 2000

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Richiesta Su Misura — the Class</title>
      <meta
        name="description"
        content="Descrivi il viaggio dei tuoi sogni: il nostro team costruirà un pacchetto esclusivo su misura per te entro 24 ore."
      />
      <div className="max-w-xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
            Solo per noi due
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            Richiesta su misura
          </h1>
          <p className="text-[#5A4F44] font-light">Descrivi la tua visione. Realizziamo l'impossibile.</p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              {/* Icon */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 rounded-full bg-[rgba(197,160,89,0.08)] border border-[#C5A059] flex items-center justify-center mb-6">
                  <Check size={26} className="text-[#C5A059]" />
                </div>
                <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-2">
                  Richiesta ricevuta
                </h2>
                <p className="text-[#5A4F44] font-light text-sm mb-1">
                  ID richiesta:{' '}
                  <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">{successId}</span>
                </p>
                <p className="text-[#5A4F44] font-light text-sm">
                  Risposta stimata entro{' '}
                  <span className="text-[#1C1C1C] font-medium">{urgencyResponseTime}</span>
                </p>
              </div>

              {/* Cosa succede dopo */}
              <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.18)] p-6 mb-6">
                <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-[family-name:var(--font-family-mono)] mb-5">
                  Cosa succede dopo?
                </h3>
                <div className="space-y-5">
                  {SUCCESS_STEPS.map((step, i) => (
                    <div key={step.n} className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full border border-[#C5A059] flex items-center justify-center shrink-0 text-[11px] font-medium text-[#C5A059]">
                        {step.n}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1C1C1C]">{step.title}</p>
                        <p className="text-xs text-[#5A4F44] font-light mt-0.5">{step.desc}</p>
                      </div>
                      {i < SUCCESS_STEPS.length - 1 && (
                        <ArrowRight size={14} className="text-[rgba(197,160,89,0.4)] ml-auto mt-1 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <Link
                  to="/concierge"
                  className="w-full text-center bg-[#C5A059] text-white py-3.5 rounded-xl text-sm tracking-wide hover:bg-[#b8924a] transition-colors"
                >
                  Parla col Concierge
                </Link>
                <button
                  onClick={() => {
                    setStatus('idle')
                    setForm({
                      name: '', email: '', phone: '', description: '', budget: 50000,
                      urgency: 'medium', people: 2, dateFrom: '', dateTo: '', occasion: '',
                    })
                    setImages([])
                  }}
                  className="text-sm text-[#C5A059] underline"
                >
                  Invia un'altra richiesta
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Quick templates */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5 block">
                  Template rapidi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_TEMPLATES.map(tpl => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="text-left px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] hover:border-[#C5A059] hover:bg-[rgba(197,160,89,0.04)] transition-all text-xs text-[#5A4F44] font-light"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + email */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Nome *', type: 'text', ph: 'Alessandro Bianchi' },
                  { key: 'email', label: 'Email *', type: 'email', ph: 'a@example.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                      {f.label}
                    </label>
                    <input
                      required
                      type={f.type}
                      value={form[f.key as 'name' | 'email']}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  Telefono (opzionale)
                </label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A4F44]/50" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+39 333 123 4567"
                    className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>

              {/* Occasion + People */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                    Occasione
                  </label>
                  <select
                    value={form.occasion}
                    onChange={e => setForm(p => ({ ...p, occasion: e.target.value }))}
                    className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors appearance-none"
                  >
                    {OCCASION_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                    Persone: <span className="text-[#C5A059] font-medium">{form.people}</span>
                  </label>
                  <div className="flex items-center gap-3 h-[42px]">
                    <input
                      type="range"
                      min={2}
                      max={50}
                      value={form.people}
                      onChange={e => setForm(p => ({ ...p, people: Number(e.target.value) }))}
                      className="flex-1 accent-[#C5A059]"
                    />
                    <span className="text-xs text-[#5A4F44] w-6 text-right">{form.people}</span>
                  </div>
                </div>
              </div>

              {/* Preferred dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                    Data inizio
                  </label>
                  <input
                    type="date"
                    value={form.dateFrom}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))}
                    className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                    Data fine
                  </label>
                  <input
                    type="date"
                    value={form.dateTo}
                    min={form.dateFrom || new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))}
                    className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>

              {/* Description with character counter */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Descrivi la tua richiesta *</span>
                  <span className={cn('font-[family-name:var(--font-family-mono)]', descLength > DESC_MAX * 0.9 ? 'text-red-400' : 'text-[#5A4F44]/50')}>
                    {descLength}/{DESC_MAX}
                  </span>
                </label>
                <textarea
                  required
                  rows={5}
                  maxLength={DESC_MAX}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Compleanno importante per 20 persone. Ho in mente un'isola privata, chef stellato, musica live, fuochi d'artificio. Budget ~€200.000. Date: luglio 2026..."
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              {/* Budget slider */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 flex justify-between">
                  <span>Budget indicativo</span>
                  <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-xs">
                    {formatBudget(form.budget)}
                  </span>
                </label>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={5000}
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: Number(e.target.value) }))}
                  className="w-full accent-[#C5A059]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#5A4F44]/50">{formatBudget(BUDGET_MIN)}</span>
                  <span className="text-[10px] text-[#5A4F44]/50">{formatBudget(BUDGET_MAX)}</span>
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3 block">Urgenza</label>
                <div className="grid grid-cols-3 gap-3">
                  {URGENCY.map(({ value, label, desc, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, urgency: value }))}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all duration-200',
                        form.urgency === value
                          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.05)]'
                          : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.38)]',
                      )}
                    >
                      <Icon
                        size={15}
                        className={cn('mb-2', form.urgency === value ? 'text-[#C5A059]' : 'text-[#5A4F44]')}
                      />
                      <p className="text-xs font-medium text-[#1C1C1C]">{label}</p>
                      <p className="text-[10px] text-[#5A4F44] font-light">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5 block">
                  Immagini di ispirazione (max 5)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragging(false)
                    handleFiles(e.dataTransfer.files)
                  }}
                  className={cn(
                    'w-full border-2 border-dashed rounded-xl px-4 py-6 text-center transition-all cursor-pointer',
                    dragging
                      ? 'border-[#C5A059] bg-[rgba(197,160,89,0.08)]'
                      : 'border-[rgba(197,160,89,0.3)] hover:border-[#C5A059] hover:bg-[rgba(197,160,89,0.04)]',
                  )}
                >
                  <Upload size={22} className="text-[rgba(197,160,89,0.45)] mx-auto mb-2" />
                  <p className="text-sm text-[#5A4F44] font-light">Clicca o trascina le immagini</p>
                  <p className="text-[11px] text-[#5A4F44]/50 mt-1">PNG, JPG — max 10MB</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
                {images.length > 0 && (
                  <div className="flex gap-2.5 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16">
                        <img src={img.preview} alt="" className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-[#1C1C1C] rounded-full flex items-center justify-center"
                        >
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                onClick={e => addRipple(e as unknown as React.MouseEvent<HTMLElement>)}
                className="btn-ripple w-full bg-[#C5A059] text-white py-4 rounded-xl text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  'Invia Richiesta su Misura'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
