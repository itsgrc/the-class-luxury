import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'sonner'
import { ArrowRight, Anchor, Plane, Car, Sparkles, Shield, Clock, Globe } from 'lucide-react'
import { generateId, addRipple, cn } from '@/lib/utils'
import { listings } from '@/data/listings'
import { safeRead } from '@/lib/errorHandler'

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(eased * target))
      if (frame >= total) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="font-[family-name:var(--font-family-mono)] text-5xl md:text-6xl font-light text-[#C5A059]">
      {current.toLocaleString('it-IT')}{suffix}
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

  return (
    <div>
      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video background with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO}
            autoPlay muted loop playsInline
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

      {/* ══ SERVICES ══ */}
      <section className="py-24 px-6">
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

      {/* ══ CONCIERGE WIDGET ══ */}
      <section className="py-20 px-6 bg-[#FCFAF5]">
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
      <section className="py-24 px-6">
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

      {/* ══ STATS ══ */}
      <section className="py-20 px-6 bg-[#1C1C1C]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <CountUp target={stat.value} suffix={stat.suffix} />
              <p className="text-white/45 font-light text-sm mt-2 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
