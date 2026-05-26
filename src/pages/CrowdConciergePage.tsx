import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Award, MessageCircle, Plus, X, Send, ThumbsUp, Search, Bell, BellOff, Clock, Shield, Users, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Answer {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: number
  votes: number
  verified: boolean
  isStaff?: boolean
}

interface Request {
  id: string
  author: string
  avatar: string
  title: string
  description: string
  budget: string
  dates: string
  category: string
  timestamp: number
  answers: Answer[]
  votes: number
  status: 'aperta' | 'in_risposta' | 'risolta'
  anonymous?: boolean
  relatableCount?: number
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_REQUESTS: Request[] = [
  {
    id: 'cr-001',
    author: 'Alessandro M.',
    avatar: 'AM',
    title: 'Yacht 30m+ per 10 persone, Sardegna, luglio',
    description: 'Cerco uno yacht di almeno 30 metri per una settimana in Costa Smeralda con equipaggio completo. Budget flessibile. Preferibilmente con jacuzzi e tender.',
    budget: '€35.000–50.000',
    dates: '12–19 Luglio 2026',
    category: 'Yacht',
    timestamp: Date.now() - 86400000 * 2,
    votes: 12,
    status: 'in_risposta',
    answers: [
      {
        id: 'ans-001a',
        author: 'The Class Staff',
        avatar: 'TC',
        text: 'Consiglio il **Sunseeker 34m** disponibile in quel periodo, ha tutto quello che cerchi incluso *jacuzzi di poppa* e tender Williams. Il charter si aggira sui €42.000/settimana tutto incluso. Contatta Yacht Charter Sardegna.',
        timestamp: Date.now() - 86400000,
        votes: 8,
        verified: true,
        isStaff: true,
      },
    ],
  },
  {
    id: 'cr-002',
    author: 'Chiara L.',
    avatar: 'CL',
    title: 'Jet privato Milano-Maldive per 6 persone',
    description: 'Matrimonio in agosto, cerco un heavy jet con cena di coppia a bordo. Budget generoso, voglio massima privacy.',
    budget: '€80.000+',
    dates: 'Agosto 2026',
    category: 'Jet',
    timestamp: Date.now() - 86400000 * 5,
    votes: 28,
    status: 'risolta',
    answers: [
      {
        id: 'ans-002a',
        author: 'Roberto F.',
        avatar: 'RF',
        text: 'Per le Maldive suggerisco il **Gulfstream G550** o il *Bombardier Global 6000*. Con scalo tecnico a Dubai è possibile. Chef privato incluso. Stimate €95k andata+ritorno.',
        timestamp: Date.now() - 86400000 * 4,
        votes: 19,
        verified: true,
        isStaff: false,
      },
    ],
  },
  {
    id: 'cr-003',
    author: 'Francesco G.',
    avatar: 'FG',
    title: 'Villa con piscina privata in Toscana, 8 persone, settembre',
    description: 'Sto cercando una tenuta o villa di lusso in Chianti o Maremma, con piscina infinita, cantina, possibilmente con cuoco. Weekend lungo (4 notti).',
    budget: '€8.000–15.000',
    dates: 'Settembre 2026',
    category: 'Villa',
    timestamp: Date.now() - 86400000 * 16,
    votes: 7,
    status: 'aperta',
    answers: [],
  },
  {
    id: 'cr-004',
    author: 'Sofia R.',
    avatar: 'SR',
    title: 'Esperienza gastronomica esclusiva, Piemonte',
    description: 'Cerco una cena privata con chef stellato in cantina storica per 12 persone. Occasione anniversario aziendale. Degustazione vini inclusa.',
    budget: '€3.000–6.000',
    dates: 'Ottobre 2026',
    category: 'Esperienza',
    timestamp: Date.now() - 86400000 * 3,
    votes: 22,
    status: 'aperta',
    answers: [],
  },
]

const CATEGORIES = ['Tutti', 'Yacht', 'Jet', 'Villa', 'Auto', 'Esperienza', 'Altro']

const BADGES = [
  { id: 'yacht-expert', label: 'Esperto Yacht', icon: '⛵', color: '#0ea5e9' },
  { id: 'jet-guru', label: 'Guru Jet', icon: '✈️', color: '#8b5cf6' },
  { id: 'local-hero', label: 'Local Hero', icon: '📍', color: '#f59e0b' },
  { id: 'verified', label: 'Verificato', icon: '✓', color: '#10b981' },
]

const LEADERBOARD = [
  { name: 'Marco S.', points: 2840, badge: 'Esperto Yacht ⛵' },
  { name: 'Roberto F.', points: 2210, badge: 'Guru Jet ✈️' },
  { name: 'Elena C.', points: 1890, badge: 'Local Hero 📍' },
]

// ── 8. Top Contributors (mock) ──
const TOP_CONTRIBUTORS = [
  { name: 'Giulia B.', avatar: 'GB', answers: 34, month: 'Maggio' },
  { name: 'Luca M.', avatar: 'LM', answers: 29, month: 'Maggio' },
  { name: 'Paola V.', avatar: 'PV', answers: 21, month: 'Maggio' },
]

// ── 9. Request templates ──
const REQUEST_TEMPLATES = [
  { label: 'Yacht Sicilia', title: 'Yacht per 10 persone luglio Sicilia', description: 'Cerco yacht 30m+ per 10 persone, luglio 2026, itinerario Sicilia/Eolie. Equipaggio completo, chef a bordo.' },
  { label: 'Jet Privato', title: 'Jet privato Milano→Miami one way', description: 'One way Milano Linate → Miami, 4 passeggeri, fascia heavy jet, giugno 2026. Privacy assoluta.' },
  { label: 'Villa Amalfi', title: 'Villa esclusiva Costa Amalfi, agosto', description: 'Villa con piscina infinita, vista mare, personale dedicato per 6 persone. 1 settimana agosto 2026.' },
  { label: 'Esperienza VIP', title: 'Cena privata chef stellato, anniversario', description: 'Cena privata con chef 2 stelle Michelin per 2 persone, Roma o Milano, ricorrenza speciale.' },
]

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Request['status'] }) {
  const map: Record<Request['status'], { label: string; className: string }> = {
    aperta: { label: 'Aperta', className: 'bg-amber-50 border-amber-200 text-amber-600' },
    in_risposta: { label: 'In risposta', className: 'bg-blue-50 border-blue-200 text-blue-600' },
    risolta: { label: 'Risolta', className: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  }
  const { label, className } = map[status]
  return (
    <span className={cn('text-[9px] font-medium border px-1.5 py-0.5 rounded-full', className)}>
      {label}
    </span>
  )
}

// ─── Render rich text (bold/italic) ──────────────────────────────────────────
function renderRichText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// ─── Live counter ─────────────────────────────────────────────────────────────
function LiveCounter() {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 17) + 8)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(Math.floor(Math.random() * 17) + 8)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-xs text-[#5A4F44]">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span><span className="font-medium text-[#1C1C1C]">{count}</span> persone stanno consultando ora</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CrowdConciergePage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>(() =>
    safeRead('theclass_crowd_requests', SEED_REQUESTS)
  )
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [newReq, setNewReq] = useState({
    title: '',
    description: '',
    budget: '',
    dates: '',
    category: 'Yacht',
    tags: [] as string[],
    anonymous: false,
  })
  const [showTemplates, setShowTemplates] = useState(false)

  // ── 2. Upvotes localStorage ──
  const [myUpvotes, setMyUpvotes] = useState<string[]>(() => safeRead('theclass_crowd_upvotes', []))
  // ── 3. Search ──
  const [search, setSearch] = useState('')
  // ── 4. Category filter ──
  const [catFilter, setCatFilter] = useState('Tutti')
  // ── 10. Notify per richiesta ──
  const [notified, setNotified] = useState<string[]>(() => safeRead('theclass_crowd_notify', []))

  // NEW 1. Sort ──
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'unanswered'>('votes')
  // NEW 4. Tab ──
  const [tab, setTab] = useState<'all' | 'followed'>('all')
  // NEW 7. Relatable votes ──
  const [myRelatable, setMyRelatable] = useState<Record<string, number>>(() => safeRead('theclass_crowd_relatable', {}))
  // NEW 10. Visible count (pagination) ──
  const [visibleCount, setVisibleCount] = useState(6)

  const searchRef = useRef<HTMLInputElement>(null)

  // ── 2. Upvote (localStorage-persisted) ──
  const voteRequest = useCallback((id: string) => {
    if (myUpvotes.includes(id)) {
      toast('Hai già votato questa richiesta')
      return
    }
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r)
      safeWrite('theclass_crowd_requests', updated)
      return updated
    })
    const newUpvotes = [...myUpvotes, id]
    setMyUpvotes(newUpvotes)
    safeWrite('theclass_crowd_upvotes', newUpvotes)
    toast.success('+1 voto!')
  }, [myUpvotes])

  // ── 10. Toggle notify ──
  const toggleNotify = useCallback((id: string) => {
    setNotified(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      safeWrite('theclass_crowd_notify', next)
      if (!prev.includes(id)) toast.success('Sarai notificato quando arriva una risposta')
      else toast('Notifiche disattivate')
      return next
    })
  }, [])

  // NEW 7. Relatable vote ──
  const voteRelatable = useCallback((id: string) => {
    setMyRelatable(prev => {
      const current = prev[id] ?? 0
      const updated = { ...prev, [id]: current + 1 }
      safeWrite('theclass_crowd_relatable', updated)
      return updated
    })
    toast.success('Aggiunto "Mi riguarda anche"')
  }, [])

  const submitRequest = useCallback(() => {
    if (!user) { toast.error('Accedi per pubblicare una richiesta'); return }
    if (!newReq.title || !newReq.description) { toast.error('Compila tutti i campi'); return }
    const req: Request = {
      id: `cr-${Date.now()}`,
      author: newReq.anonymous ? 'Anonimo' : user.name,
      avatar: newReq.anonymous ? 'AN' : user.name.slice(0, 2).toUpperCase(),
      title: newReq.title,
      description: newReq.description,
      budget: newReq.budget,
      dates: newReq.dates,
      category: newReq.category,
      timestamp: Date.now(),
      votes: 0,
      status: 'aperta',
      anonymous: newReq.anonymous,
      answers: [],
    }
    const updated = [req, ...requests]
    setRequests(updated)
    safeWrite('theclass_crowd_requests', updated)
    setShowNewRequest(false)
    setNewReq({ title: '', description: '', budget: '', dates: '', category: 'Yacht', tags: [], anonymous: false })
    toast.success('Richiesta pubblicata! La community risponderà presto.')
    if (navigator.vibrate) navigator.vibrate(40)
  }, [user, newReq, requests])

  const submitReply = useCallback((requestId: string) => {
    if (!user) { toast.error('Accedi per rispondere'); return }
    if (!replyText.trim()) return
    const answer: Answer = {
      id: `ans-${Date.now()}`,
      author: user.name,
      avatar: user.name.slice(0, 2).toUpperCase(),
      text: replyText,
      timestamp: Date.now(),
      votes: 0,
      verified: false,
      isStaff: false,
    }
    const updated = requests.map(r => r.id === requestId
      ? { ...r, answers: [...r.answers, answer] }
      : r
    )
    setRequests(updated)
    safeWrite('theclass_crowd_requests', updated)
    setReplyingTo(null)
    setReplyText('')
    toast.success('Risposta pubblicata! Hai guadagnato 50 punti.')
  }, [user, replyText, requests])

  // ── 3 & 4. Filtered requests ──
  const maxVotes = Math.max(...requests.map(r => r.votes), 1)

  const filtered = requests.filter(r => {
    const matchCat = catFilter === 'Tutti' || r.category === catFilter
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    // NEW 4: "Seguiti" tab
    const matchTab = tab === 'all' || notified.includes(r.id)
    return matchCat && matchSearch && matchTab
  })

  // NEW 1. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes
    if (sortBy === 'recent') return b.timestamp - a.timestamp
    if (sortBy === 'unanswered') return a.answers.length - b.answers.length
    return 0
  })

  // NEW 10. Paginated
  const paginated = sorted.slice(0, visibleCount)
  const hasMore = sorted.length > visibleCount

  // ── 7. Avg response time (mock) ──
  const avgResponseTime = '2.4h'

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Crowd Concierge — the Class</title>
        <meta name="description" content="La community di esperti del lusso risponde alle tue domande più complesse." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">
            Intelligenza Collettiva
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-[#1C1C1C] mb-4">
            Crowd Concierge
          </h1>
          <p className="text-[#5A4F44] font-light max-w-2xl leading-relaxed mb-4">
            Hai una richiesta complessa? La nostra community di esperti verificati risponde con consigli reali, non bot.
          </p>
          {/* ── 1. Live counter + 7. Response time ── */}
          <div className="flex items-center gap-6 flex-wrap">
            <LiveCounter />
            <div className="flex items-center gap-1.5 text-xs text-[#5A4F44]">
              <Clock size={12} className="text-[#C5A059]" />
              Risposta media: <span className="font-medium text-[#1C1C1C] ml-1">{avgResponseTime}</span>
            </div>
          </div>
        </motion.div>

        {/* ── 3. Search bar ── */}
        <div className="mb-6 relative max-w-lg">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C5A059]" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca richieste nella community..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={12} className="text-[#5A4F44]" />
            </button>
          )}
        </div>

        {/* ── 4. Category filter ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                catFilter === cat
                  ? 'bg-[#C5A059] border-[#C5A059] text-white'
                  : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:border-[#C5A059] bg-white',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* NEW 1. Sort dropdown + NEW 4. Tab toggle */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          {/* Tab: Tutte / Solo seguite */}
          <div className="flex gap-1 bg-white border border-[rgba(197,160,89,0.2)] rounded-full p-0.5">
            {(['all', 'followed'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                  tab === t ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:text-[#C5A059]',
                )}
              >
                {t === 'all' ? 'Tutte' : 'Solo seguite'}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-xs border border-[rgba(197,160,89,0.22)] rounded-full px-3 py-1.5 bg-white text-[#5A4F44] cursor-pointer select-none">
              <ChevronDown size={12} className="text-[#C5A059]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent focus:outline-none text-xs text-[#5A4F44] cursor-pointer"
              >
                <option value="votes">Ordina: Più votati</option>
                <option value="recent">Ordina: Più recenti</option>
                <option value="unanswered">Ordina: Senza risposta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main: Requests ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── 5. "Posta la tua richiesta" button ── */}
            <button
              onClick={() => setShowNewRequest(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059] transition-all flex items-center justify-center gap-2 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-light">Pubblica una richiesta</span>
            </button>

            {/* Results count */}
            {(search || catFilter !== 'Tutti') && (
              <p className="text-xs text-[#5A4F44]">
                <span className="font-medium text-[#1C1C1C]">{filtered.length}</span> risultati
                {search && <span> per "<em>{search}</em>"</span>}
              </p>
            )}

            {/* ── Request list ── */}
            {paginated.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#5A4F44] font-light italic">
                Nessuna richiesta trovata. Sii il primo a pubblicarne una!
              </div>
            ) : (
              <>
                {paginated.map((req, i) => {
                  // ── 6. Trending badge (top 25% by votes) ──
                  const isTrending = req.votes >= maxVotes * 0.65 && req.votes > 5
                  const isNotified = notified.includes(req.id)
                  const hasUpvoted = myUpvotes.includes(req.id)

                  // NEW 5. Expiry badge (> 14 days no answer)
                  const daysSinceCreated = (Date.now() - req.timestamp) / (1000 * 60 * 60 * 24)
                  const daysLeft = 30 - Math.floor(daysSinceCreated)
                  const showExpiry = daysSinceCreated > 14 && req.answers.length === 0

                  // NEW 7. Relatable count
                  const relatableCount = myRelatable[req.id] ?? (req.relatableCount ?? 0)

                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,24,22,0.05)] relative overflow-hidden"
                    >
                      {/* NEW 2. Status badge — top right */}
                      <div className="absolute top-4 right-4">
                        <StatusBadge status={req.status} />
                      </div>

                      <div className="flex items-start gap-3 mb-3 pr-20">
                        <div className="w-9 h-9 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-medium text-[#C5A059]">{req.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-medium text-[#1C1C1C]">{req.author}</span>
                            <span className="text-[10px] bg-[rgba(197,160,89,0.12)] text-[#C5A059] px-2 py-0.5 rounded-full">{req.category}</span>
                            {/* ── 6. Trending badge ── */}
                            {isTrending && (
                              <span className="text-[10px] bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                🔥 Trending
                              </span>
                            )}
                            {/* NEW 5. Expiry badge */}
                            {showExpiry && (
                              <span className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full">
                                ⏰ Scade tra {daysLeft > 0 ? `${daysLeft} giorni` : 'oggi'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#5A4F44]/60">{new Date(req.timestamp).toLocaleDateString('it-IT')}</p>
                        </div>
                        {/* ── 10. Notificami toggle ── */}
                        <button
                          onClick={() => toggleNotify(req.id)}
                          title={isNotified ? 'Disattiva notifiche' : 'Notificami'}
                          className={cn(
                            'p-1.5 rounded-full transition-colors shrink-0',
                            isNotified ? 'text-[#C5A059] bg-[rgba(197,160,89,0.1)]' : 'text-[#5A4F44]/40 hover:text-[#C5A059]',
                          )}
                        >
                          {isNotified ? <Bell size={13} /> : <BellOff size={13} />}
                        </button>
                      </div>

                      <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-2">{req.title}</h3>
                      <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-3">{req.description}</p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        {req.budget && (
                          <span className="text-[11px] text-[#5A4F44] bg-[#FCFAF5] border border-[rgba(197,160,89,0.15)] px-2.5 py-1 rounded-lg">
                            💰 {req.budget}
                          </span>
                        )}
                        {req.dates && (
                          <span className="text-[11px] text-[#5A4F44] bg-[#FCFAF5] border border-[rgba(197,160,89,0.15)] px-2.5 py-1 rounded-lg">
                            📅 {req.dates}
                          </span>
                        )}
                      </div>

                      {/* ── Answers with staff verified badge ── */}
                      {req.answers.length > 0 && (
                        <div className="space-y-3 mb-4 pl-4 border-l-2 border-[rgba(197,160,89,0.2)]">
                          {req.answers.map(ans => (
                            <div key={ans.id} className={cn(
                              'rounded-xl p-3',
                              ans.isStaff ? 'bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)]' : 'bg-[#FCFAF5]',
                            )}>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <div className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center',
                                  ans.isStaff ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.15)]',
                                )}>
                                  <span className={cn('text-[8px] font-medium', ans.isStaff ? 'text-white' : 'text-[#C5A059]')}>{ans.avatar}</span>
                                </div>
                                <span className="text-xs font-medium text-[#1C1C1C]">{ans.author}</span>
                                {/* ── 8. Verified staff badge ── */}
                                {ans.isStaff && (
                                  <span className="text-[9px] bg-[#C5A059] text-white px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                    <Shield size={8} /> The Class Staff
                                  </span>
                                )}
                                {ans.verified && !ans.isStaff && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">✓ Verificato</span>
                                )}
                                <span className="text-[10px] text-[#5A4F44] ml-auto">▲ {ans.votes}</span>
                              </div>
                              {/* NEW 6. Rich text rendering */}
                              <p
                                className="text-xs text-[#5A4F44] font-light leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderRichText(ans.text) }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Actions ── */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* ── 2. Upvote ── */}
                        <button
                          onClick={() => voteRequest(req.id)}
                          className={cn(
                            'flex items-center gap-1.5 text-xs transition-colors',
                            hasUpvoted ? 'text-[#C5A059]' : 'text-[#5A4F44] hover:text-[#C5A059]',
                          )}
                        >
                          <ThumbsUp size={12} className={hasUpvoted ? 'fill-current' : ''} /> {req.votes}
                        </button>

                        {/* NEW 7. Mi riguarda anche */}
                        <button
                          onClick={() => voteRelatable(req.id)}
                          className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-blue-500 transition-colors"
                          title="Mi riguarda anche"
                        >
                          <Users size={12} /> {relatableCount > 0 ? relatableCount : 'Mi riguarda'}
                        </button>

                        <button onClick={() => setReplyingTo(replyingTo === req.id ? null : req.id)}
                          className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors">
                          <MessageCircle size={12} /> {req.answers.length} risposte
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Guarda questa richiesta su the Class: "${req.title}" — https://the-class-luxury.pages.dev/crowd-concierge`)}`, '_blank')}
                          className="flex items-center gap-1 text-xs text-[#5A4F44] hover:text-green-600 transition-colors"
                        >
                          <span className="text-xs">💬</span> WhatsApp
                        </button>
                        <button
                          onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent('https://the-class-luxury.pages.dev/crowd-concierge')}&text=${encodeURIComponent(req.title)}`, '_blank')}
                          className="flex items-center gap-1 text-xs text-[#5A4F44] hover:text-blue-500 transition-colors"
                        >
                          <span className="text-xs">✈️</span> Telegram
                        </button>
                      </div>

                      {/* Reply box — NEW 6: Rich text hint */}
                      <AnimatePresence>
                        {replyingTo === req.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                            <p className="text-[10px] text-[#5A4F44]/50 mb-1.5">Supporta **grassetto** e *corsivo* nel testo</p>
                            <div className="flex gap-2">
                              <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Scrivi la tua risposta esperta... Usa **testo** per grassetto e *testo* per corsivo"
                                rows={3}
                                className="flex-1 border border-[rgba(197,160,89,0.25)] rounded-xl px-3 py-2 text-xs text-[#1C1C1C] bg-[#FCFAF5] focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                              />
                              <button onClick={() => submitReply(req.id)}
                                className="px-3 py-2 rounded-xl bg-[#C5A059] text-white hover:bg-[#b8924a] transition-colors shrink-0 self-end">
                                <Send size={14} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}

                {/* NEW 10. Load more */}
                {hasMore && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <button
                      onClick={() => setVisibleCount(v => v + 3)}
                      className="px-6 py-2.5 rounded-full border border-[rgba(197,160,89,0.3)] text-sm text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                    >
                      Mostra altri {Math.min(3, sorted.length - visibleCount)} →
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar: Leaderboard + Badges + Contributors ── */}
          <div className="space-y-6">
            {/* ── 7. Response time + stats ── */}
            <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-5">
              <h3 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-3">
                Statistiche Community
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Richieste attive', value: requests.length },
                  { label: 'Risposte totali', value: requests.reduce((acc, r) => acc + r.answers.length, 0) },
                  { label: 'Risposta media', value: avgResponseTime },
                  { label: 'Esperti attivi', value: '24+' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#5A4F44]">{s.label}</span>
                    <span className="text-xs font-medium text-[#C5A059] font-[family-name:var(--font-family-mono)]">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW 8. Top Contributors */}
            <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-5">
              <h3 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-4 flex items-center gap-2">
                <Users size={14} className="text-[#C5A059]" /> Top Contributors
                <span className="ml-auto text-[10px] text-[#5A4F44]/60">Questo mese</span>
              </h3>
              <div className="space-y-3">
                {TOP_CONTRIBUTORS.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-[#C5A059] w-4">{i + 1}.</span>
                    <div className="w-7 h-7 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-medium text-[#C5A059]">{c.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1C1C1C] truncate">{c.name}</p>
                    </div>
                    <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059]">{c.answers} risp.</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-5">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4 flex items-center gap-2">
                <Award size={14} className="text-[#C5A059]" /> Leaderboard
              </h3>
              <div className="space-y-3">
                {LEADERBOARD.map((u, i) => (
                  <div key={u.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[rgba(197,160,89,0.12)] flex items-center justify-center text-[11px] font-bold text-[#C5A059]">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1C1C1C] truncate">{u.name}</p>
                      <p className="text-[10px] text-[#5A4F44]">{u.badge}</p>
                    </div>
                    <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059]">{u.points.toLocaleString('it-IT')} pt</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-5">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
                Badge Community
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {BADGES.map(b => (
                  <div key={b.id} className="p-2.5 rounded-xl border border-[rgba(197,160,89,0.12)] text-center">
                    <span className="text-lg block mb-1">{b.icon}</span>
                    <p className="text-[9px] text-[#5A4F44] font-medium">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. New Request Modal con tag selector + NEW 3 anon + NEW 9 templates ── */}
      <AnimatePresence>
        {showNewRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewRequest(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
                  Nuova Richiesta
                </h2>
                <button onClick={() => setShowNewRequest(false)} className="p-1.5 rounded-lg hover:bg-[rgba(197,160,89,0.1)]">
                  <X size={14} className="text-[#5A4F44]" />
                </button>
              </div>

              {/* NEW 9. Template picker */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={() => setShowTemplates(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-[#C5A059] border border-[rgba(197,160,89,0.3)] px-3 py-1.5 rounded-full hover:bg-[rgba(197,160,89,0.08)] transition-colors mb-2"
                >
                  📋 Usa template
                </button>
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {REQUEST_TEMPLATES.map(tpl => (
                          <button
                            key={tpl.label}
                            type="button"
                            onClick={() => {
                              setNewReq(prev => ({ ...prev, title: tpl.title, description: tpl.description }))
                              setShowTemplates(false)
                            }}
                            className="text-left px-3 py-2 rounded-xl border border-[rgba(197,160,89,0.2)] hover:border-[#C5A059] text-xs text-[#5A4F44] bg-white transition-colors"
                          >
                            <span className="font-medium text-[#1C1C1C] block mb-0.5">{tpl.label}</span>
                            <span className="line-clamp-2 text-[10px]">{tpl.description}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                {([
                  { label: 'Titolo *', key: 'title', placeholder: 'Es. Yacht 30m per 8 persone, luglio' },
                  { label: 'Descrizione *', key: 'description', placeholder: 'Descriva in dettaglio cosa cerca...' },
                  { label: 'Budget', key: 'budget', placeholder: 'Es. €20.000–30.000' },
                  { label: 'Date', key: 'dates', placeholder: 'Es. 10–17 Luglio 2026' },
                ] as const).map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">{label}</label>
                    {key === 'description' ? (
                      <textarea value={newReq[key]} onChange={e => setNewReq(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder} rows={3}
                        className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] transition-colors resize-none" />
                    ) : (
                      <input value={newReq[key]} onChange={e => setNewReq(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder} type="text"
                        className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] transition-colors" />
                    )}
                  </div>
                ))}

                {/* ── 5. Tag/categoria selector ── */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.filter(c => c !== 'Tutti').map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewReq(prev => ({ ...prev, category: cat }))}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs border transition-colors',
                          newReq.category === cat
                            ? 'bg-[#C5A059] border-[#C5A059] text-white'
                            : 'border-[rgba(197,160,89,0.25)] text-[#5A4F44] hover:border-[#C5A059] bg-white',
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NEW 3. Anonymous toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[rgba(197,160,89,0.2)] bg-white">
                  <div>
                    <p className="text-xs font-medium text-[#1C1C1C]">Pubblica anonimamente</p>
                    <p className="text-[10px] text-[#5A4F44]/60">Il tuo nome non sarà visibile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewReq(prev => ({ ...prev, anonymous: !prev.anonymous }))}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      newReq.anonymous ? 'bg-[#C5A059]' : 'bg-[#E5E0D8]',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      newReq.anonymous ? 'translate-x-5' : 'translate-x-0.5',
                    )} />
                  </button>
                </div>

                <button onClick={submitRequest}
                  className="w-full py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium hover:bg-[#2a2a2a] transition-colors">
                  Pubblica Richiesta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
