import { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, MessageCircle, Check, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { generateId, formatPrice, cn } from '@/lib/utils'
import type { Listing, UpgradeOption } from '@/data/listings'
import { notifyRequestReceived, notifyAdmin } from '@/lib/notifications'
import { validateCoupon, redeemCoupon } from '@/lib/coupons'

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
  const lastId = useRef<string>('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const [emailTouched, setEmailTouched] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const upgradeTotal = listing.upgrades
    .filter(u => upgrades.includes(u.id))
    .reduce((s, u) => s + u.price, 0)

  const toggleUpgrade = (id: string) =>
    setUpgrades(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])

  const totalForCoupon = listing.price + upgradeTotal
  const applyCoupon = () => {
    const result = validateCoupon(couponCode, totalForCoupon)
    if (result.valid && result.coupon && result.discountAmount !== undefined) {
      setCouponDiscount(result.discountAmount)
      setCouponApplied(result.coupon.description)
      toast.success(`Codice applicato: ${result.coupon.description}`)
    } else {
      toast.error(result.error ?? 'Codice non valido')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    await new Promise(r => setTimeout(r, 900))

    const id = generateId()
    lastId.current = id
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

    if (couponApplied && form.email) {
      redeemCoupon(couponCode.trim().toUpperCase(), form.email)
    }

    notifyRequestReceived(form.name, form.email, id, listing.title)
    notifyAdmin(id, 'standard', `${listing.title} — ${form.name}`)

    setStatus('success')
    toast.success('Richiesta inviata!', { description: `ID: ${id} — risposta entro 2 ore.` })
    setTimeout(() => {
      onOpenChange(false)
      setStatus('idle')
      setForm({ name: '', email: '', phone: '', message: '', contact: 'email' })
    }, 4000)
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
                      onBlur={f.key === 'email' ? () => setEmailTouched(true) : undefined}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                    {f.key === 'email' && emailTouched && form.email && (
                      <p className={`text-[10px] mt-1 ${isValidEmail(form.email) ? 'text-emerald-600' : 'text-red-400'}`}>
                        {isValidEmail(form.email) ? '✓ Email valida' : 'Formato email non valido'}
                      </p>
                    )}
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

              {/* Coupon */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  Codice Promozionale
                </label>
                {couponApplied ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <Check size={13} className="text-emerald-600 shrink-0" />
                    <span className="text-sm text-emerald-700 flex-1">{couponApplied}</span>
                    <span className="font-[family-name:var(--font-family-mono)] text-sm text-emerald-700 font-medium">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                      placeholder="es. LUXURY10"
                      className="flex-1 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors font-[family-name:var(--font-family-mono)] tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                      className="px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#C5A059] text-xs hover:border-[#C5A059] transition-colors disabled:opacity-40"
                    >
                      Applica
                    </button>
                  </div>
                )}
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
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs px-1 mt-1">
                      <span className="text-[#5A4F44]">Sconto coupon</span>
                      <span className="font-[family-name:var(--font-family-mono)] text-emerald-600">-{formatPrice(couponDiscount)}</span>
                    </div>
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

              {status === 'success' && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="button"
                  disabled={pdfLoading}
                  onClick={async () => {
                    setPdfLoading(true)
                    try {
                      const { generateQuotePDF } = await import('@/lib/pdfExport')
                      await generateQuotePDF({
                        requestId: lastId.current ?? '—',
                        clientName: form.name,
                        listingTitle: listing.title,
                        location: listing.location,
                        basePrice: listing.price,
                        upgradeItems: listing.upgrades
                          .filter(u => upgrades.includes(u.id))
                          .map(u => ({ name: u.name, price: u.price })),
                        discount: 0,
                        discountLabel: '',
                        total: listing.price + upgradeTotal,
                      })
                    } finally {
                      setPdfLoading(false)
                    }
                  }}
                  className="w-full border border-[rgba(197,160,89,0.4)] text-[#C5A059] py-3 rounded-xl text-sm hover:border-[#C5A059] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {pdfLoading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-[#C5A059]/30 border-t-[#C5A059] rounded-full animate-spin" /> Generazione PDF...</>
                  ) : (
                    <><FileText size={14} /> Scarica Preventivo PDF</>
                  )}
                </motion.button>
              )}
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
