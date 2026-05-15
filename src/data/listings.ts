export type Category = 'yacht' | 'jet' | 'auto' | 'esperienza' | 'fractional' | 'concierge' | 'staff' | 'asta'

export interface UpgradeOption {
  id: string
  name: string
  description: string
  price: number
  image: string
}

export interface Listing {
  id: string
  title: string
  category: Category
  price: number
  priceUnit: string
  location: string
  image: string
  description: string
  trending?: boolean
  features: string[]
  rating: number
  reviews: number
  upgrades: UpgradeOption[]
  coords: { lat: number; lng: number }
}

const sharedUpgrades: UpgradeOption[] = [
  {
    id: 'up-champagne',
    name: 'Champagne Krug Grande Cuvée',
    description: 'Cassa 6 bottiglie, servita a 8°C con sommelier',
    price: 480,
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&q=80',
  },
  {
    id: 'up-photo',
    name: 'Fotografo Professionista',
    description: '4 ore di shooting, 100 scatti editati in 48h',
    price: 850,
    image: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&q=80',
  },
  {
    id: 'up-massage',
    name: 'Massaggio di Coppia',
    description: 'Massaggiatrice certificata, 90 min a bordo',
    price: 320,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80',
  },
  {
    id: 'up-sushi',
    name: 'Sushi Chef Privato',
    description: 'Omakase per 4 persone, ingredienti premium',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
  },
]

export const listings: Listing[] = [
  {
    id: 'tc-001',
    title: 'Azimut Grande 27 – Doppio Flybridge',
    category: 'yacht',
    price: 18500,
    priceUnit: 'settimana',
    location: 'Portofino, Liguria',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
    description: 'Un capolavoro galleggiante da 27 metri. Suite armatoriale con vasca, Jacuzzi di poppa, tender Williams Turbojet e chef privato incluso. Naviga le acque smeraldo della Liguria con il massimo del comfort italiano.',
    trending: true,
    features: ['Chef privato', 'Jacuzzi di poppa', '5 cabine', 'Wi-Fi Starlink', 'Tender incluso'],
    rating: 4.9,
    reviews: 47,
    upgrades: sharedUpgrades,
    coords: { lat: 44.3, lng: 9.21 },
  },
  {
    id: 'tc-002',
    title: 'Riva Aquarama Special 1973',
    category: 'yacht',
    price: 4200,
    priceUnit: 'giorno',
    location: 'Lago di Como, Lombardia',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    description: 'La Rolls-Royce dell\'acqua. Riva Aquarama originale restaurato con motori twin Crusader 350CV cromati. Legno mogano lucidato a mano, sedili pelle avorio. Un\'icona degli anni \'70 per una giornata senza tempo sul Lago di Como.',
    trending: true,
    features: ['Restauro originale', 'Skipper incluso', 'Champagne a bordo', 'Picnic gourmet', 'Transfer'],
    rating: 5.0,
    reviews: 23,
    upgrades: sharedUpgrades,
    coords: { lat: 45.99, lng: 9.27 },
  },
  {
    id: 'tc-003',
    title: 'Gulfstream G700 – Intercontinental',
    category: 'jet',
    price: 125000,
    priceUnit: 'tratta',
    location: 'Milano Malpensa (MXP)',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
    description: 'Il jet privato più avanzato al mondo. 19 posti in configurazione ultra-lusso, range 13.890 km non-stop. Dormitori separati, cucina completa, bagni in marmo e suite lounge con divani in pelle. Da Milano a New York senza compromessi.',
    trending: true,
    features: ['19 passeggeri', 'Dormitori privati', 'Chef di bordo', 'Wi-Fi Starlink Ka', 'Range 13.890 km'],
    rating: 4.8,
    reviews: 31,
    upgrades: sharedUpgrades,
    coords: { lat: 45.63, lng: 8.72 },
  },
  {
    id: 'tc-004',
    title: 'Embraer Phenom 300E – City Hopper',
    category: 'jet',
    price: 8900,
    priceUnit: 'ora di volo',
    location: 'Roma Ciampino (CIA)',
    image: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=800&q=80',
    description: 'Il light jet più performante della sua categoria. 8 passeggeri, cabina pressurizzata silenziosa, bagagli generosi. Ideale per Parigi, Londra, Zurigo. Partenza in 2 ore dalla richiesta.',
    features: ['8 passeggeri', 'Cabina extra silenziosa', 'Interni custom', 'Bagagli abbondanti', 'Catering incluso'],
    rating: 4.7,
    reviews: 58,
    upgrades: sharedUpgrades,
    coords: { lat: 41.79, lng: 12.59 },
  },
  {
    id: 'tc-005',
    title: 'Ferrari SF90 Stradale – Weekend Factory',
    category: 'auto',
    price: 3800,
    priceUnit: 'weekend',
    location: 'Maranello, Emilia-Romagna',
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80',
    description: '1000 CV ibridi plug-in. La Ferrari più potente di sempre. Ritiro direttamente in fabbrica a Maranello con giro pista Fiorano incluso, tour esclusivo Museo Ferrari e pranzo nel ristorante degli ingegneri.',
    trending: true,
    features: ['1000 CV PHEV', 'Ritiro Maranello', 'Giro pista Fiorano', 'Tour museo', 'Full kasko'],
    rating: 5.0,
    reviews: 19,
    upgrades: sharedUpgrades,
    coords: { lat: 44.53, lng: 10.86 },
  },
  {
    id: 'tc-006',
    title: 'Rolls-Royce Cullinan – Rappresentanza',
    category: 'auto',
    price: 1200,
    priceUnit: 'giorno',
    location: 'Milano, Lombardia',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80',
    description: 'L\'SUV più lussuoso al mondo. Autista privato 24/7, minibar in cristallo, sedili massaggianti riscaldati, profumatore ambiente. Silenzio assoluto, comfort soprannaturale. Per il viaggiatore che non transige.',
    features: ['Autista 24/7', 'Minibar cristallo', 'Sedili massaggio', 'Wi-Fi bordo', 'Autista multilingue'],
    rating: 4.9,
    reviews: 84,
    upgrades: sharedUpgrades,
    coords: { lat: 45.46, lng: 9.19 },
  },
  {
    id: 'tc-007',
    title: 'Cena Privata – Enoteca Pinchiorri',
    category: 'esperienza',
    price: 2400,
    priceUnit: 'per coppia',
    location: 'Firenze, Toscana',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    description: 'Una serata nell\'unico 3 stelle Michelin di Firenze, in sala privata. Menu degustazione 12 portate con abbinamento da cantine storiche: Pétrus 2005, Romanée-Conti, Sassicaia riserva. Sommelier dedicato.',
    trending: true,
    features: ['3 stelle Michelin', '12 portate', 'Sommelier privato', 'Sala riservata', 'Transfer incluso'],
    rating: 5.0,
    reviews: 12,
    upgrades: sharedUpgrades,
    coords: { lat: 43.77, lng: 11.26 },
  },
  {
    id: 'tc-008',
    title: 'Fractional Ownership – Pilatus PC-12',
    category: 'fractional',
    price: 85000,
    priceUnit: 'quota 1/8 annuale',
    location: 'Ginevra, Svizzera',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    description: 'Possiedi una quota di turboelica premium. 50 ore di volo annue garantite, gestione operativa e manutenzione incluse, hangaraggio Ginevra. Il metodo più razionale per accedere all\'aviazione privata senza i costi fissi.',
    features: ['50 ore/anno', 'Gestione totale', 'Hangaraggio', 'Assicurazione', 'Disponibilità 4h'],
    rating: 4.8,
    reviews: 7,
    upgrades: sharedUpgrades,
    coords: { lat: 46.23, lng: 6.11 },
  },
  {
    id: 'tc-009',
    title: 'Concierge Platinum – Abbonamento Annuale',
    category: 'concierge',
    price: 12000,
    priceUnit: 'anno',
    location: 'Worldwide',
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
    description: 'Il tuo assistente personale 24/7 per 365 giorni. Prenotazioni in ristoranti altrimenti irraggiungibili, biglietti sold-out, viaggi organizzati in 48h, spedizioni gift. Una rete globale al tuo servizio esclusivo.',
    features: ['24/7 disponibile', 'Team multilingue', 'Rete globale', 'Last-minute', 'Illimitato'],
    rating: 4.9,
    reviews: 156,
    upgrades: sharedUpgrades,
    coords: { lat: 45.46, lng: 9.19 },
  },
  {
    id: 'tc-010',
    title: 'Villa Staff – Équipe Completa Sardegna',
    category: 'staff',
    price: 6500,
    priceUnit: 'settimana',
    location: 'Costa Smeralda, Sardegna',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    description: 'Chef stellato, sommelier, maggiordomo, governante e security discreto. Cinque professionisti per trasformare la tua villa in Sardegna in un hotel 7 stelle privato. Selezione personale, NDA firmato.',
    features: ['Chef stellato', 'Sommelier', 'Maggiordomo', 'Security 24/7', 'NDA firmato'],
    rating: 4.9,
    reviews: 28,
    upgrades: sharedUpgrades,
    coords: { lat: 41.09, lng: 9.51 },
  },
  {
    id: 'tc-011',
    title: 'Asta Privata – Arte Contemporanea',
    category: 'asta',
    price: 50000,
    priceUnit: 'base d\'asta',
    location: 'Venezia, Veneto',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    description: 'Accesso esclusivo all\'asta privata delle principali gallerie veneziane durante la Biennale. Opere di Cattelan, Vezzoli, Koons e Kapoor. Solo 12 collezionisti invitati. Consulenza curatoriale pre-asta inclusa.',
    trending: true,
    features: ['Solo 12 invitati', 'Consulenza curatoriale', 'Certificati autenticità', 'Spedizione assicurata', 'Catalogo riservato'],
    rating: 4.7,
    reviews: 4,
    upgrades: sharedUpgrades,
    coords: { lat: 45.43, lng: 12.33 },
  },
  {
    id: 'tc-012',
    title: 'Lamborghini Sterrato – Avventura Dolomiti',
    category: 'auto',
    price: 2800,
    priceUnit: 'giorno',
    location: 'Dolomiti, Alto Adige',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    description: '610 CV su sterrato alpino. La supercar che non teme il fuoristrada. Tre giorni sulle Dolomiti con percorso guidato esclusivo, pernottamento in rifugio di design e cena dallo chef stellato altoatesino.',
    features: ['610 CV', 'Guida guidata Dolomiti', 'Rifugio design', 'Chef stellato', 'Fotografo incluso'],
    rating: 4.8,
    reviews: 15,
    upgrades: sharedUpgrades,
    coords: { lat: 46.5, lng: 11.35 },
  },
]

export const getCategoryLabel = (cat: Category): string => ({
  yacht: 'Yacht',
  jet: 'Jet Privato',
  auto: 'Auto di Lusso',
  esperienza: 'Esperienza',
  fractional: 'Fractional',
  concierge: 'Concierge',
  staff: 'Staff',
  asta: 'Asta',
}[cat])

export const ALL_CATEGORIES: Category[] = ['yacht', 'jet', 'auto', 'esperienza', 'fractional', 'concierge', 'staff', 'asta']
