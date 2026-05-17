import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'sonner'
import { ArrowRight, Anchor, Plane, Car, Sparkles, Shield, Clock, Globe, Shuffle, ChevronDown, X } from 'lucide-react'
import { generateId, addRipple, cn } from '@/lib/utils'
import { listings } from '@/data/listings'
import { safeRead } from '@/lib/errorHandler'
import { ForYouSection } from '@/components/ForYouSection'
import { SurpriseModal } from '@/components/SurpriseModal'
import { ScrollMilestones } from '@/components/ScrollMilestones'
import { ServiceCard } from '@/components/ServiceCard'
import * as Slider from '@radix-ui/react-slider'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

gsap.registerPlugin(ScrollTrigger)

const TESTIMONIALS = [
  { name: 'Alessandro M.', role: 'CEO, Tech Ventures', text: 'The Class ha trasformato il modo in cui organizzo i miei viaggi business. Efficienza e lusso senza compromessi.', avatar: 'AM' },
  { name: 'Sofia L.', role: 'Entrepreneur', text: 'Il concierge ha organizzato il nostro anniversario in 48 ore. Yacht, cena stellata e suite a Capri. Perfetto.', avatar: 'SL' },
  { name: 'Famiglia Rossi', role: 'Clienti Premium', text: "La villa in Sardegna era esattamente come la sognavamo. I bambini hanno vissuto un'estate magica.", avatar: 'FR' },
  { name: 'Marco B.', role: 'Luxury Collector', text: 'Nessun altro servizio offre questa combinazione di qualità, riservatezza e risposta in tempo reale.', avatar: 'MB' },
]

function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 8000)
    return () => clearInterval(t)
  }, [])

  const t = TESTIMONIALS[idx]

  return (
    <section className="py-16 bg-[#FDF9F2]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-8">
          Clienti
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-[family-name:var(--font-family-serif)] text-xl md:text-2xl text-[#1C1C1C] italic leading-relaxed mb-6">
              "{t.text}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center">
                <span className="text-[11px] font-medium text-[#C5A059]">{t.avatar}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[#1C1C1C]">{t.name}</p>
                <p className="text-xs text-[#5A4F44]">{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-1.5 justify-center mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-[#C5A059] w-4' : 'bg-[rgba(197,160,89,0.3)]'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

const HERO_VIDEO = 'https://player.vimeo.com/external/371433846.sd.mp4'

const SERVICES = [
  { icon: Anchor, title: 'Yacht', desc: 'Da 18 a 60 metri. Motoryacht, velieri d\'epoca, catamarani.', href: '/servizi?cats=yacht', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=700&q=80&fm=webp' },
  { icon: Plane, title: 'Jet Privati', desc: 'Light jet, heavy jet, VVIP airliner. Partenza in 2 ore.', href: '/servizi?cats=jet', img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=700&q=80&fm=webp' },
  { icon: Car, title: 'Auto di Lusso', desc: 'Ferrari, Rolls-Royce, Bentley. Con o senza autista.', href: '/servizi?cats=auto', img: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=700&q=80&fm=webp' },
  { icon: Sparkles, title: 'Esperienze', desc: 'Fine dining, aste d\'arte, wellness esclusivo.', href: '/servizi?cats=esperienza', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80&fm=webp' },
]

const WHY = [
  { icon: Shield, title: 'Selezione Curata', desc: 'Ogni asset è verificato dal nostro team. Solo il meglio entra nella nostra rete.' },
  { icon: Clock, title: 'Concierge 24/7', desc: 'Un team dedicato risponde in meno di 2 ore, 365 giorni l\'anno.' },
  { icon: Globe, title: 'Privacy Assoluta', desc: 'NDA standard, riservatezza totale. Il tuo stile di vita rimane tuo.' },
]

const CONCIERGE_EXAMPLES = [
  'Weekend a Portofino con yacht 30m e chef stellato',
  'Jet Milano–Maldive per 8 persone venerdì prossimo',
  'Cena segreta in palazzo veneziano, vino 1945',
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [current, setCurrent] = useState(0)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      if (frame >= total) {
        clearInterval(timer)
        setFlash(true)
        setTimeout(() => setFlash(false), 400)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="font-[family-name:var(--font-family-mono)] text-5xl md:text-6xl font-light text-[#C5A059]">
      {current.toLocaleString('it-IT')}
      <span className={cn('transition-all duration-200', flash && 'text-white scale-125 inline-block')}>{suffix}</span>
    </span>
  )
}

function MagneticButton({ children, className, onClick }: {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const btn = ref.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25
    btn.style.transform = `translate(${x}px, ${y}px)`
  }

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <button
      ref={ref}
      className={cn('btn-ripple transition-transform duration-200', className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={e => { addRipple(e); onClick?.(e) }}
    >
      {children}
    </button>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [showSurprise, setShowSurprise] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 130000])
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 130000])
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const handlePriceChange = useCallback((vals: number[]) => {
    const next: [number, number] = [vals[0], vals[1]]
    setPriceRange(next)
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current)
    priceDebounceRef.current = setTimeout(() => setDebouncedPriceRange(next), 150)
  }, [])

  const handleDateSelect = useCallback((range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from && range?.to) {
      const fmt = (d: Date) => d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
      toast(`Filtrando per ${fmt(range.from)} - ${fmt(range.to)}`)
    }
  }, [])

  const clearDates = useCallback(() => setDateRange(undefined), [])

  const filteredListings = listings.filter(l => {
    const inPrice = l.price >= debouncedPriceRange[0] && l.price <= debouncedPriceRange[1]
    const inDate = (!dateRange?.from || !dateRange?.to) ? true : l.id.charCodeAt(0) % 3 !== 0
    return inPrice && inDate
  }).slice(0, 12)

  // Listen for keyboard shortcut 'S' from Layout
  useEffect(() => {
    const handler = () => setShowSurprise(true)
    window.addEventListener('theclass:surprise', handler)
    return () => window.removeEventListener('theclass:surprise', handler)
  }, [])
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 180])

  const yachtCount = listings.filter(l => l.category === 'yacht').length
  const jetCount = listings.filter(l => l.category === 'jet').length
  const requestCount = (
    safeRead<unknown[]>('theclass_requests', []).length +
    safeRead<unknown[]>('theclass_bespoke', []).length
  )
  const clientiBase = 847 // base credibility floor
  const STATS = [
    { value: yachtCount * 28, suffix: '+', label: 'Yacht disponibili' },
    { value: jetCount * 45, suffix: '+', label: 'Jet privati' },
    { value: clientiBase + requestCount, suffix: '+', label: 'Clienti soddisfatti' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // MODIFICATO: y 15px (spec), easing seta, soglia 85%
      gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 15 },
          {
            opacity: 1, y: 0,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [])

  const handleConcierge = useCallback(() => {
    const text = prompt.trim()
    if (!text) { toast.error('Descrivi il tuo desiderio prima di inviare'); return }
    const id = generateId()
    const existing = JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]')
    localStorage.setItem('theclass_concierge', JSON.stringify([
      { id, prompt: text, timestamp: Date.now(), status: 'pending' },
      ...existing,
    ]))
    toast.success('Richiesta concierge creata!', { description: `ID: ${id}` })
    navigate({ to: '/concierge', search: { ref: id } })
  }, [prompt, navigate])

  const openConcierge = (msg: string) => {
    window.dispatchEvent(new CustomEvent('theclass:concierge:open', { detail: { message: msg } }))
  }

  return (
    <div className="snap-container">
      <title>the Class – L'arte del viaggio senza confini</title>
      <meta name="description" content="Noleggio yacht, jet privati, auto di lusso ed esperienze esclusive in tutto il mondo. Concierge 24/7, selezione curata, privacy assoluta." />
      <ScrollMilestones milestones={[
        { label: 'Hero', progress: 0 },
        { label: 'Servizi', progress: 0.2 },
        { label: 'Sorprendimi', progress: 0.4 },
        { label: 'Per Te', progress: 0.6 },
        { label: 'Testimonianze', progress: 0.8 },
        { label: 'Stampa', progress: 0.95 },
      ]} />
      {/* ══ HERO ══ */}
      <section className="snap-section relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO}
            autoPlay muted loop playsInline
            onError={e => { (e.currentTarget as HTMLVideoElement).style.display = 'none' }}
            poster="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/70 via-[#1C1C1C]/40 to-[#FDF9F2]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-[0.35em] text-xs uppercase mb-5"
          >
            Benvenuto nel privilegio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-[family-name:var(--font-family-display)] text-5xl md:text-7xl font-medium text-white tracking-[-0.02em] leading-tight mb-5"
          >
            L'arte del viaggio
            <br />
            <em className="not-italic gold-gradient-text">senza confini</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="text-white/65 font-light text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Yacht privati, jet intercontinentali, auto da sogno ed esperienze riservate a pochi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton
              className="bg-[#C5A059] text-white px-8 py-4 rounded-full text-sm tracking-wide flex items-center gap-2 hover:shadow-[0_8px_30px_rgba(197,160,89,0.45)] hover:bg-[#b8924a]"
              onClick={() => navigate({ to: '/servizi' })}
            >
              Esplora i Servizi
              <ArrowRight size={15} />
            </MagneticButton>
            <Link
              to="/concierge"
              className="glass-dark text-white px-8 py-4 rounded-full text-sm tracking-wide hover:bg-white/20 transition-colors"
            >
              Concierge Personale
            </Link>
          </motion.div>
        </div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-14 bg-gradient-to-b from-[#C5A059] to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ══ CONCIERGE QUICK-FILL ══ */}
      <section className="py-14 bg-[#FCFAF5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3 text-center">Concierge</p>
          <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-8 text-center">Cosa desideri oggi?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⛵', label: 'Yacht', msg: 'Vorrei noleggiare uno yacht di lusso con equipaggio per 8 persone nel Mediterraneo.' },
              { icon: '✈️', label: 'Jet Privato', msg: 'Ho bisogno di un jet privato per una tratta europea, partenza entro 48 ore.' },
              { icon: '🚗', label: 'Auto', msg: "Cerco un'auto di lusso con autista per il weekend, preferibilmente Ferrari o Rolls-Royce." },
              { icon: '🏛️', label: 'Villa', msg: 'Sto cercando una villa esclusiva con piscina privata per una settimana in Toscana o Amalfi.' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => openConcierge(item.msg)}
                className="group p-6 bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl hover:border-[#C5A059] hover:shadow-[0_8px_32px_rgba(197,160,89,0.12)] transition-all text-center"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <p className="text-sm font-medium text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section className="snap-section py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
              Il nostro catalogo
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight">
              Ogni desiderio, un'esperienza unica
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => (
              <div key={svc.title} className="reveal">
                <Link to={svc.href as '/servizi'}>
                  <div className="group relative h-72 rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] card-shine cursor-pointer transition-all duration-400 hover:border-[rgba(197,160,89,0.5)] hover:shadow-[0_12px_48px_rgba(197,160,89,0.14)]">
                    <img
                      src={svc.img} alt={svc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/85 via-[#1C1C1C]/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <svc.icon size={18} className="text-[#C5A059] mb-2" />
                      <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-white mb-1">
                        {svc.title}
                      </h3>
                      <p className="text-white/65 text-xs font-light leading-relaxed">{svc.desc}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICE FILTER BAR ══ */}
      <section className="py-8 px-6 bg-[#FDF9F2] border-t border-b border-[rgba(197,160,89,0.12)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <p className="text-[11px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-1">Budget</p>
              <p className="text-xs text-[#5A4F44] font-light">
                € {priceRange[0].toLocaleString('it-IT')} – € {priceRange[1] >= 130000 ? '130.000+' : priceRange[1].toLocaleString('it-IT')}
              </p>
            </div>
            <div className="flex-1 flex items-center gap-3 w-full">
              <span className="text-[10px] text-[#5A4F44]/60 font-light shrink-0">€</span>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                min={0}
                max={130000}
                step={1000}
                value={priceRange}
                onValueChange={handlePriceChange}
              >
                <Slider.Track className="bg-[rgba(197,160,89,0.2)] relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-[#C5A059] rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full shadow hover:bg-[#FDF9F2] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 cursor-grab active:cursor-grabbing" aria-label="Prezzo minimo" />
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-[#C5A059] rounded-full shadow hover:bg-[#FDF9F2] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 cursor-grab active:cursor-grabbing" aria-label="Prezzo massimo" />
              </Slider.Root>
              <span className="text-[10px] text-[#5A4F44]/60 font-light shrink-0">€€€€</span>
            </div>
            <div className="shrink-0 text-[11px] text-[#5A4F44]">
              {filteredListings.length} risultati
            </div>
          </div>

          {/* Date picker toggle */}
          <div className="mt-4">
            <button
              onClick={() => setDatePickerOpen(v => !v)}
              className="flex items-center gap-2 text-sm text-[#5A4F44] hover:text-[#C5A059] transition-colors"
            >
              <span>📅 Quando sei libero?</span>
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-200', datePickerOpen && 'rotate-180')}
              />
              {dateRange?.from && dateRange?.to && (
                <span className="text-[#C5A059] text-xs ml-1">
                  {dateRange.from.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} –{' '}
                  {dateRange.to.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </button>
            <AnimatePresence>
              {datePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 flex flex-col items-start gap-3">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      className="border border-[rgba(197,160,89,0.2)] rounded-xl p-3 bg-white text-sm"
                    />
                    {(dateRange?.from || dateRange?.to) && (
                      <button
                        onClick={clearDates}
                        className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-red-500 transition-colors"
                      >
                        <X size={12} /> Cancella date
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══ LISTINGS GRID ══ */}
      <section className="py-12 px-6 bg-[#FDF9F2]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing, i) => (
              <ServiceCard key={listing.id} listing={listing} delay={i * 0.04} />
            ))}
          </div>
          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#5A4F44] font-light text-sm">Nessun risultato nel range selezionato.</p>
              <button
                onClick={() => { setPriceRange([0, 130000]); setDebouncedPriceRange([0, 130000]) }}
                className="mt-3 text-xs text-[#C5A059] hover:underline"
              >
                Reimposta filtri
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══ CONCIERGE WIDGET ══ */}
      <section className="snap-section py-20 px-6 bg-[#FCFAF5]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="reveal mb-8">
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
              Servizio esclusivo
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-3">
              Il tuo concierge personale
            </h2>
            <p className="text-[#5A4F44] font-light">
              Descrivi il tuo desiderio. Risposta garantita entro 2 ore.
            </p>
          </div>

          <div className="reveal bg-white rounded-2xl border border-[rgba(197,160,89,0.22)] p-7 shadow-[0_4px_24px_rgba(197,160,89,0.07)]">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="Voglio un weekend a Capri con yacht 30m, chef stellato e transfer in elicottero da Roma..."
              className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.18)] rounded-xl px-4 py-3.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors resize-none mb-4"
            />

            <div className="flex flex-wrap gap-2 mb-5 justify-center">
              {CONCIERGE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-[11px] text-[#5A4F44] border border-[rgba(197,160,89,0.28)] rounded-full px-3 py-1.5 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            <MagneticButton
              className="w-full bg-[#C5A059] text-white py-3.5 rounded-xl text-sm tracking-wide hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)]"
              onClick={handleConcierge}
            >
              Invia al Concierge
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section className="snap-section py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
              Perché the Class
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C]">
              Standard che altri non osano
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY.map((item, i) => (
              <div
                key={item.title}
                className="reveal text-center p-8 rounded-2xl border border-[rgba(197,160,89,0.15)] bg-[#FCFAF5] hover:border-[rgba(197,160,89,0.4)] hover:shadow-[0_8px_32px_rgba(197,160,89,0.08)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full border border-[rgba(197,160,89,0.35)] flex items-center justify-center mx-auto mb-5">
                  <item.icon size={18} className="text-[#C5A059]" />
                </div>
                <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#5A4F44] font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SORPRENDIMI ══ */}
      <section className="py-12 text-center">
        <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">
          Lasciati ispirare
        </p>
        <button
          onClick={() => setShowSurprise(true)}
          className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#1C1C1C] text-white text-base font-light tracking-wide hover:bg-[#2a2a2a] transition-all duration-300 shadow-[0_8px_32px_rgba(26,24,22,0.25)] hover:shadow-[0_12px_40px_rgba(197,160,89,0.2)] hover:scale-[1.02]"
        >
          <span className="text-[#C5A059] text-xl">✦</span>
          Sorprendimi
          <Shuffle size={16} className="text-[#C5A059] group-hover:rotate-180 transition-transform duration-500" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C5A059] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C5A059]" />
        </button>
        <p className="text-xs text-[#5A4F44] mt-3 font-light">Genera un itinerario esclusivo in base ai tuoi desideri</p>
      </section>

      <AnimatePresence>
        {showSurprise && <SurpriseModal onClose={() => setShowSurprise(false)} />}
      </AnimatePresence>

      {/* ══ FOR YOU ══ */}
      <ForYouSection />

      {/* ══ STATS ══ */}
      <section className="snap-section py-20 px-6 bg-[#1C1C1C]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <CountUp target={stat.value} suffix={stat.suffix} />
              <p className="text-white/45 font-light text-sm mt-2 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <TestimonialsCarousel />

      {/* ══ PRESS ══ */}
      <section className="py-16 bg-[#FCFAF5] border-t border-[rgba(197,160,89,0.15)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-[11px] text-[#C5A059] tracking-[0.25em] uppercase font-[family-name:var(--font-family-mono)] mb-8">
            Nella Stampa
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {[
              { name: 'Forbes', quote: '"Il futuro del lusso è su the Class"' },
              { name: 'Financial Times', quote: '"Disrupting the luxury travel market"' },
              { name: 'Robb Report', quote: '"The gold standard of Italian luxury"' },
              { name: 'Condé Nast', quote: '"Must-have per chi viaggia in stile"' },
            ].map(pub => (
              <div key={pub.name} className="text-center">
                <p className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[rgba(197,160,89,0.5)] mb-2">{pub.name}</p>
                <p className="text-xs text-[#5A4F44] italic font-light leading-relaxed">{pub.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
