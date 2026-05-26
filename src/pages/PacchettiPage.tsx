import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Check, ChevronRight, AlertTriangle, Shield, Gift } from 'lucide-react'
import { toast } from 'sonner'

type Audience = 'Tutti' | 'Coppia' | 'Business' | 'Famiglia' | 'Wellness' | 'Avventura'

interface Package {
  id: string
  name: string
  icon: string
  tagline: string
  description: string
  includes: string[]
  price: number
  nights: number
  image: string
  audience: Audience
  badge?: 'Più prenotato' | 'Novità'
  testimonial: string
  limitedAvailability?: boolean
  faqs: { q: string; a: string }[]
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
    nights: 2,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80',
    audience: 'Coppia',
    testimonial: '"Un\'esperienza che ha cambiato il significato di romanticismo." — Marco B.',
    limitedAvailability: true,
    faqs: [
      { q: 'Posso modificare il menu?', a: 'Sì, il menu è completamente personalizzabile con almeno 48h di preavviso.' },
      { q: 'È incluso il transfer dall\'aeroporto?', a: 'Sì, limousine privata dall\'aeroporto più vicino.' },
    ],
  },
  {
    id: 'pkg-business',
    name: 'Business Elite',
    icon: '💼',
    tagline: 'Per il professionista esigente',
    description: 'Jet privato per destinazione europea, trasferimenti VIP con Rolls-Royce, accesso executive lounge, suite in hotel 5 stelle con butler personale.',
    includes: ['Jet privato light', 'Rolls-Royce Cullinan', 'Executive Lounge VIP', 'Hotel 5★ suite', 'Concierge 24/7'],
    price: 28500,
    nights: 3,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    audience: 'Business',
    badge: 'Più prenotato',
    testimonial: '"Efficienza e lusso senza compromessi. Il mio standard di viaggio da sempre." — Lorenzo M.',
    faqs: [
      { q: 'Posso portare collaboratori?', a: 'Sì, il jet light ospita fino a 6 passeggeri.' },
      { q: 'È prevista una sala riunioni?', a: 'Sì, suite con area meeting privata disponibile su richiesta.' },
    ],
  },
  {
    id: 'pkg-family',
    name: 'Family Adventure',
    icon: '🏖️',
    tagline: 'Ricordi indimenticabili per tutta la famiglia',
    description: 'Villa esclusiva con piscina privata, auto di lusso a disposizione, babysitter certificata, attività outdoor e cena di famiglia con chef privato.',
    includes: ['Villa 6 camere — 5 notti', 'Auto di lusso SUV', 'Babysitter certificata', 'Chef privato', 'Attività outdoor'],
    price: 18000,
    nights: 5,
    image: 'https://images.unsplash.com/photo-1540541338537-1220059af0dc?w=800&q=80',
    audience: 'Famiglia',
    testimonial: '"I bambini ne parlano ancora. Un viaggio che ha unito la famiglia." — Famiglia Rossi',
    faqs: [
      { q: 'Quanti bambini possono partecipare?', a: 'La villa è adatta a famiglie fino a 12 persone.' },
      { q: 'Le attività outdoor sono sicure per i bambini?', a: 'Sì, tutte le attività sono guidate da istruttori certificati.' },
    ],
  },
  {
    id: 'pkg-wellness',
    name: 'Wellness Retreat',
    icon: '🧘',
    tagline: 'Ritrova te stesso nel massimo comfort',
    description: 'Cinque giorni in villa spa esclusiva con programma benessere personalizzato, trattamenti ayurvedici, yoga privato all\'alba e cucina bio con chef nutrizionista.',
    includes: ['Villa spa privata — 5 notti', 'Programma wellness su misura', 'Yoga & meditazione privata', 'Chef nutrizionista', 'Trattamenti ayurvedici daily'],
    price: 9500,
    nights: 5,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    audience: 'Wellness',
    badge: 'Novità',
    testimonial: '"Mi sono rigenerato completamente. Tornare è già programmato." — Giulia F.',
    faqs: [
      { q: 'Posso personalizzare i trattamenti?', a: 'Sì, il programma viene costruito su misura in base alle tue esigenze.' },
      { q: 'È adatto a diete speciali?', a: 'Sì, lo chef nutrizionista si adatta a qualsiasi regime alimentare.' },
    ],
  },
  {
    id: 'pkg-adventure',
    name: 'Adventure Extreme',
    icon: '🏔️',
    tagline: 'Adrenalina pura senza limiti',
    description: 'Heliski sulle Alpi al mattino, pomeriggio in pista con supercar su circuito privato, sera al ristorante stellato in quota. Per chi non si accontenta mai.',
    includes: ['Heliski 3 giorni — guida IFMGA', 'Track day circuito privato', 'Ferrari 296 GTB o McLaren', 'Chalet esclusivo con butler', 'Cena stellata in quota'],
    price: 22000,
    nights: 3,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    audience: 'Avventura',
    badge: 'Novità',
    testimonial: '"Heliski la mattina, Ferrari il pomeriggio. Impossibile fare di meglio." — Andrea V.',
    limitedAvailability: true,
    faqs: [
      { q: 'Serve esperienza sugli sci?', a: 'È consigliato un livello intermedio. Il nostro istruttore adatta il percorso.' },
      { q: 'Posso scegliere la supercar?', a: 'Sì, puoi scegliere tra Ferrari 296 GTB, McLaren 720S o Lamborghini Huracán.' },
    ],
  },
]

const AUDIENCES: Audience[] = ['Tutti', 'Coppia', 'Business', 'Famiglia', 'Wellness', 'Avventura']

// Generate fake upcoming dates (4 dates in next 8 weeks)
function getUpcomingDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 4; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + 7 + i * 14)
    dates.push(d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }))
  }
  return dates
}

const UPCOMING_DATES = getUpcomingDates()

const LEVEL_MULTIPLIERS: Record<string, number> = {
  Essential: 1,
  Premium: 1.5,
  Ultra: 2.2,
}

export function PacchettiPage() {
  const [activeAudience, setActiveAudience] = useState<Audience>('Tutti')
  const [showComparison, setShowComparison] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [openFaqPkg, setOpenFaqPkg] = useState<string | null>(null)
  const [openCalendarPkg, setOpenCalendarPkg] = useState<string | null>(null)
  const [giftEnabled, setGiftEnabled] = useState<Set<string>>(new Set())
  const [isMember, setIsMember] = useState(false)

  // Bundle calculator state
  const [calcDuration, setCalcDuration] = useState(5)
  const [calcGuests, setCalcGuests] = useState(2)
  const [calcLevel, setCalcLevel] = useState<'Essential' | 'Premium' | 'Ultra'>('Premium')

  const basePrice = 1800
  const estimatedPrice = Math.round(basePrice * calcDuration * calcGuests * LEVEL_MULTIPLIERS[calcLevel])

  useEffect(() => {
    try {
      const hasProfile = !!localStorage.getItem('theclass_quiz_profile') || !!localStorage.getItem('theclass_user')
      setIsMember(hasProfile)
    } catch { /* ignore */ }
  }, [])

  const filtered = activeAudience === 'Tutti'
    ? PACKAGES
    : PACKAGES.filter(p => p.audience === activeAudience)

  const toggleCompare = (id: string) => {
    const next = new Set(selectedForCompare)
    if (next.has(id)) {
      next.delete(id)
    } else {
      if (next.size >= 2) {
        toast.info('Puoi confrontare al massimo 2 pacchetti')
        return
      }
      next.add(id)
    }
    setSelectedForCompare(next)
  }

  const comparePackages = PACKAGES.filter(p => selectedForCompare.has(p.id))

  const toggleGift = (id: string) => {
    const next = new Set(giftEnabled)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
      toast.success('Opzione regalo attivata', { description: 'Riceverai un certificato regalo stampabile.' })
    }
    setGiftEnabled(next)
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Pacchetti Esclusivi — the Class</title>
        <meta name="description" content="Pacchetti curati per ogni occasione: Romantic Escape, Business Elite, Family Adventure, Wellness Retreat, Adventure Extreme." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Trust badges strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8 py-4 px-6 bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl"
        >
          {[
            { icon: Shield, label: 'Pagamento sicuro SSL' },
            { icon: Check, label: 'Cancellazione gratuita 48h' },
            { icon: Shield, label: 'Concierge 24/7' },
            { icon: Check, label: 'NDA incluso' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[#5A4F44]">
              <Icon size={12} className="text-[#C5A059]" />
              <span>✓ {label}</span>
            </div>
          ))}
        </motion.div>

        {/* Loyalty discount banner */}
        {isMember && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-5 py-3.5 bg-[rgba(197,160,89,0.12)] border border-[#C5A059] rounded-2xl"
          >
            <span className="text-lg">🏅</span>
            <p className="text-sm text-[#1C1C1C]">
              Sei un membro — hai diritto al{' '}
              <span className="font-semibold text-[#C5A059]">5% di sconto</span> su tutti i pacchetti.
            </p>
          </motion.div>
        )}

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
          className="flex flex-wrap gap-2 justify-center mb-8"
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

        {/* Price comparison toggle + compare CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setShowComparison(c => !c)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showComparison ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'bg-white border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'}`}
          >
            {showComparison ? 'Nascondi confronto' : 'Confronta prezzi'}
          </button>
          {selectedForCompare.size === 2 && (
            <button
              onClick={() => {}}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#1C1C1C] text-white border border-[#1C1C1C]"
            >
              Vedi confronto ({selectedForCompare.size}/2)
            </button>
          )}
        </div>

        {/* Price comparison table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 overflow-x-auto"
          >
            <table className="w-full bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-[rgba(197,160,89,0.06)] border-b border-[rgba(197,160,89,0.15)]">
                  <th className="px-4 py-3 text-left text-xs text-[#5A4F44] uppercase tracking-wider">Pacchetto</th>
                  <th className="px-4 py-3 text-center text-xs text-[#5A4F44] uppercase tracking-wider">Prezzo</th>
                  <th className="px-4 py-3 text-center text-xs text-[#5A4F44] uppercase tracking-wider">Notti</th>
                  <th className="px-4 py-3 text-center text-xs text-[#5A4F44] uppercase tracking-wider">Servizi</th>
                  <th className="px-4 py-3 text-center text-xs text-[#5A4F44] uppercase tracking-wider">Badge</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map((pkg, i) => (
                  <tr
                    key={pkg.id}
                    className={`border-b border-[rgba(197,160,89,0.08)] transition-colors hover:bg-[rgba(197,160,89,0.04)] ${i % 2 === 0 ? '' : 'bg-[rgba(197,160,89,0.02)]'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{pkg.icon}</span>
                        <span className="font-medium text-[#1C1C1C]">{pkg.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-[#C5A059] font-medium">€{pkg.price.toLocaleString('it-IT')}</td>
                    <td className="px-4 py-3 text-center text-[#5A4F44]">{pkg.nights}</td>
                    <td className="px-4 py-3 text-center text-[#5A4F44]">{pkg.includes.length}</td>
                    <td className="px-4 py-3 text-center">
                      {pkg.badge
                        ? <span className={`text-[10px] px-2 py-0.5 rounded-full ${pkg.badge === 'Più prenotato' ? 'bg-[#C5A059] text-white' : 'bg-emerald-500 text-white'}`}>{pkg.badge}</span>
                        : <span className="text-[#5A4F44]/40">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Side-by-side comparison modal */}
        {selectedForCompare.size === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-white border border-[rgba(197,160,89,0.2)] rounded-2xl"
          >
            <h3 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-5 text-center">Confronto diretto</h3>
            <div className="grid grid-cols-2 gap-6">
              {comparePackages.map(pkg => (
                <div key={pkg.id} className="text-center">
                  <div className="text-3xl mb-2">{pkg.icon}</div>
                  <h4 className="font-medium text-[#1C1C1C] mb-1">{pkg.name}</h4>
                  <p className="text-[#C5A059] font-medium mb-2">€{pkg.price.toLocaleString('it-IT')}</p>
                  <p className="text-xs text-[#5A4F44] mb-3">{pkg.nights} notti · {pkg.audience}</p>
                  <ul className="text-xs text-left space-y-1">
                    {pkg.includes.map(item => (
                      <li key={item} className="flex items-center gap-2 text-[#5A4F44]">
                        <Check size={10} className="text-[#C5A059] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bundle calculator */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 p-7 bg-white border border-[rgba(197,160,89,0.2)] rounded-2xl"
        >
          <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">Costruisci il tuo pacchetto</h3>
          <p className="text-xs text-[#5A4F44] mb-6">Stima il costo in pochi secondi</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs text-[#5A4F44] uppercase tracking-wider block mb-2">Durata: {calcDuration} giorni</label>
              <input type="range" min={2} max={14} value={calcDuration} onChange={e => setCalcDuration(Number(e.target.value))}
                className="w-full accent-[#C5A059]" />
            </div>
            <div>
              <label className="text-xs text-[#5A4F44] uppercase tracking-wider block mb-2">Ospiti: {calcGuests}</label>
              <input type="range" min={1} max={20} value={calcGuests} onChange={e => setCalcGuests(Number(e.target.value))}
                className="w-full accent-[#C5A059]" />
            </div>
            <div>
              <label className="text-xs text-[#5A4F44] uppercase tracking-wider block mb-2">Livello</label>
              <div className="flex gap-2">
                {(['Essential', 'Premium', 'Ultra'] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setCalcLevel(l)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${calcLevel === l ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'bg-white border-[rgba(197,160,89,0.3)] text-[#5A4F44]'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 pt-5 border-t border-[rgba(197,160,89,0.15)]">
            <div>
              <p className="text-xs text-[#5A4F44]/60 uppercase tracking-wider">Stima preventivo</p>
              <p className="font-[family-name:var(--font-family-display)] text-3xl text-[#C5A059] font-medium">€{estimatedPrice.toLocaleString('it-IT')}</p>
            </div>
            <Link
              to="/richiesta-su-misura"
              className="px-6 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-light tracking-wide hover:bg-[#2a2a2a] transition-colors"
            >
              Richiedi preventivo
            </Link>
          </div>
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
                {pkg.limitedAvailability && (
                  <div className="absolute bottom-6 left-6">
                    <span className="flex items-center gap-1.5 text-[10px] bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] px-3 py-1.5 rounded-full font-medium">
                      <AlertTriangle size={10} />
                      Solo 3 disponibili questo mese
                    </span>
                  </div>
                )}
                {/* Compare checkbox */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white/90 rounded-full px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedForCompare.has(pkg.id)}
                      onChange={() => toggleCompare(pkg.id)}
                      className="accent-[#C5A059] w-3 h-3"
                    />
                    <span className="text-[10px] text-[#5A4F44] font-medium">Confronta</span>
                  </label>
                </div>
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
                <blockquote className="border-l-2 border-[rgba(197,160,89,0.4)] pl-4 mb-4 italic text-sm text-[#5A4F44] font-light">
                  {pkg.testimonial}
                </blockquote>

                {/* FAQ accordion */}
                <div className="mb-4">
                  <button
                    onClick={() => setOpenFaqPkg(openFaqPkg === pkg.id ? null : pkg.id)}
                    className="flex items-center gap-2 text-xs text-[#C5A059] font-medium mb-2"
                  >
                    {openFaqPkg === pkg.id ? '▲' : '▼'} Domande frequenti
                  </button>
                  {openFaqPkg === pkg.id && (
                    <div className="space-y-3 mt-2">
                      {pkg.faqs.map(faq => (
                        <div key={faq.q} className="bg-[rgba(197,160,89,0.04)] rounded-xl p-3 border border-[rgba(197,160,89,0.1)]">
                          <p className="text-xs font-medium text-[#1C1C1C] mb-1">{faq.q}</p>
                          <p className="text-xs text-[#5A4F44] font-light">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability calendar */}
                <div className="mb-4">
                  <button
                    onClick={() => setOpenCalendarPkg(openCalendarPkg === pkg.id ? null : pkg.id)}
                    className="flex items-center gap-2 text-xs text-[#5A4F44] font-medium mb-2"
                  >
                    📅 {openCalendarPkg === pkg.id ? 'Nascondi' : 'Prossime date disponibili'}
                  </button>
                  {openCalendarPkg === pkg.id && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {UPCOMING_DATES.map((date, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          ✓ {date}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gift option */}
                <div className="flex items-center gap-3 mb-5 p-3 bg-[rgba(197,160,89,0.04)] rounded-xl border border-[rgba(197,160,89,0.1)]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => toggleGift(pkg.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${giftEnabled.has(pkg.id) ? 'bg-[#C5A059]' : 'bg-[#E5E7EB]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${giftEnabled.has(pkg.id) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <Gift size={13} className="text-[#C5A059]" />
                    <span className="text-xs text-[#5A4F44]">Regalo</span>
                  </label>
                  {giftEnabled.has(pkg.id) && (
                    <div className="text-xs text-[#C5A059] flex-1">
                      Riceverai un certificato regalo stampabile
                    </div>
                  )}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] text-[#5A4F44]/60 uppercase tracking-wider">da</p>
                    <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#C5A059] font-medium">
                      €{pkg.price.toLocaleString('it-IT')}
                    </p>
                    <p className="text-[10px] text-[#5A4F44]/50 mt-0.5">IVA esclusa</p>
                    {/* Installment badge */}
                    <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                      o {6} rate da €{Math.round(pkg.price / 6).toLocaleString('it-IT')}/mese
                    </p>
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
