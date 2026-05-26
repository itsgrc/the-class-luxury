import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Shield, Clock, Gem, Anchor, Plane, Car, Star, MessageSquare, Wand2, X } from 'lucide-react'
import { toast } from 'sonner'
import { generateId } from '@/lib/utils'
import { PartnerLogos } from '@/components/PartnerLogos'
import { inspirations } from '@/data/inspirations'
import { listings } from '@/data/listings'
import { observeReveal } from '@/lib/scroll'
import { useSmartFactotum } from '@/hooks/useSmartFactotum'

const TESTIMONIALS = [
  { name: 'Alessandro M.', role: 'CEO, Tech Ventures', text: 'The Class ha trasformato il modo in cui organizzo i miei viaggi business. Efficienza e lusso senza compromessi.', avatar: 'AM' },
  { name: 'Sofia L.', role: 'Entrepreneur', text: 'Il concierge ha organizzato il nostro anniversario in 48 ore. Yacht, cena stellata e suite a Capri. Perfetto.', avatar: 'SL' },
  { name: 'Famiglia Rossi', role: 'Clienti Premium', text: "La villa in Sardegna era esattamente come la sognavamo. I bambini hanno vissuto un'estate magica.", avatar: 'FR' },
  { name: 'Marco B.', role: 'Luxury Collector', text: 'Nessun altro servizio offre questa combinazione di qualità, riservatezza e risposta in tempo reale.', avatar: 'MB' },
]

// ── 1. Social proof ticker items ──
const TICKER_ITEMS = [
  '2 ore fa: Yacht 25m — Costa Amalfitana prenotato',
  '5 ore fa: Jet Cessna Citation — Milano → Ginevra',
  '1 ora fa: Villa Sardegna — 7 notti confermato',
  '3 ore fa: Lamborghini Urus — Roma weekend',
  '6 ore fa: Gulfstream G650 — Londra → Dubai',
  '30 min fa: Suite Ritz Paris — 4 notti prenotato',
]

// ── 2. Last-minute offers ──
function getCountdown(targetMs: number): string {
  const diff = Math.max(0, targetMs - Date.now())
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const LAST_MINUTE = [
  { title: 'Riva Aquarama 8h', location: 'Lago di Como', priceOriginal: '€4.200', price: '€2.940', deadline: Date.now() + 5 * 3_600_000 + 12 * 60_000 },
  { title: 'Falcon 7X Slot', location: 'Milano → Nizza', priceOriginal: '€18.000', price: '€11.900', deadline: Date.now() + 11 * 3_600_000 + 33 * 60_000 },
  { title: 'Villa Positano', location: 'Costiera Amalfitana, 3 notti', priceOriginal: '€9.600', price: '€6.720', deadline: Date.now() + 8 * 3_600_000 + 5 * 60_000 },
]

function LastMinuteSection() {
  const [ticks, setTicks] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTicks(v => v + 1), 60_000)
    return () => clearInterval(t)
  }, [])
  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-[family-name:var(--font-family-mono)] tracking-widest uppercase bg-red-600 text-white px-3 py-1 rounded-full">
          ● Last Minute
        </span>
        <h2 className="font-playfair text-2xl text-[#1C1C1C]">Offerte in scadenza</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {LAST_MINUTE.map((item, _i) => (
          <div key={item.title} className="bg-white rounded-2xl border border-[rgba(197,160,89,0.18)] p-5 shadow-sm relative overflow-hidden">
            <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-[family-name:var(--font-family-mono)] px-2.5 py-0.5 rounded-full tracking-wider">
              Scade tra {getCountdown(item.deadline)} h
            </span>
            <p className="font-playfair text-lg text-[#1C1C1C] leading-snug mb-1 pr-24">{item.title}</p>
            <p className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)] mb-4">{item.location}</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="line-through text-[#5A4F44] text-sm">{item.priceOriginal}</span>
              <span className="text-[#C5A059] font-[family-name:var(--font-family-mono)] text-lg font-medium">{item.price}</span>
            </div>
            <button
              onClick={() => toast.success(`Opzione bloccata: ${item.title}`, { description: 'Il concierge ti contatterà entro 30 minuti' })}
              className="w-full py-2.5 bg-[#1C1C1C] text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors"
            >
              Blocca ora
            </button>
            {/* invisible dep to re-render on tick */}
            <span className="hidden">{ticks}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── 3. "Per te" personalized section ──
function PerTeSection() {
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('theclass_quiz_profile') ?? 'null') } catch { return null }
  })()
  if (!profile) {
    return (
      <section className="bg-[rgba(197,160,89,0.04)] py-10 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Personalizzazione</p>
          <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-3">Scopri le esperienze per te</h2>
          <p className="text-[#5A4F44] text-sm mb-6">Rispondi a 3 domande e il concierge costruirà la tua selezione personale.</p>
          <Link to="/quiz" className="inline-flex items-center gap-2 px-7 py-3 bg-[#C5A059] text-white rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
            Fai il quiz →
          </Link>
        </div>
      </section>
    )
  }
  const category = (profile as { category?: string }).category ?? 'yacht'
  const filtered = listings.filter(l => l.category === category).slice(0, 3)
  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Per te</p>
        <h2 className="font-playfair text-2xl text-[#1C1C1C]">Basato sul tuo profilo: <em className="text-[#C5A059] not-italic capitalize">{category}</em></h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {filtered.map(l => (
          <motion.div key={l.id} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm">
            <img src={l.image} className="w-full h-40 object-cover" alt={l.title} loading="lazy" />
            <div className="p-4">
              <p className="font-playfair text-base text-[#1C1C1C] mb-1">{l.title}</p>
              <p className="text-xs text-[#5A4F44]">{l.location}</p>
              <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm mt-2">€{l.price.toLocaleString('it-IT')}/{l.priceUnit}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ── 4. Booking count strip ──
function BookingCountStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const STATS = [
    { label: 'Clienti', value: 2400, suffix: '+' },
    { label: 'Asset disponibili', value: 500, suffix: '+' },
    { label: 'Destinazioni', value: 48, suffix: '' },
    { label: 'Risposta media', value: 2, suffix: 'h' },
  ]
  useEffect(() => {
    if (!inView || !ref.current) return
    ref.current.querySelectorAll<HTMLElement>('.bcs-number').forEach(el => {
      const target = parseInt(el.dataset.target ?? '0')
      const dur = 1400
      const step = target / (dur / 16)
      let cur = 0
      const tick = () => {
        cur += step
        if (cur < target) { el.innerText = Math.floor(cur).toLocaleString('it-IT'); requestAnimationFrame(tick) }
        else { el.innerText = target.toLocaleString('it-IT') }
      }
      requestAnimationFrame(tick)
    })
  }, [inView])
  return (
    <div ref={ref} className="bg-[#1C1C1C] py-8">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {STATS.map(s => (
          <div key={s.label}>
            <div className="flex items-end justify-center gap-0.5">
              {s.label === 'Risposta media' && <span className="text-[#C5A059] font-[family-name:var(--font-family-mono)] text-2xl mb-0.5">{'< '}</span>}
              <span className="bcs-number font-[family-name:var(--font-family-mono)] text-4xl text-[#C5A059]" data-target={s.value}>0</span>
              <span className="font-[family-name:var(--font-family-mono)] text-xl text-[#C5A059] mb-0.5">{s.suffix}</span>
            </div>
            <p className="text-white/50 text-[10px] font-[family-name:var(--font-family-mono)] tracking-widest uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 7. Come funziona section ──
function ComeFunzionaSection() {
  const steps = [
    { icon: MessageSquare, num: '1', title: 'Descrivi il desiderio', desc: 'Racconta cosa cerchi — anche un\'idea vaga. Il concierge capisce il non detto.' },
    { icon: Wand2, num: '2', title: 'Il concierge costruisce la proposta', desc: 'Entro 2 ore ricevi una selezione personalizzata, curata a mano per te.' },
    { icon: Star, num: '3', title: 'Vivi l\'esperienza', desc: 'Ogni dettaglio gestito. Tu arrivi. Noi abbiamo già pensato a tutto.' },
  ]
  return (
    <section className="bg-[#F5EFE4] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Il processo</p>
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Come funziona</h2>
          <div className="divider-gold-short" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center mx-auto mb-5">
                <step.icon size={22} className="text-[#C5A059]" />
              </div>
              <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] tracking-widest uppercase mb-2">Step {step.num}</p>
              <h3 className="font-playfair text-xl text-[#1C1C1C] mb-3">{step.title}</h3>
              <p className="text-[#5A4F44] text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 8. Club preview locked section ──
function ClubPreviewSection() {
  return (
    <section className="bg-[#1C1C1C] py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(197,160,89,0.05)] to-transparent pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center relative">
        <div
          className="rounded-3xl border border-[rgba(197,160,89,0.2)] p-10 md:p-14 relative overflow-hidden"
          style={{ backdropFilter: 'blur(8px)', background: 'rgba(28,28,28,0.6)' }}
        >
          {/* blur veil */}
          <div className="absolute inset-0 rounded-3xl" style={{ backdropFilter: 'blur(8px)' }} />
          <div className="relative z-10">
            <span className="inline-block text-[9px] font-[family-name:var(--font-family-mono)] tracking-[0.3em] uppercase border border-[rgba(197,160,89,0.4)] text-[#C5A059] px-4 py-1 rounded-full mb-6">
              Accesso Club Riservato
            </span>
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-playfair text-3xl text-white mb-4">Offerte private, aste silenziose,<br />esperienze non in catalogo</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-md mx-auto">
              Accesso esclusivo a dimore mai pubblicate, jet condivisi a costo zero e offerte riservate ai soci fondatori.
              Membership su approvazione personale.
            </p>
            <Link to="/profilo"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#C5A059] to-[#D4AF71] text-[#1C1C1C] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition shadow-lg shadow-[rgba(197,160,89,0.2)]">
              Richiedi membership →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 8000)
    return () => clearInterval(t)
  }, [])
  const t = TESTIMONIALS[idx]
  return (
    <section className="py-14 bg-[#FDF9F2]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-8">Clienti</p>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <p className="font-[family-name:var(--font-family-serif)] text-xl md:text-2xl text-[#1C1C1C] italic leading-relaxed mb-6">"{t.text}"</p>
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
            <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-[#C5A059] w-4' : 'bg-[rgba(197,160,89,0.3)]'}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 6. Sticky CTA bar ──
function StickyCtaBar() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (dismissed) return null
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#C5A059] text-white py-3 px-5 flex items-center justify-between shadow-xl"
        >
          <p className="text-sm font-[family-name:var(--font-family-mono)] tracking-wide">
            Hai domande? Il concierge risponde in &lt;&nbsp;2h
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.success('Il concierge ti contatterà a breve!', { description: 'Disponibile anche su WhatsApp e Telegram' })}
              className="px-5 py-2 bg-[#1C1C1C] text-white rounded-full text-[11px] font-[family-name:var(--font-family-mono)] tracking-widest uppercase hover:bg-white hover:text-[#1C1C1C] transition-colors"
            >
              Chatta ora
            </button>
            <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white transition" aria-label="Chiudi">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── 10. Exit intent newsletter modal ──
function ExitIntentNewsletter() {
  const [shown, setShown] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('theclass_exit_dismissed')) return
    const handler = (e: MouseEvent) => {
      if (e.clientY < 0 && !shown) {
        setShown(true)
      }
    }
    document.documentElement.addEventListener('mouseleave', handler)
    return () => document.documentElement.removeEventListener('mouseleave', handler)
  }, [shown])

  const dismiss = useCallback(() => {
    sessionStorage.setItem('theclass_exit_dismissed', '1')
    setShown(false)
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    sessionStorage.setItem('theclass_exit_dismissed', '1')
    setSubmitted(true)
    setTimeout(() => setShown(false), 2000)
  }, [email])

  if (!shown) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1C1C]/60 backdrop-blur-sm px-4" onClick={dismiss}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.3 }}
        className="bg-[#FDF9F2] rounded-3xl max-w-md w-full p-10 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={dismiss} className="absolute top-4 right-4 text-[#5A4F44]/50 hover:text-[#1C1C1C] transition" aria-label="Chiudi">
          <X size={20} />
        </button>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">✦</div>
            <h3 className="font-playfair text-2xl text-[#C5A059] mb-2">Benvenuto nel Club</h3>
            <p className="text-[#5A4F44] text-sm">Riceverai le offerte riservate in anticipo.</p>
          </div>
        ) : (
          <>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Prima di andare...</p>
            <h3 className="font-playfair text-2xl text-[#1C1C1C] mb-3">Iscriviti per accedere alle offerte riservate</h3>
            <p className="text-[#5A4F44] text-sm mb-6 leading-relaxed">Last minute esclusivi, aste silenziose e selezioni private. Disponibili solo per iscritti.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="La tua email"
                required
                className="px-5 py-3.5 rounded-full border border-[rgba(197,160,89,0.3)] bg-white text-sm focus:outline-none focus:border-[#C5A059] transition"
              />
              <button type="submit" className="py-3.5 bg-[#C5A059] text-white rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
                Iscriviti
              </button>
            </form>
            <button onClick={dismiss} className="mt-4 w-full text-center text-xs text-[#5A4F44]/50 hover:text-[#5A4F44] transition">
              No grazie, continuo senza
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-15%' })
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 160])

  useEffect(() => {
    const cleanup = observeReveal()
    return cleanup
  }, [])

  useEffect(() => {
    if (!statsInView || !statsRef.current) return
    statsRef.current.querySelectorAll<HTMLElement>('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target ?? '0')
      const duration = 1500
      const step = target / (duration / 16)
      let current = 0
      const tick = () => {
        current += step
        if (current < target) {
          el.innerText = Math.floor(current).toLocaleString('it-IT')
          requestAnimationFrame(tick)
        } else {
          el.innerText = target.toLocaleString('it-IT')
        }
      }
      requestAnimationFrame(tick)
    })
  }, [statsInView])

  const { suggestions, dismiss, addToFactotum } = useSmartFactotum()

  const handleConciergeRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const desire = (new FormData(e.currentTarget).get('desire') as string ?? '').trim()
    if (!desire) return
    const id = generateId()
    const existing = (() => { try { return JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]') } catch { return [] } })()
    existing.push({ id, prompt: desire, timestamp: Date.now(), status: 'pending' })
    localStorage.setItem('theclass_concierge', JSON.stringify(existing))
    toast.success(`Richiesta ricevuta #${id.slice(-6)}. Il concierge ti risponderà a breve.`)
    e.currentTarget.reset()
    setTimeout(() => { window.location.href = `/concierge?ref=${id}` }, 1500)
  }

  return (
    <>
      {/* ── 1. Social proof ticker ── */}
      <div className="bg-[#1C1C1C] overflow-hidden py-2.5">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{
            animation: 'marquee-scroll 32s linear infinite',
            willChange: 'transform',
          }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-white/80 text-[11px] font-[family-name:var(--font-family-mono)] tracking-wide">
              <span className="text-[#C5A059] mr-2">✦</span>{item}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ══ HERO ══ */}
      {/* ── 5. Hero video background ── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
          {/* Video background (CSS-ready, src empty — falls back to img) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            src=""
            className="absolute inset-0 object-cover w-full h-full opacity-30 z-0"
          />
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&q=90&auto=format&fit=crop"
            alt=""
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/50 via-[#1C1C1C]/20 to-[#FDF9F2]" />
        </motion.div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-[0.25em] text-[10px] uppercase mb-5">
            Membership su invito
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
            className="font-playfair text-5xl md:text-7xl text-white drop-shadow-lg mb-6 leading-tight">
            Il lusso non si compra.<br />
            <em className="not-italic text-gold-matte">Si orchestra.</em>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="font-cormorant text-xl md:text-2xl text-white/90 italic max-w-2xl mx-auto mb-10">
            Una membership privata che riunisce yacht, jet, dimore, auto da collezione e fractional ownership.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/servizi" className="px-8 py-3.5 bg-gold-matte text-velvet-black rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
              Esplora i servizi
            </Link>
            <Link to="/concierge" className="px-8 py-3.5 border border-white/70 text-white rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-white/10 transition">
              Richiesta concierge
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ CREDO ══ */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-6">Il nostro manifesto</p>
        <p className="font-cormorant text-[#5A4F44] text-xl md:text-2xl italic leading-relaxed mb-6">
          Crediamo che la ricchezza autentica non si misuri in beni accumulati, ma nella qualità delle ore che ci appartengono.
        </p>
        <p className="text-[#1C1C1C] leading-relaxed mb-4">
          the Class non è un marketplace. È un atelier di rapporti umani, costruito attorno a poche famiglie, imprenditori e collezionisti che riconoscono il valore di un interlocutore unico: chi anticipa il desiderio prima che venga pronunciato.
        </p>
        <p className="text-[#5A4F44] text-sm leading-relaxed">
          Discrezione assoluta, NDA reciproci, partner selezionati uno ad uno. Nessuna vetrina, nessun rumore.
        </p>
      </section>

      {/* ══ STATISTICHE ══ */}
      <section className="bg-card-bg py-14 border-y border-[rgba(197,160,89,0.2)]" ref={statsRef}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Yacht & Super Yacht', target: 500, suffix: '+' },
            { label: 'Jet Privati', target: 200, suffix: '+' },
            { label: 'Clienti soddisfatti', target: 1200, suffix: '+' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="flex items-end justify-center gap-1">
                <span className="stat-number font-[family-name:var(--font-family-mono)] text-5xl text-[#C5A059]" data-target={stat.target}>0</span>
                <span className="font-[family-name:var(--font-family-mono)] text-2xl text-[#C5A059] mb-1">{stat.suffix}</span>
              </div>
              <div className="text-[#5A4F44] text-xs mt-2 uppercase tracking-[0.18em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Booking count strip ── */}
      <BookingCountStrip />

      {/* ══ PARTNER LOGOS ══ */}
      <PartnerLogos />

      {/* ══ CATEGORIE ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Categorie in evidenza</h2>
          <Link to="/servizi" className="gold-underline text-[#C5A059] text-sm">Vedi tutto →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Yacht', icon: Anchor, href: '/servizi?cats=yacht' },
            { label: 'Jet Privati', icon: Plane, href: '/servizi?cats=jet' },
            { label: 'Auto di Lusso', icon: Car, href: '/servizi?cats=auto' },
            { label: 'Fractional', icon: Star, href: '/servizi?cats=fractional' },
            { label: 'Concierge', icon: Shield, href: '/concierge' },
            { label: 'Esperienze', icon: Gem, href: '/servizi?cats=esperienza' },
          ].map(cat => (
            <Link key={cat.label} to={cat.href as '/'}
              className="bg-card-bg border border-[rgba(197,160,89,0.2)] rounded-xl p-5 text-center hover:border-[rgba(197,160,89,0.55)] transition-all lift-hover flex flex-col items-center gap-3">
              <cat.icon size={20} className="text-[#C5A059]" />
              <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44] tracking-wider uppercase">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Per te personalized section ── */}
      <PerTeSection />

      {/* ── 2. Last minute urgency ── */}
      <LastMinuteSection />

      {/* ══ ESPERIENZE ══ */}
      <section className="bg-card-bg py-14">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl text-center text-[#1C1C1C] mb-10">Le esperienze più richieste questa settimana</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Sanlorenzo SL86', cat: 'Yacht', price: '€8.500/giorno', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80' },
              { title: 'Gulfstream G650', cat: 'Jet Privato', price: 'Su richiesta', img: 'https://images.unsplash.com/photo-1540962351504-5bdd6d022c7f?w=800&q=80' },
              { title: 'Sotheby\'s Auction Access', cat: 'Esperienza', price: '€12.000/evento', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80' },
            ].map(exp => (
              <motion.div key={exp.title} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}
                className="bg-[#FDF9F2] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm">
                <div className="relative h-48 overflow-hidden">
                  <img src={exp.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt={exp.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-widest uppercase">{exp.cat}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-xl text-[#1C1C1C] mb-1">{exp.title}</h3>
                  <p className="text-[#5A4F44] text-sm mb-3">Servizio di rappresentanza, equipaggio incluso.</p>
                  <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm">{exp.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ULTIMI ARRIVI ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Freschi di flotta</p>
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Ultimi arrivi</h2>
          <div className="divider-gold-short" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { name: 'Sunseeker Predator 55', cat: 'Motoryacht', badge: 'Nuovo' },
            { name: 'Riva 88 Folgore', cat: 'Day Cruiser', badge: 'Esclusiva' },
            { name: 'Lamborghini Revuelto', cat: 'Supercar', badge: 'Limitato' },
            { name: 'Gulfstream G700', cat: 'Ultra Long Range', badge: 'Premium' },
          ].map(item => (
            <div key={item.name} className="luxury-card rounded-2xl p-6 text-center">
              <span className="inline-block text-[9px] font-[family-name:var(--font-family-mono)] tracking-widest text-[#C5A059] border border-[rgba(197,160,89,0.4)] rounded-full px-3 py-0.5 mb-4 uppercase">
                {item.badge}
              </span>
              <p className="font-playfair text-[#1C1C1C] text-base leading-snug">{item.name}</p>
              <p className="text-[#5A4F44] text-xs mt-1 font-[family-name:var(--font-family-mono)] tracking-wider">{item.cat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CONCIERGE WIDGET ══ */}
      <section className="py-16 px-6 bg-[rgba(197,160,89,0.04)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">Il tuo concierge</p>
          <h2 className="font-playfair text-3xl md:text-4xl text-[#1C1C1C] mb-3">Parla con il tuo Concierge</h2>
          <p className="font-cormorant text-[#5A4F44] text-lg mb-8 italic">Descrivi l'esperienza che cerchi — ti troveremo la proposta perfetta.</p>
          <form onSubmit={handleConciergeRequest} className="flex flex-col md:flex-row gap-4">
            <input name="desire" placeholder='Es. "Cerco uno yacht a Porto Cervo per 8 persone ad agosto"'
              className="flex-1 px-5 py-4 rounded-full border border-[rgba(197,160,89,0.3)] bg-white/80 text-sm focus:outline-none focus:border-[#C5A059] transition gold-focus" />
            <button className="px-8 py-4 bg-velvet-black text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-[#C5A059] transition-colors">
              Invia
            </button>
          </form>
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {['Yacht 10 giorni Costiera', 'Jet Milano → Ibiza', 'Weekend VIP Montecarlo', 'Chef stellato a domicilio'].map(ex => (
              <button key={ex} onClick={() => { const el = document.querySelector<HTMLInputElement>('input[name="desire"]'); if (el) el.value = ex }}
                className="text-xs text-[#5A4F44] bg-[#FCFAF5] border border-[rgba(197,160,89,0.2)] px-3 py-1.5 rounded-full hover:bg-[rgba(197,160,89,0.08)] transition">
                "{ex}"
              </button>
            ))}
          </div>
          <p className="text-xs text-[#5A4F44] mt-4">Risposta garantita entro 24 ore</p>
        </div>
      </section>

      {/* ══ FACTOTUM TEASER ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="rounded-3xl border border-[rgba(197,160,89,0.22)] bg-gradient-to-br from-[#FDF9F2] to-[#FCFAF5] p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 shadow-[0_4px_32px_rgba(197,160,89,0.06)]">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Esclusivo</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-[#C5A059] mb-3">Il tuo Factotum Personale</h3>
            <p className="text-[#5A4F44] leading-relaxed max-w-md mb-6">
              Gestisci promemoria, scadenze fiscali (IVA, IMU, bollo) e impegni. Export ICS, Google Calendar, notifiche smart.
            </p>
            <Link to="/concierge" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-matte text-velvet-black rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
              Apri il Factotum →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[['🗓', 'Scadenze fiscali'], ['⏰', 'Promemoria smart'], ['📎', 'ICS Export'], ['📊', 'Dashboard IMU']].map(([icon, label]) => (
              <div key={label} className="bg-white rounded-2xl p-4 text-center border border-[rgba(197,160,89,0.12)] shadow-premium lift-hover">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PERCHÉ THE CLASS ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="font-playfair text-4xl text-center text-[#1C1C1C] mb-14">Perché the Class</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { Icon: Shield, title: 'Partner verificati', desc: 'Ogni fornitore è selezionato e validato personalmente dal nostro team. Zero sorprese, zero compromessi.' },
            { Icon: Clock, title: 'Assistenza 24/7', desc: 'Concierge dedicato sempre disponibile, in ogni fuso orario. Risposta garantita entro 2 ore.' },
            { Icon: Gem, title: 'Esperienze certificate', desc: 'Standard di qualità e discrezione assoluti. NDA reciproci, privacy totale.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="text-center group border border-[rgba(197,160,89,0.12)] rounded-2xl p-8 bg-card-bg lift-hover">
              <div className="w-14 h-14 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mx-auto mb-5 group-hover:bg-[rgba(197,160,89,0.2)] transition">
                <Icon size={22} className="text-[#C5A059]" />
              </div>
              <h3 className="font-playfair text-xl text-[#1C1C1C] mb-3">{title}</h3>
              <p className="text-[#5A4F44] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LUXURY COMPASS ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14 reveal-on-scroll">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Personalizza</p>
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Luxury Compass</h2>
          <div className="divider-gold-short" />
          <p className="text-[#5A4F44] text-sm mt-2">Seleziona un umore — ti suggeriamo l'esperienza perfetta</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {['Avventura', 'Relax', 'Romanticismo', 'Business', 'Famiglia'].map(mood => (
            <button key={mood}
              onClick={() => toast(`Cerco esperienze "${mood}" per te...`, { description: 'Il concierge ti contatterà entro 2 ore' })}
              className="px-6 py-3 rounded-full border border-[rgba(197,160,89,0.4)] bg-white/20 hover:bg-[rgba(197,160,89,0.1)] hover:border-[#C5A059] transition font-[family-name:var(--font-family-mono)] text-sm text-[#5A4F44] hover:text-[#C5A059]">
              {mood}
            </button>
          ))}
        </div>
      </section>

      {/* ══ ISPIRAZIONI ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Curate per te</p>
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Ispirazioni per te</h2>
          <div className="divider-gold-short" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {inspirations.map(item => (
            <Link key={item.title} to="/servizi" className="glass-satin rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg block">
              <img src={item.image} className="h-40 w-full object-cover" alt={item.title} loading="lazy" />
              <div className="p-4">
                <span className="text-[9px] font-[family-name:var(--font-family-mono)] tracking-widest text-[#C5A059] uppercase">{item.category}</span>
                <h3 className="font-playfair text-base text-[#1C1C1C] mt-1 leading-snug">{item.title}</h3>
                <p className="text-[#5A4F44] text-xs mt-1">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ YACHT PIÙ DESIDERATI ══ */}
      <section className="max-w-7xl mx-auto px-6 py-14 reveal-on-scroll">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Fleet selection</p>
          <h2 className="font-playfair text-3xl gold-title">Yacht più desiderati</h2>
          <div className="divider-gold-short" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {listings.filter(l => l.category === 'yacht').slice(0, 3).map(y => (
            <motion.div key={y.id} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.18)] shadow-sm bg-[#FDF9F2]">
              <div className="relative h-52 overflow-hidden">
                <img src={y.image} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={y.title} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/75 via-transparent to-transparent" />
                {y.trending && (
                  <span className="absolute top-3 right-3 text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059] border border-[rgba(197,160,89,0.5)] rounded-full px-2.5 py-0.5 bg-[rgba(28,28,28,0.6)] uppercase tracking-widest">
                    Trending
                  </span>
                )}
                <div className="absolute bottom-3 left-4">
                  <p className="font-playfair text-white text-lg leading-snug">{y.title}</p>
                  <p className="text-[10px] text-white/70 font-[family-name:var(--font-family-mono)]">{y.location}</p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex gap-3 text-[11px] text-[#5A4F44] font-[family-name:var(--font-family-mono)]">
                  <span>⭐ {y.rating}</span>
                  <span className="text-[rgba(197,160,89,0.4)]">|</span>
                  <span>{y.reviews} rec.</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm">
                    €{y.price.toLocaleString('it-IT')}/{y.priceUnit}
                  </span>
                  <button onClick={() => toast(`Richiesta per ${y.title} inviata`, { description: 'Il concierge ti risponderà entro 2 ore' })}
                    className="px-4 py-1.5 bg-[#1C1C1C] text-[#FDF9F2] rounded-full text-[10px] font-[family-name:var(--font-family-mono)] tracking-wider uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors">
                    Prenota
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/servizi" className="inline-flex items-center gap-2 text-sm text-[#C5A059] font-[family-name:var(--font-family-mono)] tracking-wider hover:underline underline-offset-4">
            Vedi tutta la flotta →
          </Link>
        </div>
      </section>

      {/* ── 7. Come funziona section (after yacht) ── */}
      <ComeFunzionaSection />

      {/* ── 9. "Sfoglia le Stories" with badge ── */}
      <section className="max-w-7xl mx-auto px-6 py-8 text-center">
        <div className="inline-flex items-center gap-3">
          <Link to="/stories" className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm tracking-wider hover:underline underline-offset-4">
            Sfoglia le Stories
          </Link>
          <span className="text-[10px] bg-[#C5A059] text-white font-[family-name:var(--font-family-mono)] tracking-wider px-2 py-0.5 rounded-full leading-none">
            ✦ Novità
          </span>
        </div>
      </section>

      {/* ══ MAGIC TRIP ══ */}
      <section className="py-16 bg-[#1C1C1C] reveal-on-scroll">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">AI-Powered</p>
          <h2 className="font-playfair text-4xl gold-title mb-3">Magic Trip</h2>
          <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mb-4" />
          <p className="font-cormorant text-[#C5A059]/80 text-xl italic mb-10">
            Scegli tre ingredienti. Il Factotum costruisce il viaggio dei tuoi sogni.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                label: 'Tipo di viaggio',
                options: ['Solo mare', 'Avventura', 'City break', 'Montagna'],
                emoji: '🧭',
              },
              {
                label: 'Con chi',
                options: ['Solo', 'Coppia', 'Famiglia', 'Friend group'],
                emoji: '👥',
              },
              {
                label: 'Durata',
                options: ['Weekend', '5 giorni', '10 giorni', '3 settimane'],
                emoji: '🗓️',
              },
            ].map(({ label, options, emoji }) => (
              <div key={label} className="bg-white/5 border border-[rgba(197,160,89,0.2)] rounded-2xl p-5 text-left">
                <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-widest uppercase mb-3">{emoji} {label}</p>
                <div className="flex flex-col gap-2">
                  {options.map(opt => (
                    <button key={opt}
                      onClick={e => {
                        const btn = e.currentTarget
                        btn.parentElement?.querySelectorAll('button').forEach(b => b.classList.remove('!bg-[rgba(197,160,89,0.2)]', '!text-[#C5A059]', '!border-[#C5A059]'))
                        btn.classList.add('!bg-[rgba(197,160,89,0.2)]', '!text-[#C5A059]', '!border-[#C5A059]')
                      }}
                      className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-[rgba(197,160,89,0.5)] hover:text-white/90 transition text-left">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              toast('✨ Il tuo Magic Trip è in costruzione!', { description: 'Il concierge ti invierà un itinerario personalizzato entro 2 ore' })
            }}
            className="px-10 py-4 bg-gradient-to-r from-[#C5A059] to-[#D4AF71] text-[#1C1C1C] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition shadow-lg shadow-[rgba(197,160,89,0.3)]">
            Genera il mio itinerario →
          </button>
          <p className="text-white/30 text-xs mt-4 font-[family-name:var(--font-family-mono)]">Elaborato da The Class AI · Confidenziale</p>
        </div>
      </section>

      {/* ── 8. Club preview locked section ── */}
      <ClubPreviewSection />

      {/* ══ SMART SUGGESTIONS ══ */}
      {suggestions.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-14 reveal-on-scroll">
          <div className="text-center mb-8">
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Factotum AI</p>
            <h2 className="font-playfair text-3xl text-[#1C1C1C]">Suggerimenti per te</h2>
            <div className="divider-gold-short" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.slice(0, 3).map(s => (
              <div key={s.id} className="luxury-card rounded-2xl p-5 flex gap-4 items-start">
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-playfair text-sm text-[#1C1C1C] leading-snug">{s.title}</p>
                    <button onClick={() => dismiss(s.id)} className="text-[#5A4F44]/40 hover:text-[#5A4F44] text-xs shrink-0">✕</button>
                  </div>
                  <p className="text-xs text-[#5A4F44] mb-3 leading-relaxed">{s.description}</p>
                  <button
                    onClick={() => s.type === 'fiscal' ? addToFactotum(s) : toast(`Richiesta "${s.title}" inviata al concierge`)}
                    className="text-[10px] text-[#C5A059] font-[family-name:var(--font-family-mono)] tracking-wider hover:underline underline-offset-2">
                    {s.cta} →
                  </button>
                </div>
                {s.urgency === 'high' && (
                  <span className="shrink-0 w-2 h-2 rounded-full bg-red-400 mt-1" title="Urgente" />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ TESTIMONIALS ══ */}
      <TestimonialsCarousel />

      {/* ── 6. Sticky CTA bar ── */}
      <StickyCtaBar />

      {/* ── 10. Exit intent newsletter ── */}
      <ExitIntentNewsletter />
    </>
  )
}
