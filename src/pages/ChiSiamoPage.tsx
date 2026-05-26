// src/pages/ChiSiamoPage.tsx
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Users, Globe, Award, CheckCircle, ArrowRight, Clock, Leaf, Check } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'

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

const PARTNERS = [
  'Ferretti Group', 'Bombardier', 'Rolls-Royce', 'Four Seasons',
  'Aman Resorts', 'NetJets', 'Sunseeker', 'Amels',
]

const SUSTAINABILITY_PILLARS = [
  { icon: Leaf, title: 'Compensazione CO₂', desc: 'Ogni prenotazione include la compensazione delle emissioni tramite progetti forestali certificati.' },
  { icon: CheckCircle, title: 'Partner LSCA Certificati', desc: 'Lavoriamo esclusivamente con partner certificati Luxury & Sustainability Council of America.' },
  { icon: Globe, title: 'Programma No-Plastic', desc: 'Tutti i nostri yacht e ville partner hanno eliminato la plastica monouso dal 2023.' },
]

const MANIFESTO_POINTS = [
  { num: '01', text: 'Nessun compromesso' },
  { num: '02', text: 'Il tempo è l\'unico vero lusso' },
  { num: '03', text: 'Privacy assoluta' },
  { num: '04', text: 'Personalizzazione totale' },
  { num: '05', text: 'Accesso prima di chiunque' },
]

const TESTIMONIAL_CARDS = [
  { initials: 'MB', name: 'Marco B.', company: 'CEO, Brioni SpA', quote: 'the Class ha ridefinito il mio standard di viaggio. Non tornerei indietro per nessun motivo.', stars: 5 },
  { initials: 'SF', name: 'Sofia F.', company: 'Managing Partner, Apex Capital', quote: 'Ogni dettaglio è curato con una precisione che raramente si trova nel mondo del lusso.', stars: 5 },
  { initials: 'AV', name: 'Andrea V.', company: 'Founder, Venezia Luxury Group', quote: 'Discrezione, eccellenza e velocità di risposta. Esattamente quello che cercavo.', stars: 5 },
]

const CITY_CLOUD = [
  { city: 'Milano', size: 'text-2xl' },
  { city: 'Monaco', size: 'text-lg' },
  { city: 'Londra', size: 'text-xl' },
  { city: 'Dubai', size: 'text-3xl' },
  { city: 'Singapore', size: 'text-lg' },
  { city: 'New York', size: 'text-2xl' },
  { city: 'Ibiza', size: 'text-sm' },
  { city: 'Portofino', size: 'text-base' },
  { city: 'Capri', size: 'text-xl' },
  { city: 'Saint-Tropez', size: 'text-lg' },
]

const CERT_BADGES = [
  { label: 'ISO 9001:2015', icon: Shield },
  { label: 'GDPR Compliant', icon: Check },
  { label: 'LSCA Certified', icon: Award },
]

const DISCOVERY_OPTIONS = ['Passaparola', 'Social media', 'Stampa / Media', 'Motore di ricerca', 'Evento esclusivo', 'Altro']

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

  // Waitlist form state
  const [waitlistName, setWaitlistName] = useState('')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistDiscovery, setWaitlistDiscovery] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)
  const [waitlistPosition] = useState(847)

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

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistName.trim() || !waitlistEmail.trim()) {
      toast.error('Inserisci nome e email')
      return
    }
    setWaitlistSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Chi Siamo — the Class</title>
        <meta name="description" content="the Class: la piattaforma luxury italiana per yacht, jet privati, auto e esperienze esclusive. Scopri il team e i valori." />
      </Helmet>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">

        {/* Certification badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          {CERT_BADGES.map(({ label, icon: Icon }) => (
            <span key={label} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[rgba(197,160,89,0.4)] bg-[rgba(197,160,89,0.06)] text-xs text-[#C5A059] font-medium">
              <Icon size={11} />
              {label}
            </span>
          ))}
        </motion.div>

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

      {/* Mission statement video placeholder */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-video bg-[#1C1C1C] rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => toast.info('Video presto disponibile', { description: 'Il nostro manifesto sarà online nel 2026.' })}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-transparent border-l-[#C5A059] ml-1" />
            </div>
            <p className="text-white/60 text-sm">Il nostro manifesto</p>
            <p className="text-[#C5A059] text-xs tracking-widest uppercase mt-1">Coming soon 2026</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
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

      {/* "Il lusso secondo noi" manifesto list */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-12">Il lusso secondo noi</h2>
        <div className="space-y-4">
          {MANIFESTO_POINTS.map((point, i) => (
            <motion.div
              key={point.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-5 py-4 border-b border-[rgba(197,160,89,0.1)]"
            >
              <span className="font-[family-name:var(--font-family-mono)] text-4xl font-bold text-[rgba(197,160,89,0.2)] shrink-0 w-16">{point.num}</span>
              <p className="font-[family-name:var(--font-family-display)] text-xl md:text-2xl text-[#1C1C1C] font-medium">{point.text}</p>
            </motion.div>
          ))}
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

      {/* Sustainability commitment */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-xs text-emerald-600 uppercase tracking-widest mb-2">Responsabilità</p>
            <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">Lusso responsabile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUSTAINABILITY_PILLARS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-medium text-[#1C1C1C] text-sm mb-2">{title}</h3>
                <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
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

      {/* Partner logos grid */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] text-center mb-8">Partner certificati</h2>
        <div className="grid grid-cols-4 gap-0 border border-[rgba(197,160,89,0.15)] rounded-2xl overflow-hidden bg-white">
          {PARTNERS.map((p, i) => (
            <div
              key={p}
              className={`flex items-center justify-center p-6 text-center ${i % 4 !== 3 ? 'border-r border-[rgba(197,160,89,0.1)]' : ''} ${i < 4 ? 'border-b border-[rgba(197,160,89,0.1)]' : ''}`}
            >
              <span className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C]/50 hover:text-[#C5A059] transition-colors text-center leading-tight">{p}</span>
            </div>
          ))}
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

      {/* Global footprint tag cloud */}
      <div className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <p className="text-[10px] text-[#C5A059] uppercase tracking-[0.3em] mb-6">Le nostre destinazioni</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {CITY_CLOUD.map(({ city, size }, i) => (
            <span
              key={city}
              className={`font-[family-name:var(--font-family-display)] ${size} text-[#1C1C1C] font-medium hover:text-[#C5A059] transition-colors cursor-default ${i < CITY_CLOUD.length - 1 ? 'after:content-["·"] after:ml-4 after:text-[#C5A059]/40' : ''}`}
            >
              {city}
            </span>
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

      {/* Team carousel — horizontal scroll snap */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-12">Il nostro team</h2>
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
          {TEAM.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="snap-start shrink-0 w-72 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6 text-center"
            >
              <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-[rgba(197,160,89,0.3)]" loading="lazy" decoding="async" />
              <h3 className="font-medium text-[#1C1C1C] text-sm mb-0.5">{p.name}</h3>
              <p className="text-[11px] text-[#C5A059] mb-2">{p.role}</p>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{p.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial video cards (dark) */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] text-center mb-8">Cosa dicono i nostri membri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIAL_CARDS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1C1C1C] rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#C5A059] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{t.name}</p>
                  <p className="text-[10px] text-white/50">{t.company}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, idx) => (
                  <span key={idx} className="text-[#C5A059] text-sm">★</span>
                ))}
              </div>
              <blockquote className="text-sm text-white/70 font-light italic leading-relaxed">"{t.quote}"</blockquote>
            </motion.div>
          ))}
        </div>
      </div>

      {/* "Parla con il fondatore" CTA */}
      <div className="max-w-3xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-center"
        >
          {/* Avatar SVG placeholder */}
          <div className="w-20 h-20 rounded-full bg-[rgba(197,160,89,0.2)] border-2 border-[#C5A059] flex items-center justify-center shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="16" r="8" fill="#C5A059" fillOpacity="0.6" />
              <path d="M4 36c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#C5A059" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-2">
              Parla con il fondatore
            </h3>
            <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-4">
              Ogni mese, Alessandro Ferrari incontra personalmente 5 nuovi membri per capire cosa cercano davvero nel lusso.
            </p>
            <button
              onClick={() => toast.success('Richiesta inviata.', { description: 'Ti contatteremo presto.' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1C1C] text-white rounded-xl text-sm font-medium hover:bg-[#C5A059] transition-colors"
            >
              Richiedi un incontro <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Join waitlist form */}
      <div className="max-w-xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-[rgba(197,160,89,0.2)] rounded-2xl p-8"
        >
          <p className="text-[10px] text-[#C5A059] uppercase tracking-[0.3em] mb-2 text-center">Membership</p>
          <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] text-center mb-6">Diventa membro</h3>
          {waitlistSubmitted ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">✦</p>
              <p className="font-[family-name:var(--font-family-display)] text-lg text-[#1C1C1C] mb-2">Benvenuto nella lista!</p>
              <p className="text-sm text-[#5A4F44]">
                Sei il numero <span className="text-[#C5A059] font-semibold">#{waitlistPosition}</span> in lista.
                Ti contatteremo presto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <input
                type="text"
                value={waitlistName}
                onChange={e => setWaitlistName(e.target.value)}
                placeholder="Il tuo nome"
                className="w-full px-4 py-3 bg-[rgba(197,160,89,0.04)] border border-[rgba(197,160,89,0.2)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059]"
              />
              <input
                type="email"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                placeholder="la-tua@email.it"
                className="w-full px-4 py-3 bg-[rgba(197,160,89,0.04)] border border-[rgba(197,160,89,0.2)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059]"
              />
              <select
                value={waitlistDiscovery}
                onChange={e => setWaitlistDiscovery(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(197,160,89,0.04)] border border-[rgba(197,160,89,0.2)] rounded-xl text-sm text-[#5A4F44] focus:outline-none focus:border-[#C5A059]"
              >
                <option value="">Come hai scoperto the Class?</option>
                {DISCOVERY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <button
                type="submit"
                className="w-full py-3 bg-[#1C1C1C] text-white rounded-xl text-sm font-medium hover:bg-[#C5A059] transition-colors"
              >
                Entra in lista
              </button>
            </form>
          )}
        </motion.div>
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
