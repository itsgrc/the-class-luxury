// src/pages/ChiSiamoPage.tsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Users, Globe, Award, CheckCircle, ArrowRight, Clock } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const TEAM = [
  { name: 'Alessandro Moretti', role: 'CEO & Founder', avatar: 'https://i.pravatar.cc/150?img=11', bio: '20 anni nel lusso. Ex Goldman Sachs, appassionato di vela e aviazione.' },
  { name: 'Giulia Ferrara', role: 'Head of Concierge', avatar: 'https://i.pravatar.cc/150?img=5', bio: 'Ex Four Seasons Dubai. Parla 5 lingue, conosce ogni maitre d\'hôtel di Montecarlo.' },
  { name: 'Lorenzo Bianchi', role: 'CTO', avatar: 'https://i.pravatar.cc/150?img=15', bio: 'Ingegnere del software con 10 anni in Silicon Valley. Ora costruisce il futuro del luxury tech.' },
  { name: 'Camille Dupont', role: 'Partnerships Director', avatar: 'https://i.pravatar.cc/150?img=45', bio: 'Rete esclusiva di 300+ armatori, operatori jet e proprietari di ville in 40 paesi.' },
]

const VALUES = [
  { icon: Shield, title: 'Fiducia', desc: 'Ogni partner è verificato direttamente dal nostro team. Nessuna lista aggregata.' },
  { icon: Users, title: 'Discrezione', desc: 'NDA standard, server europei, zero dati condivisi con terze parti.' },
  { icon: Globe, title: 'Presenza', desc: 'Uffici a Milano, Monaco, Dubai e Singapore. Reperibili ovunque tu sia.' },
  { icon: Award, title: 'Eccellenza', desc: 'Solo il top 3% degli asset richiesti entra nel nostro portfolio.' },
]

const TIMELINE = [
  { year: '2019', event: 'Fondazione a Milano', desc: 'Alessandro Moretti lancia the Class con un team di 4 persone.' },
  { year: '2021', event: '500 asset verificati', desc: 'Raggiunto il traguardo dei 500 asset yacht, jet e auto in portfolio.' },
  { year: '2023', event: 'Apertura Dubai', desc: 'Inaugurato il terzo ufficio internazionale nel cuore degli Emirati.' },
  { year: '2025', event: '2.400 clienti', desc: 'La community esclusiva supera i 2.400 membri attivi in tutto il mondo.' },
  { year: '2026', event: 'Launch piattaforma', desc: 'Debutto della nuova piattaforma digitale con concierge AI-powered.' },
]

const MEDIA = ['Forbes', 'Financial Times', 'Condé Nast Traveller', 'Forbes Italia', 'Robb Report']

const HOW_STEPS = [
  { icon: '🔑', title: 'Entra nella rete', desc: 'Richiedi l\'accesso e vieni verificato dal nostro team in 24 ore.' },
  { icon: '✨', title: 'Descrivi il desiderio', desc: 'Il tuo concierge dedicato raccoglie ogni dettaglio della tua richiesta.' },
  { icon: '🌟', title: 'Vivi l\'esperienza', desc: 'Goditi l\'esperienza: ci occupiamo di tutto, dal primo all\'ultimo dettaglio.' },
]

const AWARDS = [
  { title: 'Best Luxury Platform Italia 2025', org: 'Luxury Awards Italy' },
  { title: 'HNWI Trust Award', org: 'Private Wealth Forum' },
  { title: 'Top Concierge Service EU', org: 'European Luxury Council' },
]

const OFFICES = [
  { city: 'Milano', country: 'Italia', tz: 'Europe/Rome', flag: '🇮🇹' },
  { city: 'Monaco', country: 'Francia', tz: 'Europe/Paris', flag: '🇲🇨' },
  { city: 'Dubai', country: 'UAE', tz: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬' },
]

function useAnimatedCounter(target: number, duration = 1600, active = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return value
}

function LocalTime({ tz }: { tz: string }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('it-IT', { timeZone: tz, hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [tz])
  return <span>{time}</span>
}

export function ChiSiamoPage() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const c500 = useAnimatedCounter(500, 1400, statsVisible)
  const c300 = useAnimatedCounter(300, 1400, statsVisible)
  const c40 = useAnimatedCounter(40, 1000, statsVisible)
  const c2400 = useAnimatedCounter(2400, 1800, statsVisible)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Chi Siamo — the Class</title>
        <meta name="description" content="the Class: la piattaforma luxury italiana per yacht, jet privati, auto e esperienze esclusive. Scopri il team e i valori." />
      </Helmet>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-4"
        >
          Chi siamo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-[family-name:var(--font-family-display)] text-5xl md:text-6xl font-medium text-[#1C1C1C] leading-tight mb-6"
        >
          Il lusso come dovrebbe essere.<br />
          <span className="gold-gradient-text">Sempre.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-[#5A4F44] font-light leading-relaxed max-w-2xl mx-auto"
        >
          Nati a Milano nel 2019, the Class è la risposta italiana alla frammentazione del mercato luxury.
          Una piattaforma costruita da appassionati per chi non accetta compromessi: yacht, jet, auto d'epoca
          e esperienze irripetibili in un unico ecosistema curato.
        </motion.p>
      </div>

      {/* Manifesto pull-quote */}
      <div className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="relative">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-7xl text-[#C5A059] font-serif leading-none opacity-30 select-none">"</span>
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-family-display)] text-2xl md:text-3xl italic text-[#1C1C1C] leading-relaxed px-8 py-6 border-l-4 border-[#C5A059] text-left"
          >
            Il vero lusso non si compra. Si cura, si costruisce e si vive con chi ha la stessa visione del mondo.
          </motion.blockquote>
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.25em] mt-3">— Alessandro Moretti, Fondatore</p>
        </div>
      </div>

      {/* Citati da */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white border-y border-[rgba(197,160,89,0.15)] py-10 mb-20"
      >
        <p className="text-center text-[10px] text-[#5A4F44] uppercase tracking-[0.3em] mb-6">Citati da</p>
        <div className="flex flex-wrap items-center justify-center gap-8 px-6">
          {MEDIA.map((m) => (
            <span key={m} className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]/40 hover:text-[#C5A059] transition-colors">
              {m}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-7 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mx-auto mb-4">
                <Icon size={20} className="text-[#C5A059]" />
              </div>
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-2">{title}</h3>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Come funziona */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-12">Come funziona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center mx-auto mb-4 text-2xl">
                {step.icon}
              </div>
              <div className="text-[10px] text-[#C5A059] font-medium uppercase tracking-widest mb-2">Step {i + 1}</div>
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-2">{step.title}</h3>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partner network animated counter strip */}
      <div ref={statsRef} className="bg-[rgba(197,160,89,0.08)] border-y border-[rgba(197,160,89,0.15)] py-12 mb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-4xl text-[#C5A059] mb-1">{c500}+</p>
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider">Asset in portfolio</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-4xl text-[#C5A059] mb-1">{c300}+</p>
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider">Partner certificati</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-4xl text-[#C5A059] mb-1">{c40}</p>
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider">Paesi coperti</p>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers dark strip */}
      <div className="bg-[#1C1C1C] py-16 mb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-3xl text-[#C5A059] mb-1">{statsVisible ? c500 : 0}+</p>
              <p className="text-xs text-white/50">Asset verificati</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-3xl text-[#C5A059] mb-1">{statsVisible ? c40 : 0}</p>
              <p className="text-xs text-white/50">Paesi coperti</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-3xl text-[#C5A059] mb-1">{statsVisible ? c2400 : 0}+</p>
              <p className="text-xs text-white/50">Clienti soddisfatti</p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-family-mono)] text-3xl text-[#C5A059] mb-1">{'< 2h'}</p>
              <p className="text-xs text-white/50">Tempo risposta medio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-14">La nostra storia</h2>
        <div className="relative">
          {/* Vertical gold line */}
          <div className="absolute left-[28px] top-0 bottom-0 w-px bg-[rgba(197,160,89,0.3)]" />
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="w-14 shrink-0 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#C5A059] flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                  <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] mt-1.5 font-medium">{item.year}</span>
                </div>
                <div className="bg-white rounded-xl border border-[rgba(197,160,89,0.15)] p-4 flex-1 mb-1">
                  <h3 className="font-medium text-sm text-[#1C1C1C] mb-1">{item.event}</h3>
                  <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-10">Riconoscimenti</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AWARDS.map((award, i) => (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-[rgba(197,160,89,0.25)] p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mx-auto mb-4">
                <Award size={22} className="text-[#C5A059]" />
              </div>
              <h3 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-1 leading-snug">{award.title}</h3>
              <p className="text-[10px] text-[#C5A059] uppercase tracking-wider">{award.org}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Uffici globali */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-10">Presenza globale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {OFFICES.map((office, i) => (
            <motion.div
              key={office.city}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl border border-[rgba(197,160,89,0.15)] p-5 text-center"
            >
              <div className="text-2xl mb-2">{office.flag}</div>
              <h3 className="font-medium text-sm text-[#1C1C1C] mb-0.5">{office.city}</h3>
              <p className="text-[10px] text-[#5A4F44] mb-2">{office.country}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-[#C5A059]">
                <Clock size={9} />
                <LocalTime tz={office.tz} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* NDA + Privacy pledge */}
      <div className="max-w-3xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-[rgba(197,160,89,0.2)] p-8 flex gap-6"
        >
          <div className="w-12 h-12 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center shrink-0 mt-1">
            <Shield size={22} className="text-[#C5A059]" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-2">NDA & Privacy Pledge</h3>
            <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-3">
              Ogni transazione è coperta da un accordo di riservatezza standard. I tuoi dati non vengono mai condivisi con terze parti senza consenso esplicito. Server europei, crittografia end-to-end, conformità GDPR totale.
            </p>
            <div className="flex flex-wrap gap-2">
              {['NDA standard', 'Server EU', 'GDPR compliant', 'Zero data sharing'].map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] text-[#C5A059] bg-[rgba(197,160,89,0.1)] px-2.5 py-1 rounded-full">
                  <CheckCircle size={9} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Team */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-12">Il Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-[rgba(197,160,89,0.3)]" loading="lazy" decoding="async" />
              <h3 className="font-medium text-[#1C1C1C] text-sm mb-0.5">{p.name}</h3>
              <p className="text-[11px] text-[#C5A059] mb-2">{p.role}</p>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{p.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto px-6 text-center"
      >
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-4">
          Pronto a fare parte del club?
        </h2>
        <p className="text-[#5A4F44] font-light mb-8">
          Unisciti a 2.400+ clienti che hanno scelto the Class per vivere il lusso senza compromessi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/concierge"
            className="bg-[#C5A059] text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors flex items-center justify-center gap-2"
          >
            Diventa Membro
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/contatti"
            className="bg-white border border-[rgba(197,160,89,0.4)] text-[#1C1C1C] px-8 py-3.5 rounded-xl text-sm font-medium hover:border-[#C5A059] transition-colors"
          >
            Parla con noi
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
