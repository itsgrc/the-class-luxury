import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Shield, Clock, Gem, Anchor, Plane, Car, Star } from 'lucide-react'
import { toast } from 'sonner'
import { generateId } from '@/lib/utils'
import { PartnerLogos } from '@/components/PartnerLogos'
import { inspirations } from '@/data/inspirations'
import { observeReveal } from '@/lib/scroll'
import { useSmartFactotum } from '@/hooks/useSmartFactotum'

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
      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
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
          <h2 className="font-playfair text-3xl text-[#1C1C1C]">Yacht più desiderati</h2>
          <div className="divider-gold-short" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Azimut Grande 32M', length: '32 m', guests: '10 ospiti', price: '€18.500/giorno', location: 'Portofino', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80', tag: 'Superyacht' },
            { name: 'Sanlorenzo SL96', length: '29 m', guests: '8 ospiti', price: '€14.200/giorno', location: 'Costa Smeralda', img: 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=800&q=80', tag: 'Motor Yacht' },
            { name: 'Riva 88 Folgore', length: '26 m', guests: '6 ospiti', price: '€9.800/giorno', location: 'Capri', img: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&q=80', tag: 'Day Cruiser' },
          ].map(y => (
            <motion.div key={y.name} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.18)] shadow-sm bg-[#FDF9F2]">
              <div className="relative h-52 overflow-hidden">
                <img src={y.img} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt={y.name} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/75 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059] border border-[rgba(197,160,89,0.5)] rounded-full px-2.5 py-0.5 bg-[rgba(28,28,28,0.6)] uppercase tracking-widest">
                  {y.tag}
                </span>
                <div className="absolute bottom-3 left-4">
                  <p className="font-playfair text-white text-lg leading-snug">{y.name}</p>
                  <p className="text-[10px] text-white/70 font-[family-name:var(--font-family-mono)]">{y.location}</p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex gap-4 text-[11px] text-[#5A4F44] font-[family-name:var(--font-family-mono)]">
                  <span>{y.length}</span>
                  <span className="text-[rgba(197,160,89,0.4)]">|</span>
                  <span>{y.guests}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm">{y.price}</span>
                  <button onClick={() => toast(`Richiesta per ${y.name} inviata`, { description: 'Il concierge ti risponderà entro 2 ore' })}
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

      {/* ══ MAGIC TRIP ══ */}
      <section className="py-16 bg-[#1C1C1C] reveal-on-scroll">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">AI-Powered</p>
          <h2 className="font-playfair text-4xl text-white mb-3">Magic Trip</h2>
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
    </>
  )
}
