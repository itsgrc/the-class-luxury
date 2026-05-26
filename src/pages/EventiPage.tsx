import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Calendar, MapPin, Lock, Users, CheckCircle, Share2, CalendarPlus, Clock, Heart, Bell, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'

interface EventHost {
  name: string
  role: string
  avatar: string
}

interface Event {
  id: string
  title: string
  date: string
  dateISO: string
  location: string
  locationPremium?: boolean
  category: string
  description: string
  cover: string
  price: number
  priceUnit: string
  spots: number
  totalSpots: number
  memberOnly: boolean
  isPast?: boolean
  dressCode?: string
  speaker?: string
  sponsor?: string
  host?: EventHost
}

const EVENTS: Event[] = [
  {
    id: 'ev-001',
    title: 'Gala Biennale Venezia — Vernissage Esclusivo',
    date: '10 Maggio 2026',
    dateISO: '2026-05-10',
    location: 'Venezia, Padiglioni Giardini',
    locationPremium: true,
    category: 'Arte & Cultura',
    description: 'Accesso riservato al vernissage privato della Biennale Arte, con visita guidata da curatori internazionali, cocktail esclusivo e cena di gala nel palazzo storico del collezionista.',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    price: 2800,
    priceUnit: 'persona',
    spots: 12,
    totalSpots: 20,
    memberOnly: true,
    dressCode: 'Black Tie',
    speaker: 'Cecilia Alemani, Curatrice Biennale',
    sponsor: 'Bulgari',
    host: {
      name: 'Cecilia Alemani',
      role: 'Curatrice Internazionale',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
  },
  {
    id: 'ev-002',
    title: 'Regata Classica di Napoli — Experience VIP',
    date: '18–20 Giugno 2026',
    dateISO: '2026-06-18',
    location: 'Golfo di Napoli',
    category: 'Vela & Mare',
    description: "Seguire la Regata Storica a bordo di uno yacht d'appoggio privato con equipaggio dedicato. Calici di Champagne Billecart-Salmon, pranzi firmati dallo chef Gennaro Esposito.",
    cover: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80',
    price: 4500,
    priceUnit: 'persona',
    spots: 8,
    totalSpots: 12,
    memberOnly: false,
    dressCode: 'Smart Casual',
    sponsor: 'Moët Hennessy',
  },
  {
    id: 'ev-003',
    title: 'Masterclass Sassicaia — Tenuta San Guido',
    date: '5 Luglio 2026',
    dateISO: '2026-07-05',
    location: 'Bolgheri, Toscana',
    category: 'Enologia',
    description: "Visita privata alla cantina più iconica d'Italia, degustazione verticale di 6 annate con il winemaker della famiglia Incisa della Rocchetta. Notte in suite agriturismo con transfer in GT.",
    cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    price: 3200,
    priceUnit: 'tavolo',
    spots: 6,
    totalSpots: 8,
    memberOnly: true,
    dressCode: 'Business Casual',
    sponsor: 'Ferrari',
    host: {
      name: 'Priya Castellan',
      role: 'Master Sommelier',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
  },
  {
    id: 'ev-004',
    title: 'Track Day Monza — Esercizio Ferrari',
    date: '12 Settembre 2026',
    dateISO: '2026-09-12',
    location: 'Autodromo di Monza',
    locationPremium: true,
    category: 'Motorsport',
    description: "Una giornata intera al volante di Ferrari SF90 Stradale e 296 GTB sul circuito più famoso d'Italia, con istruttore da scuola Ferrari Racing Days. Telemetria, debriefing e cena nel paddock.",
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    price: 8500,
    priceUnit: 'persona',
    spots: 4,
    totalSpots: 6,
    memberOnly: true,
    dressCode: 'Casual sportivo',
    sponsor: 'Ferrari',
  },
  {
    id: 'ev-005',
    title: 'Cena Privata con Norbert Niederkofler',
    date: '3 Ottobre 2026',
    dateISO: '2026-10-03',
    location: 'St. Hubertus, Alta Badia',
    category: 'Fine Dining',
    description: "Un'esclusiva cena a 8 ospiti cucinata dallo chef tre stelle Michelin Norbert Niederkofler nel suo ristorante St. Hubertus. Menu degustazione di 12 portate con abbinamento vini rari.",
    cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    price: 6000,
    priceUnit: 'persona',
    spots: 8,
    totalSpots: 8,
    memberOnly: false,
    dressCode: 'Black Tie',
    sponsor: 'Moët Hennessy',
  },
  {
    id: 'ev-006',
    title: 'Heliski Chamonix — Settimana Bianca Privata',
    date: '14–19 Febbraio 2027',
    dateISO: '2027-02-14',
    location: 'Chamonix-Mont-Blanc, Francia',
    category: 'Sport',
    description: 'Cinque giorni di heliski nelle Alpi francesi con guida IFMGA, elicottero privato, chalet esclusivo con servizio butler e spa. Accesso alle polveri vergini di Mont Blanc.',
    cover: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    price: 18000,
    priceUnit: 'persona',
    spots: 6,
    totalSpots: 10,
    memberOnly: true,
    dressCode: 'Abbigliamento tecnico fornito',
  },
  {
    id: 'ev-past-001',
    title: 'Gala di Apertura — Villa d\'Este 2025',
    date: '15 Ottobre 2025',
    dateISO: '2025-10-15',
    location: 'Villa d\'Este, Como',
    category: 'Arte & Cultura',
    description: 'Serata inaugurale della stagione the Class con cocktail nel parco storico, concerto da camera e cena di gala.',
    cover: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    price: 1800,
    priceUnit: 'persona',
    spots: 0,
    totalSpots: 30,
    memberOnly: false,
    isPast: true,
    sponsor: 'Bulgari',
  },
  {
    id: 'ev-past-002',
    title: 'Concerto Privato Sting — Castello di Brolio',
    date: '22 Luglio 2025',
    dateISO: '2025-07-22',
    location: 'Castello di Brolio, Chianti',
    category: 'Fine Dining',
    description: 'Serata esclusiva con concerto privato e cena nel cortile del castello medievale.',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    price: 3500,
    priceUnit: 'tavolo',
    spots: 0,
    totalSpots: 20,
    memberOnly: true,
    isPast: true,
  },
]

const CATEGORIES = ['Tutto', 'Arte & Cultura', 'Vela & Mare', 'Enologia', 'Motorsport', 'Fine Dining', 'Sport']

function getDaysRemaining(dateISO: string): number {
  const target = new Date(dateISO).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((target - now) / 86400000))
}

function generateICS(event: Event): string {
  const startDate = new Date(event.dateISO)
  const endDate = new Date(startDate.getTime() + 86400000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(startDate)}`,
    `DTEND:${fmt(endDate)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadICS(event: Event) {
  const ics = generateICS(event)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.id}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function shareEvent(eventId: string) {
  const url = `${window.location.origin}/eventi?id=${eventId}`
  navigator.clipboard.writeText(url).then(() => toast.success('Link copiato!'))
}

// --- Event Detail Modal ---
function EventModal({ event, onClose, onRegister, isRegistered, onWaitlist }: {
  event: Event
  onClose: () => void
  onRegister: (id: string) => void
  isRegistered: boolean
  onWaitlist: (title: string) => void
}) {
  const occupiedPct = Math.round(((event.totalSpots - event.spots) / event.totalSpots) * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-2xl bg-[#FDF9F2] rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-52 shrink-0">
          <img src={event.cover} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
          {event.memberOnly && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#1C1C1C]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Lock size={10} className="text-[#C5A059]" />
              <span className="text-[10px] text-white font-medium">Solo Membri</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-[10px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-1">{event.category}</p>
          <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-1">{event.title}</h2>
          <p className="font-[family-name:var(--font-family-display)] text-lg text-[#C5A059] font-medium mb-4">
            €{event.price.toLocaleString('it-IT')} <span className="text-sm font-light text-[#5A4F44]">/ {event.priceUnit}</span>
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-[#5A4F44]">
            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#C5A059]" />{event.date}</span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#C5A059]" />
              {event.locationPremium ? 'Venue riservato' : event.location}
            </span>
            {event.dressCode && <span className="flex items-center gap-1.5"><span className="text-[#C5A059]">👔</span>{event.dressCode}</span>}
            {event.speaker && <span className="flex items-center gap-1.5 col-span-2"><span className="text-[#C5A059]">🎤</span>{event.speaker}</span>}
          </div>

          {/* Host */}
          {event.host && (
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 mb-4 border border-[rgba(197,160,89,0.15)]">
              <img src={event.host.avatar} alt={event.host.name} className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-xs font-medium text-[#1C1C1C]">{event.host.name}</p>
                <p className="text-[10px] text-[#5A4F44]">{event.host.role}</p>
              </div>
            </div>
          )}

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] text-[#5A4F44]/60 mb-1">
              <span>Disponibilità</span>
              <span>{event.totalSpots - event.spots}/{event.totalSpots} occupati</span>
            </div>
            <div className="w-full h-1.5 bg-[rgba(197,160,89,0.12)] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${occupiedPct >= 80 ? 'bg-red-400' : 'bg-[#C5A059]'}`} style={{ width: `${occupiedPct}%` }} />
            </div>
          </div>

          <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-6">{event.description}</p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-2">
            {isRegistered ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-sm text-emerald-700 font-medium">Iscritto</span>
              </div>
            ) : event.spots === 0 ? (
              <button onClick={() => { onWaitlist(event.title); onClose() }} className="px-6 py-2.5 rounded-xl bg-[#5A4F44] text-white text-sm font-light">Waitlist</button>
            ) : (
              <button onClick={() => { onRegister(event.id); onClose() }} className="px-6 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm font-light">Richiedi Iscrizione</button>
            )}
            <button onClick={() => downloadICS(event)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors">
              <CalendarPlus size={13} />Calendario
            </button>
            <button onClick={() => shareEvent(event.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors">
              <Share2 size={13} />Condividi
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function EventiPage() {
  const { user } = useAuth()
  const registrations: string[] = safeRead('theclass_event_registrations', [])
  const [registered, setRegistered] = useState<string[]>(registrations)

  // 7. Multi-select categories
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [onlyOpen, setOnlyOpen] = useState(false)

  // 3. Past events tab
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  // 1. Event detail modal
  const [modalEvent, setModalEvent] = useState<Event | null>(null)

  // 5. Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => safeRead('theclass_event_wishlist', []))

  // 8. Reminders
  const [reminders, setReminders] = useState<string[]>(() => safeRead('theclass_event_reminders', []))

  const register = (eventId: string) => {
    if (!user) { toast.error('Accedi per iscriverti agli eventi'); return }
    const key = `${eventId}_${user.id}`
    if (registered.includes(key)) return
    const next = [...registered, key]
    setRegistered(next)
    safeWrite('theclass_event_registrations', next)
    toast.success('Iscrizione confermata! Il team ti contatterà entro 24h.')
    if (navigator.vibrate) navigator.vibrate([60, 30, 60])
  }

  const isRegistered = (eventId: string) => {
    if (!user) return false
    return registered.includes(`${eventId}_${user.id}`)
  }

  const joinWaitlist = (eventTitle: string) => {
    toast('Aggiunto alla waitlist!', { description: `Ti avviseremo non appena si libera un posto per ${eventTitle}.` })
  }

  // 5. Toggle wishlist
  const toggleWishlist = useCallback((eventId: string) => {
    setWishlist(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
      safeWrite('theclass_event_wishlist', next)
      toast(next.includes(eventId) ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti')
      return next
    })
  }, [])

  // 8. Toggle reminder
  const toggleReminder = useCallback((eventId: string) => {
    setReminders(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
      safeWrite('theclass_event_reminders', next)
      toast(next.includes(eventId) ? 'Ti avviseremo 24h prima!' : 'Promemoria rimosso')
      return next
    })
  }, [])

  // 7. Toggle category multi-select
  const toggleCategory = (cat: string) => {
    if (cat === 'Tutto') { setActiveCategories([]); return }
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const UPCOMING = EVENTS.filter(e => !e.isPast)
  const PAST = EVENTS.filter(e => e.isPast)

  const filtered = useMemo(() => {
    const pool = tab === 'upcoming' ? UPCOMING : PAST
    return pool.filter(e => {
      const catOk = activeCategories.length === 0 || activeCategories.includes(e.category)
      const openOk = !onlyOpen || e.spots > 0
      return catOk && openOk
    })
  }, [activeCategories, onlyOpen, tab])

  // Hero: next upcoming event
  const heroEvent = useMemo(() => {
    const upcoming = [...UPCOMING].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    return upcoming[0]
  }, [])

  const heroDays = getDaysRemaining(heroEvent.dateISO)

  // 2. "Ti potrebbe piacere" — related events by category of last viewed
  const [lastViewedCategory, setLastViewedCategory] = useState<string | null>(null)
  const relatedEvents = useMemo(() => {
    if (!lastViewedCategory) return []
    return UPCOMING.filter(e => e.category === lastViewedCategory).slice(0, 3)
  }, [lastViewedCategory])

  const openModal = (event: Event) => {
    setLastViewedCategory(event.category)
    setModalEvent(event)
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Eventi Esclusivi — the Class</title>
        <meta name="description" content="Esperienze riservate ai membri: gala, regate, masterclass e cene con chef stellati." />
      </Helmet>

      {/* 1. Detail Modal */}
      <AnimatePresence>
        {modalEvent && (
          <EventModal
            event={modalEvent}
            onClose={() => setModalEvent(null)}
            onRegister={register}
            isRegistered={isRegistered(modalEvent.id)}
            onWaitlist={joinWaitlist}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden mb-14 h-72 md:h-96"
        >
          <img src={heroEvent.cover} alt={heroEvent.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">
              Prossimo evento
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-2xl md:text-3xl font-medium text-white mb-3 max-w-lg">
              {heroEvent.title}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#C5A059] text-white px-4 py-2 rounded-full">
                <Clock size={13} />
                <span className="text-sm font-medium">
                  {heroDays === 0 ? 'Oggi!' : `${heroDays} giorni al via`}
                </span>
              </div>
              <span className="text-white/80 text-sm">{heroEvent.location}</span>
            </div>
          </div>
        </motion.div>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">
            The Class Club
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-[#1C1C1C] leading-tight mb-4">
            Eventi Esclusivi
          </h1>
          <p className="text-[#5A4F44] text-base font-light max-w-2xl leading-relaxed">
            Esperienze curate per i nostri clienti più selezionati. Dal vernissage di Venezia alle Alpi in elicottero, ogni evento è un capitolo irripetibile.
          </p>
        </motion.div>

        {/* 3. Past/Upcoming tab toggle */}
        <div className="flex items-center gap-2 mb-6">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-light transition-all duration-200 ${
                tab === t ? 'bg-[#1C1C1C] text-white' : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
              }`}
            >
              {t === 'upcoming' ? 'Prossimi' : 'Passati'}
            </button>
          ))}
          {/* 5. Wishlist count badge */}
          {wishlist.length > 0 && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-[#C5A059] bg-[rgba(197,160,89,0.1)] px-3 py-1.5 rounded-full border border-[rgba(197,160,89,0.2)]">
              <Heart size={11} className="fill-[#C5A059]" />
              {wishlist.length} preferiti
            </span>
          )}
        </div>

        {/* 7. Multi-select category filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleCategory('Tutto')}
              className={`px-4 py-1.5 rounded-full text-sm font-light transition-all duration-200 ${
                activeCategories.length === 0
                  ? 'bg-[#1C1C1C] text-white'
                  : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
              }`}
            >
              Tutto
            </button>
            {CATEGORIES.filter(c => c !== 'Tutto').map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-light transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategories.includes(cat)
                    ? 'bg-[#C5A059] text-white'
                    : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059]'
                }`}
              >
                {activeCategories.includes(cat) && <CheckCircle size={11} />}
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOnlyOpen(v => !v)}
            className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
              onlyOpen ? 'bg-emerald-500 text-white' : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
            }`}
          >
            Solo aperti
          </button>
        </div>

        {/* Events list or empty state */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-6">🔍</div>
            <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">Nessun evento trovato</h2>
            <p className="text-[#5A4F44] font-light mb-6 max-w-sm text-sm">Non ci sono eventi per questa categoria al momento. Prova a cambiare filtro.</p>
            <button
              onClick={() => { setActiveCategories([]); setOnlyOpen(false) }}
              className="px-6 py-2.5 rounded-full bg-[#1C1C1C] text-white text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Mostra tutti gli eventi
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-8">
            {filtered.map((event, i) => {
              const daysLeft = getDaysRemaining(event.dateISO)
              const occupiedPct = Math.round(((event.totalSpots - event.spots) / event.totalSpots) * 100)
              const isUrgent = event.spots > 0 && event.spots <= 4
              const inWishlist = wishlist.includes(event.id)
              const hasReminder = reminders.includes(event.id)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(26,24,22,0.06)] flex flex-col md:flex-row ${event.isPast ? 'opacity-70 grayscale-[30%]' : ''}`}
                >
                  {/* Cover */}
                  <div className="relative md:w-80 shrink-0 overflow-hidden">
                    <img src={event.cover} alt={event.title} className="w-full h-56 md:h-full object-cover" loading="lazy" />
                    {event.memberOnly && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#1C1C1C]/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Lock size={10} className="text-[#C5A059]" />
                        <span className="text-[10px] text-white font-medium tracking-wide">Solo Membri</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-[rgba(253,249,242,0.9)] backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <span className="text-[10px] text-[#C5A059] font-medium">{event.category}</span>
                    </div>
                    {isUrgent && !event.isPast && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-red-500 text-white text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                          Ultimi posti!
                        </span>
                      </div>
                    )}
                    {/* 3. Past badge */}
                    {event.isPast && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-[#5A4F44] text-white text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Concluso
                        </span>
                      </div>
                    )}
                    {/* 5. Wishlist button */}
                    <button
                      onClick={() => toggleWishlist(event.id)}
                      className="absolute top-3 right-14 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      title={inWishlist ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                    >
                      <Heart size={12} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-[#5A4F44]'} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] leading-tight max-w-md">
                          {event.title}
                        </h2>
                        {/* 4. Price display */}
                        <p className="font-[family-name:var(--font-family-display)] text-lg text-[#C5A059] font-medium mt-1">
                          €{event.price.toLocaleString('it-IT')}
                          <span className="text-sm font-light text-[#5A4F44] ml-1">/ {event.priceUnit}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#5A4F44]">
                        <Calendar size={12} className="text-[#C5A059]" />
                        {event.date}
                      </span>
                      {/* 6. Location badge */}
                      <span className="flex items-center gap-1.5 text-xs text-[#5A4F44]">
                        <MapPin size={12} className="text-[#C5A059]" />
                        {event.locationPremium ? (
                          <span className="text-[#C5A059] font-medium">Venue riservato</span>
                        ) : event.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-[#5A4F44]">
                        <Users size={12} className="text-[#C5A059]" />
                        {event.spots} posti disponibili
                      </span>
                      {daysLeft > 0 && !event.isPast && (
                        <span className="flex items-center gap-1.5 text-xs text-[#C5A059] font-medium">
                          <Clock size={12} />
                          {daysLeft} giorni al via
                        </span>
                      )}
                    </div>

                    {/* Capacity bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#5A4F44]/60">Disponibilità</span>
                        <span className="text-[10px] text-[#5A4F44]">{event.totalSpots - event.spots}/{event.totalSpots} posti occupati</span>
                      </div>
                      <div className="w-full h-1.5 bg-[rgba(197,160,89,0.12)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${occupiedPct >= 80 ? 'bg-red-400' : 'bg-[#C5A059]'}`}
                          style={{ width: `${occupiedPct}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-4 flex-1">
                      {event.description}
                    </p>

                    {/* 10. Host footer */}
                    {event.host && (
                      <div className="flex items-center gap-2.5 mb-4 pt-3 border-t border-[rgba(197,160,89,0.12)]">
                        <img src={event.host.avatar} alt={event.host.name} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="text-[10px] text-[#5A4F44]/60">Host / Speaker</p>
                          <p className="text-xs text-[#1C1C1C] font-medium">{event.host.name} · <span className="font-light text-[#5A4F44]">{event.host.role}</span></p>
                        </div>
                      </div>
                    )}

                    {/* 9. Sponsor pill */}
                    {event.sponsor && (
                      <p className="text-[10px] text-[#5A4F44]/50 mb-3">Powered by <span className="font-medium text-[#5A4F44]/70">{event.sponsor}</span></p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.isPast ? (
                        /* 3. Past CTA */
                        <button className="px-6 py-2.5 rounded-xl bg-[#5A4F44]/10 text-[#5A4F44] text-sm font-light border border-[rgba(90,79,68,0.2)] hover:bg-[#5A4F44]/15 transition-colors">
                          Rivivi in foto →
                        </button>
                      ) : isRegistered(event.id) ? (
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-sm text-emerald-700 font-medium">Iscritto</span>
                        </div>
                      ) : event.spots === 0 ? (
                        <button onClick={() => joinWaitlist(event.title)} className="px-6 py-2.5 rounded-xl bg-[#5A4F44] text-white text-sm font-light tracking-wide hover:bg-[#4a3f34] transition-colors">
                          Unisciti alla waitlist
                        </button>
                      ) : event.memberOnly && !user ? (
                        <button onClick={() => joinWaitlist(event.title)} className="px-6 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm font-light tracking-wide hover:bg-[#2a2a2a] transition-colors">
                          Unisciti alla waitlist
                        </button>
                      ) : (
                        <button onClick={() => register(event.id)} className="px-6 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm font-light tracking-wide hover:bg-[#2a2a2a] transition-colors">
                          Richiedi Iscrizione
                        </button>
                      )}

                      {/* 1. Scopri di più button */}
                      <button
                        onClick={() => openModal(event)}
                        className="px-5 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                      >
                        Scopri di più
                      </button>

                      {!event.isPast && (
                        <>
                          <button
                            onClick={() => downloadICS(event)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                            title="Aggiungi a calendario"
                          >
                            <CalendarPlus size={13} />Calendario
                          </button>

                          <button
                            onClick={() => shareEvent(event.id)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm font-light hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                            title="Condividi evento"
                          >
                            <Share2 size={13} />Condividi
                          </button>

                          {/* 8. Reminder button */}
                          <button
                            onClick={() => toggleReminder(event.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-light transition-colors ${
                              hasReminder
                                ? 'bg-[rgba(197,160,89,0.1)] border-[#C5A059] text-[#C5A059]'
                                : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
                            }`}
                            title={hasReminder ? 'Promemoria attivo' : 'Ricordamelo 24h prima'}
                          >
                            <Bell size={13} className={hasReminder ? 'fill-[#C5A059]' : ''} />
                            {hasReminder ? 'Promemoria attivo' : 'Ricordamelo'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* 2. "Ti potrebbe piacere" section */}
        {relatedEvents.length > 0 && tab === 'upcoming' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-1">
              In base a ciò che hai visto
            </p>
            <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-6">
              Ti potrebbe piacere
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedEvents.map(event => (
                <motion.button
                  key={event.id}
                  onClick={() => openModal(event)}
                  whileHover={{ y: -2 }}
                  className="text-left bg-white rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.15)] shadow-sm hover:shadow-md transition-shadow"
                >
                  <img src={event.cover} alt={event.title} className="w-full h-36 object-cover" />
                  <div className="p-4">
                    <p className="text-[10px] text-[#C5A059] mb-1">{event.category}</p>
                    <p className="text-sm font-medium text-[#1C1C1C] leading-snug mb-1">{event.title}</p>
                    <p className="font-[family-name:var(--font-family-display)] text-sm text-[#C5A059]">
                      €{event.price.toLocaleString('it-IT')}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
