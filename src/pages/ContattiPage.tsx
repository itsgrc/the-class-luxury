// src/pages/ContattiPage.tsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, Check, Zap, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { generateId } from '@/lib/utils'
import { safeWrite, safeRead } from '@/lib/errorHandler'

interface ContactMsg {
  id: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  priority: string
  preferredContact: string
  timestamp: number
}

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

const QUICK_SUBJECTS = ['Preventivo yacht', 'Noleggio jet', 'Evento privato', 'Partnership']

const DRAFT_KEY = 'theclass_contact_draft'

// 2. Office hours configuration
const OFFICE_HOURS: Record<string, { open: number; close: number; tz: number }> = {
  Milano:    { open: 9,  close: 18, tz: 1 },
  Monaco:    { open: 9,  close: 18, tz: 1 },
  Dubai:     { open: 10, close: 19, tz: 4 },
  Singapore: { open: 9,  close: 17, tz: 8 },
}

function isOfficeOpen(city: string): boolean {
  const cfg = OFFICE_HOURS[city]
  if (!cfg) return false
  const now = new Date()
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60
  const localHour = (utcHour + cfg.tz) % 24
  return localHour >= cfg.open && localHour < cfg.close
}

// 6. Appointment slots for next 2 days
function getAppointmentSlots(): { label: string; time: string }[] {
  const slots: { label: string; time: string }[] = []
  const days = ['Domani', 'Dopodomani']
  const hours = ['10:00', '11:30', '14:00', '16:30']
  days.forEach(day => hours.forEach(h => slots.push({ label: day, time: h })))
  return slots
}

const APPOINTMENT_SLOTS = getAppointmentSlots()

// 9. Response time badge
function getResponseBadge(): string {
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0=Sun, 6=Sat
  const hourUTC = now.getUTCHours()
  const milanoHour = hourUTC + 1 // approx CET
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const isOutOfHours = milanoHour < 9 || milanoHour >= 21
  if (isWeekend) return 'Risposta entro lunedì mattina'
  if (isOutOfHours) return 'Risposta entro domani mattina'
  return '< 2h in orario lavorativo'
}

export function ContattiPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'Normal',
    preferredContact: 'Email',
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [draftRestored, setDraftRestored] = useState(false)

  // 4. File attachment
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 7. Language selector
  const [lang, setLang] = useState<'it' | 'en' | 'ar'>('it')
  const PLACEHOLDERS: Record<typeof lang, { name: string; email: string; subject: string; message: string }> = {
    it: { name: 'Alessandro Bianchi', email: 'a@example.com', subject: 'Richiesta preventivo yacht...', message: 'Descrivici la tua richiesta...' },
    en: { name: 'John Smith', email: 'j@example.com', subject: 'Request for yacht quote...', message: 'Describe your request...' },
    ar: { name: 'محمد علي', email: 'a@example.com', subject: 'طلب عرض أسعار...', message: 'صف طلبك...' },
  }
  const ph = PLACEHOLDERS[lang]

  // 6. Selected appointment slot
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // 10. Preview mode
  const [showPreview, setShowPreview] = useState(false)

  // 9. Live response badge
  const [responseBadge, setResponseBadge] = useState(getResponseBadge())
  useEffect(() => {
    const t = setInterval(() => setResponseBadge(getResponseBadge()), 60000)
    return () => clearInterval(t)
  }, [])

  // Restore draft on mount
  useEffect(() => {
    const draft = safeRead<typeof form | null>(DRAFT_KEY, null)
    if (draft && (draft.name || draft.email || draft.subject || draft.message)) {
      setForm(prev => ({ ...prev, ...draft }))
      if (!draftRestored) {
        setDraftRestored(true)
        toast.info('Bozza ripristinata', { description: 'Abbiamo recuperato il tuo messaggio precedente.' })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save draft on change
  useEffect(() => {
    if (sent) return
    safeWrite(DRAFT_KEY, form)
  }, [form, sent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (showPreview) {
      // Actually send
      if (form.message.length < 20) { toast.error('Scrivi almeno 20 caratteri nel messaggio'); return }
      setLoading(true)
      await new Promise(r => setTimeout(r, 800))
      const msg: ContactMsg = {
        ...form,
        phone: form.phone || undefined,
        id: generateId(),
        timestamp: Date.now(),
      }
      const existing = safeRead<ContactMsg[]>('theclass_contacts', [])
      safeWrite('theclass_contacts', [msg, ...existing])
      safeWrite(DRAFT_KEY, { name: '', email: '', phone: '', subject: '', message: '', priority: 'Normal', preferredContact: 'Email' })
      setSent(true)
      setLoading(false)
      setShowPreview(false)
      toast.success('Messaggio inviato!', { description: 'Ti risponderemo entro 2 ore.' })
    } else {
      if (form.message.length < 20) { toast.error('Scrivi almeno 20 caratteri nel messaggio'); return }
      setShowPreview(true)
    }
  }

  const PRIORITIES = [
    { value: 'Normal', label: 'Normale', note: null },
    { value: 'Urgente', label: 'Urgente (entro 24h)', note: '+€50 gestione prioritaria' },
    { value: 'Critica', label: 'Critica (entro 4h)', note: '+€50 gestione prioritaria' },
  ]

  const CONTACT_METHODS = ['Email', 'Telefono', 'WhatsApp', 'Zoom']
  const LANGS: { code: typeof lang; flag: string; label: string }[] = [
    { code: 'it', flag: '🇮🇹', label: 'Italiano' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'ar', flag: '🇦🇪', label: 'العربية' },
  ]

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
          {/* Response time guarantee pill */}
          <span className="inline-flex items-center gap-1.5 bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] text-[#C5A059] text-xs px-4 py-2 rounded-full font-medium">
            <Zap size={12} className="fill-[#C5A059]" />
            Risposta garantita entro 2h
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info sidebar */}
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

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/390287243300"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#1ebe5a] transition-colors w-full justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
              Scrivici su WhatsApp
            </a>

            <div className="p-5 bg-white rounded-2xl border border-[rgba(197,160,89,0.15)]">
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-2">Orari</p>
              <p className="text-sm text-[#1C1C1C]">Lun–Ven 9:00–21:00</p>
              <p className="text-sm text-[#1C1C1C]">Sab–Dom 10:00–18:00</p>
              <p className="text-xs text-[#C5A059] mt-2">Concierge premium: 24/7</p>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              <a href="#" className="flex items-center gap-2 text-xs text-[#5A4F44] bg-white border border-[rgba(197,160,89,0.2)] rounded-xl px-4 py-2.5 hover:border-[#C5A059] transition-colors">
                <span className="text-[#C5A059] text-[10px] font-bold">in</span> LinkedIn
              </a>
              <a href="#" className="flex items-center gap-2 text-xs text-[#5A4F44] bg-white border border-[rgba(197,160,89,0.2)] rounded-xl px-4 py-2.5 hover:border-[#C5A059] transition-colors">
                <span className="text-[#C5A059] text-sm font-bold">IG</span> Instagram
              </a>
            </div>

            {/* FAQ quick link */}
            <Link to="/faq" className="flex items-center gap-1 text-sm text-[#C5A059] hover:underline underline-offset-2">
              Consulta le FAQ →
            </Link>

            {/* 2. Sedi con "Aperto ora" indicator */}
            <div>
              <p className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2">Sedi</p>
              <div className="flex flex-col gap-2">
                {Object.keys(OFFICE_HOURS).map(city => {
                  const open = isOfficeOpen(city)
                  return (
                    <div key={city} className="flex items-center justify-between text-xs bg-white border border-[rgba(197,160,89,0.15)] px-3 py-2 rounded-xl">
                      <span className="text-[#1C1C1C]">{city}</span>
                      <span className={`flex items-center gap-1.5 ${open ? 'text-emerald-600' : 'text-[#5A4F44]/50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-500' : 'bg-[#5A4F44]/30'}`} />
                        {open ? 'Aperto ora' : 'Chiuso'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 9. Live response badge */}
            <div className="flex items-center gap-2 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-xl px-4 py-3">
              <Zap size={13} className="text-[#C5A059] shrink-0" />
              <p className="text-xs text-[#5A4F44]">{responseBadge}</p>
            </div>

            {/* 3. Static map placeholder */}
            <div className="h-48 bg-[#E8E0D4] rounded-2xl flex flex-col items-center justify-center gap-2 border border-[rgba(197,160,89,0.15)]">
              <span className="text-2xl">📍</span>
              <p className="text-xs text-[#5A4F44] font-medium text-center">Via Montenapoleone 8, Milano</p>
              <a
                href="https://maps.google.com?q=Via+Montenapoleone+8+Milano"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#C5A059] hover:underline underline-offset-2"
              >
                Apri in Maps →
              </a>
            </div>

            {/* 6. Appointment picker */}
            <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-5">
              <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-3">Prenota una call</p>
              <div className="grid grid-cols-2 gap-2">
                {APPOINTMENT_SLOTS.map(slot => {
                  const key = `${slot.label} ${slot.time}`
                  const isSelected = selectedSlot === key
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedSlot(key)
                        toast.success(`Slot prenotato: ${slot.label} alle ${slot.time}`)
                      }}
                      className={`text-xs px-3 py-2 rounded-xl border transition-colors text-left ${
                        isSelected
                          ? 'bg-[#C5A059] text-white border-[#C5A059]'
                          : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059]'
                      }`}
                    >
                      <p className="font-medium">{slot.label}</p>
                      <p className={isSelected ? 'text-white/80' : 'text-[#C5A059]'}>{slot.time}</p>
                    </button>
                  )
                })}
              </div>
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
                  Grazie, {form.name.split(' ')[0]}!
                </h2>
                <p className="text-sm text-[#5A4F44] font-light mb-6">
                  Il nostro team ti contatterà a <strong>{form.email}</strong> entro 2 ore.
                </p>
                <Link
                  to="/concierge"
                  className="inline-flex items-center gap-2 bg-[#C5A059] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors mb-4"
                >
                  Vai al Concierge
                </Link>
                <p className="text-xs text-[#5A4F44] mt-4">
                  Siamo disponibili anche su{' '}
                  <a href="https://wa.me/390287243300" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-medium">
                    WhatsApp
                  </a>
                </p>
              </motion.div>
            ) : showPreview ? (
              /* 10. Inline preview */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]">Anteprima messaggio</h2>
                  <button onClick={() => setShowPreview(false)} className="text-[#5A4F44] hover:text-[#C5A059]">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3 bg-[#FDF9F2] rounded-xl p-5 mb-6 text-sm text-[#5A4F44]">
                  <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Nome</span><span className="text-[#1C1C1C]">{form.name}</span></div>
                  <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Email</span><span className="text-[#1C1C1C]">{form.email}</span></div>
                  {form.phone && <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Telefono</span><span className="text-[#1C1C1C]">{form.phone}</span></div>}
                  <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Oggetto</span><span className="text-[#1C1C1C]">{form.subject || '—'}</span></div>
                  <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Priorità</span><span className="text-[#1C1C1C]">{form.priority}</span></div>
                  <div className="flex gap-2"><span className="text-[#5A4F44]/50 w-24 shrink-0">Contatto</span><span className="text-[#1C1C1C]">{form.preferredContact}</span></div>
                  <div className="flex gap-2 pt-2 border-t border-[rgba(197,160,89,0.1)]">
                    <span className="text-[#5A4F44]/50 w-24 shrink-0">Messaggio</span>
                    <span className="text-[#1C1C1C] leading-relaxed">{form.message}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 border border-[rgba(197,160,89,0.3)] text-[#5A4F44] py-3 rounded-xl text-sm hover:border-[#C5A059] transition-colors"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    disabled={loading}
                    className="flex-1 bg-[#C5A059] text-white py-3 rounded-xl text-sm hover:bg-[#b8924a] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Invio...' : 'Conferma e invia'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-8 space-y-5">
                {/* 7. Language selector */}
                <div className="flex justify-end">
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value as typeof lang)}
                    className="text-xs bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3 py-1.5 text-[#5A4F44] focus:outline-none focus:border-[#C5A059] transition-colors"
                  >
                    {LANGS.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                    ))}
                  </select>
                </div>

                {/* Quick subject chips */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Seleziona argomento</label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUBJECTS.map(subj => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, subject: subj }))}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.subject === subj
                            ? 'bg-[#C5A059] text-white border-[#C5A059]'
                            : 'bg-[#FDF9F2] text-[#5A4F44] border-[rgba(197,160,89,0.3)] hover:border-[#C5A059]'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Nome *', type: 'text', placeholder: ph.name },
                    { key: 'email', label: 'Email *', type: 'email', placeholder: ph.email },
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
                        <p className="text-xs text-emerald-600 mt-1">✓ Email valida</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* 1. Phone number */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Telefono (opzionale)</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C5A059]" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+39 333 1234567"
                      className="w-full pl-9 bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Oggetto</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder={ph.subject}
                    className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-1.5 block">Messaggio *</label>
                  <textarea
                    required
                    rows={5}
                    maxLength={1000}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder={ph.message}
                    className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                  <p className={`text-[11px] text-right mt-0.5 ${form.message.length > 900 ? 'text-amber-500' : 'text-[#5A4F44]/50'}`}>
                    {form.message.length}/1000
                  </p>
                </div>

                {/* 5. Priority selector */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Priorità richiesta</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.priority === p.value
                            ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                            : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {(form.priority === 'Urgente' || form.priority === 'Critica') && (
                    <p className="text-[10px] text-amber-600 mt-1.5">
                      {PRIORITIES.find(p => p.value === form.priority)?.note}
                    </p>
                  )}
                </div>

                {/* 8. Contact method preference */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Preferisci essere contattato via</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_METHODS.map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, preferredContact: method }))}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.preferredContact === method
                            ? 'bg-[#C5A059] text-white border-[#C5A059]'
                            : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. File attachment */}
                <div>
                  <label className="text-[10px] text-[#5A4F44] uppercase tracking-wider mb-2 block">Allega documento (opzionale)</label>
                  {attachedFile ? (
                    <div className="flex items-center gap-2 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-xl px-4 py-2.5">
                      <span className="text-xs text-[#5A4F44] flex-1 truncate">{attachedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => { setAttachedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                        className="text-[#5A4F44]/50 hover:text-red-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-[rgba(197,160,89,0.3)] rounded-xl px-4 py-3 text-xs text-[#5A4F44]/60 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors text-center"
                    >
                      + Clicca per allegare PDF, JPG o PNG
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => { if (e.target.files?.[0]) setAttachedFile(e.target.files[0]) }}
                  />
                </div>

                {/* 10. Preview + submit */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (form.message.length < 20) { toast.error('Scrivi almeno 20 caratteri nel messaggio'); return }
                      setShowPreview(true)
                    }}
                    className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors"
                  >
                    <Eye size={14} /> Anteprima
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ripple flex-1 bg-[#C5A059] text-white py-3.5 rounded-xl text-sm hover:bg-[#b8924a] transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Invio...' : 'Invia Messaggio'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
