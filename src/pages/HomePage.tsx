import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'sonner'
import { ArrowRight, Anchor, Plane, Car, Sparkles } from 'lucide-react'
import { generateId } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    icon: Anchor,
    title: 'Yacht',
    desc: 'Da 18 a 60 metri. Catamarani, motoryacht, velieri d\'epoca.',
    href: '/servizi?cats=yacht',
    img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=80',
  },
  {
    icon: Plane,
    title: 'Jet Privati',
    desc: 'Light jet, heavy jet, VVIP airliner. Partenza in 4 ore.',
    href: '/servizi?cats=jet',
    img: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
  },
  {
    icon: Car,
    title: 'Auto di Lusso',
    desc: 'Ferrari, Rolls-Royce, Bentley. Con o senza autista.',
    href: '/servizi?cats=auto',
    img: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&q=80',
  },
  {
    icon: Sparkles,
    title: 'Esperienze',
    desc: 'Fine dining, aste d\'arte, wellness privato, avventure.',
    href: '/servizi?cats=esperienza',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
]

const stats = [
  { value: 500, suffix: '+', label: 'Yacht disponibili' },
  { value: 200, suffix: '+', label: 'Jet privati' },
  { value: 1200, suffix: '+', label: 'Clienti soddisfatti' },
]

const whyUs = [
  {
    title: 'Selezione Curata',
    desc: 'Ogni asset è verificato dal nostro team. Solo il meglio entra nella nostra rete.',
  },
  {
    title: 'Concierge 24/7',
    desc: 'Un team dedicato risponde in meno di 2 ore, 365 giorni l\'anno.',
  },
  {
    title: 'Privacy Assoluta',
    desc: 'NDA standard, pagamenti tokenizzati, riservatezza totale sui clienti.',
  },
]

const conciergeExamples = [
  '"Voglio un weekend a Portofino con yacht e chef stellato"',
  '"Jet privato Milano–Maldive per 8 persone venerdì prossimo"',
  '"Cena segreta in un palazzo veneziano, vino 1945 incluso"',
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="font-[family-name:var(--font-family-mono)] text-5xl font-light text-[#C5A059]">
      {current.toLocaleString('it-IT')}{suffix}
    </span>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const [conciergePrompt, setConciergePrompt] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  const handleConcierge = () => {
    if (!conciergePrompt.trim()) {
      toast.error('Descrivi il tuo desiderio...')
      return
    }
    const id = generateId()
    const existing = JSON.parse(localStorage.getItem('tc_concierge') || '[]')
    localStorage.setItem('tc_concierge', JSON.stringify([
      { id, prompt: conciergePrompt, timestamp: Date.now(), status: 'in-attesa' },
      ...existing,
    ]))
    toast.success('Richiesta concierge creata!', { description: `ID: ${id}` })
    navigate({ to: '/servizi', search: { ref: id } })
  }

  return (
    <div className="noise-bg">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#1C1C1C]">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt="Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/60 via-[#1C1C1C]/30 to-[#FDF9F2]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-[family-name:var(--font-family-serif)] text-[#C5A059] tracking-[0.3em] text-sm uppercase mb-6 italic"
          >
            Benvenuto nel privilegio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-[family-name:var(--font-family-display)] text-5xl md:text-7xl font-medium text-white leading-tight tracking-[-0.02em] mb-6"
          >
            L'arte del viaggio
            <br />
            <span className="gold-gradient-text">senza confini</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="font-[family-name:var(--font-family-sans)] text-white/70 font-light text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Yacht privati, jet intercontinentali, auto da sogno ed esperienze riservate a pochi.
            La piattaforma che ridefinisce il lusso nell'era della libertà assoluta.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/servizi"
              className="group relative overflow-hidden bg-[#C5A059] text-white px-8 py-4 rounded-full font-[family-name:var(--font-family-sans)] text-sm tracking-wide flex items-center gap-2 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(197,160,89,0.4)] hover:scale-[1.02]"
            >
              Esplora i Servizi
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/concierge"
              className="glass text-white px-8 py-4 rounded-full font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all duration-300 hover:bg-white/20"
            >
              Concierge Personale
            </Link>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-[#C5A059] to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 gsap-reveal">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
            I nostri servizi
          </p>
          <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight">
            Ogni desiderio, un'esperienza unica
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              className="gsap-reveal group"
            >
              <Link to={svc.href as '/servizi'} className="block">
                <div className="relative h-72 rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm transition-all duration-500 hover:border-[rgba(197,160,89,0.5)] hover:shadow-[0_12px_40px_rgba(197,160,89,0.15)] card-shine">
                  <img
                    src={svc.img}
                    alt={svc.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-[#1C1C1C]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <svc.icon size={20} className="text-[#C5A059] mb-2" />
                    <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-white mb-1">
                      {svc.title}
                    </h3>
                    <p className="text-white/70 text-sm font-light leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONCIERGE WIDGET ── */}
      <section className="py-20 px-6 bg-[#FCFAF5]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="gsap-reveal mb-10">
            <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-3">
              Servizio esclusivo
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-4">
              Il tuo concierge personale
            </h2>
            <p className="text-[#5A4F44] font-light text-lg">
              Descrivi il tuo desiderio. Il nostro team risponderà entro 2 ore.
            </p>
          </div>

          <div className="gsap-reveal bg-white rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 shadow-[0_4px_24px_rgba(197,160,89,0.08)]">
            <textarea
              value={conciergePrompt}
              onChange={e => setConciergePrompt(e.target.value)}
              rows={3}
              placeholder="Es: Voglio un weekend a Capri con yacht 30m, chef stellato e trasferimento in elicottero da Roma..."
              className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.2)] rounded-xl px-5 py-4 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors resize-none mb-4"
            />

            {/* Examples */}
            <div className="flex flex-wrap gap-2 mb-5 justify-center">
              {conciergeExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setConciergePrompt(ex.replace(/"/g, ''))}
                  className="text-xs text-[#5A4F44] border border-[rgba(197,160,89,0.3)] rounded-full px-3 py-1.5 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            <button
              onClick={handleConcierge}
              className="w-full bg-[#C5A059] text-white py-4 rounded-xl font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)]"
            >
              Invia al Concierge
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 gsap-reveal">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-3">
            Perché the Class
          </p>
          <h2 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C]">
            Standard che altri non osano
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyUs.map((item, i) => (
            <div key={item.title} className="gsap-reveal text-center p-8 rounded-2xl border border-[rgba(197,160,89,0.15)] bg-[#FCFAF5] hover:border-[rgba(197,160,89,0.4)] transition-colors duration-300">
              <div className="w-12 h-12 rounded-full border border-[rgba(197,160,89,0.4)] flex items-center justify-center mx-auto mb-5">
                <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-3">
                {item.title}
              </h3>
              <p className="text-[#5A4F44] font-light text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="py-20 px-6 bg-[#1C1C1C]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map(stat => (
              <div key={stat.label} className="gsap-reveal">
                <CountUp target={stat.value} suffix={stat.suffix} />
                <p className="font-[family-name:var(--font-family-sans)] text-white/50 font-light text-sm mt-2 tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
