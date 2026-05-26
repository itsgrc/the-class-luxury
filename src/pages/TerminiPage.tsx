// src/pages/TerminiPage.tsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Search, Printer, ChevronUp, MessageCircle, Shield, CreditCard, FileText, Lock, Copyright, Scale, Package, Users, Bookmark, CheckCircle, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTION_ICONS = [Users, FileText, Package, Shield, CreditCard, Lock, Copyright, Scale, FileText, MessageCircle]

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
  // NEW 1. Two new sections
  {
    id: 'modifiche',
    title: '9. Modifiche alla Piattaforma',
    content: `The Class si riserva il diritto di modificare, sospendere o interrompere, in qualsiasi momento e senza preavviso, qualsiasi funzionalità della Piattaforma. Modifiche significative che impattano i Servizi attivi saranno comunicate agli Utenti registrati via email con almeno 30 giorni di preavviso. The Class non sarà responsabile nei confronti degli Utenti o di terzi per qualsiasi modifica, sospensione o interruzione dei Servizi.`,
  },
  {
    id: 'contatti',
    title: '10. Contatti e Reclami',
    content: `Per qualsiasi richiesta, reclamo o segnalazione relativa ai presenti Termini o ai Servizi offerti, l'Utente può contattare the Class ai seguenti recapiti: Email: legal@the-class.it | Indirizzo: Via Montenapoleone 8, 20121 Milano (MI), Italia | Telefono: +39 02 1234 5678. I reclami scritti saranno trattati entro 30 giorni lavorativi dalla ricezione. Per controversie di consumo è possibile ricorrere alla piattaforma ODR della Commissione Europea disponibile all'indirizzo ec.europa.eu/consumers/odr.`,
  },
]

// NEW 3. Version history
const VERSION_HISTORY = [
  { version: 'v1.0', date: '2023-01-01', note: 'Prima versione pubblica dei Termini di Servizio' },
  { version: 'v1.1', date: '2024-03-15', note: 'Aggiunta sezione GDPR e privacy avanzata' },
  { version: 'v1.2', date: '2025-01-01', note: 'Aggiornamento clausole cancellazione e rimborsi' },
]

// NEW 7. Glossary terms
const GLOSSARY: Record<string, string> = {
  'Asset': 'Yacht, aeromobili, autoveicoli ed esperienze nel catalogo the Class',
  'Piattaforma': 'Il sito web e i servizi digitali di the Class S.r.l.',
  'Utente': 'Qualsiasi persona fisica o giuridica che accede ai Servizi',
}

const KEY_POINTS = [
  { icon: '🔒', text: 'Dati GDPR-compliant, mai ceduti a terzi' },
  { icon: '↩️', text: 'Cancellazione gratuita fino a 48h prima' },
  { icon: '⚖️', text: 'Foro esclusivo: Tribunale di Milano' },
]

// NEW 5. Total words for reading time
const totalWords = SECTIONS.reduce((acc, s) => acc + s.content.split(' ').length, 0)
const readingMinutes = Math.ceil(totalWords / 200)

// NEW 7. Render content with glossary tooltips
function renderWithGlossary(content: string): React.ReactNode[] {
  const terms = Object.keys(GLOSSARY)
  const pattern = new RegExp(`(${terms.join('|')})`, 'g')
  const parts = content.split(pattern)
  return parts.map((part, i) =>
    GLOSSARY[part]
      ? <abbr key={i} title={GLOSSARY[part]} className="border-b border-dashed border-[#C5A059] cursor-help no-underline text-[#1C1C1C]">{part}</abbr>
      : part
  )
}

export function TerminiPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string>('')
  const [showTop, setShowTop] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // NEW 2. Terms accepted
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem('theclass_terms_accepted') !== null
  })
  const [acceptedAt, setAcceptedAt] = useState<string | null>(() => {
    return localStorage.getItem('theclass_terms_accepted')
  })
  const [showAcceptCheck, setShowAcceptCheck] = useState(false)

  // NEW 3. Version history collapsed
  const [showHistory, setShowHistory] = useState(false)

  // NEW 4. Language toggle
  const [lang, setLang] = useState<'IT' | 'EN'>('IT')

  // NEW 6. Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('theclass_terms_bookmarks') ?? '[]') } catch { return [] }
  })

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

  // NEW 2. Accept terms
  const acceptTerms = () => {
    const ts = new Date().toLocaleString('it-IT')
    localStorage.setItem('theclass_terms_accepted', ts)
    setTermsAccepted(true)
    setAcceptedAt(ts)
    setShowAcceptCheck(true)
    setTimeout(() => setShowAcceptCheck(false), 3000)
  }

  // NEW 6. Toggle bookmark
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem('theclass_terms_bookmarks', JSON.stringify(next))
      return next
    })
  }

  // NEW 8. Download as txt
  const downloadTxt = () => {
    const text = SECTIONS.map(s => `${s.title}\n\n${s.content}`).join('\n\n─────────────────────\n\n')
    const blob = new Blob([`TERMINI DI SERVIZIO — the Class\nVersione 1.2 — 1 gennaio 2025\n\n${text}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'termini-di-servizio-theclass.txt'
    a.click()
    URL.revokeObjectURL(url)
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

              {/* NEW 10. Accepted timestamp in ToC */}
              {termsAccepted && acceptedAt && (
                <div className="mb-3 px-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[9px] text-emerald-600 leading-tight">
                    Hai accettato il {acceptedAt}
                  </p>
                </div>
              )}

              <nav className="space-y-1">
                {SECTIONS.map(s => {
                  const isBookmarked = bookmarks.includes(s.id)
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <button
                        onClick={() => scrollTo(s.id)}
                        className={cn(
                          'flex-1 text-left text-xs px-3 py-2 rounded-lg transition-colors',
                          activeSection === s.id
                            ? 'bg-[rgba(197,160,89,0.12)] text-[#C5A059] font-medium'
                            : 'text-[#5A4F44] hover:text-[#C5A059] hover:bg-[rgba(197,160,89,0.06)]'
                        )}
                      >
                        {s.title}
                      </button>
                      {/* NEW 6. Bookmark icon in ToC */}
                      <button
                        onClick={() => toggleBookmark(s.id)}
                        className="p-1 rounded shrink-0"
                        title={isBookmarked ? 'Rimuovi segnalibro' : 'Aggiungi segnalibro'}
                      >
                        <Bookmark
                          size={10}
                          className={isBookmarked ? 'text-[#C5A059] fill-current' : 'text-[#5A4F44]/30 hover:text-[#C5A059]'}
                        />
                      </button>
                    </div>
                  )
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-[rgba(197,160,89,0.15)] space-y-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
                >
                  <Printer size={13} />
                  Stampa / PDF
                </button>
                {/* NEW 8. Download txt */}
                <button
                  onClick={downloadTxt}
                  className="flex items-center gap-2 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
                >
                  <FileText size={13} />
                  Scarica .txt
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em]">Legale</p>
                {/* NEW 4. Language toggle */}
                <div className="flex gap-1 bg-white border border-[rgba(197,160,89,0.2)] rounded-full p-0.5">
                  {(['IT', 'EN'] as const).map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                        lang === l ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:text-[#C5A059]',
                      )}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-3">
                Termini di Servizio
              </h1>

              {/* NEW 4. EN notice */}
              {lang === 'EN' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                  The English version of these Terms is available upon request at{' '}
                  <a href="mailto:legal@the-class.it" className="underline font-medium">legal@the-class.it</a>
                </motion.div>
              )}

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm text-[#5A4F44] font-light">
                  Ultimo aggiornamento:{' '}
                  <span className="text-[#C5A059] font-medium">1 gennaio 2025</span>
                </span>
                {/* NEW 5. Reading time */}
                <span className="text-xs text-[#5A4F44]/60">
                  Tempo di lettura: ~{readingMinutes} min
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
              className="mb-6 p-5 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-2xl"
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

            {/* NEW 3. Version history collapsible */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-6"
            >
              <button
                onClick={() => setShowHistory(v => !v)}
                className="flex items-center gap-2 text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors"
              >
                <ChevronDown size={12} className={cn('transition-transform', showHistory && 'rotate-180')} />
                Storico versioni
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pl-4 border-l-2 border-[rgba(197,160,89,0.2)] space-y-2">
                      {VERSION_HISTORY.map(v => (
                        <div key={v.version} className="text-xs">
                          <span className="font-medium text-[#C5A059] font-[family-name:var(--font-family-mono)]">{v.version}</span>
                          <span className="text-[#5A4F44]/60 mx-2">{v.date}</span>
                          <span className="text-[#5A4F44]">{v.note}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <button onClick={() => setSearch('')}
                    className="mt-3 text-xs text-[#C5A059] underline underline-offset-2">
                    Azzera ricerca
                  </button>
                </div>
              ) : (
                filtered.map((s, i) => {
                  const Icon = SECTION_ICONS[SECTIONS.indexOf(s)] ?? FileText
                  const isBookmarked = bookmarks.includes(s.id)
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
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C]">
                              {s.title}
                            </h2>
                            {/* NEW 6. Bookmark button on section title */}
                            <button
                              onClick={() => toggleBookmark(s.id)}
                              title={isBookmarked ? 'Rimuovi segnalibro' : 'Aggiungi segnalibro'}
                              className="p-1 rounded shrink-0 mt-0.5"
                            >
                              <Bookmark
                                size={14}
                                className={isBookmarked ? 'text-[#C5A059] fill-current' : 'text-[#5A4F44]/30 hover:text-[#C5A059] transition-colors'}
                              />
                            </button>
                          </div>
                          {/* NEW 7. Glossary tooltips + search highlight */}
                          <p className="text-sm text-[#5A4F44] font-light leading-relaxed">
                            {search ? (
                              s.content.split(new RegExp(`(${search})`, 'gi')).map((part, j) =>
                                part.toLowerCase() === search.toLowerCase()
                                  ? <mark key={j} className="bg-[rgba(197,160,89,0.25)] rounded-sm">{part}</mark>
                                  : part
                              )
                            ) : renderWithGlossary(s.content)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* NEW 9. Related pages strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 grid sm:grid-cols-3 gap-4"
            >
              {[
                { label: 'FAQ', href: '/faq', desc: 'Domande frequenti su servizi e prenotazioni', icon: '❓' },
                { label: 'Privacy Policy', href: '/', desc: 'Trattamento dati — disponibile a breve', icon: '🔒' },
                { label: 'Cookie Policy', href: '/', desc: 'Informativa cookie — disponibile a breve', icon: '🍪' },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.href as '/'}
                  className="block p-4 bg-white border border-[rgba(197,160,89,0.15)] rounded-xl hover:border-[#C5A059] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{link.icon}</span>
                    <span className="text-xs font-medium text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors">{link.label}</span>
                    <ExternalLink size={10} className="text-[#5A4F44]/40 ml-auto" />
                  </div>
                  <p className="text-[10px] text-[#5A4F44] font-light">{link.desc}</p>
                </Link>
              ))}
            </motion.div>

            {/* Contact strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 bg-[#1C1C1C] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-5"
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

      {/* NEW 2. Accept terms sticky banner */}
      <AnimatePresence>
        {!termsAccepted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-[#1C1C1C] border-t border-[rgba(197,160,89,0.2)] px-6 py-4"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-white/80 font-light">
                Hai letto i Termini di Servizio di <span className="text-[#C5A059]">the Class</span>?
              </p>
              <button
                onClick={acceptTerms}
                className="flex items-center gap-2 bg-[#C5A059] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors shrink-0"
              >
                <CheckCircle size={14} />
                Accetto i Termini
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accept success animation */}
      <AnimatePresence>
        {showAcceptCheck && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-lg text-sm font-medium"
          >
            <CheckCircle size={16} />
            Termini accettati
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-6 z-50 w-10 h-10 bg-[#1C1C1C] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a2a2a] transition-colors"
        >
          <ChevronUp size={16} />
        </button>
      )}
    </div>
  )
}
