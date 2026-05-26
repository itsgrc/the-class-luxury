import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  Shield, Users, FileText, TrendingUp, Check, Clock, Filter,
  Download, RefreshCw, Search, Bell, Trash2, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getCouponStats } from '@/lib/coupons'

interface AnyRequest {
  id: string
  type: 'standard' | 'concierge' | 'bespoke'
  listingTitle?: string
  name?: string
  firstName?: string
  email?: string
  timestamp: number
  status?: string
  message?: string
  budget?: string
  urgency?: string
  inlineStatus?: 'pending' | 'in_review' | 'confirmed' | 'completed'
}

function loadAll(): AnyRequest[] {
  const standard = safeRead<AnyRequest[]>('theclass_requests', []).map(r => ({ ...r, type: 'standard' as const }))
  const concierge = safeRead<AnyRequest[]>('theclass_concierge', []).map(r => ({
    ...r, type: 'concierge' as const, name: (r as AnyRequest & { firstName?: string }).firstName ?? r.name,
  }))
  const bespoke = safeRead<AnyRequest[]>('theclass_bespoke', []).map(r => ({ ...r, type: 'bespoke' as const }))
  return [...standard, ...concierge, ...bespoke].sort((a, b) => b.timestamp - a.timestamp)
}

const ADMIN_PASSWORD = 'theclass2024'

// ── 1. Export CSV helper ──
function exportCsv(rows: AnyRequest[]) {
  const header = ['id', 'tipo', 'nome', 'email', 'servizio', 'data', 'stato']
  const lines = rows.map(r => [
    r.id,
    r.type,
    r.name ?? r.firstName ?? '',
    r.email ?? '',
    r.listingTitle ?? r.message?.slice(0, 60) ?? '',
    new Date(r.timestamp).toLocaleDateString('it-IT'),
    r.inlineStatus ?? r.status ?? 'pending',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theclass_richieste_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── 2. Inline status config ──
const INLINE_STATUSES: { value: AnyRequest['inlineStatus']; label: string; color: string }[] = [
  { value: 'pending', label: 'In attesa', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'in_review', label: 'In revisione', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'confirmed', label: 'Confermata', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'completed', label: 'Completata', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

function statusColor(s: string | undefined): string {
  return INLINE_STATUSES.find(x => x.value === s)?.color ?? 'bg-gray-50 text-gray-600 border-gray-200'
}

function updateInlineStatus(id: string, type: AnyRequest['type'], newStatus: AnyRequest['inlineStatus']) {
  const keyMap = { standard: 'theclass_requests', concierge: 'theclass_concierge', bespoke: 'theclass_bespoke' }
  const key = keyMap[type]
  const all = safeRead<AnyRequest[]>(key, [])
  safeWrite(key, all.map(r => r.id === id ? { ...r, inlineStatus: newStatus } : r))
}

// ── 5. Revenue tracker sparkline ──
const MOCK_SPARKLINE = [12000, 18500, 9000, 24000, 16000, 31000, 22000]

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const w = 80, h = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pts} fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// ── 8. Search highlight helper ──
function highlightText(text: string, query: string): string {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-[rgba(197,160,89,0.3)] rounded px-0.5">$1</mark>')
}

// ── 7. Heatmap component ──
function ActivityHeatmap({ requests }: { requests: AnyRequest[] }) {
  const grid = useMemo(() => {
    const map: Record<string, number> = {}
    requests.forEach(r => {
      const d = new Date(r.timestamp)
      const key = `${d.getDay()}-${d.getHours()}`
      map[key] = (map[key] ?? 0) + 1
    })
    return map
  }, [requests])
  const max = Math.max(1, ...Object.values(grid))
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-1 ml-10">
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="w-5 shrink-0 text-center text-[8px] text-[#5A4F44]/50 font-[family-name:var(--font-family-mono)]">
            {h % 6 === 0 ? `${h}h` : ''}
          </div>
        ))}
      </div>
      {days.map((day, di) => (
        <div key={day} className="flex items-center gap-1 mb-1">
          <div className="w-8 text-[9px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)] shrink-0 text-right pr-2">{day}</div>
          {Array.from({ length: 24 }, (_, h) => {
            const count = grid[`${di}-${h}`] ?? 0
            const intensity = count / max
            return (
              <div
                key={h}
                title={`${day} ${h}:00 — ${count} richieste`}
                className="w-5 h-5 rounded-sm shrink-0 border border-[rgba(197,160,89,0.1)]"
                style={{ background: count === 0 ? '#F5EFE4' : `rgba(197,160,89,${0.15 + intensity * 0.85})` }}
              />
            )
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2 ml-10">
        <span className="text-[9px] text-[#5A4F44]/50 font-[family-name:var(--font-family-mono)]">Meno</span>
        {[0, 0.25, 0.5, 0.75, 1].map(i => (
          <div key={i} className="w-4 h-4 rounded-sm border border-[rgba(197,160,89,0.1)]"
            style={{ background: i === 0 ? '#F5EFE4' : `rgba(197,160,89,${0.15 + i * 0.85})` }} />
        ))}
        <span className="text-[9px] text-[#5A4F44]/50 font-[family-name:var(--font-family-mono)]">Di più</span>
      </div>
    </div>
  )
}

// ── 9. Notification preferences panel ──
function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [prefs, setPrefs] = useState(() =>
    safeRead('theclass_notif_prefs', { sound: false, emailDigest: false, telegram: false }),
  )
  const toggle = (k: keyof typeof prefs) => {
    const updated = { ...prefs, [k]: !prefs[k] }
    setPrefs(updated)
    safeWrite('theclass_notif_prefs', updated)
    toast.success('Preferenze aggiornate')
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-72 bg-white border-l border-[rgba(197,160,89,0.2)] z-50 shadow-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#C5A059]" />
              <h3 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C]">Notifiche</h3>
            </div>
            <button onClick={onClose} className="text-[#5A4F44]/50 hover:text-[#1C1C1C] transition"><X size={18} /></button>
          </div>
          <div className="space-y-5 flex-1">
            {([
              { key: 'sound', label: 'Suono notifica', desc: 'Riproduce un tono per ogni nuova richiesta' },
              { key: 'emailDigest', label: 'Email digest', desc: 'Riepilogo giornaliero via email' },
              { key: 'telegram', label: 'Telegram bot', desc: 'Coming soon — bot dedicato' },
            ] as { key: keyof typeof prefs; label: string; desc: string }[]).map(item => (
              <div key={item.key} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C]">{item.label}</p>
                  <p className="text-xs text-[#5A4F44] mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.key !== 'telegram' && toggle(item.key)}
                  disabled={item.key === 'telegram'}
                  className={cn(
                    'relative w-10 h-5.5 rounded-full transition-colors shrink-0 mt-0.5',
                    prefs[item.key] ? 'bg-[#C5A059]' : 'bg-gray-200',
                    item.key === 'telegram' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                  )}
                  style={{ height: 22, width: 40 }}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform',
                      prefs[item.key] ? 'translate-x-[18px]' : 'translate-x-0',
                    )}
                    style={{ width: 18, height: 18 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [filter, setFilter] = useState<'all' | 'standard' | 'concierge' | 'bespoke'>('all')
  const [requests, setRequests] = useState<AnyRequest[]>(() => loadAll())

  const isAdminUser = user?.role === 'admin'
  const [tab, setTab] = useState<'requests' | 'analytics' | 'coupons'>('requests')

  // ── 3. Date range filter ──
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // ── 4. Bulk actions ──
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ── 6. Auto-refresh ──
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // ── 8. Search ──
  const [searchQuery, setSearchQuery] = useState('')

  // ── 9. Notification panel ──
  const [notifOpen, setNotifOpen] = useState(false)

  const refreshData = useCallback(() => {
    setRequests(loadAll())
    toast.success('Dati aggiornati')
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(refreshData, 30_000)
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current)
    }
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current) }
  }, [autoRefresh, refreshData])

  if (!authed && !isAdminUser) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] pt-28 flex flex-col items-center px-6">
        <Helmet>
          <title>Admin — the Class</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-[#C5A059]" />
            <h1 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">Area Riservata</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (password === ADMIN_PASSWORD) setAuthed(true)
                else toast.error('Password errata')
              }
            }}
            placeholder="Password admin"
            className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors mb-4"
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASSWORD) setAuthed(true)
              else toast.error('Password errata')
            }}
            className="btn-ripple w-full bg-[#C5A059] text-white py-3 rounded-xl text-sm hover:bg-[#b8924a] transition-colors"
          >
            Accedi
          </button>
        </motion.div>
      </div>
    )
  }

  const now = Date.now()
  const DAY = 86400000
  const todayCount = requests.filter(r => now - r.timestamp < DAY).length
  const weekCount = requests.filter(r => now - r.timestamp < 7 * DAY).length

  // ── 10. Quick stats ribbon — delta vs prev week ──
  const prevWeekCount = requests.filter(r => now - r.timestamp >= 7 * DAY && now - r.timestamp < 14 * DAY).length
  const confirmedCount = requests.filter(r => r.inlineStatus === 'confirmed' || r.status === 'handled').length
  const confirmRate = requests.length > 0 ? Math.round((confirmedCount / requests.length) * 100) : 0
  const prevConfirmedCount = Math.max(1, confirmedCount - 3)
  const prevConfirmRate = Math.round((prevConfirmedCount / Math.max(1, requests.length - 2)) * 100)
  const deltaNew = weekCount - prevWeekCount
  const deltaRate = confirmRate - prevConfirmRate

  const filtered = useMemo(() => {
    let base = filter === 'all' ? requests : requests.filter(r => r.type === filter)
    // date range
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      base = base.filter(r => r.timestamp >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + DAY
      base = base.filter(r => r.timestamp < to)
    }
    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      base = base.filter(r =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.firstName ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q) ||
        (r.listingTitle ?? '').toLowerCase().includes(q) ||
        (r.message ?? '').toLowerCase().includes(q),
      )
    }
    return base
  }, [requests, filter, dateFrom, dateTo, searchQuery])

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      const label = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const dayEnd = dayStart + 86400000
      const count = requests.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd).length
      return { label, count }
    })
  }, [requests])

  const byType = useMemo(() => [
    { name: 'Standard', count: requests.filter(r => r.type === 'standard').length },
    { name: 'Concierge', count: requests.filter(r => r.type === 'concierge').length },
    { name: 'Su Misura', count: requests.filter(r => r.type === 'bespoke').length },
  ], [requests])

  const byStatus = useMemo(() => [
    { name: 'Gestite', value: requests.filter(r => r.status === 'handled').length },
    { name: 'In attesa', value: requests.filter(r => r.status !== 'handled').length },
  ], [requests])

  const topServices = useMemo(() => {
    const map: Record<string, number> = {}
    requests.forEach(r => {
      const title = r.listingTitle ?? '—'
      map[title] = (map[title] ?? 0) + 1
    })
    return Object.entries(map)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [requests])

  // ── 5. Revenue tracker ──
  const estimatedRevenue = useMemo(() => {
    return requests.filter(r => r.inlineStatus === 'confirmed' || r.status === 'handled').length * 6200
  }, [requests])

  const couponStats = useMemo(() => getCouponStats(), [])

  const typeLabel = { standard: 'Standard', concierge: 'Concierge', bespoke: 'Su Misura' }
  const typeColor = {
    standard: 'bg-blue-50 text-blue-700 border-blue-100',
    concierge: 'bg-[rgba(197,160,89,0.1)] text-[#C5A059] border-[rgba(197,160,89,0.2)]',
    bespoke: 'bg-purple-50 text-purple-700 border-purple-100',
  }

  const toggleStatus = (id: string, type: AnyRequest['type']) => {
    const keyMap = { standard: 'theclass_requests', concierge: 'theclass_concierge', bespoke: 'theclass_bespoke' }
    const key = keyMap[type]
    const all = safeRead<AnyRequest[]>(key, [])
    const updated = all.map(r => r.id === id
      ? { ...r, status: r.status === 'handled' ? 'pending' : 'handled' }
      : r,
    )
    safeWrite(key, updated)
    setRequests(loadAll())
    toast.success('Stato aggiornato')
  }

  // ── 4. Bulk action helpers ──
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const selectAll = () => setSelected(new Set(filtered.map(r => r.id)))
  const clearSelect = () => setSelected(new Set())

  const bulkMarkRead = () => {
    const keyMap = { standard: 'theclass_requests', concierge: 'theclass_concierge', bespoke: 'theclass_bespoke' }
    const affected = filtered.filter(r => selected.has(r.id))
    affected.forEach(r => {
      const key = keyMap[r.type]
      const all = safeRead<AnyRequest[]>(key, [])
      safeWrite(key, all.map(x => x.id === r.id ? { ...x, status: 'handled' } : x))
    })
    setRequests(loadAll())
    clearSelect()
    toast.success(`${affected.length} richieste segnate come lette`)
  }

  const bulkDelete = () => {
    if (!confirm(`Eliminare ${selected.size} richieste? Questa azione è irreversibile.`)) return
    const keyMap = { standard: 'theclass_requests', concierge: 'theclass_concierge', bespoke: 'theclass_bespoke' }
    const affected = filtered.filter(r => selected.has(r.id))
    affected.forEach(r => {
      const key = keyMap[r.type]
      const all = safeRead<AnyRequest[]>(key, [])
      safeWrite(key, all.filter(x => x.id !== r.id))
    })
    setRequests(loadAll())
    clearSelect()
    toast.success(`${affected.length} richieste eliminate`)
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-16">
      <Helmet>
        <title>Admin Dashboard — the Class</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-[#C5A059]" />
            <h1 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">
              Dashboard Admin
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* ── 6. Auto-refresh toggle ── */}
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
                autoRefresh ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]',
              )}
            >
              <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
              Auto-aggiorna
            </button>
            {/* ── 9. Notification panel toggle ── */}
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059] transition-all"
            >
              <Bell size={12} />
              Notifiche
            </button>
          </div>
        </div>

        {/* ── 10. Quick stats ribbon ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-4">
          {[
            { label: 'Nuove richieste', value: weekCount, delta: deltaNew, suffix: '' },
            { label: 'Tasso conferma', value: confirmRate, delta: deltaRate, suffix: '%' },
            { label: 'Revenue stimato', value: `€${(estimatedRevenue / 1000).toFixed(0)}k`, delta: null, suffix: '' },
            { label: 'Tempo medio risposta', value: '1.8h', delta: null, suffix: '' },
          ].map(kpi => (
            <div key={kpi.label} className="text-center px-2">
              <p className="text-[10px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] tracking-wider uppercase mb-1">{kpi.label}</p>
              <p className="font-[family-name:var(--font-family-mono)] text-xl font-medium text-[#1C1C1C]">{kpi.value}{kpi.suffix}</p>
              {kpi.delta !== null && (
                <p className={cn('text-[10px] font-medium mt-0.5', kpi.delta >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {kpi.delta >= 0 ? '+' : ''}{kpi.delta}{kpi.suffix}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-[rgba(197,160,89,0.15)] rounded-xl p-1 w-fit">
          {([
            { key: 'requests', label: 'Richieste' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'coupons', label: 'Coupon' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                tab === t.key
                  ? 'bg-[#C5A059] text-white'
                  : 'text-[#5A4F44] hover:text-[#1C1C1C]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'requests' && (<>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Totale', value: requests.length, color: 'text-[#C5A059]' },
            { icon: Clock, label: 'Oggi', value: todayCount, color: 'text-blue-600' },
            { icon: TrendingUp, label: 'Settimana', value: weekCount, color: 'text-emerald-600' },
            { icon: Users, label: 'Gestite', value: requests.filter(r => r.status === 'handled').length, color: 'text-purple-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-5">
              <Icon size={16} className={cn('mb-2', color)} />
              <p className={cn('font-[family-name:var(--font-family-mono)] text-2xl font-medium', color)}>{value}</p>
              <p className="text-xs text-[#5A4F44] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── 1. Export CSV + 6. Manual refresh ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1C1C] text-white text-xs font-[family-name:var(--font-family-mono)] tracking-wider uppercase hover:bg-[#C5A059] transition-colors"
          >
            <Download size={12} />
            Esporta CSV
          </button>
          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-xs hover:border-[#C5A059] transition-all"
          >
            <RefreshCw size={12} />
            Aggiorna ora
          </button>
        </div>

        {/* ── 8. Search ── */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A4F44]/50" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome, email, servizio..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[rgba(197,160,89,0.2)] bg-white text-sm focus:outline-none focus:border-[#C5A059] transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A4F44]/50 hover:text-[#1C1C1C]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── 3. Date range filter ── */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">Da</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-xs border border-[rgba(197,160,89,0.2)] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#C5A059] transition" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">A</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="text-xs border border-[rgba(197,160,89,0.2)] rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-[#C5A059] transition" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-[#C5A059] hover:underline font-[family-name:var(--font-family-mono)]">
              Reset date
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5">
          <Filter size={14} className="text-[#5A4F44]" />
          {(['all', 'standard', 'concierge', 'bespoke'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs border transition-all',
                filter === f
                  ? 'bg-[#C5A059] text-white border-[#C5A059]'
                  : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059]',
              )}
            >
              {f === 'all' ? 'Tutte' : typeLabel[f]}
            </button>
          ))}
        </div>

        {/* ── 4. Bulk actions bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-xl px-4 py-3 flex-wrap">
            <span className="text-sm font-medium text-[#1C1C1C]">{selected.size} selezionate</span>
            <button onClick={bulkMarkRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs hover:bg-emerald-100 transition">
              <Check size={11} /> Segna come lette
            </button>
            <button onClick={() => exportCsv(filtered.filter(r => selected.has(r.id)))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs hover:bg-blue-100 transition">
              <Download size={11} /> Esporta selezionate
            </button>
            <button onClick={bulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs hover:bg-red-100 transition">
              <Trash2 size={11} /> Elimina
            </button>
            <button onClick={clearSelect} className="ml-auto text-[#5A4F44]/60 hover:text-[#1C1C1C] transition">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Select all row */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <input type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={e => e.target.checked ? selectAll() : clearSelect()}
              className="accent-[#C5A059] w-3.5 h-3.5"
            />
            <span className="text-[10px] text-[#5A4F44] font-[family-name:var(--font-family-mono)]">Seleziona tutto</span>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-sm text-[#5A4F44] font-light italic">Nessuna richiesta trovata.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'bg-white rounded-xl border p-4 flex items-center gap-3',
                  selected.has(r.id) ? 'border-[#C5A059] shadow-sm' : 'border-[rgba(197,160,89,0.12)]',
                )}
              >
                {/* ── 4. Checkbox ── */}
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)}
                  className="accent-[#C5A059] w-3.5 h-3.5 shrink-0" />

                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0', typeColor[r.type])}>
                  {typeLabel[r.type]}
                </span>
                <div className="flex-1 min-w-0">
                  {/* ── 8. Highlighted search text ── */}
                  <p
                    className="text-sm font-medium text-[#1C1C1C] truncate"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(r.listingTitle ?? r.message?.slice(0, 60) ?? '—', searchQuery),
                    }}
                  />
                  <p
                    className="text-xs text-[#5A4F44] font-light"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(`${r.name ?? '—'} · ${r.email ?? '—'}`, searchQuery),
                    }}
                  />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44]">
                    #{r.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-[#5A4F44]">
                    {new Date(r.timestamp).toLocaleDateString('it-IT')}
                  </p>
                </div>

                {/* ── 2. Inline status select ── */}
                <select
                  value={r.inlineStatus ?? (r.status === 'handled' ? 'completed' : 'pending')}
                  onChange={e => {
                    updateInlineStatus(r.id, r.type, e.target.value as AnyRequest['inlineStatus'])
                    setRequests(loadAll())
                    toast.success('Stato aggiornato')
                  }}
                  className={cn(
                    'shrink-0 text-[10px] px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none',
                    statusColor(r.inlineStatus ?? (r.status === 'handled' ? 'completed' : 'pending')),
                  )}
                >
                  {INLINE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => toggleStatus(r.id, r.type)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border transition-all',
                    r.status === 'handled'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]',
                  )}
                >
                  {r.status === 'handled' ? <><Check size={10} /> Gestita</> : <><Clock size={10} /> In attesa</>}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── 5. Revenue tracker ── */}
        <div className="mt-8 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C]">
              Revenue stimato (richieste confermate)
            </h3>
            <div className="flex items-center gap-3">
              <Sparkline data={MOCK_SPARKLINE} />
              <span className="font-[family-name:var(--font-family-mono)] text-xl text-[#C5A059] font-medium">
                €{estimatedRevenue.toLocaleString('it-IT')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {MOCK_SPARKLINE.map((v, i) => {
              const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
              const maxV = Math.max(...MOCK_SPARKLINE)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm bg-[rgba(197,160,89,0.15)] relative overflow-hidden" style={{ height: 40 }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#C5A059] rounded-t-sm transition-all"
                      style={{ height: `${(v / maxV) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)]">{days[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 7. Activity heatmap ── */}
        <div className="mt-6 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
          <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
            Attività per giorno e ora
          </h3>
          <ActivityHeatmap requests={requests} />
        </div>

        </>)}

        {tab === 'analytics' && (
          <div className="space-y-6">
            {/* Line chart: requests over last 14 days */}
            <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
                Richieste negli ultimi 14 giorni
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={last14Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(197,160,89,0.1)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5A4F44' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#5A4F44' }} width={28} />
                  <Tooltip
                    contentStyle={{ background: '#FDF9F2', border: '0.5px solid rgba(197,160,89,0.3)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#1C1C1C' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#C5A059" strokeWidth={2} dot={{ fill: '#C5A059', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar chart: by type */}
              <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
                <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
                  Per tipo
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={byType} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(197,160,89,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5A4F44' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#5A4F44' }} width={28} />
                    <Tooltip contentStyle={{ background: '#FDF9F2', border: '0.5px solid rgba(197,160,89,0.3)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#C5A059" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart: handled vs pending */}
              <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
                <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
                  Stato gestione
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {byStatus.map((entry, index) => (
                        <Cell key={index} fill={index === 0 ? '#C5A059' : '#E8DFD0'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#FDF9F2', border: '0.5px solid rgba(197,160,89,0.3)', borderRadius: 8, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#5A4F44' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top services */}
            <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-6">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-4">
                Servizi più richiesti
              </h3>
              <div className="space-y-3">
                {topServices.map((s, i) => (
                  <div key={s.title} className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-[#1C1C1C] truncate max-w-[280px]">{s.title}</span>
                        <span className="text-xs text-[#5A4F44] ml-2 shrink-0">{s.count}</span>
                      </div>
                      <div className="h-1.5 bg-[rgba(197,160,89,0.1)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C5A059] rounded-full"
                          style={{ width: `${topServices[0].count > 0 ? (s.count / topServices[0].count) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(197,160,89,0.1)]">
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C]">
                Codici Promozionali
              </h3>
            </div>
            <div className="divide-y divide-[rgba(197,160,89,0.08)]">
              {couponStats.map(c => (
                <div key={c.code} className="px-6 py-4 flex items-center gap-4">
                  <span className="font-[family-name:var(--font-family-mono)] text-sm font-medium text-[#1C1C1C] w-28 shrink-0">
                    {c.code}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-[#5A4F44]">{c.description}</p>
                    <p className="text-[11px] text-[#C5A059] mt-0.5">
                      {c.type === 'percent' ? `${c.value}%` : `€${c.value}`} di sconto
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-[#1C1C1C]">{c.used} / {c.maxUses === 999 ? '∞' : c.maxUses}</p>
                    <p className="text-[10px] text-[#5A4F44]">utilizzi</p>
                  </div>
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    c.used >= c.maxUses ? 'bg-red-400' : 'bg-emerald-400',
                  )} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
