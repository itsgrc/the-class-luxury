import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Check, Share2, Link2, ChevronRight, ArrowLeft, Users, Calendar, MapPin, Shield, Star, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'

// ─── SEGMENT TYPES ─────────────────────────────────────────────────────────

type AgeSegment = 'millennial' | 'family' | 'senior'
type BudgetLevel = 'affordable' | 'premium' | 'ultra'
type InterestTag = 'wine' | 'adventure' | 'wellness' | 'culture' | 'shopping'
type DestLevel = 'iconic' | 'accessible'

interface GroupDestination {
  id: string
  name: string
  country: string
  tagline: string
  image: string
  heroImage: string
  duration: string
  bestPeriod: string
  groupSize: string
  priceRange: string
  pricePerPersonMin: number
  pricePerPersonMax: number
  whyGo: string
  activities: string[]
  experiences: string[]
  insuranceTip: string
  uniqueFact: string
  tags: string[]
  // Segmentation
  level: DestLevel
  ageSegments: AgeSegment[]
  budget: BudgetLevel
  interests: InterestTag[]
  idealFor: string
  similarDestIds: string[]
}

// ─── DESTINATION DATA ──────────────────────────────────────────────────────

const groupDestinations: GroupDestination[] = [
  // ── LIVELLO 1: LUSSO ICONICO ──────────────────────────────────────────────
  {
    id: 'maldive',
    name: 'Maldive',
    country: 'Repubblica delle Maldive',
    tagline: "Un'isola intera per il tuo gruppo",
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '7 – 14 notti',
    bestPeriod: 'Novembre – Aprile',
    groupSize: '6 – 16 persone',
    priceRange: '€8.500 – €22.000 / persona',
    pricePerPersonMin: 8500,
    pricePerPersonMax: 22000,
    whyGo: "Le Maldive offrono qualcosa di unico al mondo: la sensazione concreta di possedere un'isola. Quando il tuo gruppo affitta una villa resort privata, ogni corallo, ogni tramonto, ogni brezza appartiene esclusivamente a voi. Non è vacanza. È sovranità temporanea sul Paradiso.",
    activities: [
      'Cena privata su spiaggia con chef stellato locale',
      'Snorkeling e diving nella riserva UNESCO di Baa Atoll',
      'Sessione yoga al tramonto sul pontile overwater',
      'Tour notturno di bioluminescenza in mare aperto',
      "Escursione a Malé e mercato del pesce con chef",
    ],
    experiences: [
      'Villa overwater con piscina privata a sfioro (8–12 camere)',
      'Butler team dedicato 24/7 per il gruppo',
      'Idrovolante privato per arrivo/partenza panoramico',
      'Cena underwater nel ristorante sommergibile',
      'Spa suite con trattamenti ayurvedici di gruppo',
      'Pesca sportiva con capitano locale certificato',
    ],
    insuranceTip: 'Copertura medica minima 500.000€ con rimpatrio aereo. Aggiungere cancellazione viaggio e copertura attività acquatiche. I centri medici più avanzati sono a Malé — trasferimento in 30 min.',
    uniqueFact: "Il 99% del territorio delle Maldive è oceano. Le ville private includono accesso diretto alla laguna cristallina.",
    tags: ['Privacy', 'Snorkeling', 'Overwater', 'Wellness'],
    level: 'iconic',
    ageSegments: ['senior', 'millennial'],
    budget: 'ultra',
    interests: ['wellness', 'adventure'],
    idealFor: 'Coppie, Amanti del mare, Età 30–60, Wellness retreat',
    similarDestIds: ['caraibi', 'dubai'],
  },
  {
    id: 'grecia',
    name: 'Grecia',
    country: 'Mikonos & Santorini',
    tagline: 'Tramonti epici, nightlife esclusiva, storia millenaria',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '7 – 10 notti',
    bestPeriod: 'Maggio – Ottobre',
    groupSize: '6 – 20 persone',
    priceRange: '€2.200 – €9.800 / persona',
    pricePerPersonMin: 2200,
    pricePerPersonMax: 9800,
    whyGo: "La Grecia è l'unica destinazione al mondo capace di unire nightlife da club ibizena, archeologia millenaria e viste mozzafiato in 7 giorni. Per un gruppo HNWI, Mikonos offre accesso VIP ai migliori beach club del Mediterraneo, mentre Santorini regala il tramonto più fotografato della Terra.",
    activities: [
      'Tour in barca privata tra le isole delle Cicladi',
      'Degustazione vini con sommelier (vigneti Assyrtiko)',
      'Escursione al vulcano di Nea Kameni',
      'Taverna privata a Oia riservata solo per il gruppo',
      'Accesso VIP Nammos Beach Club a Mikonos',
    ],
    experiences: [
      'Veliero privato 30m con equipaggio per island hopping',
      'Villa infinity sulla caldera di Santorini (6–10 camere)',
      'Elicottero inter-isola Mikonos ↔ Santorini',
      'Chef greco stellato con menu degustazione di gruppo',
      "Tour privato dell'Acropoli all'alba (prima dei turisti)",
      'Lezione di ceramica tradizionale cicladica',
    ],
    insuranceTip: 'Tessera Sanitaria Europea valida. Aggiungere assicurazione cancellazione e copertura per sport acquatici in mare aperto.',
    uniqueFact: "A Santorini puoi vedere il tramonto sul mare stando al di sopra delle nuvole, dalla terrazza di Oia a 300m sul livello del mare.",
    tags: ['Cultura', 'Nightlife', 'Gastronomia', 'Barca'],
    level: 'iconic',
    ageSegments: ['millennial', 'family'],
    budget: 'premium',
    interests: ['wine', 'culture', 'shopping'],
    idealFor: 'Gruppi di amici 25–40, Coppie, Amanti della gastronomia',
    similarDestIds: ['montenegro', 'puglia'],
  },
  {
    id: 'croazia',
    name: 'Croazia',
    country: 'Dalmazia & Isole',
    tagline: 'Eleganza sobria tra baie segrete e borghi medievali',
    image: 'https://images.unsplash.com/photo-1555990793-da11153b6ca9?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '8 – 10 notti',
    bestPeriod: 'Giugno – Settembre',
    groupSize: '8 – 16 persone',
    priceRange: '€7.000 – €15.000 / persona',
    pricePerPersonMin: 7000,
    pricePerPersonMax: 15000,
    whyGo: "La Dalmazia è il segreto meglio custodito del Mediterraneo. Le sue 1.246 isole offrono una privacy che il Mediterraneo occidentale non può più garantire. Per un gruppo che vuole eleganza senza ostentazione, la Croazia è la scelta definitiva.",
    activities: [
      "Esplorazione delle mura di Dubrovnik all'alba",
      "Degustazione olio e vino plavac mali sull'isola di Brač",
      'Snorkeling nel Parco Marino di Kornati',
      'Serata privata in masseria storica a Hvar',
      'Kayak tra i canyon fluviali della Krka',
    ],
    experiences: [
      'Catamarano privato 18m con skipper e hostess per 8 giorni',
      "Accesso al ristorante Zinfandel's di Dubrovnik (1★ Michelin)",
      "Notte in castello medievale sull'isola di Korčula",
      'Tour truffle hunting privato in Istria',
      'Lezione di cucina dalmatina con chef locale in masseria',
      'Kayak sunset tour tra le grotte marine di Vis',
    ],
    insuranceTip: "Croazia è UE: Tessera Sanitaria Europea valida. Per gruppi su barca aggiungere assicurazione nautica e copertura meteo.",
    uniqueFact: "La Croazia ha 1.246 isole, di cui solo 48 abitate. Il vostro skipper vi porta in baie che non appaiono su Google Maps.",
    tags: ['Barca', 'Cultura', 'Gastronomia', 'Natura'],
    level: 'iconic',
    ageSegments: ['family', 'senior'],
    budget: 'premium',
    interests: ['wine', 'adventure', 'culture'],
    idealFor: 'Famiglie, Coppie 35–55, Velisti, Amanti della natura',
    similarDestIds: ['montenegro', 'grecia'],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'Emirati Arabi Uniti',
    tagline: 'La città che ridefinisce il lusso ogni giorno',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '5 – 8 notti',
    bestPeriod: 'Ottobre – Aprile',
    groupSize: '6 – 20 persone',
    priceRange: '€8.000 – €30.000 / persona',
    pricePerPersonMin: 8000,
    pricePerPersonMax: 30000,
    whyGo: "Dubai non è una destinazione. È una dichiarazione. La città che ha costruito isole artificiali e un hotel a forma di vela non smette mai di stupire. Per un gruppo d'élite, Dubai rappresenta la summa del lusso contemporaneo: servizio, architettura, gastronomia e innovazione fusi in un'esperienza continua.",
    activities: [
      'Tour in elicottero privato sullo skyline e Palm Islands',
      'Convoy di Lamborghini Urus nel deserto con cena beduina',
      'Osservatorio Burj Khalifa At the Top Sky (piano 148) riservato',
      'Shopping privato in Mall of the Emirates (fuori orario)',
      'Serata esclusiva in roof bar con vista 360° sulla città',
    ],
    experiences: [
      'Suite Presidential al Burj Al Arab (1 notte inclusa)',
      'Yacht privato 30m nel Dubai Creek e Palm Jumeirah',
      'Cena privata al Nobu One Palm',
      'Skydiving sopra il Palm Jumeirah',
      'Incontro privato con falconiere emiratino tradizionale',
      'Accesso VIP Cavalli Club con table riservata',
    ],
    insuranceTip: 'Copertura medica minima 1.000.000€. Sistema sanitario eccellente ma costoso. Obbligatoria copertura per attività (skydiving, sport estremi nel deserto).',
    uniqueFact: "Il Burj Khalifa è così alto che puoi assistere a un secondo tramonto salendo dall'ultimo piano dopo il tramonto al suolo.",
    tags: ['Architettura', 'Shopping', 'Gastronomia', 'Avventura'],
    level: 'iconic',
    ageSegments: ['millennial', 'family'],
    budget: 'ultra',
    interests: ['shopping', 'adventure', 'culture'],
    idealFor: 'Business traveller, Shopaholic, Amanti della tecnologia, Età 28–50',
    similarDestIds: ['maldive', 'messico'],
  },
  {
    id: 'caraibi',
    name: 'Caraibi',
    country: 'Isole Vergini Britanniche',
    tagline: 'Lusso informale tra 60 isole di natura selvaggia',
    image: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '10 – 14 notti',
    bestPeriod: 'Dicembre – Aprile',
    groupSize: '6 – 16 persone',
    priceRange: '€10.000 – €25.000 / persona',
    pricePerPersonMin: 10000,
    pricePerPersonMax: 25000,
    whyGo: "Le BVI sono l'unica destinazione caraibica dove il lusso rimane autentico. Nessun mega-resort da 3.000 camere. Solo 60 isole accessibili via mare. Il vostro catamarano diventa casa, trasporto e club privato al tempo stesso.",
    activities: [
      'Snorkeling a The Baths di Virgin Gorda',
      "Cocktail party su Jost Van Dyke (la barra più remota dei Caraibi)",
      'Pesca sportiva con capitano certificato IGFA',
      'Stand-up paddle nelle lagune protette di Anegada',
      'Tramonto con degustazione rum artigianale',
    ],
    experiences: [
      'Catamarano 60ft con skipper e chef a bordo (10 giorni)',
      'Villa su Necker Island (su richiesta)',
      "Escursione a Mosquito Island (isola privata di Richard Branson)",
      'Immersione sul relitto del RMS Rhone (sito UNESCO)',
      'Concerto privato al tramonto su spiaggia',
      'Evacuazione medica aerea inclusa nel pacchetto premium',
    ],
    insuranceTip: "Copertura medica 500.000€ con evacuazione aerea obbligatoria: ospedale più vicino a San Juan, Porto Rico (45 min). Copertura subacquea essenziale.",
    uniqueFact: "Nelle BVI esistono baie dove il vostro catamarano ancora a 10 metri dalla spiaggia più vicina all'umanità — senza nome su nessuna mappa.",
    tags: ['Barca', 'Natura', 'Snorkeling', 'Privacy'],
    level: 'iconic',
    ageSegments: ['millennial', 'senior'],
    budget: 'ultra',
    interests: ['adventure', 'wellness'],
    idealFor: 'Avventurieri, Amanti del mare, Età 30–55, Coppie',
    similarDestIds: ['maldive', 'croazia'],
  },

  // ── LIVELLO 2: LUSSO ACCESSIBILE ──────────────────────────────────────────
  {
    id: 'puglia',
    name: 'Puglia',
    country: 'Italia — Salento & Valle d\'Itria',
    tagline: 'Masserie di lusso, vino e mare cristallino a prezzi umani',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1534445538923-ab07f6c0b5ee?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '5 – 8 notti',
    bestPeriod: 'Maggio – Settembre',
    groupSize: '6 – 20 persone',
    priceRange: '€2.000 – €5.000 / persona',
    pricePerPersonMin: 2000,
    pricePerPersonMax: 5000,
    whyGo: "La Puglia è il segreto che gli italiani preferirebbero non condividere. Masserie del Cinquecento convertite in resort di lusso, olio d'oliva che vale più dell'oro, un mare che sfida le Maldive per trasparenza, e una cucina che è patrimonio dell'umanità nel piatto. Il lusso vero non ha bisogno di prezzi assurdi.",
    activities: [
      'Masterclass di cucina pugliese in masseria storica',
      "Tour privato dei Trulli di Alberobello con architetto",
      'Degustazione primitivo e negroamaro con produttore',
      "Gita in barca alle Grotte di Castellana e Polignano a Mare",
      'Mercato privato mattutino con chef a Lecce',
    ],
    experiences: [
      'Masseria privata con piscina e uliveto (10–20 ospiti)',
      'Chef stellato con cena a lume di candela nel cortile',
      "Degustazione olio extravergine con mastro oleario",
      "Tour privato dei siti UNESCO: Alberobello, Matera",
      'Accesso privato spiagge di Torre dell\'Orso e Porto Cesareo',
      'Aperitivo sunset sul Lungomare di Gallipoli',
    ],
    insuranceTip: "Italia — Tessera Sanitaria Europea valida. Consigliata assicurazione bagaglio e cancellazione per gruppi numerosi.",
    uniqueFact: "La Valle d'Itria produce il 40% dell'olio d'oliva europeo. Alcune masserie hanno uliveti di oltre 1.000 anni.",
    tags: ['Gastronomia', 'Cultura', 'Mare', 'Relax'],
    level: 'accessible',
    ageSegments: ['family', 'senior', 'millennial'],
    budget: 'affordable',
    interests: ['wine', 'culture', 'wellness'],
    idealFor: 'Famiglie, Appassionati di cibo, Età 30–65, Coppie',
    similarDestIds: ['grecia', 'algarve'],
  },
  {
    id: 'algarve',
    name: 'Algarve',
    country: 'Portogallo — Costa Vicentina',
    tagline: 'Scogliere mozzafiato, surf, golf e resort di classe mondiale',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1515659911831-a0ae01c05f87?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '5 – 8 notti',
    bestPeriod: 'Aprile – Ottobre',
    groupSize: '6 – 16 persone',
    priceRange: '€1.500 – €4.000 / persona',
    pricePerPersonMin: 1500,
    pricePerPersonMax: 4000,
    whyGo: "L'Algarve è ciò che la Costa Azzurra era 30 anni fa: glamour autentico senza il sovraffollamento. Le sue scogliere rosse che piombano nell'Atlantico, i resort Five Star sulle dune e il vento perfetto per il surf creano una combinazione irripetibile di adrenalina e relax. Il costo della vita è il 40% inferiore alla media europea, ma la qualità non scende di un millimetro.",
    activities: [
      'Lezione di surf privata con istruttore certificato WSL',
      'Tour in gommone delle Grotte di Ponta da Piedade',
      'Round di golf a Quinta do Lago (top 3 in Europa)',
      "Cena privata in cliff restaurant con vista sull'Atlantico",
      'Escursione in kayak tra le faraglioni di Lagos',
    ],
    experiences: [
      'Villa con piscina fronte oceano (8–12 ospiti)',
      'Barca privata per dolphin watching e tour costiero',
      'Accesso esclusivo a beach club di Vilamoura',
      'Degustazione vini Alentejanos con enologo',
      'Percorso spa di gruppo in resort termale',
      'Lezione di cucina portoghese con chef locale stellato',
    ],
    insuranceTip: "UE — Tessera Sanitaria Europea valida. Copertura per sport acquatici consigliata (surf, kayak, windsurf).",
    uniqueFact: "L'Algarve ha 300 giorni di sole all'anno e acque che raggiungono i 24°C in estate — le più calde dell'Atlantico europeo.",
    tags: ['Surf', 'Golf', 'Natura', 'Relax'],
    level: 'accessible',
    ageSegments: ['millennial', 'family'],
    budget: 'affordable',
    interests: ['adventure', 'wellness', 'wine'],
    idealFor: 'Sportivi, Famiglie, Amanti della natura, Età 25–50',
    similarDestIds: ['puglia', 'montenegro'],
  },
  {
    id: 'thailandia',
    name: 'Thailandia',
    country: 'Phuket & Krabi',
    tagline: 'Lusso tropicale con spiagge private e benessere thai autentico',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '7 – 12 notti',
    bestPeriod: 'Novembre – Aprile',
    groupSize: '6 – 16 persone',
    priceRange: '€1.200 – €3.500 / persona',
    pricePerPersonMin: 1200,
    pricePerPersonMax: 3500,
    whyGo: "La Thailandia offre il rapporto qualità/lusso più competitivo al mondo. Le ville con piscina privata a Phuket che costano €500/notte varrebbero €3.000 in Sardegna. Il massaggio thai è riconosciuto dall'UNESCO come patrimonio immateriale. Le baie di Krabi sono tra le più belle del pianeta. Prezzo accessibile, esperienza da cinque stelle.",
    activities: [
      'Tour delle baie di Phi Phi in longtail boat privata',
      'Corso di cucina thai con chef locale stellato a Phuket',
      'Sessione di yoga tradizionale al tramonto sulla spiaggia',
      'Escursione in elefante sanctuary (eticamente certificato)',
      'Immersione nelle barriere coralline di Ko Lanta',
    ],
    experiences: [
      'Villa privata con piscina e spiaggia semi-privata (6–12 ospiti)',
      'Barca privata per tour Phang Nga Bay (James Bond Island)',
      'Giornata intera di trattamenti spa thai tradizionali',
      'Cena privata su barca al tramonto con chef di bordo',
      'Accesso a beach club Catch Beach Club (Phuket)',
      'Floating market tour con tuk-tuk riservato',
    ],
    insuranceTip: "Copertura medica minima 300.000€ con rimpatrio. Ospedali privati di Bangkok Phuket Hospital e Bumrungrad di altissimo livello. Copertura per sport acquatici essenziale.",
    uniqueFact: "La Thailandia ha 1.430 isole. Solo 70 sono abitate. Le altre rimangono paradisi intatti raggiungibili solo in barca.",
    tags: ['Benessere', 'Spiaggia', 'Gastronomia', 'Natura'],
    level: 'accessible',
    ageSegments: ['millennial', 'family'],
    budget: 'affordable',
    interests: ['wellness', 'adventure', 'wine'],
    idealFor: 'Amanti del benessere, Gruppi di amici 25–40, Budget-conscious luxury',
    similarDestIds: ['maldive', 'messico'],
  },
  {
    id: 'montenegro',
    name: 'Montenegro',
    country: 'Bocche di Cattaro & Budva',
    tagline: 'Il fiordo del Mediterraneo: yachting a prezzi da Adriatico',
    image: 'https://images.unsplash.com/photo-1597552004893-18b0a8dc4e8c?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1569399078436-6f1d7d793eb3?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '6 – 9 notti',
    bestPeriod: 'Maggio – Settembre',
    groupSize: '6 – 14 persone',
    priceRange: '€2.500 – €5.500 / persona',
    pricePerPersonMin: 2500,
    pricePerPersonMax: 5500,
    whyGo: "Il Montenegro è la Croazia di 15 anni fa: le stesse acque turchesi, gli stessi borghi medievali, lo stesso yachting di lusso — ma senza i prezzi gonfiati del turismo di massa. Le Bocche di Cattaro sono l'unico fiordo del Mediterraneo, un paesaggio che fa sembrare la Norvegia tropicale. Porto Montenegro è il porto per superyacht più esclusivo dei Balcani.",
    activities: [
      "Tour delle Bocche di Cattaro in tender privato",
      "Visita alla città murata di Kotor all'alba (Patrimonio UNESCO)",
      "Escursione al Monastero di Ostrog aggrappato alla roccia",
      "Degustazione vino Vranac con produttore locale",
      "Bagno nelle acque blu del lago Skadar",
    ],
    experiences: [
      "Yacht privato 20m con skipper per navigazione nelle Bocche",
      "Accesso a Porto Montenegro Marina e Clubhouse",
      "Villa con piscina e vista sul fiordo (8–14 ospiti)",
      "Cena privata nel castello medievale di Stari Bar",
      "Tour privato in SUV nelle montagne del Durmitor",
      "Serata esclusiva a One Montenegro Club (Budva)",
    ],
    insuranceTip: "Montenegro non è UE: necessaria assicurazione sanitaria completa. Strutture sanitarie di base; per emergenze gravi trasferimento a Belgrado o Dubrovnik.",
    uniqueFact: "Le Bocche di Cattaro sono considerati il fiordo più meridionale d'Europa — un paesaggio fiordo-like che in realtà è una ria costiera profonda 60m.",
    tags: ['Barca', 'Cultura', 'Natura', 'Avventura'],
    level: 'accessible',
    ageSegments: ['millennial', 'family', 'senior'],
    budget: 'affordable',
    interests: ['adventure', 'culture', 'wine'],
    idealFor: 'Velisti, Esploratori, Età 25–55, Budget-smart luxury',
    similarDestIds: ['croazia', 'grecia'],
  },
  {
    id: 'messico',
    name: 'Messico',
    country: 'Riviera Maya & Yucatán',
    tagline: 'Cenote, rovine Maya e resort ultralusso fronte Caraibi',
    image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80&auto=format&fit=crop&fm=webp',
    heroImage: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600&q=85&auto=format&fit=crop&fm=webp',
    duration: '7 – 10 notti',
    bestPeriod: 'Novembre – Aprile',
    groupSize: '6 – 20 persone',
    priceRange: '€1.800 – €4.000 / persona',
    pricePerPersonMin: 1800,
    pricePerPersonMax: 4000,
    whyGo: "La Riviera Maya combina qualcosa di unico: il lusso ultra-accessibile dei grandi resort di Cancún e Tulum con la profondità culturale delle civiltà Maya — rovine, cenote sacre, jungla. È la destinazione dove puoi fare snorkeling in una caverna sommersa millenaria la mattina e cenare in un ristorante nella foresta la sera.",
    activities: [
      "Immersione in cenote privata (Gran Cenote, Dos Ojos)",
      "Tour guidato privato delle rovine di Chichén Itzá all'alba",
      "Snorkeling nella barriera corallina di Cozumel",
      "Cena nella jungla con show di danza Maya tradizionale",
      "Escursione in kayak nei canali di Sian Ka'an (UNESCO)",
    ],
    experiences: [
      "Villa privata con piscina fronte mare a Tulum (8–16 ospiti)",
      "Accesso esclusivo cenote privata con guida Maya",
      "Cena private nel ristorante Hartwood (top 50 World's Best)",
      "Tour privato a Chichén Itzá senza turisti (alba/tramonto)",
      "Giornata spa con trattamenti Maya tradizionali in cenote",
      "Gita in barca alle isole di Holbox (flamingo beach)",
    ],
    insuranceTip: "Assicurazione sanitaria completa obbligatoria (no SSEU). Strutture di eccellenza nei grandi resort. Attenzione: copertura per attività in cenote e sport acquatici.",
    uniqueFact: "Lo Yucatán ha oltre 6.000 cenote — pozzi d'acqua dolce sacri per i Maya, oggi la rete sotterranea più grande del mondo (360 km mappati).",
    tags: ['Avventura', 'Cultura', 'Spiaggia', 'Natura'],
    level: 'accessible',
    ageSegments: ['millennial', 'family'],
    budget: 'affordable',
    interests: ['adventure', 'culture', 'wellness'],
    idealFor: 'Avventurieri culturali, Famiglie, Giovani coppie, Età 25–45',
    similarDestIds: ['caraibi', 'thailandia'],
  },
]

// ─── ITINERARY BUILDER DATA ────────────────────────────────────────────────

interface ItineraryState { transport: string[]; experiences: string[]; extras: string[] }
const transportOptions = [
  { id: 'yacht-28', label: 'Yacht 28m – Ionio & Grecia', price: 22000, icon: '⚓' },
  { id: 'jet-phenom', label: 'Jet Phenom 300E – Transfer', price: 12000, icon: '✈️' },
  { id: 'rolls-driver', label: 'Rolls-Royce con Autista', price: 3500, icon: '🚗' },
  { id: 'elicottero', label: 'Elicottero Privato', price: 8000, icon: '🚁' },
]
const experienceOptions = [
  { id: 'degustation', label: 'Degustazione Pinchiorri', price: 2400, icon: '🍽️' },
  { id: 'spa-villa', label: 'Spa Privata in Villa', price: 1800, icon: '💆' },
  { id: 'sailing', label: 'Regata Velica Esclusiva', price: 3200, icon: '🌊' },
  { id: 'art-tour', label: 'Tour Arte Privato Firenze', price: 900, icon: '🎨' },
]
const extraOptions = [
  { id: 'chef', label: 'Chef Stellato a Bordo', price: 4500, icon: '👨‍🍳' },
  { id: 'security', label: 'Security Team (3 giorni)', price: 2800, icon: '🛡️' },
  { id: 'photographer', label: 'Fotografo Professionale', price: 1200, icon: '📸' },
  { id: 'sommelier', label: 'Sommelier Personale', price: 950, icon: '🍷' },
]
const steps = [
  { id: 1, label: 'Trasporto' }, { id: 2, label: 'Esperienze' }, { id: 3, label: 'Extra' },
]

function getTotal(s: ItineraryState) {
  const all = [...transportOptions, ...experienceOptions, ...extraOptions]
  const ids = [...s.transport, ...s.experiences, ...s.extras]
  return all.filter(o => ids.includes(o.id)).reduce((t, o) => t + o.price, 0)
}
function encodeState(s: ItineraryState) { return btoa(JSON.stringify(s)) }
function decodeState(e: string): ItineraryState | null { try { return JSON.parse(atob(e)) } catch { return null } }

// ─── FILTER TYPES & LABELS ─────────────────────────────────────────────────

const AGE_LABELS: Record<AgeSegment, string> = {
  millennial: '🎉 Millennial / Gen Z',
  family: '👨‍👩‍👧 Famiglie',
  senior: '🧘 50+ / Relax',
}
const BUDGET_LABELS: Record<BudgetLevel, string> = {
  affordable: '€€ Fino a €5.000',
  premium: '€€€ 5k – 10k',
  ultra: '€€€€ 10k+',
}
const INTEREST_LABELS: Record<InterestTag, string> = {
  wine: '🍷 Vino & Cucina',
  adventure: '🏄 Avventura',
  wellness: '🧘 Benessere & Spa',
  culture: '🎨 Arte & Storia',
  shopping: '🛍️ Shopping',
}

function getFactotumSuggestion(destId: string): string | null {
  try {
    const reminders: Array<{ title?: string; description?: string }> = JSON.parse(localStorage.getItem('theclass_factotum') ?? '[]')
    const concierge: Array<{ prompt?: string }> = JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]')
    const text = [...reminders.map(r => `${r.title ?? ''} ${r.description ?? ''}`), ...concierge.map(c => c.prompt ?? '')].join(' ').toLowerCase()
    const map: Record<string, string> = {
      croazia: 'vela|barca|yacht|mare',
      maldive: 'snorkeling|subacquea|isola|corallo',
      grecia: 'storia|arte|gastronomia|vino|cultura',
      dubai: 'architettura|shopping|business|tech|lusso',
      caraibi: 'natura|avventura|immersione|pesca',
      puglia: 'cibo|cucina|olio|vino|relax|italia',
      algarve: 'surf|sport|golf|natura|portogallo',
      thailandia: 'wellness|spa|massaggio|yoga|spiaggia',
      montenegro: 'balcani|barca|fiordo|avventura|esplorare',
      messico: 'cenote|maya|avventura|caribe|cultura',
    }
    const pattern = map[destId]
    if (pattern && new RegExp(pattern).test(text)) {
      const dest = groupDestinations.find(d => d.id === destId)
      return `Basato sul tuo profilo Factotum: ${dest?.name} sembra perfetta per te — ${dest?.idealFor?.split(',')[0]}.`
    }
  } catch { /* ignore */ }
  return null
}

// ─── OPTION BUTTON (memoized) ──────────────────────────────────────────────

const OptionButton = memo(({ id, label, price, icon, selected, onToggle }: {
  id: string; label: string; price: number; icon: string; selected: boolean; onToggle: () => void
}) => (
  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onToggle}
    className={cn('w-full text-left p-4 rounded-2xl border transition-all duration-200',
      selected ? 'border-[#C5A059] bg-[rgba(197,160,89,0.06)]' : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)] bg-[#FCFAF5]')}>
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1C1C1C]">{label}</p>
        <p className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] mt-0.5">{formatPrice(price)}</p>
      </div>
      <div className={cn('w-5 h-5 rounded border shrink-0 flex items-center justify-center',
        selected ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]')}>
        {selected && <Check size={10} className="text-white" />}
      </div>
    </div>
  </motion.button>
))

// ─── DESTINATION CARD (memoized) ───────────────────────────────────────────

const DestinationCard = memo(({ dest, onClick }: { dest: GroupDestination; onClick: () => void }) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}
    onClick={onClick}
    className="cursor-pointer rounded-3xl overflow-hidden border border-[rgba(197,160,89,0.18)] bg-[#FDF9F2] group">
    <div className="relative h-52 overflow-hidden">
      <img src={dest.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        alt={dest.name} loading="lazy" decoding="async" width="800" height="416" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-[#1C1C1C]/10 to-transparent" />
      {/* Level badge */}
      <div className={cn('absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-[family-name:var(--font-family-mono)] tracking-widest uppercase font-bold',
        dest.level === 'iconic'
          ? 'bg-[rgba(197,160,89,0.92)] text-[#1C1C1C]'
          : 'bg-white/90 text-[#5A4F44]')}>
        {dest.level === 'iconic' ? '★ Lusso iconico' : '◆ Gemma nascosta'}
      </div>
      {/* Budget badge */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-[family-name:var(--font-family-mono)] tracking-wider bg-[rgba(28,28,28,0.65)] text-white border border-white/20 uppercase">
        {BUDGET_LABELS[dest.budget].split(' ')[0]}
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="font-playfair text-white text-2xl leading-tight">{dest.name}</p>
        <p className="text-white/70 text-xs font-[family-name:var(--font-family-mono)] mt-0.5">{dest.country}</p>
      </div>
    </div>
    <div className="p-5">
      <p className="font-cormorant text-[#5A4F44] text-[15px] italic mb-3">{dest.tagline}</p>
      {/* Interest chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {dest.interests.map(i => (
          <span key={i} className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059] border border-[rgba(197,160,89,0.3)] rounded-full px-2 py-0.5 uppercase tracking-wider">
            {INTEREST_LABELS[i].split(' ').slice(0, 2).join(' ')}
          </span>
        ))}
        {dest.ageSegments.map(a => (
          <span key={a} className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] border border-[rgba(107,94,82,0.25)] rounded-full px-2 py-0.5">
            {AGE_LABELS[a].split(' ')[0]}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(197,160,89,0.12)]">
        <div><p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Durata</p><p className="text-xs text-[#1C1C1C] font-medium">{dest.duration}</p></div>
        <div><p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Gruppo</p><p className="text-xs text-[#1C1C1C] font-medium">{dest.groupSize}</p></div>
        <div><p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Da</p><p className="text-xs text-[#C5A059] font-[family-name:var(--font-family-mono)] font-bold">€{(dest.pricePerPersonMin / 1000).toFixed(0)}k</p></div>
      </div>
    </div>
  </motion.div>
))

// ─── DESTINATION DETAIL ────────────────────────────────────────────────────

function DestinationDetail({ dest, onBack, onNavigate }: {
  dest: GroupDestination; onBack: () => void; onNavigate: (id: string) => void
}) {
  const [persons, setPersons] = useState(10)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 100])
  const suggestion = getFactotumSuggestion(dest.id)

  const priceRows = [6, 10, 16, 20].map(p => ({
    p, min: (p * dest.pricePerPersonMin).toLocaleString('it-IT'), max: (p * dest.pricePerPersonMax).toLocaleString('it-IT')
  }))

  const similar = groupDestinations.filter(d => dest.similarDestIds.includes(d.id)).slice(0, 2)

  const getMockBookings = useCallback(() => {
    const options: Record<string, string[]> = {
      maldive: ['Villa overwater 7gg per 8 pax', 'Cena underwater + diving'],
      grecia: ['Island hopping 10gg veliero', 'Accesso VIP beach club Mikonos'],
      croazia: ['Catamarano 8gg + chef', 'Notte castello Korčula'],
      dubai: ['Suite Burj Al Arab + elicottero', 'Skydiving + tour deserto'],
      caraibi: ['Catamarano 12gg BVI', 'Necker Island 1 notte'],
      puglia: ['Masseria 6gg + chef stellato', 'Tour Trulli + degustazione'],
      algarve: ['Villa fronte oceano + surf', 'Golf Quinta do Lago + spa'],
      thailandia: ['Villa Phuket + cenote tour', 'Spa thai 3gg + island hopping'],
      montenegro: ['Yacht Bocche + Kotor tour', 'Villa fiordo + Durmitor'],
      messico: ['Villa Tulum + cenote privata', 'Chichén Itzá alba + Holbox'],
    }
    return options[dest.id] ?? ['Richiesta personalizzata concierge', 'Pacchetto su misura']
  }, [dest.id])

  const requestQuote = useCallback(() => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]') } catch { return [] } })()
    const id = `req-${Date.now()}`
    existing.push({ id, prompt: `Preventivo ${dest.name} (${dest.country}) — ${persons} persone, ${dest.duration}`, timestamp: Date.now(), status: 'pending' })
    localStorage.setItem('theclass_concierge', JSON.stringify(existing))
    toast.success('Preventivo inviato!', { description: `${dest.name} — ${persons} persone. Risposta entro 24h.` })
    setTimeout(() => { window.location.href = `/concierge?ref=${id}` }, 1800)
  }, [dest, persons])

  const shareDestination = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/itinerari?dest=${dest.id}`)
      .then(() => toast.success('Link copiato!', { description: `Condividi ${dest.name} con il tuo gruppo.` }))
  }, [dest.id])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <button onClick={onBack}
        className="flex items-center gap-2 text-[#5A4F44] hover:text-[#C5A059] mb-8 font-[family-name:var(--font-family-mono)] text-sm tracking-wider group transition-colors">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Tutti gli itinerari
      </button>

      {/* Hero */}
      <div ref={heroRef} className="relative h-[52vh] rounded-3xl overflow-hidden mb-10">
        <motion.img style={{ y: heroY }} src={dest.heroImage}
          className="absolute inset-0 w-full h-[115%] object-cover hero-parallax"
          alt={dest.name} loading="eager" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/85 via-[#1C1C1C]/15 to-transparent" />
        <div className={cn('absolute top-5 left-5 px-3 py-1.5 rounded-full text-[10px] font-[family-name:var(--font-family-mono)] tracking-widest uppercase font-bold',
          dest.level === 'iconic' ? 'bg-[rgba(197,160,89,0.92)] text-[#1C1C1C]' : 'bg-white/90 text-[#5A4F44]')}>
          {dest.level === 'iconic' ? '★ Lusso Iconico — Certificato The Class' : '◆ Gemma Nascosta — Certificato The Class'}
        </div>
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div>
            <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-[10px] tracking-[0.2em] uppercase mb-2">{dest.country}</p>
            <h1 className="font-playfair text-5xl md:text-6xl text-white leading-tight">{dest.name}</h1>
            <p className="font-cormorant text-white/80 text-xl italic mt-1">{dest.tagline}</p>
          </div>
          <button onClick={shareDestination}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 border border-white/40 text-white rounded-full text-[11px] font-[family-name:var(--font-family-mono)] tracking-wider hover:bg-white/10 transition">
            <Share2 size={12} /> Condividi
          </button>
        </div>
      </div>

      {/* Factotum suggestion */}
      {suggestion && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.25)] flex items-start gap-3">
          <span className="text-xl shrink-0">🧠</span>
          <div>
            <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest mb-1">Factotum AI</p>
            <p className="text-sm text-[#1C1C1C]">{suggestion}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">

          {/* Info pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { Icon: Calendar, label: 'Durata', value: dest.duration },
              { Icon: MapPin, label: 'Periodo', value: dest.bestPeriod },
              { Icon: Users, label: 'Gruppo', value: dest.groupSize },
              { Icon: Star, label: 'Livello', value: dest.level === 'iconic' ? 'Lusso Iconico' : 'Lusso Accessibile' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="luxury-card rounded-2xl p-4 text-center">
                <Icon size={15} className="text-[#C5A059] mx-auto mb-2" />
                <p className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-xs text-[#1C1C1C] font-medium leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Ideale per */}
          <div className="p-5 rounded-2xl bg-[rgba(197,160,89,0.04)] border border-[rgba(197,160,89,0.15)]">
            <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest mb-2">Ideale per</p>
            <div className="flex flex-wrap gap-2">
              {dest.idealFor.split(',').map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-white border border-[rgba(197,160,89,0.2)] text-sm text-[#1C1C1C]">{s.trim()}</span>
              ))}
            </div>
          </div>

          {/* Perché andare */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Perché andare</p>
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-4">L'essenza di {dest.name}</h2>
            <p className="text-[#5A4F44] leading-relaxed">{dest.whyGo}</p>
            <div className="mt-4 p-4 bg-[rgba(197,160,89,0.04)] border-l-2 border-[#C5A059] rounded-r-xl">
              <p className="font-cormorant text-[#5A4F44] text-base italic">✦ {dest.uniqueFact}</p>
            </div>
          </div>

          {/* Cosa fare */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Programma di massima</p>
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-5">Cosa fare</h2>
            <div className="space-y-3">
              {dest.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#FCFAF5] border border-[rgba(197,160,89,0.12)]">
                  <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-[#C5A059] mt-0.5 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-[#1C1C1C] leading-relaxed">{act}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Esperienze esclusive */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Solo per i nostri soci</p>
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-5">Esperienze esclusive</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {dest.experiences.map((exp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#FDF9F2] border border-[rgba(197,160,89,0.15)]">
                  <div className="w-5 h-5 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={9} className="text-[#C5A059]" />
                  </div>
                  <p className="text-sm text-[#1C1C1C] leading-relaxed">{exp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Price table */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Trasparenza</p>
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-5">Prezzi per dimensione del gruppo</h2>
            <div className="overflow-hidden rounded-2xl border border-[rgba(197,160,89,0.18)]">
              <table className="w-full">
                <thead><tr className="bg-[rgba(197,160,89,0.06)]">
                  <th className="text-left p-4 text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-wider">Persone</th>
                  <th className="text-right p-4 text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-wider">Stima min.</th>
                  <th className="text-right p-4 text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-wider">Stima max.</th>
                </tr></thead>
                <tbody>
                  {priceRows.map((row, i) => (
                    <tr key={row.p} className={cn('border-t border-[rgba(197,160,89,0.1)]', i % 2 === 0 ? 'bg-white' : 'bg-[#FCFAF5]')}>
                      <td className="p-4 font-[family-name:var(--font-family-mono)] text-sm text-[#1C1C1C] font-medium">{row.p} pax</td>
                      <td className="p-4 text-right font-[family-name:var(--font-family-mono)] text-sm text-[#5A4F44]">€{row.min}</td>
                      <td className="p-4 text-right font-[family-name:var(--font-family-mono)] text-sm text-[#C5A059] font-bold">€{row.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#5A4F44]/50 mt-2 font-[family-name:var(--font-family-mono)] text-center">* Stime orientative. Preventivo esatto su richiesta.</p>
          </div>

          {/* Insurance */}
          <div className="rounded-2xl border border-[rgba(197,160,89,0.2)] bg-[rgba(197,160,89,0.03)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center">
                <Shield size={16} className="text-[#C5A059]" />
              </div>
              <div>
                <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest">Raccomandazioni The Class</p>
                <h3 className="font-playfair text-lg text-[#1C1C1C]">Assicurazione di viaggio</h3>
              </div>
            </div>
            <p className="text-[#5A4F44] text-sm leading-relaxed">{dest.insuranceTip}</p>
          </div>

          {/* Cosa altri clienti hanno prenotato */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Social proof</p>
            <h2 className="font-playfair text-xl text-[#1C1C1C] mb-4">Clienti come te hanno scelto</h2>
            <div className="flex flex-col gap-3">
              {getMockBookings().map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFAF5] border border-[rgba(197,160,89,0.12)]">
                  <div className="w-7 h-7 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#C5A059] font-bold">{i === 0 ? '🔥' : '⭐'}</span>
                  </div>
                  <p className="text-sm text-[#1C1C1C]">{b}</p>
                  <span className="ml-auto text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] shrink-0">Prenotato di recente</span>
                </div>
              ))}
            </div>
          </div>

          {/* Destinazioni simili */}
          {similar.length > 0 && (
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Cross-sell</p>
              <h2 className="font-playfair text-xl text-[#1C1C1C] mb-4">Destinazioni simili</h2>
              <div className="grid grid-cols-2 gap-4">
                {similar.map(s => (
                  <button key={s.id} onClick={() => onNavigate(s.id)}
                    className="rounded-2xl overflow-hidden border border-[rgba(197,160,89,0.18)] text-left group hover:border-[#C5A059] transition-colors">
                    <div className="relative h-28 overflow-hidden">
                      <img src={s.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={s.name} loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/70 to-transparent" />
                      <p className="absolute bottom-2 left-3 font-playfair text-white text-base">{s.name}</p>
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059]">da €{(s.pricePerPersonMin / 1000).toFixed(0)}k/persona</p>
                      <p className="text-xs text-[#5A4F44] mt-0.5 flex items-center gap-1">Scopri <ChevronRight size={10} /></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Cost estimator */}
          <div className="luxury-card rounded-2xl p-6">
            <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest mb-1">Widget esclusivo</p>
            <h3 className="font-playfair text-lg text-[#1C1C1C] mb-4">Stima costi gruppo</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">Numero persone</label>
                <span className="text-[#C5A059] font-[family-name:var(--font-family-mono)] text-xl font-bold">{persons}</span>
              </div>
              <input type="range" min={6} max={20} value={persons}
                onChange={e => setPersons(Number(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer" />
              <div className="flex justify-between text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] mt-1">
                <span>6</span><span>20</span>
              </div>
            </div>
            <div className="border-t border-[rgba(197,160,89,0.15)] pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-[#5A4F44]">Stima minima</span>
                <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] font-bold">€{(persons * dest.pricePerPersonMin).toLocaleString('it-IT')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#5A4F44]">Stima massima</span>
                <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] font-bold">€{(persons * dest.pricePerPersonMax).toLocaleString('it-IT')}</span>
              </div>
            </div>
            <p className="text-[9px] text-[#5A4F44]/50 mt-3 font-[family-name:var(--font-family-mono)]">* Orientativo. Prezzi definitivi su preventivo.</p>
          </div>

          <button onClick={requestQuote}
            className="w-full py-4 bg-[#1C1C1C] text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.15em] uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors shadow-lg">
            Richiedi preventivo gruppo
          </button>
          <button onClick={shareDestination}
            className="w-full py-3.5 border border-[rgba(197,160,89,0.4)] text-[#5A4F44] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-wider uppercase hover:border-[#C5A059] hover:text-[#C5A059] transition flex items-center justify-center gap-2">
            <Share2 size={12} /> Condividi itinerario
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── FILTER BAR ────────────────────────────────────────────────────────────

interface Filters { age: AgeSegment | null; budget: BudgetLevel | null; interests: InterestTag[] }

function FilterBar({ filters, setFilters, total }: { filters: Filters; setFilters: (f: Filters) => void; total: number }) {
  const hasActive = filters.age !== null || filters.budget !== null || filters.interests.length > 0
  const toggleInterest = (i: InterestTag) => setFilters({
    ...filters, interests: filters.interests.includes(i) ? filters.interests.filter(x => x !== i) : [...filters.interests, i]
  })

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 text-[#5A4F44]">
          <SlidersHorizontal size={14} />
          <span className="text-[11px] font-[family-name:var(--font-family-mono)] uppercase tracking-wider">Filtra per</span>
        </div>
        {hasActive && (
          <button onClick={() => setFilters({ age: null, budget: null, interests: [] })}
            className="flex items-center gap-1 text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] hover:underline">
            <X size={10} /> Azzera filtri
          </button>
        )}
        <span className="ml-auto text-[11px] font-[family-name:var(--font-family-mono)] text-[#5A4F44]">{total} destinazion{total === 1 ? 'e' : 'i'}</span>
      </div>

      {/* Age */}
      <div className="mb-2 flex flex-wrap gap-2">
        {(Object.entries(AGE_LABELS) as [AgeSegment, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setFilters({ ...filters, age: filters.age === k ? null : k })}
            className={cn('px-3 py-1.5 rounded-full text-[11px] font-[family-name:var(--font-family-mono)] transition-all border',
              filters.age === k ? 'bg-[#C5A059] text-[#1C1C1C] border-[#C5A059]' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]')}>
            {v}
          </button>
        ))}
        <span className="text-[rgba(197,160,89,0.3)] self-center">|</span>
        {(Object.entries(BUDGET_LABELS) as [BudgetLevel, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setFilters({ ...filters, budget: filters.budget === k ? null : k })}
            className={cn('px-3 py-1.5 rounded-full text-[11px] font-[family-name:var(--font-family-mono)] transition-all border',
              filters.budget === k ? 'bg-[#C5A059] text-[#1C1C1C] border-[#C5A059]' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]')}>
            {v}
          </button>
        ))}
      </div>

      {/* Interests */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(INTEREST_LABELS) as [InterestTag, string][]).map(([k, v]) => (
          <button key={k} onClick={() => toggleInterest(k)}
            className={cn('px-3 py-1.5 rounded-full text-[11px] font-[family-name:var(--font-family-mono)] transition-all border',
              filters.interests.includes(k) ? 'bg-[rgba(197,160,89,0.15)] text-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[rgba(197,160,89,0.5)]')}>
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── ITINERARY BUILDER (preserved) ────────────────────────────────────────

function ItineraryBuilder() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<ItineraryState>({ transport: [], experiences: [], extras: [] })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('it')
    if (p) { const d = decodeState(p); if (d) { setState(d); toast.success('Itinerario ripristinato!') } return }
    try {
      const s = localStorage.getItem('theclass_itinerario_draft')
      if (s) { const p2: ItineraryState = JSON.parse(s); if (p2.transport.length || p2.experiences.length || p2.extras.length) { setState(p2); toast('Bozza ripristinata') } }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { try { localStorage.setItem('theclass_itinerario_draft', JSON.stringify(state)) } catch { /* ignore */ } }, [state])

  const toggle = useCallback((section: keyof ItineraryState, id: string) => {
    setState(prev => ({ ...prev, [section]: prev[section].includes(id) ? prev[section].filter(i => i !== id) : [...prev[section], id] }))
  }, [])

  const shareItinerary = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/itinerari?it=${encodeState(state)}`)
      .then(() => toast.success('Link copiato!'))
  }, [state])

  const total = getTotal(state)
  const selectedCount = state.transport.length + state.experiences.length + state.extras.length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button onClick={() => setStep(s.id)}
                className={cn('flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all text-sm',
                  step === s.id ? 'bg-[#C5A059] text-white' : step > s.id ? 'border border-[#C5A059] text-[#C5A059]' : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44]')}>
                {step > s.id ? <Check size={12} /> : <span className="font-[family-name:var(--font-family-mono)] text-xs">{String(s.id).padStart(2, '0')}</span>}
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-[rgba(197,160,89,0.4)]" />}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Come vuoi muoverti?</h2>
              {transportOptions.map(o => <OptionButton key={o.id} {...o} selected={state.transport.includes(o.id)} onToggle={() => toggle('transport', o.id)} />)}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Cosa vuoi vivere?</h2>
              {experienceOptions.map(o => <OptionButton key={o.id} {...o} selected={state.experiences.includes(o.id)} onToggle={() => toggle('experiences', o.id)} />)}
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Aggiungi servizi extra</h2>
              {extraOptions.map(o => <OptionButton key={o.id} {...o} selected={state.extras.includes(o.id)} onToggle={() => toggle('extras', o.id)} />)}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
            className="px-6 py-2.5 rounded-full border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm disabled:opacity-30 hover:border-[#C5A059] transition-colors">
            Indietro
          </button>
          {step < 3
            ? <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:opacity-90 transition">Avanti</button>
            : <button onClick={shareItinerary} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:opacity-90 transition"><Share2 size={14} />Condividi</button>
          }
        </div>
      </div>
      <div>
        <div className="sticky top-24 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.25)] p-6">
          <h3 className="font-playfair text-lg text-[#1C1C1C] mb-4 pb-4 border-b border-[rgba(197,160,89,0.2)]">Riepilogo</h3>
          {selectedCount === 0
            ? <p className="text-sm text-[#5A4F44] italic">Nessun elemento selezionato</p>
            : <div className="space-y-3 mb-4">
                {[
                  { label: 'Trasporto', ids: state.transport, options: transportOptions },
                  { label: 'Esperienze', ids: state.experiences, options: experienceOptions },
                  { label: 'Extra', ids: state.extras, options: extraOptions },
                ].map(sec => {
                  const sel = sec.options.filter(o => sec.ids.includes(o.id))
                  if (!sel.length) return null
                  return (
                    <div key={sec.label}>
                      <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5">{sec.label}</p>
                      {sel.map(o => (
                        <div key={o.id} className="flex justify-between text-sm mb-1">
                          <span className="text-[#1C1C1C] flex items-center gap-1.5"><span>{o.icon}</span><span className="truncate">{o.label.split('–')[0].trim()}</span></span>
                          <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44]">{formatPrice(o.price)}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
          }
          {total > 0 && <div className="border-t border-[rgba(197,160,89,0.2)] pt-4 flex justify-between items-baseline">
            <span className="text-sm text-[#5A4F44]">Totale stimato</span>
            <span className="font-[family-name:var(--font-family-mono)] text-xl text-[#C5A059]">{formatPrice(total)}</span>
          </div>}
          {selectedCount > 0 && <button onClick={shareItinerary}
            className="w-full mt-4 flex items-center justify-center gap-2 border border-[rgba(197,160,89,0.4)] text-[#5A4F44] py-2.5 rounded-xl text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors">
            <Link2 size={12} />Copia link
          </button>}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────

type ViewMode = 'destinations' | 'builder'

export function ItinerariPage() {
  const [view, setView] = useState<ViewMode>('destinations')
  const [activeDestId, setActiveDestId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({ age: null, budget: null, interests: [] })

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const dest = p.get('dest')
    if (dest && groupDestinations.find(d => d.id === dest)) { setActiveDestId(dest); setView('destinations') }
  }, [])

  const filtered = useMemo(() => groupDestinations.filter(d => {
    if (filters.age && !d.ageSegments.includes(filters.age)) return false
    if (filters.budget && d.budget !== filters.budget) return false
    if (filters.interests.length > 0 && !filters.interests.some(i => d.interests.includes(i))) return false
    return true
  }), [filters])

  const activeDest = activeDestId ? groupDestinations.find(d => d.id === activeDestId) ?? null : null

  const navigateTo = useCallback((id: string) => {
    setActiveDestId(id)
    window.history.pushState({}, '', `/itinerari?dest=${id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack = useCallback(() => {
    setActiveDestId(null)
    window.history.pushState({}, '', '/itinerari')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Itinerari di Gruppo Luxury — the Class</title>
      <meta name="description" content="10 destinazioni luxury per gruppi: iconiche e accessibili. Maldive, Grecia, Puglia, Algarve, Messico. Filtri per età, budget e interessi." />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-[0.25em] text-[10px] uppercase mb-3">
            {activeDest ? (activeDest.level === 'iconic' ? 'Lusso Iconico' : 'Gemma Nascosta') : 'Viaggi di gruppo — HNWI & Beyond'}
          </p>
          <h1 className="font-playfair text-5xl md:text-6xl text-[#1C1C1C] mb-4">
            {activeDest ? activeDest.name : 'Itinerari'}
          </h1>
          {!activeDest && (
            <p className="font-cormorant text-[#5A4F44] text-xl italic max-w-2xl mx-auto">
              Dieci destinazioni curate. Da €1.200 a €30.000 per persona. Per ogni gruppo, ogni budget, ogni sogno.
            </p>
          )}
        </div>

        {/* Tabs */}
        {!activeDest && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex border border-[rgba(197,160,89,0.25)] rounded-full p-1 bg-[#FCFAF5]">
              {([['destinations', '🗺 Destinazioni'], ['builder', '⚙️ Costruisci']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setView(id)}
                  className={cn('px-6 py-2.5 rounded-full text-sm font-[family-name:var(--font-family-mono)] tracking-wider transition-all',
                    view === id ? 'bg-[#C5A059] text-[#1C1C1C] shadow-md' : 'text-[#5A4F44] hover:text-[#C5A059]')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeDest && (
            <motion.div key={`detail-${activeDest.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <DestinationDetail dest={activeDest} onBack={goBack} onNavigate={navigateTo} />
            </motion.div>
          )}

          {!activeDest && view === 'destinations' && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <FilterBar filters={filters} setFilters={setFilters} total={filtered.length} />

              {/* Level 1 */}
              {filtered.some(d => d.level === 'iconic') && (
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest">Livello 1</p>
                      <h2 className="font-playfair text-2xl text-[#1C1C1C]">Lusso iconico</h2>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[rgba(197,160,89,0.3)] to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-grid">
                    {filtered.filter(d => d.level === 'iconic').map((dest, i) => (
                      <motion.div key={dest.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                        <DestinationCard dest={dest} onClick={() => navigateTo(dest.id)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 2 */}
              {filtered.some(d => d.level === 'accessible') && (
                <div className="mb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-widest">Livello 2</p>
                      <h2 className="font-playfair text-2xl text-[#1C1C1C]">Gemme nascoste</h2>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-[rgba(107,94,82,0.2)] to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-grid">
                    {filtered.filter(d => d.level === 'accessible').map((dest, i) => (
                      <motion.div key={dest.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}>
                        <DestinationCard dest={dest} onClick={() => navigateTo(dest.id)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="font-playfair text-2xl text-[#1C1C1C] mb-3">Nessuna destinazione corrisponde ai filtri</p>
                  <p className="text-[#5A4F44] mb-6">Prova a rimuovere qualche filtro o parla con il concierge per una proposta personalizzata.</p>
                  <button onClick={() => setFilters({ age: null, budget: null, interests: [] })}
                    className="px-6 py-3 bg-[#C5A059] text-[#1C1C1C] rounded-full font-[family-name:var(--font-family-mono)] text-sm">
                    Azzera filtri
                  </button>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-12 text-center py-10 border-t border-[rgba(197,160,89,0.15)]">
                <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-[0.25em] mb-4">Destinazione non trovata?</p>
                <h2 className="font-playfair text-3xl text-[#1C1C1C] mb-3">Il concierge la trova per te</h2>
                <p className="text-[#5A4F44] text-sm mb-6 max-w-lg mx-auto">Invia una richiesta libera: dove vuoi andare, quante persone, il budget di massima.</p>
                <a href="/concierge" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1C1C1C] text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.15em] uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors">
                  Parla con il concierge →
                </a>
              </div>
            </motion.div>
          )}

          {!activeDest && view === 'builder' && (
            <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <ItineraryBuilder />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
