import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Users, FileText, TrendingUp, Check, Clock, Filter } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { safeRead, safeWrite } from '@/lib/errorHandler'
import { formatPrice, cn } from '@/lib/utils'
import { toast } from 'sonner'

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
      </div>
    </div>
  )
}
