import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Clock, CheckCircle, ChevronUp, ChevronDown, Inbox } from 'lucide-react'
import { useConcierge } from '@/hooks/useConcierge'
import type { ConciergeRequest } from '@/hooks/useConcierge'
import { cn } from '@/lib/utils'

type SortKey = 'timestamp' | 'status'

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ConciergePage() {
  const { requests, updateStatus, deleteRequest, deleteAll } = useConcierge()
  const [sortKey, setSortKey] = useState<SortKey>('timestamp')
  const [sortAsc, setSortAsc] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

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

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Concierge Personale — the Class</title>
      <meta name="description" content="Il tuo concierge personale risponde in meno di 2 ore. Gestisci e traccia ogni richiesta luxury da un unico pannello." />
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-2">
            Dashboard
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-2">
            Richieste Concierge
          </h1>
          <p className="text-[#5A4F44] font-light text-sm">
            {requests.length} {requests.length === 1 ? 'richiesta' : 'richieste'} totali
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full border border-[rgba(197,160,89,0.28)] flex items-center justify-center mb-6">
              <Inbox size={26} className="text-[rgba(197,160,89,0.4)]" />
            </div>
            <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
              Nessuna richiesta
            </h2>
            <p className="text-[#5A4F44] font-light text-sm mb-6 max-w-sm">
              Usa il widget concierge in homepage per inviare la tua prima richiesta.
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
              {/* Header row */}
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
                {sorted.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.025 }}
                    className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 items-center px-6 py-4 border-b border-[rgba(197,160,89,0.08)] last:border-0 hover:bg-[rgba(197,160,89,0.02)] transition-colors"
                  >
                    {/* Select */}
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

                    {/* Content */}
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] mb-0.5">{req.id}</p>
                      <p className="text-sm text-[#1C1C1C] font-light truncate">{req.prompt}</p>
                    </div>

                    {/* Date */}
                    <span className="text-xs text-[#5A4F44] font-light whitespace-nowrap">{fmt(req.timestamp)}</span>

                    {/* Status toggle */}
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

                    {/* Delete */}
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
      </div>
    </div>
  )
}
