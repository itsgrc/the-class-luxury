import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { toast } from 'sonner'
import { Shield, Clock, Gem, Anchor, Plane, Car, Star } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { PartnerLogos } from '@/components/PartnerLogos'
import { useState } from 'react'

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
  const statsInView = useInView(statsRef, { once: true, margin: '-20%' })
  const conciergeRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 180])

  useEffect(() => {
    gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
      })
    })
    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  useEffect(() => {
    if (!statsInView || !statsRef.current) return
    statsRef.current.querySelectorAll<HTMLElement>('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target ?? '0')
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target, duration: 2, ease: 'power2.out', snap: { innerText: 1 },
        onUpdate() { el.innerText = Math.floor(Number(el.innerText)).toLocaleString('it-IT') },
      })
    })
  }, [statsInView])

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
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 w-full h-full">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1605281317010-fe5ffe798e2c?w=1600&q=85"
            alt=""
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/55 via-[#1C1C1C]/25 to-[#FDF9F2]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
            className="font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-[0.25em] text-[10px] uppercase mb-5"
          >
            Membership su invito
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
            className="font-playfair text-5xl md:text-7xl text-white drop-shadow-lg mb-6 leading-tight"
          >
            Il lusso non si compra.<br />
            <em className="not-italic" style={{ color: 'var(--gold-hex)' }}>Si orchestra.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="font-cormorant text-xl md:text-2xl text-white/90 italic max-w-2xl mx-auto mb-10"
          >
            Una membership privata che riunisce yacht, jet, dimore, auto da collezione, fractional ownership ed esperienze irripetibili.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/servizi" className="px-8 py-3.5 bg-gold-matte text-velvet-black rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
              Esplora i servizi
            </Link>
            <Link to="/concierge" className="px-8 py-3.5 bg-transparent border border-white/70 text-white rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-white/10 transition">
              Richiesta concierge
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ CREDO ══ */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center reveal">
        <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-8">Il nostro manifesto</p>
        <p className="font-cormorant text-[#5A4F44] text-xl md:text-2xl italic leading-relaxed mb-8">
          Crediamo che la ricchezza autentica non si misuri in beni accumulati, ma nella qualità delle ore che ci appartengono.
        </p>
        <p className="text-[#1C1C1C] leading-relaxed mb-4">
          the Class non è un marketplace. È un atelier di rapporti umani, costruito attorno a poche famiglie, imprenditori e collezionisti che riconoscono il valore di un interlocutore unico: chi anticipa il desiderio prima che venga pronunciato.
        </p>
        <p className="text-[#5A4F44] text-sm leading-relaxed">
          Discrezione assoluta, NDA reciproci, partner selezionati uno ad uno. Nessuna vetrina, nessun rumore: solo la promessa che ogni dettaglio sarà all'altezza di chi ci sceglie.
        </p>
      </section>

      {/* ══ STATISTICHE ══ */}
      <section className="bg-card-bg py-16 border-y border-[rgba(197,160,89,0.2)]" ref={statsRef}>
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
      <section className="max-w-7xl mx-auto px-6 py-20 reveal">
        <div className="flex justify-between items-center mb-10">
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
            <Link
              key={cat.label} to={cat.href as '/'}
              className="bg-card-bg border border-[rgba(197,160,89,0.2)] rounded-xl p-5 text-center hover:border-[rgba(197,160,89,0.55)] transition-all lift-hover flex flex-col items-center gap-3"
            >
              <cat.icon size={20} className="text-[#C5A059]" />
              <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44] tracking-wider uppercase">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ ESPERIENZE ══ */}
      <section className="bg-card-bg py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-playfair text-3xl text-center text-[#1C1C1C] mb-12 reveal">Le esperienze più richieste questa settimana</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Sanlorenzo SL86', cat: 'Yacht', price: '€8.500/giorno', img: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80' },
              { title: 'Gulfstream G650', cat: 'Jet Privato', price: 'Su richiesta', img: 'https://images.unsplash.com/photo-1540962351504-5bdd6d022c7f?w=800&q=80' },
              { title: 'Sotheby\'s Auction Access', cat: 'Esperienza', price: '€12.000/evento', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80' },
            ].map(exp => (
              <motion.div
                key={exp.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="bg-[#FDF9F2] rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm reveal"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={exp.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt={exp.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/70 via-[#1C1C1C]/15 to-transparent" />
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

      {/* ══ CONCIERGE WIDGET ══ */}
      <section className="py-24 px-6" ref={conciergeRef}>
        <div className="max-w-3xl mx-auto text-center reveal">
          <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">Il tuo concierge</p>
          <h2 className="font-playfair text-3xl md:text-4xl text-[#1C1C1C] mb-3">Parla con il tuo Concierge</h2>
          <p className="font-cormorant text-[#5A4F44] text-lg mb-10 italic">
            Descrivi l'esperienza che cerchi — ti troveremo la proposta perfetta.
          </p>
          <form onSubmit={handleConciergeRequest} className="flex flex-col md:flex-row gap-4">
            <input
              name="desire"
              placeholder='Es. "Cerco uno yacht a Porto Cervo per 8 persone ad agosto"'
              className="flex-1 px-5 py-4 rounded-full border border-[rgba(197,160,89,0.3)] bg-white/80 text-sm focus:outline-none focus:border-[#C5A059] transition"
            />
            <button className="px-8 py-4 bg-velvet-black text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-[#C5A059] transition-colors">
              Invia
            </button>
          </form>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['Yacht 10 giorni Costiera', 'Jet Milano → Ibiza', 'Weekend VIP Montecarlo', 'Chef stellato a domicilio'].map(ex => (
              <button
                key={ex}
                onClick={() => { const el = document.querySelector<HTMLInputElement>('input[name="desire"]'); if (el) el.value = ex }}
                className="text-xs text-[#5A4F44] bg-[#FCFAF5] border border-[rgba(197,160,89,0.2)] px-3 py-1.5 rounded-full hover:bg-[rgba(197,160,89,0.08)] transition"
              >
                "{ex}"
              </button>
            ))}
          </div>
          <p className="text-xs text-[#5A4F44] mt-4">Risposta garantita entro 24 ore</p>
        </div>
      </section>

      {/* ══ FACTOTUM TEASER ══ */}
      <section className="max-w-7xl mx-auto px-6 pb-20 reveal">
        <div className="rounded-3xl border border-[rgba(197,160,89,0.22)] bg-gradient-to-br from-[#FDF9F2] to-[#FCFAF5] p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 shadow-[0_4px_32px_rgba(197,160,89,0.06)]">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Esclusivo</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-[#C5A059] mb-3">Il tuo Factotum Personale</h3>
            <p className="text-[#5A4F44] leading-relaxed max-w-md mb-6">
              Gestisci promemoria, scadenze fiscali (IVA, IMU, bollo) e impegni. Un assistente sempre con te — export ICS, Google Calendar, notifiche smart.
            </p>
            <Link to="/concierge" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-matte text-velvet-black rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:opacity-90 transition">
              Apri il Factotum →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { icon: '🗓', label: 'Scadenze fiscali' },
              { icon: '⏰', label: 'Promemoria smart' },
              { icon: '📎', label: 'ICS Export' },
              { icon: '📊', label: 'Dashboard IMU' },
            ].map(tile => (
              <div key={tile.label} className="bg-white rounded-2xl p-4 text-center border border-[rgba(197,160,89,0.12)] shadow-premium lift-hover">
                <div className="text-2xl mb-1">{tile.icon}</div>
                <div className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">{tile.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PERCHÉ THE CLASS ══ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-playfair text-4xl text-center text-[#1C1C1C] mb-16 reveal">Perché the Class</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { Icon: Shield, title: 'Partner verificati', desc: 'Ogni fornitore è selezionato e validato personalmente dal nostro team. Zero sorprese, zero compromessi.' },
            { Icon: Clock, title: 'Assistenza 24/7', desc: 'Concierge dedicato sempre disponibile, in ogni fuso orario. Risposta garantita entro 2 ore.' },
            { Icon: Gem, title: 'Esperienze certificate', desc: 'Standard di qualità e discrezione assoluti. NDA reciproci, privacy totale.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="text-center reveal group border border-[rgba(197,160,89,0.12)] rounded-2xl p-8 bg-card-bg lift-hover">
              <div className="w-14 h-14 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mx-auto mb-5 group-hover:bg-[rgba(197,160,89,0.2)] transition">
                <Icon size={22} className="text-[#C5A059]" />
              </div>
              <h3 className="font-playfair text-xl text-[#1C1C1C] mb-3">{title}</h3>
              <p className="text-[#5A4F44] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <TestimonialsCarousel />
    </>
  )
}
