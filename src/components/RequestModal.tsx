import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, MessageCircle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { generateId, formatPrice, cn } from '@/lib/utils'
import type { Listing, UpgradeOption } from '@/data/listings'

interface RequestModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  listing: Listing
  defaultDates?: { from?: Date; to?: Date }
  preselectedUpgrades?: string[]
}

export function RequestModal({
  open, onOpenChange, listing, defaultDates, preselectedUpgrades = [],
}: RequestModalProps) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '',
    contact: 'email' as 'email' | 'phone' | 'whatsapp',
  })
  const [upgrades, setUpgrades] = useState<string[]>(preselectedUpgrades)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const upgradeTotal = listing.upgrades
    .filter(u => upgrades.includes(u.id))
    .reduce((s, u) => s + u.price, 0)

  const toggleUpgrade = (id: string) =>
    setUpgrades(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    await new Promise(r => setTimeout(r, 900))

    const id = generateId()
    const payload = {
      id,
      listingId: listing.id,
      listingTitle: listing.title,
      ...form,
      upgrades,
      dates: {
        from: defaultDates?.from?.toISOString(),
        to: defaultDates?.to?.toISOString(),
      },
      timestamp: Date.now(),
    }
    const existing = JSON.parse(localStorage.getItem('theclass_requests') ?? '[]')
    localStorage.setItem('theclass_requests', JSON.stringify([payload, ...existing]))

    setStatus('success')
    toast.success('Richiesta inviata!', { description: `ID: ${id} — risposta entro 2 ore.` })
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.3)] shadow-[0_24px_64px_rgba(26,24,22,0.14)]"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#FDF9F2] border-b border-[rgba(197,160,89,0.2)] px-7 py-5 flex items-start justify-between">
              <div>
                <Dialog.Title className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]">
                  Richiedi Disponibilità
                </Dialog.Title>
                <p className="text-xs text-[#5A4F44] font-light mt-0.5 line-clamp-1">{listing.title}</p>
              </div>
              <Dialog.Close className="p-2 rounded-full hover:bg-[rgba(197,160,89,0.1)] transition-colors mt-0.5">
                <X size={14} className="text-[#5A4F44]" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Nome *', type: 'text', placeholder: 'Alessandro Bianchi' },
                  { key: 'email', label: 'Email *', type: 'email', placeholder: 'a@example.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <input
                      required
                      type={f.type}
                      value={form[f.key as 'name' | 'email']}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Telefono</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+39 02 1234 5678"
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              {/* Dates */}
              {defaultDates?.from && (
                <div className="p-3.5 rounded-xl bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.18)]">
                  <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1">Date richieste</p>
                  <p className="text-sm text-[#1C1C1C] font-medium">
                    {defaultDates.from.toLocaleDateString('it-IT')}
                    {defaultDates.to ? ` — ${defaultDates.to.toLocaleDateString('it-IT')}` : ''}
                  </p>
                </div>
              )}

              {/* Upgrades */}
              {listing.upgrades.length > 0 && (
                <div>
                  <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3">Upgrade Opzionali</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {listing.upgrades.map(up => {
                      const sel = upgrades.includes(up.id)
                      return (
                        <button
                          key={up.id}
                          type="button"
                          onClick={() => toggleUpgrade(up.id)}
                          className={cn(
                            'text-left p-3 rounded-xl border transition-all duration-200',
                            sel
                              ? 'border-[#C5A059] bg-[rgba(197,160,89,0.05)]'
                              : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.4)]',
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className={cn(
                              'w-3.5 h-3.5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                              sel ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]',
                            )}>
                              {sel && <Check size={8} className="text-white" />}
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-[#1C1C1C] leading-tight">{up.name}</p>
                              <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] mt-0.5">
                                +{formatPrice(up.price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {upgradeTotal > 0 && (
                    <p className="text-xs text-[#5A4F44] mt-2 text-right">
                      Upgrade: <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059]">
                        +{formatPrice(upgradeTotal)}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Contact preference */}
              <div>
                <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5">Preferenza Contatto</p>
                <div className="flex gap-2.5">
                  {([
                    { value: 'email', label: 'Email', Icon: Mail },
                    { value: 'phone', label: 'Telefono', Icon: Phone },
                    { value: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
                  ] as const).map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, contact: value }))}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs transition-all duration-200',
                        form.contact === value
                          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.08)] text-[#C5A059]'
                          : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[rgba(197,160,89,0.4)]',
                      )}
                    >
                      <Icon size={12} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  Messaggio Speciale
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={3}
                  placeholder="Richieste particolari, anniversari, allergie, allestimenti speciali..."
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status !== 'idle'}
                className={cn(
                  'btn-ripple w-full py-3.5 rounded-xl text-sm tracking-wide transition-all duration-300',
                  status === 'success'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#C5A059] text-white hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)]',
                )}
              >
                <AnimatePresence mode="wait">
                  {status === 'idle' && (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Invia Richiesta
                    </motion.span>
                  )}
                  {status === 'loading' && (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Invio in corso...
                    </motion.span>
                  )}
                  {status === 'success' && (
                    <motion.span key="s"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center gap-2">
                      <Check size={15} /> Richiesta inviata!
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
