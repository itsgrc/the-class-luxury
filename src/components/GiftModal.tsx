import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { safeAppend } from '@/lib/errorHandler'
import type { Listing } from '@/data/listings'

interface Props { listing: Listing; onClose: () => void }

export function GiftModal({ listing, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [date, setDate] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!email) return
    safeAppend('theclass_gifts', { listingId: listing.id, listingTitle: listing.title, toEmail: email, message, date, sentAt: Date.now() })
    setSent(true)
    setTimeout(() => { onClose(); toast.success(`Regalo inviato a ${email}!`) }, 1200)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] shadow-[0_24px_64px_rgba(26,24,22,0.18)] w-full max-w-md p-8"
        >
          {!sent ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(197,160,89,0.12)] flex items-center justify-center">
                    <Gift size={18} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C]">Regala un'esperienza</h2>
                    <p className="text-xs text-[#5A4F44]">{listing.title}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(197,160,89,0.1)]">
                  <X size={14} className="text-[#5A4F44]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Email destinatario *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="nome@email.it"
                    className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Data esperienza</label>
                  <input value={date} onChange={e => setDate(e.target.value)} type="date"
                    className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Messaggio personale</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Scrivi un messaggio speciale..."
                    className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] transition-colors resize-none" />
                </div>
                <button onClick={send} disabled={!email}
                  className="w-full py-3 rounded-xl bg-[#C5A059] text-white text-sm font-medium hover:bg-[#b8924a] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  <Heart size={14} /> Invia Regalo
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-[#C5A059] fill-[#C5A059]" />
              </div>
              <p className="font-[family-name:var(--font-family-display)] text-xl text-[#1C1C1C] mb-2">Regalo inviato!</p>
              <p className="text-sm text-[#5A4F44]">Il destinatario riceverà una notifica a {email}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
