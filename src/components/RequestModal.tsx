import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn, generateId } from '@/lib/utils'
import type { Listing } from '@/data/listings'
import { upgradeOptions } from '@/data/listings'
import { formatPrice } from '@/lib/utils'

interface RequestModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  listing: Listing
  defaultDates?: { from?: Date; to?: Date }
  selectedUpgrades?: string[]
}

export function RequestModal({ open, onOpenChange, listing, defaultDates, selectedUpgrades = [] }: RequestModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    contact: 'email' as 'email' | 'phone' | 'whatsapp',
  })
  const [upgrades, setUpgrades] = useState<string[]>(selectedUpgrades)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const totalUpgrade = upgradeOptions.filter(u => upgrades.includes(u.id)).reduce((s, u) => s + u.price, 0)

  const toggleUpgrade = (id: string) => {
    setUpgrades(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    await new Promise(r => setTimeout(r, 900))

    const id = generateId()
    const saved = {
      id,
      listing: listing.id,
      listingTitle: listing.title,
      ...form,
      upgrades,
      dates: { from: defaultDates?.from?.toISOString(), to: defaultDates?.to?.toISOString() },
      timestamp: Date.now(),
    }
    const existing = JSON.parse(localStorage.getItem('tc_requests') || '[]')
    localStorage.setItem('tc_requests', JSON.stringify([saved, ...existing]))

    setStatus('success')
    toast.success('Richiesta inviata con successo!', {
      description: `ID richiesta: ${id}. Ti contatteremo entro 2 ore.`,
    })

    setTimeout(() => {
      onOpenChange(false)
      setStatus('idle')
      setForm({ name: '', email: '', phone: '', message: '', contact: 'email' })
    }, 1500)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.3)] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#FDF9F2] border-b border-[rgba(197,160,89,0.2)] px-8 py-5 flex items-center justify-between">
              <div>
                <Dialog.Title className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">
                  Richiedi Disponibilità
                </Dialog.Title>
                <p className="text-sm text-[#5A4F44] font-light mt-0.5">{listing.title}</p>
              </div>
              <Dialog.Close className="p-2 rounded-full hover:bg-[rgba(197,160,89,0.1)] transition-colors">
                <X size={16} className="text-[#5A4F44]" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Personal info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Nome Completo *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Alessandro Bianchi"
                    className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="a.bianchi@example.com"
                    className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Telefono</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+39 02 1234 5678"
                  className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              {defaultDates?.from && (
                <div className="p-4 rounded-xl bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)]">
                  <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1">Date selezionate</p>
                  <p className="text-sm text-[#1C1C1C] font-medium">
                    {defaultDates.from?.toLocaleDateString('it-IT')}
                    {defaultDates.to && ` – ${defaultDates.to.toLocaleDateString('it-IT')}`}
                  </p>
                </div>
              )}

              {/* Upgrades */}
              <div>
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Upgrade Esclusivi</p>
                <div className="grid grid-cols-2 gap-3">
                  {upgradeOptions.map(up => {
                    const selected = upgrades.includes(up.id)
                    return (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => toggleUpgrade(up.id)}
                        className={cn(
                          'text-left p-3 rounded-xl border transition-all duration-200',
                          selected
                            ? 'border-[#C5A059] bg-[rgba(197,160,89,0.06)]'
                            : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)]'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            'w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                            selected ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]'
                          )}>
                            {selected && <Check size={10} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#1C1C1C]">{up.name}</p>
                            <p className="text-[10px] text-[#5A4F44] font-light">{up.description}</p>
                            <p className="text-xs font-[family-name:var(--font-family-mono)] text-[#C5A059] mt-1">+{formatPrice(up.price)}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {totalUpgrade > 0 && (
                  <p className="text-sm text-[#5A4F44] mt-2">
                    Upgrade selezionati: <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">+{formatPrice(totalUpgrade)}</span>
                  </p>
                )}
              </div>

              {/* Contact preference */}
              <div>
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Preferenza Contatto</p>
                <div className="flex gap-3">
                  {[
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'phone', label: 'Telefono', icon: Phone },
                    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, contact: value as typeof form.contact }))}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200',
                        form.contact === value
                          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.08)] text-[#C5A059]'
                          : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[rgba(197,160,89,0.4)]'
                      )}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Messaggio Speciale</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={3}
                  placeholder="Desideri particolari, richieste speciali, informazioni aggiuntive..."
                  className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status !== 'idle'}
                className={cn(
                  'w-full py-4 rounded-xl font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all duration-300',
                  status === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#C5A059] text-white hover:bg-[#b8924a]'
                )}
              >
                <AnimatePresence mode="wait">
                  {status === 'idle' && (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Invia Richiesta
                    </motion.span>
                  )}
                  {status === 'loading' && (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Invio in corso...
                    </motion.span>
                  )}
                  {status === 'success' && (
                    <motion.span key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center gap-2">
                      <Check size={16} />
                      Richiesta inviata!
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
