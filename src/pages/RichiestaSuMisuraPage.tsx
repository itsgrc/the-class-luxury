import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Clock, Zap, Star, ArrowRight, Phone, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { generateId, addRipple, cn } from '@/lib/utils'

const URGENCY = [
  { value: 'low', label: 'Normale', desc: 'Entro 30 giorni', Icon: Clock, rushFee: 0 },
  { value: 'medium', label: 'Urgente (7gg)', desc: 'Entro 7 giorni +€200', Icon: Star, rushFee: 200 },
  { value: 'high', label: 'Immediata (24h)', desc: 'Entro 24h +€500', Icon: Zap, rushFee: 500 },
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

// NEW 2. Service types
const SERVICE_TYPES = ['Yacht', 'Jet Privato', 'Villa', 'Auto Luxury', 'Esperienza', 'Combinazione'] as const
type ServiceType = (typeof SERVICE_TYPES)[number]

// NEW 4. Special request tags
const SPECIAL_TAGS = ['Compleanno', 'Anniversario', 'Pet friendly', 'Accessibile', 'Vegetariano', 'Fotografo', 'Live music', 'Bambini'] as const
type SpecialTag = (typeof SPECIAL_TAGS)[number]

// NEW 3. Destinations datalist
const DESTINATIONS = ['Amalfi', 'Sardegna', 'Ibiza', 'Dubai', 'Maldive', 'Cannes', 'Santorini', 'Bali', 'Monaco', 'New York']

// NEW 10. Concierge assignment by first letter of name
const CONCIERGE_POOL = ['Sofia M.', 'Marco P.', 'Chiara R.', 'Luca B.', 'Elena V.']
function assignConcierge(name: string): string {
  if (!name) return CONCIERGE_POOL[0]
  const idx = name.charCodeAt(0) % CONCIERGE_POOL.length
  return CONCIERGE_POOL[idx]
}
function conciergeInitials(fullName: string) {
  return fullName.split(' ').map(p => p[0]).join('')
}

// NEW 9. Estimated response time
function urgencyResponseLabel(urgency: Urgency): string {
  if (urgency === 'high') return '4h'
  if (urgency === 'medium') return '12h'
  return '48h'
}

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

// NEW 1. Wizard steps
const WIZARD_STEPS = [
  { label: 'Il tuo desiderio', step: 1 },
  { label: 'Dettagli pratici', step: 2 },
  { label: 'Budget e priorità', step: 3 },
  { label: 'Riepilogo', step: 4 },
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
    // NEW 2
    serviceTypes: [] as ServiceType[],
    // NEW 3
    destination: '',
    // NEW 4
    specialTags: [] as SpecialTag[],
    // NEW 8
    referralCode: '',
    referralApplied: false,
  })
  const [images, setImages] = useState<Array<{ preview: string; name: string }>>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [successId, setSuccessId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  // NEW 1. Wizard step
  const [wizardStep, setWizardStep] = useState(1)

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
        serviceTypes: form.serviceTypes,
        destination: form.destination,
        specialTags: form.specialTags,
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

  // NEW 2. Toggle service type
  const toggleService = (s: ServiceType) => {
    setForm(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(s)
        ? prev.serviceTypes.filter(x => x !== s)
        : [...prev.serviceTypes, s],
    }))
  }

  // NEW 4. Toggle special tag
  const toggleTag = (t: SpecialTag) => {
    setForm(prev => ({
      ...prev,
      specialTags: prev.specialTags.includes(t)
        ? prev.specialTags.filter(x => x !== t)
        : [...prev.specialTags, t],
    }))
  }

  // NEW 8. Apply referral
  const applyReferral = () => {
    if (form.referralCode.toUpperCase() === 'THECLASS') {
      setForm(prev => ({ ...prev, referralApplied: true }))
      toast.success('Sconto applicato! -10% sul budget')
    } else {
      toast.error('Codice referral non valido')
    }
  }

  // Rush fee
  const rushFee = URGENCY.find(u => u.value === form.urgency)?.rushFee ?? 0
  const discountedBudget = form.referralApplied ? Math.round(form.budget * 0.9) : form.budget
  const totalEstimate = discountedBudget + rushFee

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
      description: `Risposta stimata entro ${urgencyResponseLabel(form.urgency)}`,
    })
  }

  const urgencyResponseTime = urgencyResponseLabel(form.urgency)
  const descLength = form.description.length
  const DESC_MAX = 2000

  // NEW 9. Response time badge label
  const responseTimeBadge = `Risposta stimata: ${urgencyResponseTime}`

  // NEW 10. Assigned concierge
  const assignedConcierge = assignConcierge(form.name)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Richiesta Su Misura — the Class</title>
      <meta
        name="description"
        content="Descrivi il viaggio dei tuoi sogni: il nostro team costruirà un pacchetto esclusivo su misura per te entro 24 ore."
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-10 text-center">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
            Solo per noi due
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            Richiesta su misura
          </h1>
          <p className="text-[#5A4F44] font-light">Descrivi la tua visione. Realizziamo l'impossibile.</p>

          {/* NEW 9. Estimated response time badge */}
          {status !== 'success' && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.25)] text-xs text-[#C5A059]">
              <Clock size={12} />
              {responseTimeBadge}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto py-12">
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

              {/* NEW 10. Concierge assignment preview */}
              <div className="bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-2xl p-5 mb-6">
                <p className="text-[10px] uppercase tracking-wider text-[#C5A059] mb-3">Il tuo concierge dedicato sarà:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C5A059] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{conciergeInitials(assignedConcierge)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1C]">{assignedConcierge}</p>
                    <p className="text-xs text-[#5A4F44]">Esperto luxury · Risponde entro {urgencyResponseTime}</p>
                  </div>
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
                      serviceTypes: [], destination: '', specialTags: [], referralCode: '', referralApplied: false,
                    })
                    setImages([])
                    setWizardStep(1)
                  }}
                  className="text-sm text-[#C5A059] underline"
                >
                  Invia un'altra richiesta
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* NEW 1. Progress bar + step labels */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  {WIZARD_STEPS.map((s, i) => (
                    <div key={s.step} className="flex items-center gap-0">
                      <div className={cn(
                        'flex flex-col items-center gap-1',
                        i < WIZARD_STEPS.length - 1 ? 'flex-1' : '',
                      )}>
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-colors',
                          wizardStep === s.step ? 'bg-[#C5A059] border-[#C5A059] text-white' :
                          wizardStep > s.step ? 'bg-[rgba(197,160,89,0.2)] border-[#C5A059] text-[#C5A059]' :
                          'border-[rgba(197,160,89,0.25)] text-[#5A4F44]',
                        )}>
                          {wizardStep > s.step ? '✓' : s.step}
                        </div>
                        <span className={cn(
                          'text-[9px] text-center hidden sm:block',
                          wizardStep === s.step ? 'text-[#C5A059] font-medium' : 'text-[#5A4F44]/60',
                        )}>
                          {s.label}
                        </span>
                      </div>
                      {i < WIZARD_STEPS.length - 1 && (
                        <div className={cn(
                          'h-px flex-1 mx-2 transition-colors mb-4',
                          wizardStep > s.step ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.2)]',
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-8">
                {/* Main form */}
                <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-6">
                  <AnimatePresence mode="wait">
                    {/* ── STEP 1: Il tuo desiderio ── */}
                    {wizardStep === 1 && (
                      <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-lg font-[family-name:var(--font-family-display)] text-[#1C1C1C]">Il tuo desiderio</h2>

                        {/* Quick templates */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5 block">Template rapidi</label>
                          <div className="grid grid-cols-2 gap-2">
                            {QUICK_TEMPLATES.map(tpl => (
                              <button key={tpl.label} type="button" onClick={() => applyTemplate(tpl)}
                                className="text-left px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] hover:border-[#C5A059] hover:bg-[rgba(197,160,89,0.04)] transition-all text-xs text-[#5A4F44] font-light">
                                {tpl.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* NEW 2. Service type multi-select */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Cosa ti interessa?</label>
                          <div className="flex flex-wrap gap-2">
                            {SERVICE_TYPES.map(s => (
                              <button key={s} type="button" onClick={() => toggleService(s)}
                                className={cn(
                                  'px-3 py-1.5 rounded-full text-xs border transition-colors',
                                  form.serviceTypes.includes(s)
                                    ? 'bg-[#C5A059] border-[#C5A059] text-white'
                                    : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:border-[#C5A059] bg-white',
                                )}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
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
                      </motion.div>
                    )}

                    {/* ── STEP 2: Dettagli pratici ── */}
                    {wizardStep === 2 && (
                      <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-lg font-[family-name:var(--font-family-display)] text-[#1C1C1C]">Dettagli pratici</h2>

                        {/* Name + email */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'name', label: 'Nome *', type: 'text', ph: 'Alessandro Bianchi' },
                            { key: 'email', label: 'Email *', type: 'email', ph: 'a@example.com' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">{f.label}</label>
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
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Telefono (opzionale)</label>
                          <div className="relative">
                            <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A4F44]/50" />
                            <input type="tel" value={form.phone}
                              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                              placeholder="+39 333 123 4567"
                              className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                            />
                          </div>
                        </div>

                        {/* NEW 3. Destination with datalist */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Destinazione preferita</label>
                          <input
                            list="destinations-list"
                            value={form.destination}
                            onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                            placeholder="Es. Amalfi, Sardegna, Ibiza..."
                            className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                          />
                          <datalist id="destinations-list">
                            {DESTINATIONS.map(d => <option key={d} value={d} />)}
                          </datalist>
                        </div>

                        {/* Occasion + People */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Occasione</label>
                            <select value={form.occasion} onChange={e => setForm(p => ({ ...p, occasion: e.target.value }))}
                              className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors appearance-none">
                              {OCCASION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                              Persone: <span className="text-[#C5A059] font-medium">{form.people}</span>
                            </label>
                            <div className="flex items-center gap-3 h-[42px]">
                              <input type="range" min={2} max={50} value={form.people}
                                onChange={e => setForm(p => ({ ...p, people: Number(e.target.value) }))}
                                className="flex-1 accent-[#C5A059]" />
                              <span className="text-xs text-[#5A4F44] w-6 text-right">{form.people}</span>
                            </div>
                          </div>
                        </div>

                        {/* Preferred dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Data inizio</label>
                            <input type="date" value={form.dateFrom}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))}
                              className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Data fine</label>
                            <input type="date" value={form.dateTo}
                              min={form.dateFrom || new Date().toISOString().split('T')[0]}
                              onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))}
                              className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors" />
                          </div>
                        </div>

                        {/* NEW 4. Special request tags */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Richieste speciali</label>
                          <div className="flex flex-wrap gap-2">
                            {SPECIAL_TAGS.map(tag => (
                              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                className={cn(
                                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-colors',
                                  form.specialTags.includes(tag)
                                    ? 'bg-[#C5A059] border-[#C5A059] text-white'
                                    : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:border-[#C5A059] bg-white',
                                )}>
                                <Tag size={10} /> {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* File upload */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5 block">
                            Allega ispirazione o brief (max 5)
                          </label>
                          <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                            className={cn(
                              'w-full border-2 border-dashed rounded-xl px-4 py-6 text-center transition-all cursor-pointer',
                              dragging
                                ? 'border-[#C5A059] bg-[rgba(197,160,89,0.08)]'
                                : 'border-[rgba(197,160,89,0.3)] hover:border-[#C5A059] hover:bg-[rgba(197,160,89,0.04)]',
                            )}>
                            <Upload size={22} className="text-[rgba(197,160,89,0.45)] mx-auto mb-2" />
                            <p className="text-sm text-[#5A4F44] font-light">Clicca o trascina file</p>
                            <p className="text-[11px] text-[#5A4F44]/50 mt-1">PDF, JPG, PNG, DOCX — max 10MB</p>
                          </div>
                          <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.png,.docx,image/*"
                            className="hidden" onChange={e => handleFiles(e.target.files)} />
                          {images.length > 0 && (
                            <div className="flex gap-2.5 mt-3 flex-wrap">
                              {images.map((img, i) => (
                                <div key={i} className="relative">
                                  {img.preview.startsWith('blob') ? (
                                    <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded-xl" />
                                  ) : (
                                    <div className="w-16 h-16 bg-[rgba(197,160,89,0.1)] rounded-xl flex items-center justify-center">
                                      <span className="text-[9px] text-[#C5A059] truncate px-1">{img.name}</span>
                                    </div>
                                  )}
                                  <button type="button" onClick={() => removeImage(i)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-[#1C1C1C] rounded-full flex items-center justify-center">
                                    <X size={8} className="text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 3: Budget e priorità ── */}
                    {wizardStep === 3 && (
                      <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <h2 className="text-lg font-[family-name:var(--font-family-display)] text-[#1C1C1C]">Budget e priorità</h2>

                        {/* Budget slider */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 flex justify-between">
                            <span>Budget indicativo</span>
                            <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-xs">
                              {formatBudget(form.budget)}
                              {form.referralApplied && <span className="text-emerald-500 ml-1">(-10%)</span>}
                            </span>
                          </label>
                          <input type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={5000}
                            value={form.budget}
                            onChange={e => setForm(p => ({ ...p, budget: Number(e.target.value) }))}
                            className="w-full accent-[#C5A059]" />
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-[#5A4F44]/50">{formatBudget(BUDGET_MIN)}</span>
                            <span className="text-[10px] text-[#5A4F44]/50">{formatBudget(BUDGET_MAX)}</span>
                          </div>
                        </div>

                        {/* NEW 5. Urgency with rush fee */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3 block">Urgenza</label>
                          <div className="grid grid-cols-3 gap-3">
                            {URGENCY.map(({ value, label, desc, Icon, rushFee: fee }) => (
                              <button key={value} type="button"
                                onClick={() => setForm(p => ({ ...p, urgency: value }))}
                                className={cn(
                                  'p-4 rounded-xl border text-left transition-all duration-200',
                                  form.urgency === value
                                    ? 'border-[#C5A059] bg-[rgba(197,160,89,0.05)]'
                                    : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.38)]',
                                )}>
                                <Icon size={15} className={cn('mb-2', form.urgency === value ? 'text-[#C5A059]' : 'text-[#5A4F44]')} />
                                <p className="text-xs font-medium text-[#1C1C1C]">{label}</p>
                                <p className="text-[10px] text-[#5A4F44] font-light">{desc}</p>
                                {fee > 0 && <p className="text-[10px] text-amber-500 mt-1">+{formatBudget(fee)} rush</p>}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* NEW 8. Referral code */}
                        <div>
                          <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Codice referral (opzionale)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form.referralCode}
                              onChange={e => setForm(p => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                              placeholder="Es. THECLASS"
                              disabled={form.referralApplied}
                              className={cn(
                                'flex-1 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors',
                                form.referralApplied ? 'opacity-50 cursor-not-allowed' : '',
                              )}
                            />
                            <button
                              type="button"
                              onClick={applyReferral}
                              disabled={form.referralApplied || !form.referralCode}
                              className="px-4 py-2.5 rounded-xl bg-[#C5A059] text-white text-sm font-medium hover:bg-[#b8924a] transition-colors disabled:opacity-50"
                            >
                              {form.referralApplied ? '✓ Applicato' : 'Applica'}
                            </button>
                          </div>
                          {form.referralApplied && (
                            <p className="text-xs text-emerald-600 mt-1.5">Sconto del 10% applicato al budget</p>
                          )}
                        </div>

                        {/* Budget estimate summary */}
                        <div className="p-4 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-xl">
                          <p className="text-xs text-[#5A4F44] mb-2 uppercase tracking-wider">Stima totale</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#5A4F44]">Budget base</span>
                              <span className="text-[#1C1C1C] font-medium">{formatBudget(form.budget)}</span>
                            </div>
                            {form.referralApplied && (
                              <div className="flex justify-between text-xs">
                                <span className="text-emerald-600">Sconto referral (10%)</span>
                                <span className="text-emerald-600">-{formatBudget(Math.round(form.budget * 0.1))}</span>
                              </div>
                            )}
                            {rushFee > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-amber-600">Rush fee</span>
                                <span className="text-amber-600">+{formatBudget(rushFee)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-medium pt-1.5 border-t border-[rgba(197,160,89,0.2)]">
                              <span className="text-[#1C1C1C]">Totale stimato</span>
                              <span className="text-[#C5A059] font-[family-name:var(--font-family-mono)]">{formatBudget(totalEstimate)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 4: Riepilogo ── */}
                    {wizardStep === 4 && (
                      <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                        <h2 className="text-lg font-[family-name:var(--font-family-display)] text-[#1C1C1C]">Riepilogo richiesta</h2>
                        <p className="text-xs text-[#5A4F44]">Verifica i dettagli prima di inviare.</p>

                        <div className="bg-white border border-[rgba(197,160,89,0.18)] rounded-2xl p-6 space-y-3">
                          {[
                            { label: 'Nome', value: form.name || '—' },
                            { label: 'Email', value: form.email || '—' },
                            { label: 'Telefono', value: form.phone || '—' },
                            { label: 'Servizi', value: form.serviceTypes.join(', ') || '—' },
                            { label: 'Destinazione', value: form.destination || '—' },
                            { label: 'Date', value: form.dateFrom && form.dateTo ? `${form.dateFrom} → ${form.dateTo}` : '—' },
                            { label: 'Persone', value: String(form.people) },
                            { label: 'Occasione', value: form.occasion || '—' },
                            { label: 'Richieste speciali', value: form.specialTags.join(', ') || '—' },
                            { label: 'Budget stimato', value: formatBudget(totalEstimate) },
                            { label: 'Urgenza', value: URGENCY.find(u => u.value === form.urgency)?.label ?? '—' },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between gap-4 text-xs">
                              <span className="text-[#5A4F44] shrink-0">{row.label}</span>
                              <span className="text-[#1C1C1C] font-medium text-right">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        {form.description && (
                          <div className="bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.15)] rounded-xl p-4">
                            <p className="text-[10px] text-[#5A4F44]/60 uppercase tracking-wider mb-2">Descrizione</p>
                            <p className="text-xs text-[#5A4F44] font-light leading-relaxed line-clamp-4">{form.description}</p>
                          </div>
                        )}

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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Wizard nav buttons */}
                  {wizardStep < 4 && (
                    <div className="flex justify-between mt-4">
                      <button
                        type="button"
                        onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                        disabled={wizardStep === 1}
                        className="flex items-center gap-1.5 text-sm text-[#5A4F44] hover:text-[#C5A059] transition-colors disabled:opacity-30"
                      >
                        <ChevronLeft size={14} /> Indietro
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizardStep(s => Math.min(4, s + 1))}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm hover:bg-[#2a2a2a] transition-colors"
                      >
                        Avanti <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </form>

                {/* NEW 7. Riepilogo sidebar — visible from step 2+ */}
                {wizardStep >= 2 && (
                  <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:block w-64 shrink-0"
                  >
                    <div className="sticky top-28 bg-white border border-[rgba(197,160,89,0.18)] rounded-2xl p-5 space-y-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#C5A059] font-medium">La tua richiesta</p>
                      {form.serviceTypes.length > 0 && (
                        <div>
                          <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Servizi</p>
                          <p className="text-xs text-[#1C1C1C] font-medium">{form.serviceTypes.join(', ')}</p>
                        </div>
                      )}
                      {form.destination && (
                        <div>
                          <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Destinazione</p>
                          <p className="text-xs text-[#1C1C1C] font-medium">{form.destination}</p>
                        </div>
                      )}
                      {(form.dateFrom || form.dateTo) && (
                        <div>
                          <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Date</p>
                          <p className="text-xs text-[#1C1C1C] font-medium">
                            {form.dateFrom || '?'} → {form.dateTo || '?'}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Persone</p>
                        <p className="text-xs text-[#1C1C1C] font-medium">{form.people}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Budget stimato</p>
                        <p className="text-sm text-[#C5A059] font-medium font-[family-name:var(--font-family-mono)]">
                          {formatBudget(totalEstimate)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[rgba(197,160,89,0.15)]">
                        <p className="text-[10px] text-[#5A4F44]/60 mb-0.5">Risposta stimata</p>
                        <p className="text-xs text-[#C5A059] font-medium">{urgencyResponseTime}</p>
                      </div>
                    </div>
                  </motion.aside>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
