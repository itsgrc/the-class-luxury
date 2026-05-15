import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Clock, Zap, Star } from 'lucide-react'
import { toast } from 'sonner'
import { generateId, cn } from '@/lib/utils'

const urgencyOptions = [
  { value: 'flex', label: 'Flessibile', desc: 'Entro 7 giorni', icon: Clock },
  { value: 'normal', label: 'Normale', desc: 'Entro 48 ore', icon: Star },
  { value: 'urgent', label: 'Urgente', desc: 'Entro 4 ore', icon: Zap },
]

export function RichiestaSuMisuraPage() {
  const [form, setForm] = useState({
    description: '',
    urgency: 'normal',
    budget: '',
    name: '',
    email: '',
  })
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...newImages].slice(0, 5))
  }

  const removeImage = (i: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) {
      toast.error('Descrivi la tua richiesta')
      return
    }
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1000))

    const id = generateId()
    const saved = {
      id,
      ...form,
      imageCount: images.length,
      timestamp: Date.now(),
    }
    const existing = JSON.parse(localStorage.getItem('tc_custom_requests') || '[]')
    localStorage.setItem('tc_custom_requests', JSON.stringify([saved, ...existing]))

    setStatus('success')
    toast.success('Richiesta su misura inviata!', {
      description: `Il team la contatterà all'indirizzo ${form.email}`,
    })
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="font-[family-name:var(--font-family-serif)] text-[#C5A059] italic text-sm tracking-widest uppercase mb-3">
            Servizio esclusivo
          </p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] tracking-tight mb-4">
            Richiesta su misura
          </h1>
          <p className="text-[#5A4F44] font-light text-lg">
            Descrivi la tua visione. Realizziamo l'impossibile.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(197,160,89,0.1)] border border-[#C5A059] flex items-center justify-center mx-auto mb-6">
                <Check size={28} className="text-[#C5A059]" />
              </div>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-[#1C1C1C] mb-3">
                Richiesta ricevuta
              </h2>
              <p className="text-[#5A4F44] font-light mb-8">
                Il nostro team la contatterà presto con una proposta personalizzata.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm text-[#C5A059] underline"
              >
                Invia un'altra richiesta
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Personal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Nome *</label>
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
                    placeholder="email@example.com"
                    className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">
                  Descrivi la tua richiesta *
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={6}
                  placeholder="Es: Vorrei organizzare un compleanno importante per 20 persone. Ho in mente un'isola privata, chef con menu stellato, musica live, fuochi d'artificio. Budget indicativo 200.000€. Date: luglio 2026..."
                  className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Budget indicativo</label>
                <input
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  placeholder="Es: €50.000 – €100.000"
                  className="w-full bg-white border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3 block">Urgenza</label>
                <div className="grid grid-cols-3 gap-3">
                  {urgencyOptions.map(({ value, label, desc, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, urgency: value }))}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all duration-200',
                        form.urgency === value
                          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.06)]'
                          : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)]'
                      )}
                    >
                      <Icon size={16} className={form.urgency === value ? 'text-[#C5A059] mb-2' : 'text-[#5A4F44] mb-2'} />
                      <p className="text-sm font-medium text-[#1C1C1C]">{label}</p>
                      <p className="text-xs text-[#5A4F44] font-light">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3 block">
                  Immagini di ispirazione (max 5)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-[rgba(197,160,89,0.3)] rounded-xl p-8 text-center cursor-pointer hover:border-[#C5A059] transition-colors"
                >
                  <Upload size={24} className="text-[rgba(197,160,89,0.5)] mx-auto mb-2" />
                  <p className="text-sm text-[#5A4F44] font-light">
                    Clicca per caricare o trascina le immagini
                  </p>
                  <p className="text-xs text-[#5A4F44]/60 mt-1">PNG, JPG fino a 10MB</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />

                {images.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img
                          src={img.preview}
                          alt=""
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1C1C1C] rounded-full flex items-center justify-center"
                        >
                          <X size={10} className="text-white" />
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
                className="w-full bg-[#C5A059] text-white py-4 rounded-xl font-[family-name:var(--font-family-sans)] text-sm tracking-wide transition-all duration-300 hover:bg-[#b8924a] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] disabled:opacity-70 flex items-center justify-center gap-2"
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
