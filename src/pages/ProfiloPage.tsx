import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { User, Heart, FileText, LogOut, Edit3, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { safeRead } from '@/lib/errorHandler'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StoredRequest {
  id: string
  listingTitle: string
  timestamp: number
  dates?: { from?: string; to?: string }
  upgrades?: string[]
  name: string
  email: string
}

export function ProfiloPage() {
  const { user, login, logout } = useAuth()
  const [loginForm, setLoginForm] = useState({ name: '', email: '' })
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? '')
  const requests = safeRead<StoredRequest[]>('theclass_requests', [])
  const myRequests = user ? requests.filter(r => r.email === user.email) : []
  const favCount = user
    ? (safeRead<string[]>(`theclass_favorites_${user.id}`, [])).length
    : 0

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] pt-28 px-6 flex flex-col items-center">
        <Helmet>
          <title>Profilo — the Class</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center">
              <User size={24} className="text-[#C5A059]" />
            </div>
            <div>
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
              <p className="text-sm text-[#5A4F44] font-light">{user.email}</p>
              {user.role === 'admin' && (
                <span className="text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                  Admin
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => { logout(); toast.success('Disconnesso') }}
            className="flex items-center gap-1.5 text-xs text-[#5A4F44] hover:text-[#1C1C1C] transition-colors"
          >
            <LogOut size={13} /> Esci
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: FileText, label: 'Richieste', value: myRequests.length },
            { icon: Heart, label: 'Preferiti', value: favCount },
            { icon: User, label: 'Membro da', value: new Date(user.createdAt).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-5 text-center">
              <Icon size={18} className="text-[#C5A059] mx-auto mb-2" />
              <p className="font-[family-name:var(--font-family-mono)] text-xl font-medium text-[#1C1C1C]">{value}</p>
              <p className="text-xs text-[#5A4F44] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Booking history */}
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
