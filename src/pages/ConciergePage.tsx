import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Clock, CheckCircle, ChevronUp, ChevronDown, Inbox,
  CalendarDays, Bell, BriefcaseBusiness, Plus, X, AlertTriangle,
  Receipt, Home, Car, FileText, Calendar, ExternalLink,
} from 'lucide-react'
import { useConcierge } from '@/hooks/useConcierge'
import type { ConciergeRequest } from '@/hooks/useConcierge'
import { useFactotum, FISCAL_DEADLINES } from '@/hooks/useFactotum'
import type { ReminderPriority, ReminderCategory, FiscalDeadline } from '@/hooks/useFactotum'
import { cn } from '@/lib/utils'
import { downloadICS, googleCalendarUrl } from '@/lib/calendar'

type SortKey = 'timestamp' | 'status'
type Tab = 'richieste' | 'factotum' | 'fiscale'

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtFiscalDate(month: number, day: number): string {
  const year = new Date().getFullYear()
  return new Date(year, month - 1, day).toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })
}

const PRIORITY_STYLES: Record<ReminderPriority, string> = {
  urgent: 'border-red-300/50 bg-red-50 text-red-700',
  medium: 'border-amber-300/50 bg-amber-50 text-amber-700',
  low: 'border-emerald-300/50 bg-emerald-50 text-emerald-700',
}

const PRIORITY_LABELS: Record<ReminderPriority, string> = {
  urgent: 'Urgente',
  medium: 'Media',
  low: 'Bassa',
}

const CATEGORY_ICONS: Record<ReminderCategory, React.ReactNode> = {
  fiscal: <Receipt size={13} />,
  personal: <Bell size={13} />,
  travel: <CalendarDays size={13} />,
  service: <BriefcaseBusiness size={13} />,
  bureaucratic: <FileText size={13} />,
}

const FISCAL_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  iva: <Receipt size={13} />,
  irpef: <FileText size={13} />,
  imu: <Home size={13} />,
  inps: <BriefcaseBusiness size={13} />,
  dichiarazione: <FileText size={13} />,
  altro: <AlertTriangle size={13} />,
}

const FISCAL_CATEGORY_LABELS: Record<string, string> = {
  iva: 'IVA',
  irpef: 'IRPEF',
  imu: 'IMU',
  inps: 'INPS',
  dichiarazione: 'Dichiarazione',
  altro: 'Altro',
}

function AddReminderModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (data: { title: string; description: string; dueDate: string; priority: ReminderPriority; category: ReminderCategory }) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<ReminderPriority>('medium')
  const [category, setCategory] = useState<ReminderCategory>('personal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    onAdd({ title: title.trim(), description: description.trim(), dueDate, priority, category })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative z-10 bg-[#FCFAF5] border border-[rgba(197,160,89,0.22)] rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
            Nuovo Promemoria
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(197,160,89,0.08)] text-[#5A4F44] transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#5A4F44] font-medium mb-1.5 block">Titolo</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Es. Rinnovare passaporto"
              className="w-full px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#5A4F44] font-medium mb-1.5 block">Note (opzionale)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Dettagli aggiuntivi..."
              className="w-full px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-[#5A4F44] font-medium mb-1.5 block">Scadenza</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#5A4F44] font-medium mb-1.5 block">Priorità</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ReminderPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
              >
                <option value="low">Bassa</option>
                <option value="medium">Media</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#5A4F44] font-medium mb-1.5 block">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ReminderCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-[rgba(197,160,89,0.22)] bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
              >
                <option value="personal">Personale</option>
                <option value="fiscal">Fiscale</option>
                <option value="travel">Viaggio</option>
                <option value="service">Servizio</option>
                <option value="bureaucratic">Burocratico</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 px-4 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium hover:bg-[#C5A059] transition-colors"
          >
            Aggiungi Promemoria
          </button>
        </form>
      </motion.div>
    </div>
  )
}

function FiscalDeadlineCard({ deadline, year }: { deadline: FiscalDeadline; year: number }) {
  const date = new Date(year, deadline.month - 1, deadline.day)
  const today = new Date()
  if (date < today) date.setFullYear(year + 1)

  const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86400000)

  const urgency = daysLeft <= 7 ? 'urgent' : daysLeft <= 30 ? 'medium' : 'low'
  const urgencyColors = {
    urgent: 'border-red-200 bg-red-50/50',
    medium: 'border-amber-200 bg-amber-50/50',
    low: 'border-[rgba(197,160,89,0.18)] bg-[#FCFAF5]',
  }

  const handleAddToCalendar = () => {
    const start = new Date(date)
    const end = new Date(date)
    end.setHours(23, 59, 0, 0)
    downloadICS({
      title: `Scadenza Fiscale: ${deadline.title}`,
      description: deadline.description,
      location: 'Italia',
      start,
      end,
    })
  }

  const handleGoogleCalendar = () => {
    const start = new Date(date)
    const end = new Date(date)
    end.setHours(23, 59, 0, 0)
    const url = googleCalendarUrl({
      title: `Scadenza Fiscale: ${deadline.title}`,
      details: deadline.description,
      location: 'Italia',
      start,
      end,
    })
    window.open(url, '_blank')
  }

  return (
    <div className={cn('rounded-xl border p-4 transition-all', urgencyColors[urgency])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[#C5A059] shrink-0">{FISCAL_CATEGORY_ICONS[deadline.category]}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1C1C1C] truncate">{deadline.title}</p>
            <p className="text-xs text-[#5A4F44] mt-0.5">{deadline.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn(
            'text-xs font-medium whitespace-nowrap',
            urgency === 'urgent' ? 'text-red-600' : urgency === 'medium' ? 'text-amber-600' : 'text-[#5A4F44]',
          )}>
            {daysLeft === 0 ? 'Oggi' : daysLeft === 1 ? 'Domani' : `${daysLeft} giorni`}
          </p>
          <p className="text-[10px] text-[#5A4F44]/70 mt-0.5">
            {fmtFiscalDate(deadline.month, deadline.day)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] uppercase tracking-widest text-[#5A4F44]/60 border border-[rgba(197,160,89,0.2)] rounded-full px-2 py-0.5">
          {FISCAL_CATEGORY_LABELS[deadline.category]}
        </span>
        <button
          onClick={handleAddToCalendar}
          className="ml-auto flex items-center gap-1 text-[10px] text-[#5A4F44] hover:text-[#C5A059] transition-colors"
        >
          <Calendar size={10} /> ICS
        </button>
        <button
          onClick={handleGoogleCalendar}
          className="flex items-center gap-1 text-[10px] text-[#5A4F44] hover:text-[#C5A059] transition-colors"
        >
          <ExternalLink size={10} /> Google
        </button>
      </div>
    </div>
  )
}

export function ConciergePage() {
  const { requests, updateStatus, deleteRequest, deleteAll } = useConcierge()
  const { reminders, addReminder, toggleComplete, deleteReminder, getUpcomingFiscalDeadlines } = useFactotum()

  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortAsc, setSortAsc] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('richieste')
  const [showAddModal, setShowAddModal] = useState(false)
  const [fiscalMonthsAhead, setFiscalMonthsAhead] = useState(3)

  const sorted = [...requests].sort((a, b) =>
    sortKey === 'timestamp'
      ? sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
      : sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status),
  )

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const toggleSelect = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const deleteSelected = () => { selected.forEach(id => deleteRequest(id)); setSelected([]) }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null

  const currentYear = new Date().getFullYear()
  const upcomingFiscal = getUpcomingFiscalDeadlines(currentYear, fiscalMonthsAhead)

  const activeReminders = reminders.filter(r => !r.completed)
  const completedReminders = reminders.filter(r => r.completed)

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'richieste', label: 'Richieste', count: requests.filter(r => r.status === 'pending').length || undefined },
    { key: 'factotum', label: 'Factotum', count: activeReminders.length || undefined },
    { key: 'fiscale', label: 'Scadenze Fiscali', count: upcomingFiscal.filter(d => d.daysLeft <= 30).length || undefined },
  ]

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Concierge & Factotum — the Class</title>
      <meta name="description" content="Il tuo concierge e factotum personale. Gestisci richieste, promemoria, scadenze fiscali e burocratiche da un unico pannello." />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-2">
            Dashboard
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            Il tuo Factotum Personale
          </h1>
          <p className="text-[#5A4F44] font-light text-sm max-w-lg">
            Richieste concierge, promemoria intelligenti e scadenze fiscali italiane — tutto in un unico pannello privato.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.14)] rounded-2xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-[#1C1C1C] text-white shadow-sm'
                  : 'text-[#5A4F44] hover:text-[#1C1C1C]',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  'text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium',
                  activeTab === tab.key ? 'bg-[#C5A059] text-white' : 'bg-[rgba(197,160,89,0.2)] text-[#C5A059]',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── TAB: RICHIESTE ── */}
          {activeTab === 'richieste' && (
            <motion.div key="richieste" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-full border border-[rgba(197,160,89,0.28)] flex items-center justify-center mb-6">
                    <Inbox size={26} className="text-[rgba(197,160,89,0.4)]" />
                  </div>
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
                    Nessuna richiesta
                  </h2>
                  <p className="text-[#5A4F44] font-light text-sm mb-6 max-w-sm">
                    Usa il widget concierge in homepage per inviare la tua prima richiesta luxury.
                  </p>
                </div>
              ) : (
                <>
                  {selected.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between mb-4 px-4 py-3 bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.18)] rounded-xl"
                    >
                      <span className="text-sm text-[#5A4F44]">{selected.length} selezionati</span>
                      <button
                        onClick={deleteSelected}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={13} /> Elimina selezionati
                      </button>
                    </motion.div>
                  )}

                  <div className="bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)] overflow-hidden">
                    <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 items-center px-6 py-3 border-b border-[rgba(197,160,89,0.12)] text-[10px] text-[#5A4F44] uppercase tracking-wider">
                      <div className="w-3.5" />
                      <span>Richiesta</span>
                      <button onClick={() => toggleSort('timestamp')}
                        className="flex items-center gap-1 hover:text-[#C5A059] transition-colors">
                        Data <SortIcon k="timestamp" />
                      </button>
                      <button onClick={() => toggleSort('status')}
                        className="flex items-center gap-1 hover:text-[#C5A059] transition-colors">
                        Stato <SortIcon k="status" />
                      </button>
                      <span>Azioni</span>
                    </div>

                    <AnimatePresence>
                      {sorted.map((req: ConciergeRequest, i: number) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: i * 0.025 }}
                          className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 items-center px-6 py-4 border-b border-[rgba(197,160,89,0.08)] last:border-0 hover:bg-[rgba(197,160,89,0.02)] transition-colors"
                        >
                          <div
                            onClick={() => toggleSelect(req.id)}
                            className={cn(
                              'w-3.5 h-3.5 rounded border cursor-pointer flex items-center justify-center transition-colors shrink-0',
                              selected.includes(req.id)
                                ? 'bg-[#C5A059] border-[#C5A059]'
                                : 'border-[rgba(197,160,89,0.38)] hover:border-[#C5A059]',
                            )}
                          >
                            {selected.includes(req.id) && (
                              <svg viewBox="0 0 10 10" className="w-2 h-2">
                                <path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] mb-0.5">{req.id}</p>
                            <p className="text-sm text-[#1C1C1C] font-light truncate">{req.prompt}</p>
                          </div>

                          <span className="text-xs text-[#5A4F44] font-light whitespace-nowrap">{fmt(req.timestamp)}</span>

                          <button
                            onClick={() => updateStatus(req.id, req.status === 'pending' ? 'handled' : 'pending')}
                            className={cn(
                              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap',
                              req.status === 'handled'
                                ? 'border-emerald-300/50 bg-emerald-50 text-emerald-700'
                                : 'border-amber-300/50 bg-amber-50 text-amber-700',
                            )}
                          >
                            {req.status === 'handled'
                              ? <><CheckCircle size={10} /> Gestita</>
                              : <><Clock size={10} /> In attesa</>}
                          </button>

                          <button
                            onClick={() => deleteRequest(req.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#5A4F44] hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={deleteAll}
                      className="text-xs text-[#5A4F44] hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Elimina tutte
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── TAB: FACTOTUM / PROMEMORIA ── */}
          {activeTab === 'factotum' && (
            <motion.div key="factotum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">
                    Promemoria Intelligenti
                  </h2>
                  <p className="text-sm text-[#5A4F44] font-light mt-0.5">
                    {activeReminders.length} attivi · {completedReminders.length} completati
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm hover:bg-[#C5A059] transition-colors"
                >
                  <Plus size={14} /> Nuovo
                </button>
              </div>

              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)]">
                  <div className="w-16 h-16 rounded-full border border-[rgba(197,160,89,0.28)] flex items-center justify-center mb-4">
                    <Bell size={22} className="text-[rgba(197,160,89,0.4)]" />
                  </div>
                  <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">
                    Nessun promemoria
                  </h3>
                  <p className="text-[#5A4F44] font-light text-sm mb-5 max-w-xs">
                    Aggiungi scadenze, rinnovi, appuntamenti. Il tuo factotum personale tiene traccia di tutto.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C1C1C] text-white text-sm hover:bg-[#C5A059] transition-colors"
                  >
                    <Plus size={14} /> Aggiungi il primo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeReminders.map((r, i) => {
                    const daysLeft = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / 86400000)
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-[#FCFAF5] rounded-xl border border-[rgba(197,160,89,0.18)] p-4 flex items-start gap-4 hover:border-[rgba(197,160,89,0.35)] transition-colors"
                      >
                        <button
                          onClick={() => toggleComplete(r.id)}
                          className="mt-0.5 w-4 h-4 rounded border border-[rgba(197,160,89,0.38)] hover:border-[#C5A059] flex items-center justify-center transition-colors shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <p className="text-sm font-medium text-[#1C1C1C]">{r.title}</p>
                            <span className={cn('text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-medium', PRIORITY_STYLES[r.priority])}>
                              {PRIORITY_LABELS[r.priority]}
                            </span>
                          </div>
                          {r.description && (
                            <p className="text-xs text-[#5A4F44] font-light mt-0.5">{r.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-[#5A4F44]">{CATEGORY_ICONS[r.category]}</span>
                            <span className="text-xs text-[#5A4F44]">{fmtDate(r.dueDate)}</span>
                            {daysLeft <= 7 && daysLeft >= 0 && (
                              <span className="text-[10px] text-red-600 font-medium">
                                {daysLeft === 0 ? 'Scade oggi!' : `${daysLeft} giorn${daysLeft === 1 ? 'o' : 'i'}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(r.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#5A4F44] hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    )
                  })}

                  {completedReminders.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[10px] uppercase tracking-widest text-[#5A4F44]/60 mb-3">Completati</p>
                      <div className="space-y-2">
                        {completedReminders.map(r => (
                          <div key={r.id} className="bg-[#FCFAF5] rounded-xl border border-[rgba(197,160,89,0.1)] p-4 flex items-center gap-4 opacity-50">
                            <button
                              onClick={() => toggleComplete(r.id)}
                              className="w-4 h-4 rounded border border-[rgba(197,160,89,0.3)] bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0"
                            >
                              <svg viewBox="0 0 10 10" className="w-2 h-2">
                                <path d="M1.5 5 L4 7.5 L8.5 2.5" stroke="#C5A059" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                              </svg>
                            </button>
                            <p className="text-sm text-[#5A4F44] line-through flex-1">{r.title}</p>
                            <button onClick={() => deleteReminder(r.id)} className="p-1 text-[#5A4F44] hover:text-red-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── TAB: SCADENZE FISCALI ── */}
          {activeTab === 'fiscale' && (
            <motion.div key="fiscale" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C]">
                    Calendario Fiscale Italiano
                  </h2>
                  <p className="text-sm text-[#5A4F44] font-light mt-0.5">
                    Scadenze IVA, IRPEF, IMU, INPS per {currentYear}/{currentYear + 1}
                  </p>
                </div>
                <select
                  value={fiscalMonthsAhead}
                  onChange={e => setFiscalMonthsAhead(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-[rgba(197,160,89,0.22)] bg-[#FCFAF5] text-sm text-[#1C1C1C] focus:outline-none focus:border-[#C5A059] transition-colors"
                >
                  <option value={1}>Prossimo mese</option>
                  <option value={3}>Prossimi 3 mesi</option>
                  <option value={6}>Prossimi 6 mesi</option>
                  <option value={12}>Tutto l'anno</option>
                </select>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                {(['urgent', 'medium', 'low'] as const).map(u => (
                  <div key={u} className="flex items-center gap-1.5">
                    <div className={cn('w-2 h-2 rounded-full', {
                      urgent: 'bg-red-400',
                      medium: 'bg-amber-400',
                      low: 'bg-[#C5A059]',
                    }[u])} />
                    <span className="text-[10px] text-[#5A4F44]">
                      {{ urgent: '≤7 giorni', medium: '≤30 giorni', low: 'Oltre 30 giorni' }[u]}
                    </span>
                  </div>
                ))}
              </div>

              {upcomingFiscal.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.18)]">
                  <CheckCircle size={32} className="text-emerald-400 mb-4" />
                  <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">
                    Tutto in ordine
                  </h3>
                  <p className="text-[#5A4F44] font-light text-sm">
                    Nessuna scadenza fiscale nel periodo selezionato.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <AnimatePresence>
                    {upcomingFiscal.map((deadline, i) => (
                      <motion.div
                        key={deadline.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <FiscalDeadlineCard deadline={deadline} year={currentYear} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="mt-8 p-4 bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.18)] rounded-xl">
                <p className="text-[10px] text-[#5A4F44] leading-relaxed">
                  <strong className="text-[#C5A059]">Nota:</strong> Le scadenze fiscali mostrate sono indicative e basate sul calendario fiscale italiano standard {currentYear}. Consulta sempre il tuo commercialista per confermare le date esatte e le eventuali proroghe.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddReminderModal
            onClose={() => setShowAddModal(false)}
            onAdd={data => addReminder(data)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
