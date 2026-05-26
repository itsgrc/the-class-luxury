// src/pages/FaqPage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search, MessageCircle, Share2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { safeRead, safeWrite } from '@/lib/errorHandler'

type FaqCategory = 'Prenotazioni' | 'Pagamenti' | 'Privacy' | 'Servizi'
type Complexity = 'semplice' | 'dettagliata'

interface Faq {
  q: string
  a: string
  category: FaqCategory
  complexity: Complexity
  quickAnswer?: boolean
  relatedLink?: { label: string; to: string }
}

const FAQS: Faq[] = [
  {
    q: 'Come funziona la prenotazione?',
    a: 'Seleziona il servizio desiderato, scegli le date e invia la richiesta tramite il modulo. Il nostro team conferma la disponibilità entro 2 ore e ti invia un preventivo dettagliato. La conferma definitiva avviene con il pagamento.',
    category: 'Prenotazioni',
    complexity: 'semplice',
    quickAnswer: true,
    relatedLink: { label: 'Vedi anche: Servizi', to: '/servizi' },
  },
  {
    q: 'I prezzi sono definitivi o possono variare?',
    a: 'I prezzi mostrati sono la base indicativa. Il preventivo finale include stagionalità, eventuali upgrade selezionati, carburante (per yacht) e tasse locali. Il preventivo è bloccato per 48 ore dalla ricezione.',
    category: 'Pagamenti',
    complexity: 'dettagliata',
    relatedLink: { label: 'Vedi anche: Pacchetti', to: '/pacchetti' },
  },
  {
    q: 'Quali metodi di pagamento accettate?',
    a: 'Accettiamo bonifico bancario SEPA, carta di credito (Visa, Mastercard, Amex) e SWIFT per pagamenti internazionali. Per importi superiori a €50.000 è disponibile il pagamento in criptovalute su richiesta.',
    category: 'Pagamenti',
    complexity: 'semplice',
    quickAnswer: true,
    relatedLink: { label: 'Vedi anche: Pacchetti', to: '/pacchetti' },
  },
  {
    q: 'Posso cancellare o modificare una prenotazione?',
    a: "Sì. La politica standard prevede cancellazione gratuita fino a 48 ore prima della partenza, con trattenuta del 50% tra 48h e 24h. Per i servizi con politica diversa (indicata nella scheda), si applicano i termini specifici dell'operatore.",
    category: 'Prenotazioni',
    complexity: 'dettagliata',
    quickAnswer: true,
    relatedLink: { label: 'Vedi anche: Termini', to: '/termini' },
  },
  {
    q: 'Il servizio concierge è incluso in tutte le prenotazioni?',
    a: "Il concierge di base (gestione richiesta, comunicazione con l'operatore, documentazione) è incluso in ogni prenotazione. Il concierge premium 24/7 con gestione completa del soggiorno è disponibile separatamente o incluso negli abbonamenti Platinum.",
    category: 'Servizi',
    complexity: 'dettagliata',
    relatedLink: { label: 'Vedi anche: Concierge', to: '/concierge' },
  },
  {
    q: 'Come vengono selezionati gli operatori e gli asset?',
    a: 'Ogni operatore viene verificato fisicamente dal nostro team: visita dell\'asset, controllo documentazione e assicurazioni, test del servizio. Meno del 3% degli asset proposti supera la selezione. I partner vengono rivalutati annualmente.',
    category: 'Servizi',
    complexity: 'dettagliata',
    relatedLink: { label: 'Vedi anche: Chi Siamo', to: '/chi-siamo' },
  },
  {
    q: 'I miei dati personali sono al sicuro?',
    a: 'Assolutamente. Tutti i dati sono protetti in conformità al GDPR. Non condividiamo informazioni con terze parti senza consenso esplicito. I nostri server sono in Europa e utilizziamo crittografia end-to-end per le comunicazioni sensibili.',
    category: 'Privacy',
    complexity: 'semplice',
    relatedLink: { label: 'Vedi anche: Termini & Privacy', to: '/termini' },
  },
  {
    q: 'È possibile richiedere servizi non presenti in catalogo?',
    a: 'Sì! La sezione "Su Misura" permette di descrivere qualunque desiderio: dal viaggio di nozze in luoghi segreti alle esperienze sportive estreme, dall\'affitto di luoghi privati storici alla gestione di eventi aziendali esclusivi.',
    category: 'Prenotazioni',
    complexity: 'semplice',
    relatedLink: { label: 'Vedi anche: Su Misura', to: '/richiesta-su-misura' },
  },
  // 1. Four new FAQs
  {
    q: 'Come funziona l\'abbonamento Club?',
    a: "L'abbonamento Club the Class offre accesso prioritario a tutti i servizi, tariffe preferenziali, concierge dedicato 24/7 e inviti esclusivi a eventi privati. Sono disponibili tre livelli: Silver, Gold e Platinum. L'attivazione avviene entro 24h dalla sottoscrizione.",
    category: 'Servizi',
    complexity: 'dettagliata',
    relatedLink: { label: 'Vedi anche: Concierge', to: '/concierge' },
  },
  {
    q: 'Posso portare animali a bordo dello yacht?',
    a: 'La politica varia per ogni imbarcazione. Alcuni armatori accettano animali domestici di piccola taglia (max 10 kg) con deposito cauzionale aggiuntivo di €500. È necessario indicarlo al momento della richiesta. Su yacht di dimensioni superiori ai 30m sono generalmente ammessi con accordo scritto.',
    category: 'Prenotazioni',
    complexity: 'semplice',
  },
  {
    q: 'Quali assicurazioni sono incluse?',
    a: 'Tutte le prenotazioni includono una copertura base di responsabilità civile. Per yacht e jet privati è inclusa la polizza passeggeri. Raccomandiamo tuttavia di stipulare un\'assicurazione viaggio personalizzata (annullamento, medica, bagaglio) che possiamo procurare tramite i nostri partner Lloyd\'s.',
    category: 'Pagamenti',
    complexity: 'dettagliata',
  },
  {
    q: 'Offrite servizi in lingue straniere?',
    a: 'Il nostro team parla fluentemente italiano, inglese, francese, arabo e mandarino. Il concierge è disponibile in tutte queste lingue 24/7. Possiamo inoltre coordinare interpreti professionali per eventi o meeting in qualsiasi lingua su richiesta.',
    category: 'Servizi',
    complexity: 'semplice',
  },
]

// Related FAQs per categoria (hardcoded)
const RELATED_BY_CATEGORY: Record<FaqCategory, number[]> = {
  Prenotazioni: [0, 3, 7, 8],
  Pagamenti: [1, 2, 10],
  Privacy: [6],
  Servizi: [4, 5, 8, 11],
}

// Glossary terms
const GLOSSARY = [
  { term: 'Asset', def: 'Bene di lusso noleggiabile: yacht, jet privato, villa o esperienza curata.' },
  { term: 'Fractional ownership', def: 'Proprietà condivisa di un asset di alto valore tra più soci, con diritto d\'uso proporzionale.' },
  { term: 'HNWI', def: 'High Net Worth Individual: persona con patrimonio netto superiore a $1 milione, esclusa la residenza principale.' },
  { term: 'NDA', def: 'Non-Disclosure Agreement: accordo di riservatezza firmato da tutti i nostri operatori e fornitori.' },
  { term: 'Butler service', def: 'Servizio di maggiordomo personale dedicato, disponibile 24/7 per qualsiasi esigenza durante il soggiorno.' },
]

const CATEGORIES: FaqCategory[] = ['Prenotazioni', 'Pagamenti', 'Privacy', 'Servizi']

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'Tutte'>('Tutte')
  const [allOpen, setAllOpen] = useState(false)
  const [filterComplexity, setFilterComplexity] = useState<Complexity | 'tutte'>('tutte')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [contactQuestion, setContactQuestion] = useState('')
  const [contactSent, setContactSent] = useState(false)

  // 2. FAQ ratings
  const [ratings, setRatings] = useState<Record<number, 'up' | 'down'>>(() =>
    safeRead<Record<number, 'up' | 'down'>>('theclass_faq_ratings', {})
  )

  const rateQuestion = (globalIndex: number, vote: 'up' | 'down') => {
    if (ratings[globalIndex]) return
    const next = { ...ratings, [globalIndex]: vote }
    setRatings(next)
    safeWrite('theclass_faq_ratings', next)
    toast.success('Grazie per il feedback!')
  }

  // 4. Share with ?faq=N
  const shareFaq = (globalIndex: number) => {
    const url = `${window.location.origin}/faq?faq=${globalIndex}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiato!'))
  }

  // Read faq param on mount
  useState(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const faqParam = params.get('faq')
    if (faqParam !== null) {
      const idx = parseInt(faqParam, 10)
      if (!isNaN(idx) && idx >= 0 && idx < FAQS.length) {
        setOpen(idx)
      }
    }
  })

  const filtered = FAQS.filter(faq => {
    const matchesCat = activeCategory === 'Tutte' || faq.category === activeCategory
    const matchesSearch = search === '' ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
    const matchesComplexity = filterComplexity === 'tutte' || faq.complexity === filterComplexity
    return matchesCat && matchesSearch && matchesComplexity
  })

  const categoryCount = (cat: FaqCategory) => FAQS.filter(f => f.category === cat).length

  const toggleAll = () => {
    if (allOpen) { setOpen(null); setAllOpen(false) }
    else { setAllOpen(true); setOpen(null) }
  }

  const isOpen = (i: number) => allOpen || open === i

  // 6. Related FAQ suggestions for currently open FAQ
  const openFaq = open !== null ? FAQS[open] : null
  const relatedFaqIndices = openFaq
    ? (RELATED_BY_CATEGORY[openFaq.category] ?? []).filter(i => i !== open).slice(0, 3)
    : []

  // 9. Contact form submit
  const handleContactSubmit = () => {
    if (contactQuestion.trim().length < 10) { toast.error('Scrivi almeno 10 caratteri'); return }
    setContactSent(true)
    toast.success('Domanda inviata!', { description: 'Ti risponderemo entro 2 ore.' })
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-28">
      <Helmet>
        <title>FAQ — the Class</title>
        <meta name="description" content="Domande frequenti su the Class: prenotazioni, pagamenti, cancellazioni e servizi luxury." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#5A4F44] mb-8">
          <Link to="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
          <span className="text-[#5A4F44]/40">›</span>
          <span className="text-[#C5A059]">FAQ</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">FAQ</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-4">
            Domande Frequenti
          </h1>
          <p className="text-[#5A4F44] font-light">Tutto quello che vuoi sapere su the Class.</p>
        </motion.div>

        {/* 7. Sticky search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-16 z-20 bg-[#FDF9F2] pb-2 relative mb-3"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setAllOpen(false); setOpen(null) }}
            placeholder="Cerca tra le domande..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors shadow-sm"
          />
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setActiveCategory('Tutte')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-colors border',
              activeCategory === 'Tutte'
                ? 'bg-[#C5A059] text-white border-[#C5A059]'
                : 'bg-white text-[#5A4F44] border-[rgba(197,160,89,0.3)] hover:border-[#C5A059]'
            )}
          >
            Tutte
            <span className="ml-1.5 bg-white/30 rounded-full px-1.5 py-0.5 text-[10px]">{FAQS.length}</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-colors border',
                activeCategory === cat
                  ? 'bg-[#C5A059] text-white border-[#C5A059]'
                  : 'bg-white text-[#5A4F44] border-[rgba(197,160,89,0.3)] hover:border-[#C5A059]'
              )}
            >
              {cat}
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                activeCategory === cat ? 'bg-white/30' : 'bg-[rgba(197,160,89,0.12)] text-[#C5A059]'
              )}>
                {categoryCount(cat)}
              </span>
            </button>
          ))}
        </div>

        {/* 5. Complexity filter */}
        <div className="flex gap-2 mb-4">
          {(['tutte', 'semplice', 'dettagliata'] as const).map(c => (
            <button
              key={c}
              onClick={() => setFilterComplexity(c)}
              className={cn(
                'px-3 py-1 rounded-full text-[10px] font-medium border transition-colors',
                filterComplexity === c
                  ? c === 'semplice' ? 'bg-emerald-500 text-white border-emerald-500'
                    : c === 'dettagliata' ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                  : 'bg-white text-[#5A4F44] border-[rgba(197,160,89,0.3)] hover:border-[#C5A059]'
              )}
            >
              {c === 'tutte' ? 'Tutte le risposte' : c === 'semplice' ? '● Semplice' : '● Dettagliata'}
            </button>
          ))}
        </div>

        {/* Counter + controls */}
        <div className="flex items-center justify-between mb-6">
          {/* 8. Animated counter */}
          <p className="text-xs text-[#5A4F44]">
            Mostrando{' '}
            <motion.span
              key={filtered.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#C5A059] font-medium inline-block"
            >
              {filtered.length}
            </motion.span>
            {' '}di{' '}
            <span className="font-medium">{FAQS.length}</span> risposte
          </p>
          <button
            onClick={toggleAll}
            className="text-xs text-[#C5A059] border border-[rgba(197,160,89,0.3)] px-3 py-1.5 rounded-full hover:bg-[rgba(197,160,89,0.08)] transition-colors"
          >
            {allOpen ? 'Chiudi tutte' : 'Apri tutte'}
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-[family-name:var(--font-family-display)] text-lg text-[#1C1C1C] mb-1">
              Nessun risultato per "{search}"
            </p>
            <p className="text-sm text-[#5A4F44] font-light mb-4">Hai ancora domande?</p>
            <Link
              to="/concierge"
              className="inline-flex items-center gap-2 bg-[#C5A059] text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-[#b8924a] transition-colors mb-6"
            >
              Parla con il Concierge
            </Link>

            {/* 9. Inline contact form for unanswered questions */}
            <div className="mt-8 max-w-sm mx-auto bg-white border border-[rgba(197,160,89,0.15)] rounded-2xl p-6 text-left">
              <p className="text-sm font-medium text-[#1C1C1C] mb-3">Fai la tua domanda:</p>
              {contactSent ? (
                <p className="text-sm text-emerald-600 font-light">Domanda inviata! Ti risponderemo entro 2 ore.</p>
              ) : (
                <>
                  <textarea
                    rows={3}
                    value={contactQuestion}
                    onChange={e => setContactQuestion(e.target.value)}
                    placeholder="Scrivi qui la tua domanda..."
                    className="w-full bg-[#FDF9F2] border border-[rgba(197,160,89,0.22)] rounded-xl px-3.5 py-2.5 text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/35 focus:outline-none focus:border-[#C5A059] resize-none mb-3 transition-colors"
                  />
                  <button
                    onClick={handleContactSubmit}
                    className="w-full bg-[#C5A059] text-white py-2.5 rounded-xl text-sm hover:bg-[#b8924a] transition-colors"
                  >
                    Invia domanda
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* FAQ list */}
        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const globalIndex = FAQS.indexOf(faq)
            const opened = isOpen(globalIndex)
            const voted = ratings[globalIndex]
            return (
              <motion.div
                key={globalIndex}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden"
              >
                <button
                  onClick={() => {
                    if (allOpen) { setAllOpen(false); setOpen(opened ? null : globalIndex) }
                    else { setOpen(open === globalIndex ? null : globalIndex) }
                  }}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <div className="flex items-center gap-2 pr-4 flex-1 flex-wrap">
                    {/* 3. Quick answer badge */}
                    {faq.quickAnswer && (
                      <span className="shrink-0 text-[9px] font-semibold bg-[rgba(197,160,89,0.12)] text-[#C5A059] px-2 py-0.5 rounded-full border border-[rgba(197,160,89,0.25)]">
                        ⚡ Risposta rapida
                      </span>
                    )}
                    {/* 5. Complexity chip */}
                    <span className={cn(
                      'shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-full',
                      faq.complexity === 'semplice'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    )}>
                      {faq.complexity === 'semplice' ? 'Semplice' : 'Dettagliata'}
                    </span>
                    <span className="text-sm font-medium text-[#1C1C1C]">{faq.q}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cn('text-[#C5A059] transition-transform duration-300 shrink-0', opened && 'rotate-180')}
                  />
                </button>
                <AnimatePresence>
                  {opened && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 border-t border-[rgba(197,160,89,0.1)] pt-4">
                        <p className="text-sm text-[#5A4F44] font-light leading-relaxed mb-3">
                          {faq.a}
                        </p>
                        {faq.relatedLink && (
                          <Link
                            to={faq.relatedLink.to as '/servizi' | '/pacchetti' | '/concierge' | '/chi-siamo' | '/termini' | '/richiesta-su-misura'}
                            className="text-xs text-[#C5A059] hover:underline underline-offset-2 block mb-4"
                          >
                            {faq.relatedLink.label}
                          </Link>
                        )}

                        {/* 2. FAQ rating */}
                        <div className="flex items-center justify-between pt-3 border-t border-[rgba(197,160,89,0.08)]">
                          {voted ? (
                            <p className="text-xs text-[#5A4F44]/60">Grazie per il feedback!</p>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[#5A4F44]/60">È stata utile questa risposta?</span>
                              <button
                                onClick={() => rateQuestion(globalIndex, 'up')}
                                className="flex items-center gap-1 text-[#5A4F44] hover:text-emerald-500 transition-colors"
                              >
                                <ThumbsUp size={13} />
                              </button>
                              <button
                                onClick={() => rateQuestion(globalIndex, 'down')}
                                className="flex items-center gap-1 text-[#5A4F44] hover:text-red-400 transition-colors"
                              >
                                <ThumbsDown size={13} />
                              </button>
                            </div>
                          )}
                          {/* 4. Share FAQ */}
                          <button
                            onClick={() => shareFaq(globalIndex)}
                            className="flex items-center gap-1 text-xs text-[#5A4F44]/50 hover:text-[#C5A059] transition-colors"
                          >
                            <Share2 size={11} /> Condividi
                          </button>
                        </div>

                        {/* 6. Related FAQs suggestions */}
                        {relatedFaqIndices.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[rgba(197,160,89,0.08)]">
                            <p className="text-[10px] text-[#5A4F44]/50 uppercase tracking-wider mb-2">Potresti chiederti anche:</p>
                            <div className="space-y-1.5">
                              {relatedFaqIndices.map(idx => (
                                <button
                                  key={idx}
                                  onClick={() => { setOpen(idx); setAllOpen(false) }}
                                  className="text-xs text-[#C5A059] hover:underline underline-offset-2 block text-left"
                                >
                                  → {FAQS[idx].q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* CTA bottom */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-[#1C1C1C] rounded-2xl p-8 text-center"
          >
            <p className="text-white font-[family-name:var(--font-family-display)] text-lg mb-2">
              Non hai trovato risposta?
            </p>
            <p className="text-white/60 text-sm font-light mb-5">Il nostro concierge risponde in meno di 2 ore.</p>
            <Link
              to="/concierge"
              className="inline-flex items-center gap-2 bg-[#C5A059] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors"
            >
              Parla con il concierge →
            </Link>
          </motion.div>
        )}

        {/* 10. Glossario collassabile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden"
        >
          <button
            onClick={() => setGlossaryOpen(v => !v)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <div>
              <p className="text-sm font-medium text-[#1C1C1C]">Glossario dei termini</p>
              <p className="text-xs text-[#5A4F44]/60 mt-0.5">Asset, HNWI, Butler service e altri</p>
            </div>
            <ChevronDown
              size={16}
              className={cn('text-[#C5A059] transition-transform duration-300 shrink-0', glossaryOpen && 'rotate-180')}
            />
          </button>
          <AnimatePresence>
            {glossaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-[rgba(197,160,89,0.1)] pt-4 space-y-4">
                  {GLOSSARY.map(item => (
                    <div key={item.term}>
                      <p className="text-sm font-semibold text-[#C5A059] mb-0.5">{item.term}</p>
                      <p className="text-sm text-[#5A4F44] font-light leading-relaxed">{item.def}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating support button */}
      <button
        onClick={() => toast.info('Concierge disponibile', { description: 'Il concierge risponde in < 2h. Scrivici!' })}
        className="fixed bottom-8 right-6 z-50 flex items-center gap-2 bg-[#C5A059] text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#b8924a] transition-colors text-sm font-medium"
      >
        <MessageCircle size={16} />
        Supporto live
      </button>
    </div>
  )
}
