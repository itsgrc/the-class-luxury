import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'

const PACKAGES = [
  {
    id: 'pkg-romantic',
    name: 'Romantic Escape',
    icon: '🌹',
    tagline: 'Per chi vuole stupire',
    description: 'Yacht con equipaggio privato per 2 giorni, cena stellata a bordo con chef, trasferimento in limousine. Tutto incluso, nessun dettaglio lasciato al caso.',
    includes: ['Yacht 25m — 2 notti', 'Chef privato stellato', 'Limousine transfer', 'Champagne Krug', 'Suite floreale'],
    price: 12800,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    color: '#C5A059',
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
    color: '#1C1C1C',
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
    color: '#5A4F44',
  },
]

export function PacchettiPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Pacchetti Esclusivi — the Class</title>
        <meta name="description" content="Pacchetti curati per ogni occasione: Romantic Escape, Business Elite, Family Adventure." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
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

        <div className="grid gap-12">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
              className="bg-white border border-[rgba(197,160,89,0.15)] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(26,24,22,0.07)] flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 relative overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-72 md:h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                <div className="absolute top-6 left-6">
                  <span className="text-4xl">{pkg.icon}</span>
                </div>
              </div>
              <div className="flex-1 p-8 md:p-12 flex flex-col">
                <div className="mb-6">
                  <p className="text-xs text-[#C5A059] tracking-widest uppercase mb-2">{pkg.tagline}</p>
                  <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-3">
                    {pkg.name}
                  </h2>
                  <p className="text-[#5A4F44] font-light leading-relaxed">{pkg.description}</p>
                </div>
                <ul className="space-y-2 mb-8 flex-1">
                  {pkg.includes.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[#5A4F44]">
                      <span className="w-4 h-4 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0">
                        <span className="text-[#C5A059] text-[8px]">✓</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#5A4F44]">da</p>
                    <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#C5A059] font-medium">
                      €{pkg.price.toLocaleString('it-IT')}
                    </p>
                  </div>
                  <Link
                    to="/richiesta-su-misura"
                    className="px-8 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-light tracking-wide hover:bg-[#2a2a2a] transition-colors"
                  >
                    Richiedi
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
