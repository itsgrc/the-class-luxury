export interface EmailTemplate {
  id: string
  subject: string
  preview: string
  body: string
}

export const emailTemplates: Record<string, EmailTemplate> = {
  partnerFleetManager: {
    id: 'partner-fleet-manager',
    subject: 'Partnership the Class × [Nome Flotta] — Opportunità di distribuzione esclusiva',
    preview: 'Raggiungiamo 50.000+ clienti HNWI italiani ed europei. Parliamoci.',
    body: `Gentile [Nome],

Mi permetto di contattarla in merito a una possibilità di collaborazione che ritengo possa creare valore significativo per entrambe le realtà.

**Chi siamo**
the Class è la prima piattaforma italiana di luxury asset rental, con oltre 50.000 clienti registrati nel segmento HNWI (patrimonio netto ≥ €5M). Gestiamo la distribuzione di yacht, jet privati, auto d'epoca e esperienze esclusive attraverso un sistema di concierge digitale e umano.

**Perché contattarla**
Siamo alla ricerca di partner fleet manager per ampliare il nostro portfolio nella categoria [yacht/jet/auto]. Il suo nome è emerso come riferimento nel settore per qualità e affidabilità.

**Cosa offriamo**
- Visibilità verso un pubblico qualificato, senza costi di acquisizione
- Gestione centralizzata delle prenotazioni e comunicazioni
- Assicurazione e contrattualistica standard incluse
- Pagamenti garantiti in 48 ore dalla conferma
- Dashboard partner con analytics in tempo reale

**Proposta**
Sarebbe disponibile per una call di 20 minuti questa settimana? Posso presentarle i dettagli del programma partner e rispondere a qualsiasi domanda.

La ringrazio per l'attenzione e resto a disposizione.

Cordiali saluti,
[Nome] — Head of Partnerships
the Class S.r.l.
partnerships@theclass.it | +39 02 1234 5678
www.the-class-luxury.pages.dev`,
  },

  partnerHotel: {
    id: 'partner-hotel',
    subject: '[Nome Hotel] × the Class — Esperienza integrata per i vostri ospiti VIP',
    preview: 'Proponiamo ai vostri ospiti yacht, jet e auto di lusso senza commissioni occulte.',
    body: `Gentile Direttore/Direttrice,

the Class è la piattaforma luxury italiana che permette ai clienti HNWI di accedere a yacht, jet privati, auto d'epoca e esperienze irripetibili attraverso un concierge digitale disponibile 24/7.

**La proposta per [Nome Hotel]**
Vorremmo diventare il partner di mobilità e lifestyle esclusivo per i vostri ospiti. Concretamente:

- I vostri concierge avranno accesso diretto alla nostra piattaforma per prenotare in nome degli ospiti
- Revenue sharing trasparente per ogni prenotazione generata
- White-label disponibile: il servizio può essere presentato come "[Hotel] Luxury Experiences"
- Nessun costo di integrazione, nessun minimo garantito

**I numeri**
- Oltre 200 asset verificati (yacht 18–80m, jet 4–22 pax, auto vintage e moderne)
- Concierge umano disponibile entro 2 ore
- NPS medio clienti: 72

Saremmo onorati di presentarle il programma di persona, se ritiene.

Con i migliori saluti,
[Nome] — Director of Partnerships
the Class S.r.l.
partnerships@theclass.it`,
  },

  partnerTravelAgency: {
    id: 'partner-travel-agency',
    subject: 'Amplia il tuo portfolio luxury con the Class — Programma Agenzie',
    preview: 'Commissioni fino al 12%, nessun costo di accesso, asset verificati.',
    body: `Gentile [Nome],

Siamo the Class, la piattaforma italiana specializzata in luxury asset rental. Ci rivolgiamo ad agenzie di viaggio selezionate per costruire una rete di distribuzione qualificata.

**Il programma agenzie the Class**
- Accesso al catalogo completo (200+ asset): yacht, jet, auto, ville, esperienze
- Commissione standard: 10% | Premium partners: 12%
- Nessun canone annuale, nessun costo di attivazione
- API e widget integrabili nel vostro sito o CRM
- Formazione e materiali di vendita inclusi

**Come funziona**
1. Registrazione partner (5 minuti)
2. Accesso alla dashboard dedicata con tutti i prezzi e disponibilità
3. Prenotazione per conto del cliente in tempo reale
4. Pagamento commissione entro 30 giorni dalla partenza

Allego la brochure del programma. Per maggiori informazioni o per avviare la registrazione, risponda a questa email o visiti [link dashboard partner].

Grazie per il suo tempo.

[Nome] — Sales & Partnerships
the Class S.r.l.`,
  },

  pressInquiry: {
    id: 'press-inquiry',
    subject: 'the Class — Media Kit e Accredito Stampa',
    preview: 'Tutto il materiale per il vostro articolo su the Class.',
    body: `Gentile [Nome],

Grazie per l'interesse verso the Class.

Troverà in allegato il nostro media kit completo, che include:
- Logo in varie versioni (SVG, PNG)
- Screenshot e mockup del prodotto
- Biografia del fondatore e team
- Key facts e statistiche della piattaforma
- Immagini editoriali (yacht, jet, auto) ad alta risoluzione

**Disponibili per intervista**
[Nome Fondatore], CEO & Co-fondatore di the Class, è disponibile per interviste e commenti sul mercato del lusso digitale.

Per qualsiasi approfondimento o materiale aggiuntivo:
press@theclass.it | +39 02 1234 5679

Link al media kit online: https://the-class-luxury.pages.dev/media-kit.pdf

Grazie ancora per l'attenzione.

Il team Comunicazione di the Class`,
  },
}
