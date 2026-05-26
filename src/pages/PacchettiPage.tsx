import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Check, ChevronRight } from 'lucide-react'

type Audience = 'Tutti' | 'Coppia' | 'Business' | 'Famiglia' | 'Wellness' | 'Avventura'

interface Package {
  id: string
  name: string
  icon: string
  tagline: string
  description: string
  includes: string[]
  price: number
  image: string
  audience: Audience
  badge?: 'Più prenotato' | 'Novità'
  testimonial: string
}

const PACKAGES: Package[] = [
  {
    id: 'pkg-romantic',
    name: 'Romantic Escape',
    icon: '🌹',
    tagline: 'Per chi vuole stupire',
    description: 'Yacht con equipaggio privato per 2 giorni, cena stellata a bordo con chef, trasferimento in limousine. Tutto incluso, nessun dettaglio lasciato al caso.',
    includes: ['Yacht 25m — 2 notti', 'Chef privato stellato', 'Limousine transfer', 'Champagne Krug', 'Suite floreale'],
    price: 12800,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    audience: 'Coppia',
    testimonial: '"Un\'esperienza che ha cambiato il significato di romanticismo." — Marco B.',
  },
  {
    id: 'pkg-business',
    name: 'Business Elite',
    icon: '💼',
    tagline: 'Per il professionista esigente',
    description: 'Jet privato per destinazione europea, trasferimenti VIP con Rolls-Royce, accesso executive lounge, suite in hotel 5 stelle con butler personale.',
    includes: ['Jet privato light', 'Rolls-Royce Cullinan', 'Executive Lounge VIP', 'Hotel 5★ suite', 'Concierge 24/7'],
    price: 28500,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    audience: 'Business',
    badge: 'Più prenotato',
    testimonial: '"Efficienza e lusso senza compromessi. Il mio standard di viaggio da sempre." — Lorenzo M.',
  },
  {
    id: 'pkg-family',
    name: 'Family Adventure',
    icon: '🏖️',
    tagline: 'Ricordi indimenticabili per tutta la famiglia',
    description: 'Villa esclusiva con piscina privata, auto di lusso a disposizione, babysitter certificata, attività outdoor e cena di famiglia con chef privato.',
    includes: ['Villa 6 camere — 5 notti', 'Auto di lusso SUV', 'Babysitter certificata', 'Chef privato', 'Attività outdoor'],
    price: 18000,
    image: 'https://images.unsplash.com/photo-1540541338537-1220059af0dc?w=800&q=80',
    audience: 'Famiglia',
    testimonial: '"I bambini ne parlano ancora. Un viaggio che ha unito la famiglia." — Famiglia Rossi',
  },
  {
    id: 'pkg-wellness',
    name: 'Wellness Retreat',
    icon: '🧘',
    tagline: 'Ritrova te stesso nel massimo comfort',
    description: 'Cinque giorni in villa spa esclusiva con programma benessere personalizzato, trattamenti ayurvedici, yoga privato all\'alba e cucina bio con chef nutrizionista.',
    includes: ['Villa spa privata — 5 notti', 'Programma wellness su misura', 'Yoga & meditazione privata', 'Chef nutrizionista', 'Trattamenti ayurvedici daily'],
    price: 9500,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    audience: 'Wellness',
    badge: 'Novità',
    testimonial: '"Mi sono rigenerato completamente. Tornare è già programmato." — Giulia F.',
  },
  {
    id: 'pkg-adventure',
    name: 'Adventure Extreme',
    icon: '🏔️',
    tagline: 'Adrenalina pura senza limiti',
    description: 'Heliski sulle Alpi al mattino, pomeriggio in pista con supercar su circuito privato, sera al ristorante stellato in quota. Per chi non si accontenta mai.',
    includes: ['Heliski 3 giorni — guida IFMGA', 'Track day circuito privato', 'Ferrari 296 GTB o McLaren', 'Chalet esclusivo con butler', 'Cena stellata in quota'],
    price: 22000,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    audience: 'Avventura',
    badge: 'Novità',
    testimonial: '"Heliski la mattina, Ferrari il pomeriggio. Impossibile fare di meglio." — Andrea V.',
  },
]

const AUDIENCES: Audience[] = ['Tutti', 'Coppia', 'Business', 'Famiglia', 'Wellness', 'Avventura']

export function PacchettiPage() {
  const [activeAudience, setActiveAudience] = useState<Audience>('Tutti')

  const filtered = activeAudience === 'Tutti'
    ? PACKAGES
    : PACKAGES.filter(p => p.audience === activeAudience)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Pacchetti Esclusivi — the Class</title>
        <meta name="description" content="Pacchetti curati per ogni occasione: Romantic Escape, Business Elite, Family Adventure, Wellness Retreat, Adventure Extreme." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">
            Esperienze curate
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-[#1C1C1C] mb-4">
            Pacchetti All-Inclusive
          </h1>
          <p className="text-[#5A4F44] font-light max-w-xl mx-auto leading-relaxed">
            Abbiamo combinato i nostri migliori servizi in esperienze preconfezionate. Scegli, personalizza, parti.
          </p>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {AUDIENCES.map(a => (
            <button
              key={a}
              onClick={() => setActiveAudience(a)}
              className={`px-5 py-2 rounded-full text-sm font-light transition-all duration-200 ${
                activeAudience === a
                  ? 'bg-[#1C1C1C] text-white'
                  : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]'
              }`}
            >
              {a}
            </button>
          ))}
        </motion.div>

        {/* Package strip */}
        <div className="mb-8 py-3 px-6 bg-[rgba(197,160,89,0.07)] border border-[rgba(197,160,89,0.15)] rounded-2xl flex flex-wrap items-center gap-4 justify-center text-sm text-[#5A4F44] font-light">
          <span className="font-medium text-[#C5A059]">Tutti i pacchetti includono:</span>
          <span>✦ Concierge 24/7</span>
          <span>✦ NDA reciproco</span>
          <span>✦ Cancellazione gratuita 48h</span>
        </div>

        {/* Packages grid */}
        <div className="grid gap-12">
          {filtered.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-[rgba(197,160,89,0.15)] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(26,24,22,0.07)] flex flex-col md:flex-row"
            >
              {/* Image */}
              <div className="md:w-2/5 relative overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-72 md:h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                <div className="absolute top-6 left-6">
                  <span className="text-4xl">{pkg.icon}</span>
                </div>
                {pkg.badge && (
                  <div className="absolute top-6 right-6">
                    <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      pkg.badge === 'Più prenotato'
                        ? 'bg-[#C5A059] text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {pkg.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-8 md:p-12 flex flex-col">
                <div className="mb-5">
                  <p className="text-xs text-[#C5A059] tracking-widest uppercase mb-2">{pkg.tagline}</p>
                  <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-3">
                    {pkg.name}
                  </h2>
                  <p className="text-[#5A4F44] font-light leading-relaxed">{pkg.description}</p>
                </div>

                {/* Includes */}
                <ul className="space-y-2.5 mb-5 flex-1">
                  {pkg.includes.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[#5A4F44]">
                      <span className="w-5 h-5 rounded-full bg-[rgba(197,160,89,0.12)] flex items-center justify-center shrink-0">
                        <Check size={11} className="text-[#C5A059] stroke-[2.5]" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Testimonial */}
                <blockquote className="border-l-2 border-[rgba(197,160,89,0.4)] pl-4 mb-6 italic text-sm text-[#5A4F44] font-light">
                  {pkg.testimonial}
                </blockquote>

                {/* Price + CTA */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] text-[#5A4F44]/60 uppercase tracking-wider">da</p>
                    <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#C5A059] font-medium">
                      €{pkg.price.toLocaleString('it-IT')}
                    </p>
                    <p className="text-[10px] text-[#5A4F44]/50 mt-0.5">IVA esclusa</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/richiesta-su-misura"
                      search={{ pacchetto: pkg.id, nome: pkg.name } as Record<string, string>}
                      className="px-6 py-3 rounded-xl border border-[rgba(197,160,89,0.4)] text-[#5A4F44] text-sm font-light tracking-wide hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                    >
                      Personalizza
                    </Link>
                    <Link
                      to="/richiesta-su-misura"
                      search={{ pacchetto: pkg.id } as Record<string, string>}
                      className="px-8 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-light tracking-wide hover:bg-[#2a2a2a] transition-colors"
                    >
                      Richiedi
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-[#5A4F44] font-light mb-3">Cerchi qualcosa di diverso?</p>
          <Link
            to="/richiesta-su-misura"
            className="inline-flex items-center gap-2 text-[#C5A059] font-medium hover:gap-3 transition-all duration-200"
          >
            Crea il tuo pacchetto su misura
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
