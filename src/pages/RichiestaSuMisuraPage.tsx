import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Clock, Zap, Star } from 'lucide-react'
import { toast } from 'sonner'
import { generateId, addRipple, cn } from '@/lib/utils'

const URGENCY = [
  { value: 'low', label: 'Flessibile', desc: 'Entro 7 giorni', Icon: Clock },
  { value: 'medium', label: 'Normale', desc: 'Entro 48 ore', Icon: Star },
  { value: 'high', label: 'Urgente', desc: 'Entro 4 ore', Icon: Zap },
] as const

type Urgency = typeof URGENCY[number]['value']

export function RichiestaSuMisuraPage() {
  const [form, setForm] = useState({
    name: '', email: '',
    description: '',
    budget: '',
    urgency: 'medium' as Urgency,
  })
  const [images, setImages] = useState<Array<{ preview: string; name: string }>>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files).slice(0, 5 - images.length).map(f => ({
      preview: URL.createObjectURL(f),
      name: f.name,
    }))
    setImages(prev => [...prev, ...added])
  }

  const removeImage = (i: number) => {
    setImages(prev => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i) })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.description.trim()) { toast.error('Descrivi la tua richiesta'); return }
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1000))

    const id = generateId()
    const payload = { id, ...form, imageCount: images.length, timestamp: Date.now() }
    const existing = JSON.parse(localStorage.getItem('theclass_bespoke') ?? '[]')
    localStorage.setItem('theclass_bespoke', JSON.stringify([payload, ...existing]))

    setStatus('success')
    toast.success('Richiesta su misura inviata!', {
      description: `Risposta a ${form.email} — ${form.urgency === 'high' ? 'entro 4 ore' : form.urgency === 'medium' ? 'entro 48 ore' : 'entro 7 giorni'}`,
    })
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Richiesta Su Misura — the Class</title>
      <div className="max-w-xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic tracking-widest text-sm uppercase mb-3">
            Solo per noi due
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-3">
            Richiesta su misura
          </h1>
          <p className="text-[#5A4F44] font-light">
            Descrivi la tua visione. Realizziamo l'impossibile.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(197,160,89,0.08)] border border-[#C5A059] flex items-center justify-center mx-auto mb-6">
                <Check size={26} className="text-[#C5A059]" />
              </div>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
                Richiesta ricevuta
              </h2>
              <p className="text-[#5A4F44] font-light text-sm mb-8">
                Il nostro team la contatterà con una proposta personalizzata.
              </p>
              <button onClick={() => setStatus('idle')} className="text-sm text-[#C5A059] underline">
                Invia un'altra richiesta
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name + email */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'name', label: 'Nome *', type: 'text', ph: 'Alessandro Bianchi' },
                  { key: 'email', label: 'Email *', type: 'email', ph: 'a@example.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <input
                      required type={f.type}
                      value={form[f.key as 'name' | 'email']}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  Descrivi la tua richiesta *
                </label>
                <textarea
                  required rows={5}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Compleanno importante per 20 persone. Ho in mente un'isola privata, chef stellato, musica live, fuochi d'artificio. Budget ~€200.000. Date: luglio 2026..."
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Budget indicativo</label>
                <input
                  value={form.budget}
                  onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                  placeholder="Es: €50.000 – €150.000"
                  className="w-full bg-white border border-[rgba(197,160,89,0.22)] rounded-xl px-4 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-3 block">Urgenza</label>
                <div className="grid grid-cols-3 gap-3">
                  {URGENCY.map(({ value, label, desc, Icon }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setForm(p => ({ ...p, urgency: value }))}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all duration-200',
                        form.urgency === value
                          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.05)]'
                          : 'border-[rgba(197,160,89,0.18)] hover:border-[rgba(197,160,89,0.38)]',
                      )}
                    >
                      <Icon size={15} className={cn('mb-2', form.urgency === value ? 'text-[#C5A059]' : 'text-[#5A4F44]')} />
                      <p className="text-xs font-medium text-[#1C1C1C]">{label}</p>
                      <p className="text-[10px] text-[#5A4F44] font-light">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2.5 block">
                  Immagini di ispirazione (max 5)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                  className={cn(
                    'w-full border-2 border-dashed rounded-xl px-4 py-6 text-center transition-all cursor-pointer',
                    dragging
                      ? 'border-[#C5A059] bg-[rgba(197,160,89,0.08)]'
                      : 'border-[rgba(197,160,89,0.3)] hover:border-[#C5A059] hover:bg-[rgba(197,160,89,0.04)]',
                  )}
                >
                  <Upload size={22} className="text-[rgba(197,160,89,0.45)] mx-auto mb-2" />
                  <p className="text-sm text-[#5A4F44] font-light">Clicca o trascina le immagini</p>
                  <p className="text-[11px] text-[#5A4F44]/50 mt-1">PNG, JPG — max 10MB</p>
                  <p className="text-[10px] text-[#5A4F44]/50 mt-1">o trascina qui i file</p>
                </div>
                <input
                  ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
                {images.length > 0 && (
                  <div className="flex gap-2.5 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16">
                        <img src={img.preview} alt="" className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-[#1C1C1C] rounded-full flex items-center justify-center"
                        >
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                onClick={e => addRipple(e as unknown as React.MouseEvent<HTMLElement>)}
                className="btn-ripple w-full bg-[#C5A059] text-white py-4 rounded-xl text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  'Invia Richiesta su Misura'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
