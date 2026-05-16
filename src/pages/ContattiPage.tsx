// src/pages/ContattiPage.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, Check } from 'lucide-react'
import { toast } from 'sonner'
import { generateId } from '@/lib/utils'
import { safeWrite, safeRead } from '@/lib/errorHandler'

interface ContactMsg { id: string; name: string; email: string; subject: string; message: string; timestamp: number }

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export function ContattiPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.message.length < 20) { toast.error('Scrivi almeno 20 caratteri nel messaggio'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const msg: ContactMsg = { ...form, id: generateId(), timestamp: Date.now() }
    const existing = safeRead<ContactMsg[]>('theclass_contacts', [])
    safeWrite('theclass_contacts', [msg, ...existing])
    setSent(true)
    setLoading(false)
    toast.success('Messaggio inviato!', { description: 'Ti risponderemo entro 24 ore.' })
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Contatti — the Class</title>
        <meta name="description" content="Contatta the Class per prenotazioni, informazioni su yacht, jet e esperienze luxury." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Contatti</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-4">
            Siamo qui per te.
          </h1>
          <p className="text-[#5A4F44] font-light">Risposta garantita entro 2 ore durante l'orario operativo.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: Mail, label: 'Email', value: 'concierge@theclass.it' },
              { icon: Phone, label: 'Telefono', value: '+39 02 8724 3300' },
              { icon: MapPin, label: 'Sede', value: 'Via Montenapoleone 8, Milano' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(197,160,89,0.1)] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#C5A059]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm text-[#1C1C1C]">{value}</p>
                </div>
              </div>
            ))}

            <div className="mt-8 p-5 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)]">
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-2">Orari</p>
              <p className="text-sm text-[#1C1C1C]">Lun–Ven 9:00–21:00</p>
              <p className="text-sm text-[#1C1C1C]">Sab–Dom 10:00–18:00</p>
              <p className="text-xs text-[#C5A059] mt-2">Concierge premium: 24/7</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-10 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-emerald-600" />
                </div>
                <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">
                  Messaggio ricevuto!
                </h2>
                <p className="text-sm text-[#5A4F44] font-light">
                  Il nostro team ti contatterà a <strong>{form.email}</strong> entro 24 ore.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
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
                        onBlur={() => setTouched(p => ({ ...p, [f.key]: true }))}
                        placeholder={f.placeholder}
                        className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                      />
                      {f.key === 'email' && touched.email && form.email && !isValidEmail(form.email) && (
                        <p className="text-xs text-red-500 mt-1">Email non valida</p>
                      )}
                      {f.key === 'email' && touched.email && form.email && isValidEmail(form.email) && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">✓ Email valida</p>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Oggetto</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Richiesta preventivo yacht..."
                    className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Messaggio *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Descrivici la tua richiesta..."
                    className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ripple w-full bg-[#C5A059] text-white py-3.5 rounded-xl text-sm hover:bg-[#b8924a] transition-colors disabled:opacity-60"
                >
                  {loading ? 'Invio...' : 'Invia Messaggio'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
