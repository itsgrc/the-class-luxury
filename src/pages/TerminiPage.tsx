// src/pages/TerminiPage.tsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Search, Printer, ChevronUp, MessageCircle, Shield, CreditCard, FileText, Lock, Copyright, Scale, Package, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTION_ICONS = [Users, FileText, Package, Shield, CreditCard, Lock, Copyright, Scale]

const SECTIONS = [
  {
    id: 'definizioni',
    title: '1. Definizioni',
    content: `"the Class" (o "Piattaforma") indica the Class S.r.l., società con sede in Via Montenapoleone 8, 20121 Milano, P.IVA 12345678901. "Utente" indica qualsiasi persona fisica o giuridica che accede alla Piattaforma. "Servizi" indica i servizi di noleggio, prenotazione e concierge resi disponibili tramite la Piattaforma. "Asset" indica yacht, aeromobili, autoveicoli ed esperienze presenti nel catalogo.`,
  },
  {
    id: 'accettazione',
    title: '2. Accettazione dei Termini',
    content: `L'utilizzo della Piattaforma implica l'accettazione integrale dei presenti Termini. The Class si riserva il diritto di modificarli in qualsiasi momento con comunicazione via email agli Utenti registrati. L'uso continuato della Piattaforma dopo la notifica delle modifiche costituisce accettazione delle stesse.`,
  },
  {
    id: 'servizi',
    title: '3. Servizi Offerti',
    content: `The Class è una piattaforma di intermediazione tra Utenti e fornitori di servizi luxury. Non è proprietaria degli Asset elencati, salvo diversa indicazione. La Piattaforma facilita la comunicazione tra Utenti e operatori certificati, ma non garantisce la disponibilità degli Asset per date specifiche. Ogni prenotazione è soggetta a conferma da parte dell'operatore.`,
  },
  {
    id: 'responsabilita',
    title: '4. Responsabilità e Limitazioni',
    content: `The Class non è responsabile per: danni diretti, indiretti o consequenziali derivanti dall'utilizzo degli Asset; cancellazioni o modifiche imposte da cause di forza maggiore; differenze tra descrizioni e condizioni effettive degli Asset. La responsabilità massima della Piattaforma è limitata alle commissioni effettivamente percepite nella singola transazione.`,
  },
  {
    id: 'pagamenti',
    title: '5. Pagamenti e Cancellazioni',
    content: `Il pagamento è richiesto al momento della conferma della prenotazione tramite i metodi indicati. Le politiche di cancellazione variano per ciascun Asset e sono indicate nella scheda del servizio. In assenza di indicazioni specifiche, si applica la politica standard: cancellazione gratuita fino a 48 ore dalla data di inizio, 50% trattenuto tra 48h e 24h, nessun rimborso nelle ultime 24 ore.`,
  },
  {
    id: 'privacy',
    title: '6. Privacy e Dati Personali',
    content: `Il trattamento dei dati personali è disciplinato dalla Privacy Policy di the Class, disponibile su richiesta. I dati sono trattati in conformità al GDPR (Reg. UE 2016/679). The Class non cede dati a terzi senza consenso esplicito dell'Utente, ad eccezione dei fornitori necessari all'erogazione del servizio prenotato.`,
  },
  {
    id: 'proprieta',
    title: '7. Proprietà Intellettuale',
    content: `Tutti i contenuti della Piattaforma (testi, immagini, loghi, software) sono di proprietà di the Class o dei rispettivi titolari e sono protetti dalle leggi sul diritto d'autore. È vietata qualsiasi riproduzione, distribuzione o utilizzo commerciale senza autorizzazione scritta.`,
  },
  {
    id: 'foro',
    title: '8. Foro Competente',
    content: `I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'interpretazione o esecuzione dei presenti Termini, le parti concordano la competenza esclusiva del Tribunale di Milano.`,
  },
]

const KEY_POINTS = [
  { icon: '🔒', text: 'Dati GDPR-compliant, mai ceduti a terzi' },
  { icon: '↩️', text: 'Cancellazione gratuita fino a 48h prima' },
  { icon: '⚖️', text: 'Foro esclusivo: Tribunale di Milano' },
]

export function TerminiPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string>('')
  const [showTop, setShowTop] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400)
      const offsets = SECTIONS.map(s => ({
        id: s.id,
        top: sectionRefs.current[s.id]?.getBoundingClientRect().top ?? Infinity,
      }))
      const visible = offsets.filter(o => o.top < 200)
      if (visible.length > 0) setActiveSection(visible[visible.length - 1].id)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = SECTIONS.filter(s =>
    search === '' ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  )

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Termini di Servizio — the Class</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="Termini e condizioni di servizio di the Class: prenotazioni, pagamenti, privacy e responsabilità." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#5A4F44] mb-8">
          <Link to="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
          <span className="text-[#5A4F44]/40">›</span>
          <span className="text-[#C5A059]">Termini di Servizio</span>
        </nav>

        <div className="flex gap-12">
          {/* Sticky sidebar ToC — desktop only */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium mb-4">Indice</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={cn(
                      'block w-full text-left text-xs px-3 py-2 rounded-lg transition-colors',
                      activeSection === s.id
                        ? 'bg-[rgba(197,160,89,0.12)] text-[#C5A059] font-medium'
                        : 'text-[#5A4F44] hover:text-[#C5A059] hover:bg-[rgba(197,160,89,0.06)]'
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[rgba(197,160,89,0.15)]">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
                >
                  <Printer size={13} />
                  Stampa / PDF
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Legale</p>
              <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-3">
                Termini di Servizio
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-[#5A4F44] font-light">
                  Ultimo aggiornamento:{' '}
                  <span className="text-[#C5A059] font-medium">1 gennaio 2025</span>
                </span>
                <button
                  onClick={() => window.print()}
                  className="lg:hidden flex items-center gap-1.5 text-xs text-[#5A4F44] border border-[rgba(197,160,89,0.3)] px-3 py-1.5 rounded-full hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                >
                  <Printer size={12} /> Stampa
                </button>
              </div>
            </motion.div>

            {/* Key highlights strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-5 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-2xl"
            >
              <p className="text-xs text-[#C5A059] uppercase tracking-wider mb-3 font-medium">Punti chiave</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {KEY_POINTS.map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-[#5A4F44]">
                    <span className="text-base shrink-0">{icon}</span>
                    <span className="font-light leading-snug">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative mb-8"
            >
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca nel documento..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
              />
              {search && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#C5A059]">
                  {filtered.length} sezioni
                </span>
              )}
            </motion.div>

            {/* Sections */}
            <div className="space-y-6">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm text-[#5A4F44] font-light">Nessun risultato per "{search}"</p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-3 text-xs text-[#C5A059] underline underline-offset-2"
                  >
                    Azzera ricerca
                  </button>
                </div>
              ) : (
                filtered.map((s, i) => {
                  const Icon = SECTION_ICONS[SECTIONS.indexOf(s)] ?? FileText
                  return (
                    <motion.div
                      key={s.id}
                      ref={el => { sectionRefs.current[s.id] = el }}
                      id={s.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'bg-white rounded-2xl border p-7 scroll-mt-28 transition-colors',
                        activeSection === s.id
                          ? 'border-[rgba(197,160,89,0.4)] shadow-[0_4px_20px_rgba(197,160,89,0.08)]'
                          : 'border-[rgba(197,160,89,0.12)]'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(197,160,89,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={16} className="text-[#C5A059]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-3">
                            {s.title}
                          </h2>
                          <p className="text-sm text-[#5A4F44] font-light leading-relaxed">
                            {search ? (
                              s.content.split(new RegExp(`(${search})`, 'gi')).map((part, j) =>
                                part.toLowerCase() === search.toLowerCase()
                                  ? <mark key={j} className="bg-[rgba(197,160,89,0.25)] rounded-sm">{part}</mark>
                                  : part
                              )
                            ) : s.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Contact strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 bg-[#1C1C1C] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-5"
            >
              <div>
                <p className="text-white font-[family-name:var(--font-family-display)] text-lg mb-1">
                  Hai domande sui termini?
                </p>
                <p className="text-white/50 text-sm font-light">
                  Il nostro team legale risponde entro 24 ore.
                </p>
              </div>
              <Link
                to="/contatti"
                className="flex items-center gap-2 bg-[#C5A059] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors shrink-0"
              >
                <MessageCircle size={14} />
                Contattaci
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-6 z-50 w-10 h-10 bg-[#1C1C1C] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <ChevronUp size={16} />
        </button>
      )}
    </div>
  )
}
