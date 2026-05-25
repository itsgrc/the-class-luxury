import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Check, Share2, Link2, ChevronRight, ArrowLeft, Users, Calendar, MapPin, Shield, Star, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'

// ─── GROUP DESTINATIONS DATA ───────────────────────────────────────────────

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
}

const groupDestinations: GroupDestination[] = [
  {
    id: 'maldive',
    name: 'Maldive',
    country: 'Repubblica delle Maldive',
    tagline: 'Un\'isola intera per il tuo gruppo',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=85&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1920&q=90&auto=format&fit=crop',
    duration: '7 – 14 notti',
    bestPeriod: 'Novembre – Aprile',
    groupSize: '6 – 16 persone',
    priceRange: '€12.000 – €25.000 / notte (villa intera)',
    pricePerPersonMin: 8500,
    pricePerPersonMax: 22000,
    whyGo: 'Le Maldive offrono qualcosa di unico al mondo: la sensazione concreta di possedere un\'isola. Quando il tuo gruppo affitta una villa resort privata, ogni corallo, ogni tramonto, ogni brezza appartiene esclusivamente a voi. Non è vacanza. È sovranità temporanea sul Paradiso.',
    activities: [
      'Cena privata su spiaggia con chef stellato locale',
      'Snorkeling e diving nella riserva UNESCO di Baa Atoll',
      'Sessione yoga al tramonto sul pontile sull\'acqua',
      'Tour notturno di bioluminescenza in mare aperto',
      'Escursione a Malé e mercato del pesce VIP',
    ],
    experiences: [
      'Villa overwater con piscina privata a sfioro (8–12 camere)',
      'Butler team dedicato 24/7 per il gruppo',
      'Idrovolante privato per arrivo/partenza panoramico',
      'Cena underwater nel ristorante sommergibile',
      'Spa suite con trattamenti ayurvedici di gruppo',
      'Pesca sportiva con capitano locale certificato',
    ],
    insuranceTip: 'Copertura medica minima 500.000€ obbligatoria per rimpatrio aereo. Aggiungere cancellazione viaggio (consigliata per gruppi numerosi) e copertura per attività acquatiche. I centri medici più avanzati si trovano a Malé — trasferimento in 30 min.',
    uniqueFact: 'Il 99% del territorio delle Maldive è oceano. Le ville private resort includono accesso diretto alla laguna cristallina direttamente dalla camera.',
    tags: ['Spiaggia', 'Privacy', 'Snorkeling', 'Luxury Resort'],
  },
  {
    id: 'grecia',
    name: 'Grecia',
    country: 'Mikonos & Santorini',
    tagline: 'Tramonti epici, nightlife esclusiva, storia millenaria',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=85&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920&q=90&auto=format&fit=crop',
    duration: '7 – 10 notti',
    bestPeriod: 'Maggio – Ottobre',
    groupSize: '6 – 20 persone',
    priceRange: '€2.200 – €9.800 / persona (pacchetto 7gg)',
    pricePerPersonMin: 2200,
    pricePerPersonMax: 9800,
    whyGo: 'La Grecia è l\'unica destinazione al mondo capace di unire nightlife da club ibizena, archeologia millenaria e viste mozzafiato in 7 giorni. Per un gruppo HNWI, Mikonos offre accesso VIP ai migliori beach club del Mediterraneo, mentre Santorini regala il tramonto più fotografato della Terra — vissuto però dalla terrazza di una villa privata sulle Cicladi.',
    activities: [
      'Tour in barca privata tra le isole delle Cicladi',
      'Degustazione vini con sommelier a Santorini (vigneti Assyrtiko)',
      'Escursione al vulcano di Nea Kameni e terme di Palea Kameni',
      'Taverna privata a Oia riservata solo per il gruppo',
      'Accesso VIP Nammos Beach Club a Mikonos',
    ],
    experiences: [
      'Veliero privato 30m con equipaggio per island hopping 3 giorni',
      'Villa con piscina infinity su caldera di Santorini (6–10 camere)',
      'Elicottero inter-isola Mikonos ↔ Santorini',
      'Chef greco stellato con menu degustazione di gruppo',
      'Tour privato dell\'Acropoli all\'alba (prima dei turisti)',
      'Lezione di ceramica tradizionale ciclasida',
    ],
    insuranceTip: 'La Tessera Sanitaria Europea copre le emergenze mediche. Per un pacchetto completo aggiungere: assicurazione cancellazione, bagaglio, e assistenza 24/7 con rimpatrio medico. Attenzione alle escursioni in mare aperto: richiesta copertura per sport acquatici.',
    uniqueFact: 'Santorini è l\'unico posto al mondo dove puoi vedere il tramonto sul mare stando al di sopra delle nuvole, dalla terrazza di Oia a 300m sul livello del mare.',
    tags: ['Cultura', 'Nightlife', 'Mare', 'Gastronomia'],
  },
  {
    id: 'croazia',
    name: 'Croazia',
    country: 'Dalmazia & Isole',
    tagline: 'Eleganza sobria tra baie segrete e borghi medievali',
    image: 'https://images.unsplash.com/photo-1555990793-da11153b6ca9?w=800&q=85&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90&auto=format&fit=crop',
    duration: '8 – 10 notti',
    bestPeriod: 'Giugno – Settembre',
    groupSize: '8 – 16 persone',
    priceRange: '€7.000 – €15.000 / persona (crociera privata 8gg)',
    pricePerPersonMin: 7000,
    pricePerPersonMax: 15000,
    whyGo: 'La Dalmazia è il segreto meglio custodito del Mediterraneo di lusso. Le sue 1.246 isole offrono una privacy che il Mediterraneo occidentale non può più garantire: baie cristalline accessibili solo via mare, borghi medievali come Dubrovnik e Hvar dove il tempo si è fermato, e una gastronomia locale che rivaleggia con l\'Italia. Per un gruppo che vuole eleganza senza ostentazione, la Croazia è la scelta definitiva.',
    activities: [
      'Esplorazione delle mura medievali di Dubrovnik all\'alba (accesso esclusivo)',
      'Degustazione olio d\'oliva e vino plavac mali sull\'isola di Brač',
      'Snorkeling nel Parco Marino di Kornati',
      'Serata privata in masseria storica a Hvar',
      'Kayak tra i canyon fluviali della Krka',
    ],
    experiences: [
      'Catamarano privato 18m con skipper e hostess per 8 giorni',
      'Accesso a ristorante Zinfandel\'s di Dubrovnik (1 stella Michelin)',
      'Notte in castello medievale privato sull\'isola di Korčula',
      'Tour truffle hunting privato in Istria',
      'Lezione di cucina dalmatina con chef locale in masseria',
      'Kayak sunset tour tra le grotte marine di Vis',
    ],
    insuranceTip: 'Croazia è UE dal 2023: Tessera Sanitaria Europea valida. Per gruppi su imbarcazioni privata aggiungere: assicurazione nautica, responsabilità civile, copertura meteo per cancellazione/anticipo partenza. Fondamentale avere copertura per attività marittime.',
    uniqueFact: 'La Croazia ha oltre 1.246 isole, di cui solo 48 abitate. Il vostro skipper può portarvi in baie che non appaiono su Google Maps.',
    tags: ['Barca', 'Cultura', 'Gastronomia', 'Natura'],
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'Emirati Arabi Uniti',
    tagline: 'La città che ridefinisce il concetto di lusso ogni giorno',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=1920&q=90&auto=format&fit=crop',
    duration: '5 – 8 notti',
    bestPeriod: 'Ottobre – Aprile',
    groupSize: '6 – 20 persone',
    priceRange: 'Su richiesta (pacchetti da €8.000/persona)',
    pricePerPersonMin: 8000,
    pricePerPersonMax: 30000,
    whyGo: 'Dubai non è una destinazione. È una dichiarazione. La città che ha costruito isole artificiali, un hotel a forma di vela e un parco divertimenti al chiuso in mezzo al deserto non smette mai di stupire. Per un gruppo d\'élite, Dubai rappresenta la summa del lusso contemporaneo: dove servizio, architettura, gastronomia e innovazione si fondono in un\'esperienza continua di eccesso consapevole.',
    activities: [
      'Tour in elicottero privato sullo skyline e sulle Palm Islands',
      'Esperienza deserto in convoy di Lamborghini Urus con cena beduina',
      'Osservatorio Burj Khalifa At the Top Sky (piano 148) riservato',
      'Shopping privato in Mall of the Emirates (fuori orario)',
      'Serata esclusiva in roof bar con vista 360° sulla città',
    ],
    experiences: [
      'Suite Presidential al Burj Al Arab (1 notte inclusa nel pacchetto)',
      'Yacht privato 30m nel Dubai Creek e Palm Jumeirah',
      'Cena privata al Nobu One Palm (riservazione esclusiva)',
      'Skydiving sopra il Palm Jumeirah per il gruppo',
      'Incontro privato con falconiere tradizionale emiratino',
      'Accesso VIP Cavalli Club con table riservata',
    ],
    insuranceTip: 'Copertura medica minima 1.000.000€. Il sistema sanitario a Dubai è eccellente ma costoso per non residenti. Obbligatoria assicurazione attività: skydiving, sport estremi nel deserto. Verificare copertura assicurativa per eventuali acquisti di lusso in loco.',
    uniqueFact: 'Dubai ha costruito il suo primo grattacielo nel 1979. Oggi ne ha oltre 900. Il Burj Khalifa è così alto che puoi vedere un secondo tramonto salendo dall\'ultimo piano dopo il tramonto al suolo.',
    tags: ['Architettura', 'Shopping', 'Gastronomia', 'Avventura'],
  },
  {
    id: 'caraibi',
    name: 'Caraibi',
    country: 'Isole Vergini Britanniche',
    tagline: 'Lusso informale tra 60 isole di natura selvaggia',
    image: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?w=800&q=85&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=90&auto=format&fit=crop',
    duration: '10 – 14 notti',
    bestPeriod: 'Dicembre – Aprile',
    groupSize: '6 – 16 persone',
    priceRange: '€10.000 – €25.000 / persona (10 notti)',
    pricePerPersonMin: 10000,
    pricePerPersonMax: 25000,
    whyGo: 'Le BVI sono l\'unica destinazione caraibica dove il lusso rimane autentico. Nessun mega-resort da 3.000 camere, nessuna spiaggia sovraffollata. Solo 60 isole, per lo più inabitabili, accessibili solo via mare. Il vostro catamarano diventa casa, trasporto e club privato al tempo stesso. La libertà non ha altro nome.',
    activities: [
      'Snorkeling a The Baths di Virgin Gorda (formazioni di granito iconiche)',
      'Cocktail party privato su Jost Van Dyke (la barra più remota dei Caraibi)',
      'Pesca sportiva con capitano certificato IGFA',
      'Stand-up paddle tour nelle lagune protette di Anegada',
      'Tramonto con degustazione rum agricolo artigianale',
    ],
    experiences: [
      'Catamarano 60ft con skipper e chef a bordo (10 giorni)',
      'Villa su Necker Island (disponibile su richiesta, accesso esclusivo)',
      'Escursione privata a Mosquito Island (isola privata di Richard Branson)',
      'Immersione sul relitto del RMS Rhone (sito UNESCO)',
      'Concerto privato di musicisti locali al tramonto su spiaggia',
      'Evacuazione medica aerea inclusa nel pacchetto premium',
    ],
    insuranceTip: 'Copertura medica 500.000€ con clausola di evacuazione aerea obbligatoria: l\'ospedale più attrezzato è a San Juan, Porto Rico (45 min di volo). Assicurazione per attività subacquee essenziale. Copertura uragani raccomandata (stagione: Giugno – Novembre, da evitare).',
    uniqueFact: 'Nelle BVI esistono baie dove il vostro catamarano può ancorare a 10 metri dalla spiaggia bianca più vicina all\'umanità. Quella spiaggia non ha nome su nessuna mappa.',
    tags: ['Barca', 'Natura', 'Snorkeling', 'Privacy'],
  },
]

// ─── EXISTING ITINERARY BUILDER DATA ───────────────────────────────────────

interface ItineraryState {
  transport: string[]
  experiences: string[]
  extras: string[]
}

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
  { id: 1, label: 'Trasporto', sublabel: 'Come vuoi muoverti' },
  { id: 2, label: 'Esperienze', sublabel: 'Cosa vuoi vivere' },
  { id: 3, label: 'Extra', sublabel: 'Servizi aggiuntivi' },
]

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────

function getTotal(state: ItineraryState): number {
  const allOptions = [...transportOptions, ...experienceOptions, ...extraOptions]
  const selectedIds = [...state.transport, ...state.experiences, ...state.extras]
  return allOptions.filter(o => selectedIds.includes(o.id)).reduce((s, o) => s + o.price, 0)
}
function encodeState(state: ItineraryState): string { return btoa(JSON.stringify(state)) }
function decodeState(encoded: string): ItineraryState | null {
  try { return JSON.parse(atob(encoded)) } catch { return null }
}

function getFactotumSuggestion(destId: string): string | null {
  try {
    const reminders: Array<{ title?: string; description?: string }> = JSON.parse(localStorage.getItem('theclass_factotum') ?? '[]')
    const concierge: Array<{ prompt?: string }> = JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]')
    const all = [
      ...reminders.map(r => `${r.title ?? ''} ${r.description ?? ''}`),
      ...concierge.map(c => c.prompt ?? ''),
    ].join(' ').toLowerCase()

    if (destId === 'croazia' && (all.includes('vela') || all.includes('barca') || all.includes('yacht') || all.includes('mare')))
      return 'Visto che ami il mare e la vela, la Croazia potrebbe essere la tua destinazione ideale: 1.246 isole da scoprire in catamarano privato.'
    if (destId === 'maldive' && (all.includes('snorkeling') || all.includes('subacquea') || all.includes('mare') || all.includes('isola')))
      return 'Il tuo profilo Factotum suggerisce un\'affinità con il mare. Le Maldive con villa privata corrispondono esattamente alle tue preferenze.'
    if (destId === 'grecia' && (all.includes('storia') || all.includes('arte') || all.includes('gastronomia') || all.includes('vino')))
      return 'Le tue preferenze culturali e gastronomiche si allineano perfettamente con la Grecia — storia millenaria e cucina mediterranea di livello eccezionale.'
    if (destId === 'dubai' && (all.includes('architettura') || all.includes('shopping') || all.includes('business') || all.includes('tech')))
      return 'Il tuo profilo business e tech si rispecchia perfettamente in Dubai — la destinazione che ridefinisce il lusso contemporaneo ogni giorno.'
    if (destId === 'caraibi' && (all.includes('natura') || all.includes('avventura') || all.includes('immersione') || all.includes('pesca')))
      return 'Il tuo interesse per natura e avventura trova la sua espressione più autentica nelle Isole Vergini Britanniche.'
  } catch { /* ignore */ }
  return null
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

function OptionButton({
  id, label, price, icon, selected, onToggle,
}: { id: string; label: string; price: number; icon: string; selected: boolean; onToggle: () => void }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onToggle}
      className={cn(
        'w-full text-left p-4 rounded-2xl border transition-all duration-200',
        selected
          ? 'border-[#C5A059] bg-[rgba(197,160,89,0.06)] shadow-[0_4px_20px_rgba(197,160,89,0.1)]'
          : 'border-[rgba(197,160,89,0.2)] hover:border-[rgba(197,160,89,0.4)] bg-[#FCFAF5]'
      )}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1C1C1C]">{label}</p>
          <p className="font-[family-name:var(--font-family-mono)] text-xs text-[#C5A059] mt-0.5">{formatPrice(price)}</p>
        </div>
        <div className={cn('w-5 h-5 rounded border flex-shrink-0 transition-all flex items-center justify-center',
          selected ? 'bg-[#C5A059] border-[#C5A059]' : 'border-[rgba(197,160,89,0.4)]')}>
          {selected && <Check size={10} className="text-white" />}
        </div>
      </div>
    </motion.button>
  )
}

function DestinationCard({ dest, onClick }: { dest: GroupDestination; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: [0.2, 0.9, 0.4, 1.1] }}
      onClick={onClick}
      className="cursor-pointer rounded-3xl overflow-hidden border border-[rgba(197,160,89,0.18)] shadow-sm bg-[#FDF9F2] group">
      <div className="relative h-56 overflow-hidden">
        <img src={dest.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={dest.name} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-[#1C1C1C]/10 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[rgba(197,160,89,0.9)] backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Star size={9} className="text-[#1C1C1C] fill-[#1C1C1C]" />
          <span className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#1C1C1C] tracking-widest uppercase font-bold">Certificato The Class</span>
        </div>
        <span className="absolute top-3 right-3 text-[9px] font-[family-name:var(--font-family-mono)] text-white border border-white/40 rounded-full px-2.5 py-1 bg-[rgba(28,28,28,0.5)] uppercase tracking-widest">
          Gruppo
        </span>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-playfair text-white text-2xl leading-tight">{dest.name}</p>
          <p className="text-white/70 text-xs font-[family-name:var(--font-family-mono)] mt-0.5">{dest.country}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[#5A4F44] text-sm leading-relaxed mb-4 italic font-cormorant text-base">{dest.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {dest.tags.map(tag => (
            <span key={tag} className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059] border border-[rgba(197,160,89,0.3)] rounded-full px-2.5 py-0.5 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(197,160,89,0.12)]">
          <div>
            <p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Durata</p>
            <p className="text-xs text-[#1C1C1C] font-medium">{dest.duration}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Gruppo</p>
            <p className="text-xs text-[#1C1C1C] font-medium">{dest.groupSize}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] uppercase tracking-wider mb-0.5">Partenza</p>
            <p className="text-xs text-[#1C1C1C] font-medium">{dest.bestPeriod.split('–')[0].trim()}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-sm">{dest.priceRange}</span>
          <span className="text-[10px] text-[#5A4F44] group-hover:text-[#C5A059] transition flex items-center gap-1 font-[family-name:var(--font-family-mono)]">
            Scopri <ChevronRight size={11} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function DestinationDetail({ dest, onBack }: { dest: GroupDestination; onBack: () => void }) {
  const [persons, setPersons] = useState(10)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 120])
  const suggestion = getFactotumSuggestion(dest.id)

  const estimatedMin = (persons * dest.pricePerPersonMin).toLocaleString('it-IT')
  const estimatedMax = (persons * dest.pricePerPersonMax).toLocaleString('it-IT')

  const shareDestination = () => {
    const url = `${window.location.origin}/itinerari?dest=${dest.id}`
    navigator.clipboard.writeText(url).then(() =>
      toast.success('Link copiato!', { description: `Condividi ${dest.name} con il tuo gruppo.` })
    )
  }

  const requestQuote = () => {
    const existing = (() => { try { return JSON.parse(localStorage.getItem('theclass_concierge') ?? '[]') } catch { return [] } })()
    const id = `req-${Date.now()}`
    existing.push({ id, prompt: `Preventivo gruppo ${persons} persone — ${dest.name} (${dest.country}), ${dest.duration}`, timestamp: Date.now(), status: 'pending' })
    localStorage.setItem('theclass_concierge', JSON.stringify(existing))
    toast.success('Richiesta inviata!', { description: `Preventivo per ${dest.name} — ${persons} persone. Risposta entro 24h.` })
    setTimeout(() => { window.location.href = `/concierge?ref=${id}` }, 1800)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-[#5A4F44] hover:text-[#C5A059] transition mb-8 font-[family-name:var(--font-family-mono)] text-sm tracking-wider group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Tutti gli itinerari
      </button>

      {/* Hero */}
      <div ref={heroRef} className="relative h-[55vh] rounded-3xl overflow-hidden mb-10">
        <motion.img
          style={{ y: heroY }}
          src={dest.heroImage}
          className="absolute inset-0 w-full h-[120%] object-cover"
          alt={dest.name}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/85 via-[#1C1C1C]/20 to-transparent" />
        <div className="absolute top-5 left-5 flex items-center gap-2 bg-[rgba(197,160,89,0.92)] backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Star size={10} className="text-[#1C1C1C] fill-[#1C1C1C]" />
          <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#1C1C1C] tracking-widest uppercase font-bold">Certificato The Class</span>
        </div>
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div>
            <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-[10px] tracking-[0.2em] uppercase mb-2">{dest.country}</p>
            <h1 className="font-playfair text-5xl md:text-6xl text-white leading-tight">{dest.name}</h1>
            <p className="font-cormorant text-white/80 text-xl italic mt-2">{dest.tagline}</p>
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
            <p className="text-sm text-[#1C1C1C] leading-relaxed">{suggestion}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-10">

          {/* Info box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: 'Durata', value: dest.duration },
              { icon: MapPin, label: 'Periodo', value: dest.bestPeriod },
              { icon: Users, label: 'Gruppo', value: dest.groupSize },
              { icon: Star, label: 'Categoria', value: 'HNWI Group' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="luxury-card rounded-2xl p-4 text-center">
                <Icon size={16} className="text-[#C5A059] mx-auto mb-2" />
                <p className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm text-[#1C1C1C] font-medium leading-snug">{value}</p>
              </div>
            ))}
          </div>

          {/* Perché andare */}
          <div>
            <p className="text-[10px] tracking-[0.25em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Perché andare</p>
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-4">L'essenza di {dest.name}</h2>
            <p className="text-[#5A4F44] leading-relaxed text-[15px]">{dest.whyGo}</p>
            <div className="mt-4 p-4 bg-[rgba(197,160,89,0.04)] border-l-2 border-[#C5A059] rounded-r-xl">
              <p className="text-sm text-[#5A4F44] italic font-cormorant text-base">✦ {dest.uniqueFact}</p>
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
            <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-5">Esperienze esclusive The Class</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {dest.experiences.map((exp, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-[#FDF9F2] border border-[rgba(197,160,89,0.18)]">
                  <div className="w-5 h-5 rounded-full bg-[rgba(197,160,89,0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={9} className="text-[#C5A059]" />
                  </div>
                  <p className="text-sm text-[#1C1C1C] leading-relaxed">{exp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assicurazione */}
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

        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Cost estimator */}
          <div className="luxury-card rounded-2xl p-6">
            <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest mb-1">Widget esclusivo</p>
            <h3 className="font-playfair text-lg text-[#1C1C1C] mb-4">Stima costi gruppo</h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-[#5A4F44] font-[family-name:var(--font-family-mono)]">Numero persone</label>
                <span className="text-[#C5A059] font-[family-name:var(--font-family-mono)] text-lg font-bold">{persons}</span>
              </div>
              <input
                type="range" min={6} max={20} value={persons}
                onChange={e => setPersons(Number(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#5A4F44] font-[family-name:var(--font-family-mono)] mt-1">
                <span>6 min</span><span>20 max</span>
              </div>
            </div>
            <div className="border-t border-[rgba(197,160,89,0.15)] pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#5A4F44]">Stima minima</span>
                <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] font-bold">€{estimatedMin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#5A4F44]">Stima massima</span>
                <span className="font-[family-name:var(--font-family-mono)] text-[#C5A059] font-bold">€{estimatedMax}</span>
              </div>
            </div>
            <p className="text-[9px] text-[#5A4F44]/60 mt-3 font-[family-name:var(--font-family-mono)]">* Stima orientativa. Prezzi definitivi su preventivo personalizzato.</p>
          </div>

          {/* Price range */}
          <div className="luxury-card rounded-2xl p-5">
            <p className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] uppercase tracking-widest mb-1">Costo indicativo</p>
            <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] text-base leading-snug">{dest.priceRange}</p>
          </div>

          {/* CTAs */}
          <button onClick={requestQuote}
            className="w-full py-4 bg-[#1C1C1C] text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.15em] uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors shadow-lg">
            Richiedi preventivo gruppo
          </button>

          <button onClick={shareDestination}
            className="w-full py-3.5 border border-[rgba(197,160,89,0.4)] text-[#5A4F44] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-wider uppercase hover:border-[#C5A059] hover:text-[#C5A059] transition flex items-center justify-center gap-2">
            <Share2 size={12} /> Condividi itinerario
          </button>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {dest.tags.map(tag => (
              <span key={tag} className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#C5A059] border border-[rgba(197,160,89,0.3)] rounded-full px-3 py-1 uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  )
}

// ─── ITINERARY BUILDER (preserved) ────────────────────────────────────────

function ItineraryBuilder() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<ItineraryState>({ transport: [], experiences: [], extras: [] })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('it')
    if (encoded) {
      const decoded = decodeState(encoded)
      if (decoded) { setState(decoded); toast.success('Itinerario ripristinato!') }
      return
    }
    try {
      const saved = localStorage.getItem('theclass_itinerario_draft')
      if (saved) {
        const parsed: ItineraryState = JSON.parse(saved)
        if (parsed.transport.length || parsed.experiences.length || parsed.extras.length) {
          setState(parsed); toast('Bozza ripristinata', { description: 'Hai una selezione non completata salvata.' })
        }
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem('theclass_itinerario_draft', JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const toggle = (section: keyof ItineraryState, id: string) => {
    setState(prev => ({ ...prev, [section]: prev[section].includes(id) ? prev[section].filter(i => i !== id) : [...prev[section], id] }))
  }

  const shareItinerary = () => {
    const url = `${window.location.origin}/itinerari?it=${encodeState(state)}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiato!', { description: 'Condividi il link con chi vuoi.' }))
  }

  const total = getTotal(state)
  const selectedCount = state.transport.length + state.experiences.length + state.extras.length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button onClick={() => setStep(s.id)}
                className={cn('flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 text-sm',
                  step === s.id ? 'bg-[#C5A059] text-white shadow-[0_4px_16px_rgba(197,160,89,0.3)]'
                  : step > s.id ? 'border border-[#C5A059] text-[#C5A059] bg-[rgba(197,160,89,0.06)]'
                  : 'border border-[rgba(197,160,89,0.3)] text-[#5A4F44]')}>
                {step > s.id ? <Check size={12} /> : <span className="font-[family-name:var(--font-family-mono)] text-xs">{String(s.id).padStart(2, '0')}</span>}
                <span>{s.label}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-[rgba(197,160,89,0.4)]" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Come vuoi muoverti?</h2>
              {transportOptions.map(opt => <OptionButton key={opt.id} {...opt} selected={state.transport.includes(opt.id)} onToggle={() => toggle('transport', opt.id)} />)}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Cosa vuoi vivere?</h2>
              {experienceOptions.map(opt => <OptionButton key={opt.id} {...opt} selected={state.experiences.includes(opt.id)} onToggle={() => toggle('experiences', opt.id)} />)}
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-playfair text-2xl text-[#1C1C1C] mb-6">Aggiungi servizi extra</h2>
              {extraOptions.map(opt => <OptionButton key={opt.id} {...opt} selected={state.extras.includes(opt.id)} onToggle={() => toggle('extras', opt.id)} />)}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
            className="px-6 py-2.5 rounded-full border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm disabled:opacity-30 hover:border-[#C5A059] transition-colors">
            Indietro
          </button>
          {step < 3
            ? <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:bg-[#b8924a] transition-colors">Avanti</button>
            : <button onClick={shareItinerary} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C5A059] text-white text-sm hover:bg-[#b8924a] transition-colors"><Share2 size={14} />Condividi itinerario</button>
          }
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-[#FCFAF5] rounded-2xl border border-[rgba(197,160,89,0.25)] p-6">
          <h3 className="font-playfair text-lg text-[#1C1C1C] mb-4 pb-4 border-b border-[rgba(197,160,89,0.2)]">Riepilogo</h3>
          {selectedCount === 0
            ? <p className="text-sm text-[#5A4F44] italic">Nessun elemento selezionato</p>
            : <div className="space-y-3 mb-4">
                {[
                  { label: 'Trasporto', ids: state.transport, options: transportOptions },
                  { label: 'Esperienze', ids: state.experiences, options: experienceOptions },
                  { label: 'Extra', ids: state.extras, options: extraOptions },
                ].map(section => {
                  const selected = section.options.filter(o => section.ids.includes(o.id))
                  if (!selected.length) return null
                  return (
                    <div key={section.label}>
                      <p className="text-xs text-[#5A4F44] uppercase tracking-wider mb-1.5">{section.label}</p>
                      {selected.map(o => (
                        <div key={o.id} className="flex justify-between items-center text-sm mb-1">
                          <span className="text-[#1C1C1C] font-light flex items-center gap-1.5"><span>{o.icon}</span><span className="truncate">{o.label.split('–')[0].trim()}</span></span>
                          <span className="font-[family-name:var(--font-family-mono)] text-xs text-[#5A4F44]">{formatPrice(o.price)}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
          }
          {total > 0 && (
            <div className="border-t border-[rgba(197,160,89,0.2)] pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[#5A4F44]">Totale stimato</span>
                <span className="font-[family-name:var(--font-family-mono)] text-xl text-[#C5A059]">{formatPrice(total)}</span>
              </div>
            </div>
          )}
          {selectedCount > 0 && (
            <button onClick={shareItinerary}
              className="w-full mt-4 flex items-center justify-center gap-2 border border-[rgba(197,160,89,0.4)] text-[#5A4F44] py-2.5 rounded-xl text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors">
              <Link2 size={12} />Copia link itinerario
            </button>
          )}
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

  // Restore destination from URL ?dest=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dest = params.get('dest')
    if (dest && groupDestinations.find(d => d.id === dest)) {
      setActiveDestId(dest)
      setView('destinations')
    }
  }, [])

  const activeDest = activeDestId ? groupDestinations.find(d => d.id === activeDestId) ?? null : null

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-24">
      <title>Itinerari di Gruppo Luxury — the Class</title>
      <meta name="description" content="Destinazioni luxury per gruppi HNWI: Maldive, Grecia, Croazia, Dubai, Caraibi. Esperienze esclusive, preventivi dedicati, Certificato The Class." />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="font-[family-name:var(--font-family-mono)] text-[#C5A059] tracking-[0.25em] text-[10px] uppercase mb-3">Viaggi di gruppo — HNWI</p>
          <h1 className="font-playfair text-5xl md:text-6xl text-[#1C1C1C] mb-4">
            {activeDest ? activeDest.name : 'Itinerari'}
          </h1>
          {!activeDest && (
            <p className="font-cormorant text-[#5A4F44] text-xl italic max-w-2xl mx-auto">
              Cinque destinazioni curate per gruppi d'élite. Ogni dettaglio è già pensato.
            </p>
          )}
        </div>

        {/* Mode tabs (only on grid view, not detail) */}
        {!activeDest && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex border border-[rgba(197,160,89,0.25)] rounded-full p-1 bg-[#FCFAF5]">
              {([
                { id: 'destinations', label: '🗺 Destinazioni gruppo' },
                { id: 'builder', label: '⚙️ Costruisci itinerario' },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setView(tab.id)}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-[family-name:var(--font-family-mono)] tracking-wider transition-all duration-200',
                    view === tab.id
                      ? 'bg-[#C5A059] text-[#1C1C1C] shadow-md'
                      : 'text-[#5A4F44] hover:text-[#C5A059]'
                  )}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Detail view */}
          {activeDest && (
            <motion.div key={`detail-${activeDest.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <DestinationDetail dest={activeDest} onBack={() => { setActiveDestId(null); window.history.pushState({}, '', '/itinerari') }} />
            </motion.div>
          )}

          {/* Destinations grid */}
          {!activeDest && view === 'destinations' && (
            <motion.div key="grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {groupDestinations.map((dest, i) => (
                  <motion.div key={dest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}>
                    <DestinationCard dest={dest} onClick={() => {
                      setActiveDestId(dest.id)
                      window.history.pushState({}, '', `/itinerari?dest=${dest.id}`)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }} />
                  </motion.div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-16 text-center py-12 border-t border-[rgba(197,160,89,0.15)]">
                <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-[0.25em] mb-4">Destinazione non trovata?</p>
                <h2 className="font-playfair text-3xl text-[#1C1C1C] mb-3">Il concierge la trova per te</h2>
                <p className="text-[#5A4F44] text-sm mb-6 max-w-lg mx-auto">Invia una richiesta libera: dove vuoi andare, quante persone, il budget di massima. Risposta garantita entro 24 ore.</p>
                <a href="/concierge" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1C1C1C] text-[#FDF9F2] rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.15em] uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors">
                  Parla con il concierge →
                </a>
              </div>
            </motion.div>
          )}

          {/* Builder */}
          {!activeDest && view === 'builder' && (
            <motion.div key="builder" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <ItineraryBuilder />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
