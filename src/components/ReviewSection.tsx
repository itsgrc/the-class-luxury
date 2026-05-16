import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  listingId: string
  listingTitle: string
}

function Stars({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label={interactive ? 'Valutazione' : `${rating} stelle su 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={cn(!interactive && 'pointer-events-none')}
          aria-label={interactive ? `${n} stelle` : undefined}
        >
          <Star
            size={interactive ? 20 : 13}
            className={cn(
              'transition-all duration-100',
              (hover || rating) >= n ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[rgba(197,160,89,0.25)]',
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ listingId, listingTitle }: Props) {
  const { reviews, addReview, avgRating } = useReviews(listingId)
  const { user } = useAuth()
  const [form, setForm] = useState({ rating: 0, text: '' })
  const [showForm, setShowForm] = useState(false)

  const hasReviewed = user ? reviews.some(r => r.userId === user.id) : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Accedi per lasciare una recensione', { description: 'Usa il tuo profilo in alto a destra.' }); return }
    if (form.rating === 0) { toast.error('Seleziona una valutazione'); return }
    if (form.text.trim().length < 20) { toast.error('Scrivi almeno 20 caratteri'); return }

    addReview({ listingId, userId: user.id, userName: user.name, rating: form.rating, text: form.text.trim() })
    toast.success('Recensione pubblicata!')
    setForm({ rating: 0, text: '' })
    setShowForm(false)
  }

  return (
    <section aria-labelledby="reviews-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 id="reviews-heading" className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-1">
            Recensioni
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(avgRating)} />
              <span className="font-[family-name:var(--font-family-mono)] text-sm text-[#1C1C1C]">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-[#5A4F44]">({reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'})</span>
            </div>
          )}
        </div>
        {!hasReviewed && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-xs text-[#C5A059] border border-[rgba(197,160,89,0.4)] px-3 py-1.5 rounded-full hover:border-[#C5A059] transition-colors"
          >
            {showForm ? 'Annulla' : 'Scrivi recensione'}
          </button>
        )}
      </div>

      {/* Write form */}
      <AnimatePresence>
        {showForm && !hasReviewed && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#FCFAF5] border border-[rgba(197,160,89,0.2)] rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-2">Valutazione *</p>
                <Stars rating={form.rating} interactive onRate={n => setForm(f => ({ ...f, rating: n }))} />
              </div>
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  La tua esperienza *
                </label>
                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  rows={4}
                  placeholder={`Racconta la tua esperienza con ${listingTitle}...`}
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="btn-ripple bg-[#C5A059] text-white px-6 py-2.5 rounded-full text-sm hover:bg-[#b8924a] transition-colors"
              >
                Pubblica recensione
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-[#5A4F44] font-light italic">
          Nessuna recensione ancora. Sii il primo.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#FCFAF5] border border-[rgba(197,160,89,0.15)] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C]">{r.userName}</p>
                  <Stars rating={r.rating} />
                </div>
                <span className="text-[11px] text-[#5A4F44] font-light">
                  {new Date(r.timestamp).toLocaleDateString('it-IT')}
                </span>
              </div>
              <p className="text-sm text-[#5A4F44] font-light leading-relaxed">{r.text}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
