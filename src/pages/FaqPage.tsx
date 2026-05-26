// src/pages/FaqPage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, Search, MessageCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FaqCategory = 'Prenotazioni' | 'Pagamenti' | 'Privacy' | 'Servizi'

interface Faq {
  q: string
  a: string
  category: FaqCategory
  relatedLink?: { label: string; to: string }
}

const FAQS: Faq[] = [
  {
    q: 'Come funziona la prenotazione?',
    a: 'Seleziona il servizio desiderato, scegli le date e invia la richiesta tramite il modulo. Il nostro team conferma la disponibilità entro 2 ore e ti invia un preventivo dettagliato. La conferma definitiva avviene con il pagamento.',
    category: 'Prenotazioni',
    relatedLink: { label: 'Vedi anche: Servizi', to: '/servizi' },
  },
  {
    q: 'I prezzi sono definitivi o possono variare?',
    a: 'I prezzi mostrati sono la base indicativa. Il preventivo finale include stagionalità, eventuali upgrade selezionati, carburante (per yacht) e tasse locali. Il preventivo è bloccato per 48 ore dalla ricezione.',
    category: 'Pagamenti',
    relatedLink: { label: 'Vedi anche: Pacchetti', to: '/pacchetti' },
  },
  {
    q: 'Quali metodi di pagamento accettate?',
    a: 'Accettiamo bonifico bancario SEPA, carta di credito (Visa, Mastercard, Amex) e SWIFT per pagamenti internazionali. Per importi superiori a €50.000 è disponibile il pagamento in criptovalute su richiesta.',
    category: 'Pagamenti',
    relatedLink: { label: 'Vedi anche: Pacchetti', to: '/pacchetti' },
  },
  {
    q: 'Posso cancellare o modificare una prenotazione?',
    a: 'Sì. La politica standard prevede cancellazione gratuita fino a 48 ore prima della partenza, con trattenuta del 50% tra 48h e 24h. Per i servizi con politica diversa (indicata nella scheda), si applicano i termini specifici dell\'operatore.',
    category: 'Prenotazioni',
    relatedLink: { label: 'Vedi anche: Termini', to: '/termini' },
  },
  {
    q: 'Il servizio concierge è incluso in tutte le prenotazioni?',
    a: 'Il concierge di base (gestione richiesta, comunicazione con l\'operatore, documentazione) è incluso in ogni prenotazione. Il concierge premium 24/7 con gestione completa del soggiorno è disponibile separatamente o incluso negli abbonamenti Platinum.',
    category: 'Servizi',
    relatedLink: { label: 'Vedi anche: Concierge', to: '/concierge' },
  },
  {
    q: 'Come vengono selezionati gli operatori e gli asset?',
    a: 'Ogni operatore viene verificato fisicamente dal nostro team: visita dell\'asset, controllo documentazione e assicurazioni, test del servizio. Meno del 3% degli asset proposti supera la selezione. I partner vengono rivalutati annualmente.',
    category: 'Servizi',
    relatedLink: { label: 'Vedi anche: Chi Siamo', to: '/chi-siamo' },
  },
  {
    q: 'I miei dati personali sono al sicuro?',
    a: 'Assolutamente. Tutti i dati sono protetti in conformità al GDPR. Non condividiamo informazioni con terze parti senza consenso esplicito. I nostri server sono in Europa e utilizziamo crittografia end-to-end per le comunicazioni sensibili.',
    category: 'Privacy',
    relatedLink: { label: 'Vedi anche: Termini & Privacy', to: '/termini' },
  },
  {
    q: 'È possibile richiedere servizi non presenti in catalogo?',
    a: 'Sì! La sezione "Su Misura" permette di descrivere qualunque desiderio: dal viaggio di nozze in luoghi segreti alle esperienze sportive estreme, dall\'affitto di luoghi privati storici alla gestione di eventi aziendali esclusivi.',
    category: 'Prenotazioni',
    relatedLink: { label: 'Vedi anche: Su Misura', to: '/richiesta-su-misura' },
  },
]

const CATEGORIES: FaqCategory[] = ['Prenotazioni', 'Pagamenti', 'Privacy', 'Servizi']

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'Tutte'>('Tutte')
  const [allOpen, setAllOpen] = useState(false)

  const filtered = FAQS.filter(faq => {
    const matchesCat = activeCategory === 'Tutte' || faq.category === activeCategory
    const matchesSearch = search === '' ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const categoryCount = (cat: FaqCategory) =>
    FAQS.filter(f => f.category === cat).length

  const toggleAll = () => {
    if (allOpen) {
      setOpen(null)
      setAllOpen(false)
    } else {
      setAllOpen(true)
      // We handle "all open" via allOpen flag
      setOpen(null)
    }
  }

  const isOpen = (i: number) => allOpen || open === i

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

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setAllOpen(false); setOpen(null) }}
            placeholder="Cerca tra le domande..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Counter + controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#5A4F44]">
            Mostrando <span className="text-[#C5A059] font-medium">{filtered.length}</span> di{' '}
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-[family-name:var(--font-family-display)] text-lg text-[#1C1C1C] mb-1">
              Nessun risultato per "{search}"
            </p>
            <p className="text-sm text-[#5A4F44] font-light mb-4">Hai ancora domande?</p>
            <Link
              to="/concierge"
              className="inline-flex items-center gap-2 bg-[#C5A059] text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-[#b8924a] transition-colors"
            >
              Parla con il Concierge
            </Link>
          </motion.div>
        )}

        {/* FAQ list */}
        <div className="space-y-3">
          {filtered.map((faq, i) => {
            const globalIndex = FAQS.indexOf(faq)
            const opened = isOpen(globalIndex)
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
                    if (allOpen) {
                      setAllOpen(false)
                      setOpen(opened ? null : globalIndex)
                    } else {
                      setOpen(open === globalIndex ? null : globalIndex)
                    }
                  }}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium text-[#1C1C1C] pr-4">{faq.q}</span>
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
                            className="text-xs text-[#C5A059] hover:underline underline-offset-2"
                          >
                            {faq.relatedLink.label}
                          </Link>
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
