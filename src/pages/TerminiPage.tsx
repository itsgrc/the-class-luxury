// src/pages/TerminiPage.tsx
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

const SECTIONS = [
  {
    title: '1. Definizioni',
    content: `"the Class" (o "Piattaforma") indica the Class S.r.l., società con sede in Via Montenapoleone 8, 20121 Milano, P.IVA 12345678901. "Utente" indica qualsiasi persona fisica o giuridica che accede alla Piattaforma. "Servizi" indica i servizi di noleggio, prenotazione e concierge resi disponibili tramite la Piattaforma. "Asset" indica yacht, aeromobili, autoveicoli ed esperienze presenti nel catalogo.`,
  },
  {
    title: '2. Accettazione dei Termini',
    content: `L'utilizzo della Piattaforma implica l'accettazione integrale dei presenti Termini. The Class si riserva il diritto di modificarli in qualsiasi momento con comunicazione via email agli Utenti registrati. L'uso continuato della Piattaforma dopo la notifica delle modifiche costituisce accettazione delle stesse.`,
  },
  {
    title: '3. Servizi Offerti',
    content: `The Class è una piattaforma di intermediazione tra Utenti e fornitori di servizi luxury. Non è proprietaria degli Asset elencati, salvo diversa indicazione. La Piattaforma facilita la comunicazione tra Utenti e operatori certificati, ma non garantisce la disponibilità degli Asset per date specifiche. Ogni prenotazione è soggetta a conferma da parte dell'operatore.`,
  },
  {
    title: '4. Responsabilità e Limitazioni',
    content: `The Class non è responsabile per: danni diretti, indiretti o consequenziali derivanti dall'utilizzo degli Asset; cancellazioni o modifiche imposte da cause di forza maggiore; differenze tra descrizioni e condizioni effettive degli Asset. La responsabilità massima della Piattaforma è limitata alle commissioni effettivamente percepite nella singola transazione.`,
  },
  {
    title: '5. Pagamenti e Cancellazioni',
    content: `Il pagamento è richiesto al momento della conferma della prenotazione tramite i metodi indicati. Le politiche di cancellazione variano per ciascun Asset e sono indicate nella scheda del servizio. In assenza di indicazioni specifiche, si applica la politica standard: cancellazione gratuita fino a 48 ore dalla data di inizio, 50% trattenuto tra 48h e 24h, nessun rimborso nelle ultime 24 ore.`,
  },
  {
    title: '6. Privacy e Dati Personali',
    content: `Il trattamento dei dati personali è disciplinato dalla Privacy Policy di the Class, disponibile su richiesta. I dati sono trattati in conformità al GDPR (Reg. UE 2016/679). The Class non cede dati a terzi senza consenso esplicito dell'Utente, ad eccezione dei fornitori necessari all'erogazione del servizio prenotato.`,
  },
  {
    title: '7. Proprietà Intellettuale',
    content: `Tutti i contenuti della Piattaforma (testi, immagini, loghi, software) sono di proprietà di the Class o dei rispettivi titolari e sono protetti dalle leggi sul diritto d'autore. È vietata qualsiasi riproduzione, distribuzione o utilizzo commerciale senza autorizzazione scritta.`,
  },
  {
    title: '8. Foro Competente',
    content: `I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'interpretazione o esecuzione dei presenti Termini, le parti concordano la competenza esclusiva del Tribunale di Milano.`,
  },
]

export function TerminiPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Termini di Servizio — the Class</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Legale</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C] mb-4">
            Termini di Servizio
          </h1>
          <p className="text-sm text-[#5A4F44] font-light">Ultimo aggiornamento: 1 gennaio 2025</p>
        </motion.div>

        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] p-7"
            >
              <h2 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-3">
                {s.title}
              </h2>
              <p className="text-sm text-[#5A4F44] font-light leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
