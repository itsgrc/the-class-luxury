import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Users, FileText, TrendingUp, Check, Clock, Filter } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { formatPrice, cn } from '@/lib/utils'
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

export function AdminPage() {
  const { user } = useAuth()
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [filter, setFilter] = useState<'all' | 'standard' | 'concierge' | 'bespoke'>('all')
  const [requests, setRequests] = useState<AnyRequest[]>(() => loadAll())

  const isAdminUser = user?.role === 'admin'
  const [tab, setTab] = useState<'requests' | 'analytics' | 'coupons'>('requests')

  if (!authed && !isAdminUser) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] pt-28 flex flex-col items-center px-6">
        <Helmet>
          <title>Admin — the Class</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield size={20} className="text-[#C5A059]" />
            <h1 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
              Area Riservata
            </h1>
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

  const filtered = useMemo(
    () => filter === 'all' ? requests : requests.filter(r => r.type === filter),
    [requests, filter],
  )

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

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-16">
      <Helmet>
        <title>Admin Dashboard — the Class</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield size={22} className="text-[#C5A059]" />
          <h1 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">
            Dashboard Admin
          </h1>
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
                className="bg-white rounded-xl border border-[rgba(197,160,89,0.12)] p-4 flex items-center gap-4"
              >
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0', typeColor[r.type])}>
                  {typeLabel[r.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1C] truncate">
                    {r.listingTitle ?? r.message?.slice(0, 60) ?? '—'}
                  </p>
                  <p className="text-xs text-[#5A4F44] font-light">
                    {r.name ?? '—'} · {r.email ?? '—'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44]">
                    #{r.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-[#5A4F44]">
                    {new Date(r.timestamp).toLocaleDateString('it-IT')}
                  </p>
                </div>
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
