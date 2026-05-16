// src/pages/FaqPage.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'Come funziona la prenotazione?',
    a: 'Seleziona il servizio desiderato, scegli le date e invia la richiesta tramite il modulo. Il nostro team conferma la disponibilità entro 2 ore e ti invia un preventivo dettagliato. La conferma definitiva avviene con il pagamento.',
  },
  {
    q: 'I prezzi sono definitivi o possono variare?',
    a: 'I prezzi mostrati sono la base indicativa. Il preventivo finale include stagionalità, eventuali upgrade selezionati, carburante (per yacht) e tasse locali. Il preventivo è bloccato per 48 ore dalla ricezione.',
  },
  {
    q: 'Quali metodi di pagamento accettate?',
    a: 'Accettiamo bonifico bancario SEPA, carta di credito (Visa, Mastercard, Amex) e SWIFT per pagamenti internazionali. Per importi superiori a €50.000 è disponibile il pagamento in criptovalute su richiesta.',
  },
  {
    q: 'Posso cancellare o modificare una prenotazione?',
    a: 'Sì. La politica standard prevede cancellazione gratuita fino a 48 ore prima della partenza, con trattenuta del 50% tra 48h e 24h. Per i servizi con politica diversa (indicata nella scheda), si applicano i termini specifici dell\'operatore.',
  },
  {
    q: 'Il servizio concierge è incluso in tutte le prenotazioni?',
    a: 'Il concierge di base (gestione richiesta, comunicazione con l\'operatore, documentazione) è incluso in ogni prenotazione. Il concierge premium 24/7 con gestione completa del soggiorno è disponibile separatamente o incluso negli abbonamenti Platinum.',
  },
  {
    q: 'Come vengono selezionati gli operatori e gli asset?',
    a: 'Ogni operatore viene verificato fisicamente dal nostro team: visita dell\'asset, controllo documentazione e assicurazioni, test del servizio. Meno del 3% degli asset proposti supera la selezione. I partner vengono rivalutati annualmente.',
  },
  {
    q: 'I miei dati personali sono al sicuro?',
    a: 'Assolutamente. Tutti i dati sono protetti in conformità al GDPR. Non condividiamo informazioni con terze parti senza consenso esplicito. I nostri server sono in Europa e utilizziamo crittografia end-to-end per le comunicazioni sensibili.',
  },
  {
    q: 'È possibile richiedere servizi non presenti in catalogo?',
    a: 'Sì! La sezione "Su Misura" permette di descrivere qualunque desiderio: dal viaggio di nozze in luoghi segreti alle esperienze sportive estreme, dall\'affitto di luoghi privati storici alla gestione di eventi aziendali esclusivi.',
  },
]

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>FAQ — the Class</title>
        <meta name="description" content="Domande frequenti su the Class: prenotazioni, pagamenti, cancellazioni e servizi luxury." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">FAQ</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-4">
            Domande Frequenti
          </h1>
          <p className="text-[#5A4F44] font-light">Tutto quello che vuoi sapere su the Class.</p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-sm font-medium text-[#1C1C1C] pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={cn('text-[#C5A059] transition-transform duration-300 shrink-0', open === i && 'rotate-180')}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-[#5A4F44] font-light leading-relaxed border-t border-[rgba(197,160,89,0.1)] pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
