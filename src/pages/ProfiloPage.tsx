import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { User, Heart, FileText, LogOut, Edit3, Check, Camera, Download, Bell, BellOff, RefreshCw, Star, Clock, Globe, CreditCard, ChevronDown, Phone, Mail, MessageCircle, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { LoyaltyBadge } from '@/components/LoyaltyBadge'
import { QRCodeSVG } from 'qrcode.react'
import { Link } from '@tanstack/react-router'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoredRequest {
  id: string
  listingTitle: string
  timestamp: number
  dates?: { from?: string; to?: string }
  upgrades?: string[]
  name: string
  email: string
}

interface ConciergeRequest {
  id: string
  title: string
  timestamp: number
  status?: 'pending' | 'in_progress' | 'completed'
}

interface FactotumDeadline {
  id: string
  title: string
  dueDate: string
  category: string
}

interface QuizProfile {
  type: string
  label: string
  description: string
}

// ─── Membership badge ─────────────────────────────────────────────────────────
function MembershipBadge({ requestCount }: { requestCount: number }) {
  const tier =
    requestCount >= 10 ? { label: 'Oro', color: '#C5A059', bg: 'rgba(197,160,89,0.1)', icon: '🥇' }
    : requestCount >= 5 ? { label: 'Argento', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', icon: '🥈' }
    : { label: 'Bronze', color: '#B45309', bg: 'rgba(180,83,9,0.1)', icon: '🥉' }

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
      style={{ borderColor: tier.color, background: tier.bg, color: tier.color }}
    >
      <span>{tier.icon}</span>
      Membership {tier.label}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-5 text-center">
      <Icon size={18} className="mx-auto mb-2" style={{ color: color ?? '#C5A059' }} />
      <p className="font-[family-name:var(--font-family-mono)] text-xl font-medium text-[#1C1C1C]">{value}</p>
      <p className="text-xs text-[#5A4F44] mt-0.5">{label}</p>
    </div>
  )
}

// ─── Hobby checkboxes ─────────────────────────────────────────────────────────
const HOBBIES = ['Vela', 'Golf', 'Arte', 'Gastronomia', 'Sci', 'Viaggi avventura', 'Benessere', 'Motorsport', 'Opera', 'Polo']

function TravelPreferences({ userId }: { userId: string }) {
  const key = `theclass_prefs_${userId}`
  const [selected, setSelected] = useState<string[]>(() => safeRead<string[]>(key, []))

  const toggle = (h: string) => {
    setSelected(prev => {
      const next = prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]
      safeWrite(key, next)
      return next
    })
  }

  return (
    <div className="mb-10 p-6 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
      <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
        Preferenze di Viaggio
      </h2>
      <div className="flex flex-wrap gap-2">
        {HOBBIES.map(h => (
          <button
            key={h}
            onClick={() => toggle(h)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              selected.includes(h)
                ? 'bg-[#C5A059] border-[#C5A059] text-white'
                : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]',
            )}
          >
            {h}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="text-[10px] text-[#5A4F44] mt-3">{selected.length} interessi salvati automaticamente</p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ProfiloPage() {
  const { user, login, logout } = useAuth()
  const [loginForm, setLoginForm] = useState({ name: '', email: '' })
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? '')
  const [editEmail, setEditEmail] = useState(user?.email ?? '')
  const [editingEmail, setEditingEmail] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() =>
    user ? safeRead<string | null>(`theclass_avatar_${user.id}`, null) : null
  )
  const [activeTab, setActiveTab] = useState<'richieste' | 'scadenze'>('richieste')
  const [emailNotif, setEmailNotif] = useState<boolean>(() => safeRead('theclass_notif_email', true))
  const [newsletter, setNewsletter] = useState<boolean>(() => safeRead('theclass_notif_newsletter', true))
  const fileRef = useRef<HTMLInputElement>(null)

  // ── New feature states ──────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => safeRead('theclass_dark_mode', false))
  const [notifOpen, setNotifOpen] = useState(false)
  const [language, setLanguage] = useState<string>(() => safeRead('theclass_language', 'it'))
  const [birthday, setBirthday] = useState<string>(() => safeRead('theclass_birthday', ''))
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)

  // Apply dark mode on mount and toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  // Close notif dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Birthday check
  const isBirthmonth = (() => {
    if (!birthday) return false
    const bd = new Date(birthday)
    return bd.getMonth() === new Date().getMonth()
  })()

  const requests = safeRead<StoredRequest[]>('theclass_requests', [])
  const myRequests = user ? requests.filter(r => r.email === user.email) : []
  const favCount = user
    ? (safeRead<string[]>(`theclass_favorites_${user.id}`, [])).length
    : 0
  const conciergeRequests = safeRead<ConciergeRequest[]>('theclass_concierge', [])
  const factotumDeadlines = safeRead<FactotumDeadline[]>('theclass_factotum', [])
  const quizProfile = user ? safeRead<QuizProfile | null>('theclass_quiz_profile', null) : null

  // Profile completeness %
  const profileScore = useCallback(() => {
    if (!user) return 0
    let score = 0
    if (user.name) score += 25
    if (user.email) score += 25
    if (avatarSrc) score += 25
    if (safeRead<string[]>(`theclass_prefs_${user.id}`, []).length > 0) score += 25
    return score
  }, [user, avatarSrc])

  // ── 1. Avatar upload ──────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = ev => {
      const b64 = ev.target?.result as string
      setAvatarSrc(b64)
      safeWrite(`theclass_avatar_${user.id}`, b64)
      toast.success('Foto profilo aggiornata')
    }
    reader.readAsDataURL(file)
  }

  // ── 9. Export data ────────────────────────────────────────────────────────
  const exportData = () => {
    if (!user) return
    const data: Record<string, unknown> = { user }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('theclass_')) {
        try { data[k] = JSON.parse(localStorage.getItem(k) ?? 'null') }
        catch { data[k] = localStorage.getItem(k) }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theclass-data-${user.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Dati esportati')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] pt-28 px-6 flex flex-col items-center">
        <Helmet>
          <title>Profilo — the Class</title>
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-2">
            Il tuo profilo
          </h1>
          <p className="text-sm text-[#5A4F44] font-light mb-8">
            Accedi per vedere la tua cronologia e gestire i preferiti.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Nome</label>
              <input
                value={loginForm.name}
                onChange={e => setLoginForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Alessandro Bianchi"
                className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                placeholder="a@example.com"
                className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (!loginForm.name.trim() || !loginForm.email.trim()) {
                  toast.error('Inserisci nome ed email')
                  return
                }
                login(loginForm.email.trim(), loginForm.name.trim())
                toast.success('Benvenuto!')
              }}
              className="btn-ripple w-full bg-[#C5A059] text-white py-3 rounded-xl text-sm hover:bg-[#b8924a] transition-colors"
            >
              Accedi
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-16">
      <Helmet>
        <title>Profilo — the Class</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        {/* ── Header with avatar upload ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            {/* ── 1. Avatar upload ── */}
            <div className="relative group">
              <div
                className="w-16 h-16 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-[#C5A059]" />
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={11} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              {/* ── 7. Edit inline nome ── */}
              {editMode ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-white border border-[rgba(197,160,89,0.3)] rounded-lg px-3 py-1.5 text-lg font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    onClick={() => {
                      if (editName.trim()) {
                        const stored = localStorage.getItem('theclass_user')
                        if (stored) {
                          const u = JSON.parse(stored)
                          u.name = editName.trim()
                          localStorage.setItem('theclass_user', JSON.stringify(u))
                        }
                        toast.success('Nome aggiornato')
                      }
                      setEditMode(false)
                    }}
                    className="p-1.5 rounded-lg bg-[#C5A059] text-white"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
                    {user.name}
                  </h1>
                  <button onClick={() => { setEditName(user.name); setEditMode(true) }}
                    className="p-1 text-[#5A4F44] hover:text-[#C5A059] transition-colors">
                    <Edit3 size={13} />
                  </button>
                </div>
              )}

              {/* ── 7. Edit inline email ── */}
              {editingEmail ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="bg-white border border-[rgba(197,160,89,0.3)] rounded-lg px-2 py-1 text-xs text-[#5A4F44] focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    onClick={() => {
                      if (editEmail.trim()) {
                        const stored = localStorage.getItem('theclass_user')
                        if (stored) {
                          const u = JSON.parse(stored)
                          u.email = editEmail.trim()
                          localStorage.setItem('theclass_user', JSON.stringify(u))
                        }
                        toast.success('Email aggiornata')
                      }
                      setEditingEmail(false)
                    }}
                    className="p-1 rounded-lg bg-[#C5A059] text-white"
                  >
                    <Check size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-sm text-[#5A4F44] font-light">{user.email}</p>
                  <button onClick={() => { setEditEmail(user.email); setEditingEmail(true) }}
                    className="p-0.5 text-[#5A4F44]/50 hover:text-[#C5A059] transition-colors">
                    <Edit3 size={10} />
                  </button>
                </div>
              )}
              {user.role === 'admin' && (
                <span className="text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ── 10. Membership badge ── */}
            <MembershipBadge requestCount={conciergeRequests.length + myRequests.length} />

            {/* ── 2. Notification bell ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="relative p-2 rounded-full border border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:text-[#C5A059] transition-colors"
              >
                <Bell size={14} />
                {myRequests.filter(r => Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border border-white text-[7px] text-white flex items-center justify-center">
                    {myRequests.filter(r => Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000).length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white border border-[rgba(197,160,89,0.2)] rounded-2xl shadow-lg z-30 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[rgba(197,160,89,0.15)]">
                      <p className="text-xs font-medium text-[#1C1C1C]">Notifiche recenti</p>
                    </div>
                    {myRequests.slice(0, 3).length === 0 ? (
                      <p className="text-xs text-[#5A4F44] p-4 text-center font-light">Nessuna notifica</p>
                    ) : (
                      myRequests.slice(0, 3).map(r => (
                        <div key={r.id} className="px-4 py-3 border-b border-[rgba(197,160,89,0.08)] hover:bg-[rgba(197,160,89,0.04)] transition-colors">
                          <p className="text-xs font-medium text-[#1C1C1C] line-clamp-1">{r.listingTitle}</p>
                          <p className="text-[10px] text-[#5A4F44] mt-0.5">
                            {new Date(r.timestamp).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => { logout(); toast.success('Disconnesso') }}
              className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-[#1C1C1C] transition-colors"
            >
              <LogOut size={13} /> Esci
            </button>
          </div>
        </motion.div>

        {/* ── 2. Dashboard KPI cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <KpiCard icon={FileText} label="Prenotazioni" value={myRequests.length} />
          <KpiCard icon={Heart} label="Preferiti" value={favCount} />
          <KpiCard icon={Star} label="Richieste concierge" value={conciergeRequests.length} />
          <KpiCard
            icon={User}
            label="Profilo completato"
            value={`${profileScore()}%`}
            color={profileScore() === 100 ? '#10b981' : '#C5A059'}
          />
        </div>

        {/* ── 3 & 4. Tab: Le mie richieste / Scadenze ── */}
        <div className="mb-10">
          <div className="flex gap-1 bg-[rgba(197,160,89,0.07)] rounded-xl p-1 mb-5">
            {(['richieste', 'scadenze'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-white text-[#1C1C1C] shadow-sm'
                    : 'text-[#5A4F44] hover:text-[#1C1C1C]',
                )}
              >
                {tab === 'richieste' ? 'Le mie richieste' : 'Scadenze Factotum'}
              </button>
            ))}
          </div>

          {activeTab === 'richieste' && (
            <div className="space-y-3">
              {conciergeRequests.length === 0 ? (
                <p className="text-sm text-[#5A4F44] font-light italic text-center py-8">
                  Nessuna richiesta concierge ancora.
                </p>
              ) : (
                conciergeRequests.slice(0, 8).map(req => {
                  const statusMap = {
                    pending: { label: 'In attesa', color: '#f59e0b' },
                    in_progress: { label: 'In corso', color: '#3b82f6' },
                    completed: { label: 'Completata', color: '#10b981' },
                  }
                  const s = statusMap[req.status ?? 'pending']
                  return (
                    <div key={req.id} className="bg-white border border-[rgba(197,160,89,0.15)] rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1C1C1C]">{req.title}</p>
                        <p className="text-[10px] text-[#5A4F44] mt-0.5">
                          {new Date(req.timestamp).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ color: s.color, background: `${s.color}15` }}>
                        {s.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'scadenze' && (
            <div className="space-y-3">
              {factotumDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#5A4F44] font-light italic mb-3">Nessuna scadenza fiscale salvata.</p>
                  <p className="text-xs text-[#5A4F44]/60">Le scadenze verranno aggiunte dal Factotum.</p>
                </div>
              ) : (
                factotumDeadlines.slice(0, 3).map(d => (
                  <div key={d.id} className="bg-white border border-[rgba(197,160,89,0.15)] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(197,160,89,0.1)] flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-[#C5A059]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1C]">{d.title}</p>
                      <p className="text-[10px] text-[#5A4F44]">{d.category}</p>
                    </div>
                    <p className="text-xs font-[family-name:var(--font-family-mono)] text-[#C5A059] shrink-0">{d.dueDate}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── 6. Recent activity quick-view (horizontal) ── */}
        {myRequests.slice(0, 3).length > 0 && (
          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-3">Attività recente</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {myRequests.slice(0, 3).map(r => (
                <div
                  key={r.id}
                  className="shrink-0 min-w-[180px] bg-white rounded-xl border border-[rgba(197,160,89,0.15)] p-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mb-2">
                    <FileText size={10} className="text-[#C5A059]" />
                  </div>
                  <p className="text-xs font-medium text-[#1C1C1C] line-clamp-2 leading-tight">{r.listingTitle}</p>
                  <p className="text-[10px] text-[#5A4F44] mt-1">
                    {new Date(r.timestamp).toLocaleDateString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. Preferenze viaggio ── */}
        <TravelPreferences userId={user.id} />

        {/* ── 6. Quiz profile ── */}
        {quizProfile && (
          <div className="mb-10 p-6 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C]">
                Il tuo profilo quiz
              </h2>
              <Link to="/quiz" className="text-xs text-[#C5A059] flex items-center gap-1 hover:underline">
                <RefreshCw size={10} /> Rifai il quiz
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center text-lg">
                ✨
              </div>
              <div>
                <p className="text-sm font-medium text-[#1C1C1C]">{quizProfile.label}</p>
                <p className="text-xs text-[#5A4F44] font-light">{quizProfile.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Loyalty Club ── */}
        <div className="mb-10">
          <h2 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-4">
            The Class Club
          </h2>
          <LoyaltyBadge email={user.email} />
        </div>

        {/* ── QR Concierge ── */}
        <div className="mt-6 mb-10 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)] text-center">
          <p className="text-xs text-[#5A4F44] mb-3 uppercase tracking-wider">Il tuo QR Concierge</p>
          <div className="inline-block p-3 bg-white rounded-xl border border-[rgba(197,160,89,0.2)] shadow-sm">
            <QRCodeSVG value={`theclass:user:${user.id}`} size={96} fgColor="#1C1C1C" bgColor="#FFFFFF" level="M" />
          </div>
          <p className="text-[10px] text-[#5A4F44] mt-2 font-light">Mostra al concierge per essere riconosciuto</p>
        </div>

        {/* ── Daily Missions ── */}
        {(() => {
          const today = new Date().toDateString()
          const completed = safeRead<Record<string, boolean>>('theclass_missions_' + today, {})
          const missions = [
            { id: 'view3', label: 'Esplora 3 servizi', points: 30, done: completed.view3 },
            { id: 'save1', label: 'Salva un preferito', points: 50, done: completed.save1 },
            { id: 'read1', label: 'Leggi un articolo', points: 20, done: completed.read1 },
          ]
          return (
            <div className="mt-6 mb-6 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Missioni di Oggi</p>
              <div className="space-y-2">
                {missions.map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${m.done ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.3)]'}`}>
                        {m.done && <span className="text-white text-[8px]">✓</span>}
                      </div>
                      <span className={`text-xs ${m.done ? 'text-[#5A4F44] line-through' : 'text-[#1C1C1C]'}`}>{m.label}</span>
                    </div>
                    <span className="text-[10px] text-[#C5A059] font-[family-name:var(--font-family-mono)]">+{m.points}pt</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── Ambassador Program ── */}
        <div className="mb-10 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
          <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-2">Programma Ambassador</p>
          <p className="text-xs text-[#5A4F44] font-light mb-3">
            Invita un amico e guadagna €100 di crediti per ogni prenotazione completata.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`https://the-class-luxury.pages.dev?ref=${btoa(user.id).slice(0, 8)}`}
              className="flex-1 bg-white border border-[rgba(197,160,89,0.2)] rounded-lg px-3 py-2 text-[10px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] truncate"
            />
            <button
              onClick={() => {
                void navigator.clipboard.writeText(`https://the-class-luxury.pages.dev?ref=${btoa(user.id).slice(0, 8)}`)
                toast.success('Link copiato!')
              }}
              className="px-3 py-2 rounded-lg bg-[#C5A059] text-white text-[10px] font-medium hover:bg-[#b8924a] transition-colors shrink-0"
            >
              Copia
            </button>
          </div>
        </div>

        {/* ── 5. Referral tracker ── */}
        <div className="mb-10 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
          <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-2">I tuoi referral</p>
          <p className="text-sm text-[#1C1C1C] mb-1">0 amici invitati · €0 crediti maturati</p>
          <div className="w-full h-2 bg-[rgba(197,160,89,0.1)] rounded-full overflow-hidden mb-1">
            <div className="h-full w-0 bg-[#C5A059] rounded-full" />
          </div>
          <p className="text-[10px] text-[#5A4F44]">€0 / €100 per il prossimo reward</p>
        </div>

        {/* ── 4. Lifetime value ── */}
        {(() => {
          const allReqs = safeRead<Array<{ timestamp: number }>>('theclass_requests', [])
          const lifetime = allReqs.length * 5000
          if (lifetime === 0) return null
          return (
            <div className="mb-10 p-5 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-2xl text-center">
              <p className="text-[10px] uppercase tracking-wider text-[#5A4F44] mb-1">Le tue esperienze totali</p>
              <p className="font-[family-name:var(--font-family-display)] text-3xl text-[#C5A059] font-medium">
                €{lifetime.toLocaleString('it-IT')}
              </p>
              <p className="text-[10px] text-[#5A4F44] mt-1">in esperienze richieste</p>
            </div>
          )
        })()}

        {/* ── 9. This month summary ── */}
        {(() => {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
          const allReqs = safeRead<Array<{ timestamp: number }>>('theclass_requests', [])
          const monthReqs = allReqs.filter(r => r.timestamp >= monthStart).length
          const bookmarks = safeRead<string[]>(`theclass_favorites_${user.id}`, []).length
          return (
            <div className="mb-10 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Questo mese hai fatto</p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-[family-name:var(--font-family-mono)] text-2xl font-medium text-[#C5A059]">{monthReqs}</p>
                  <p className="text-[10px] text-[#5A4F44]">richieste</p>
                </div>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-family-mono)] text-2xl font-medium text-[#C5A059]">{bookmarks}</p>
                  <p className="text-[10px] text-[#5A4F44]">bookmark</p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Activity timeline ── */}
        {(() => {
          const items: Array<{ type: string; label: string; ts: number }> = []
          const allRequests = safeRead<Array<{ listingTitle: string; timestamp: number }>>('theclass_requests', [])
          allRequests.forEach(r => items.push({ type: 'request', label: `Richiesta: ${r.listingTitle}`, ts: r.timestamp }))
          const reviews = safeRead<Array<{ timestamp: number }>>('theclass_reviews', [])
          reviews.forEach(r => items.push({ type: 'review', label: 'Recensione per servizio', ts: r.timestamp }))
          const timeline = items.sort((a, b) => b.ts - a.ts).slice(0, 10)
          if (timeline.length === 0) return null
          return (
            <div className="mb-10">
              <h2 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-4">
                Cronologia attività
              </h2>
              <div className="relative pl-6 border-l-2 border-[rgba(197,160,89,0.2)] space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      'absolute -left-[1.375rem] w-3.5 h-3.5 rounded-full border-2 border-white',
                      item.type === 'request' ? 'bg-[#C5A059]' : 'bg-blue-400',
                    )} />
                    <p className="text-sm text-[#1C1C1C] font-light">{item.label}</p>
                    <p className="text-[10px] text-[#5A4F44] mt-0.5">
                      {new Date(item.ts).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* ── 7. Birthday ── */}
        <div className="mb-10 p-5 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
          <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Data di nascita (opzionale)</p>
          {isBirthmonth && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
              Buon compleanno! 🎂 Hai diritto a un upgrade gratuito — contatta il concierge
            </div>
          )}
          <input
            type="date"
            value={birthday}
            onChange={e => {
              setBirthday(e.target.value)
              safeWrite('theclass_birthday', e.target.value)
            }}
            className="bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-3 py-2 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </div>

        {/* ── 8. Privacy settings ── */}
        <div className="mb-10 p-6 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.15)]">
          <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
            Privacy & Notifiche
          </h2>
          <div className="space-y-4">
            {([
              { label: 'Notifiche email', sublabel: 'Ricevi aggiornamenti sulle tue richieste', value: emailNotif, onChange: (v: boolean) => { setEmailNotif(v); safeWrite('theclass_notif_email', v) }, icon: (v: boolean) => v ? Bell : BellOff },
              { label: 'Newsletter', sublabel: 'Offerte esclusive e novità The Class', value: newsletter, onChange: (v: boolean) => { setNewsletter(v); safeWrite('theclass_notif_newsletter', v) }, icon: (v: boolean) => v ? Bell : BellOff },
            ] as const).map(({ label, sublabel, value, onChange, icon }) => {
              const Icon = icon(value)
              return (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={15} className="text-[#C5A059]" />
                    <div>
                      <p className="text-sm text-[#1C1C1C]">{label}</p>
                      <p className="text-[10px] text-[#5A4F44]">{sublabel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onChange(!value)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative',
                      value ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.2)]',
                    )}
                  >
                    <span className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      value ? 'translate-x-5' : 'translate-x-1',
                    )} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 9. Export data ── */}
        <div className="mb-10 flex justify-center">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
          >
            <Download size={14} /> Esporta i miei dati (JSON)
          </button>
        </div>

        {/* ── Booking history ── */}
        <div>
          <h2 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C] mb-4">
            Storico Richieste
          </h2>
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#5A4F44] font-light italic">
              Nessuna richiesta ancora. Esplora i nostri servizi.
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-[rgba(197,160,89,0.15)] p-5 flex items-start justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1C1C1C] mb-1">{r.listingTitle}</p>
                    {r.dates?.from && (
                      <p className="text-xs text-[#5A4F44] font-light">
                        {new Date(r.dates.from).toLocaleDateString('it-IT')}
                        {r.dates.to ? ` — ${new Date(r.dates.to).toLocaleDateString('it-IT')}` : ''}
                      </p>
                    )}
                    {r.upgrades && r.upgrades.length > 0 && (
                      <p className="text-[11px] text-[#C5A059] mt-1">{r.upgrades.length} upgrade selezionati</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44]">
                      #{r.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-[#5A4F44] mt-1">
                      {new Date(r.timestamp).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
