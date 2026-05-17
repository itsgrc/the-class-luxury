import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Award, MessageCircle, Plus, X, Send, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'

interface Answer {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: number
  votes: number
  verified: boolean
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
}

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
    answers: [
      {
        id: 'ans-001a',
        author: 'Marco S.',
        avatar: 'MS',
        text: 'Consiglio il Sunseeker 34m disponibile in quel periodo, ha tutto quello che cerchi incluso jacuzzi di poppa e tender Williams. Il charter si aggira sui €42.000/settimana tutto incluso. Contatta Yacht Charter Sardegna.',
        timestamp: Date.now() - 86400000,
        votes: 8,
        verified: true,
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
    answers: [
      {
        id: 'ans-002a',
        author: 'Roberto F.',
        avatar: 'RF',
        text: 'Per le Maldive suggerisco il Gulfstream G550 o il Bombardier Global 6000. Con scalo tecnico a Dubai è possibile. Chef privato incluso. Stimate €95k andata+ritorno.',
        timestamp: Date.now() - 86400000 * 4,
        votes: 19,
        verified: true,
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
    timestamp: Date.now() - 86400000 * 1,
    votes: 7,
    answers: [],
  },
]

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

export function CrowdConciergePage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>(() =>
    safeRead('theclass_crowd_requests', SEED_REQUESTS)
  )
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [newReq, setNewReq] = useState({ title: '', description: '', budget: '', dates: '', category: 'Yacht' })

  const submitRequest = useCallback(() => {
    if (!user) { toast.error('Accedi per pubblicare una richiesta'); return }
    if (!newReq.title || !newReq.description) { toast.error('Compila tutti i campi'); return }
    const req: Request = {
      id: `cr-${Date.now()}`,
      author: user.name,
      avatar: user.name.slice(0, 2).toUpperCase(),
      title: newReq.title,
      description: newReq.description,
      budget: newReq.budget,
      dates: newReq.dates,
      category: newReq.category,
      timestamp: Date.now(),
      votes: 0,
      answers: [],
    }
    const updated = [req, ...requests]
    setRequests(updated)
    safeWrite('theclass_crowd_requests', updated)
    setShowNewRequest(false)
    setNewReq({ title: '', description: '', budget: '', dates: '', category: 'Yacht' })
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

  const voteRequest = useCallback((id: string) => {
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r)
      safeWrite('theclass_crowd_requests', updated)
      return updated
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Crowd Concierge — the Class</title>
        <meta name="description" content="La community di esperti del lusso risponde alle tue domande più complesse." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">
            Intelligenza Collettiva
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl md:text-5xl font-medium text-[#1C1C1C] mb-4">
            Crowd Concierge
          </h1>
          <p className="text-[#5A4F44] font-light max-w-2xl leading-relaxed">
            Hai una richiesta complessa? La nostra community di esperti verificati risponde con consigli reali, non bot.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main: Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* New request button */}
            <button
              onClick={() => setShowNewRequest(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059] hover:text-[#C5A059] transition-all flex items-center justify-center gap-2 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              <span className="text-sm font-light">Pubblica una richiesta</span>
            </button>

            {/* Requests list */}
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-6 shadow-[0_2px_12px_rgba(26,24,22,0.05)]"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-medium text-[#C5A059]">{req.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-[#1C1C1C]">{req.author}</span>
                      <span className="text-[10px] bg-[rgba(197,160,89,0.12)] text-[#C5A059] px-2 py-0.5 rounded-full">{req.category}</span>
                    </div>
                    <p className="text-[10px] text-[#5A4F44]/60">{new Date(req.timestamp).toLocaleDateString('it-IT')}</p>
                  </div>
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

                {/* Answers */}
                {req.answers.length > 0 && (
                  <div className="space-y-3 mb-4 pl-4 border-l-2 border-[rgba(197,160,89,0.2)]">
                    {req.answers.map(ans => (
                      <div key={ans.id} className="bg-[#FCFAF5] rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center">
                            <span className="text-[8px] font-medium text-[#C5A059]">{ans.avatar}</span>
                          </div>
                          <span className="text-xs font-medium text-[#1C1C1C]">{ans.author}</span>
                          {ans.verified && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">✓ Verificato</span>
                          )}
                          <span className="text-[10px] text-[#5A4F44] ml-auto">▲ {ans.votes}</span>
                        </div>
                        <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{ans.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={() => voteRequest(req.id)}
                    className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors">
                    <ThumbsUp size={12} /> {req.votes}
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

                {/* Reply box */}
                <AnimatePresence>
                  {replyingTo === req.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Scrivi la tua risposta esperta..."
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
            ))}
          </div>

          {/* Sidebar: Leaderboard + Badges */}
          <div className="space-y-6">
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

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewRequest(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
                  Nuova Richiesta
                </h2>
                <button onClick={() => setShowNewRequest(false)} className="p-1.5 rounded-lg hover:bg-[rgba(197,160,89,0.1)]">
                  <X size={14} className="text-[#5A4F44]" />
                </button>
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
