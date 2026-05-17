// src/scripts/generateContent.mjs
import { faker } from '@faker-js/faker/locale/it'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../data/generated')

mkdirSync(OUT, { recursive: true })

faker.seed(42) // deterministic

// ── CATEGORIES & TEMPLATES ──
const CATEGORIES = ['yacht', 'jet', 'auto', 'esperienza', 'villa']
const LOCATIONS = [
  'Portofino, Liguria', 'Capri, Campania', 'Costa Smeralda, Sardegna', 'Positano, Amalfi',
  'Lago di Como, Lombardia', 'Venezia, Veneto', 'Firenze, Toscana', 'Milano, Lombardia',
  'Roma, Lazio', 'Napoli, Campania', 'Monaco, Montecarlo', 'Saint-Tropez, Francia',
  'Ibiza, Spagna', 'Mykonos, Grecia', 'Santorini, Grecia', 'Dubrovnik, Croazia',
  'Corsica, Francia', 'Amalfi, Campania', 'Taormina, Sicilia', 'Porto Cervo, Sardegna',
]
const CERT_POOL = ['RINA', 'Luxury Verified', 'MYS', 'Green Award', 'Safety First', 'ISO 9001']

const YACHT_TITLES = ['Azimut', 'Sunseeker', 'Ferretti', 'Riva', 'Princess', 'Pershing', 'Benetti', 'Baglietto']
const JET_TITLES = ['Gulfstream', 'Bombardier', 'Cessna Citation', 'Embraer', 'Dassault Falcon', 'HondaJet']
const AUTO_TITLES = ['Ferrari', 'Lamborghini', 'Rolls-Royce', 'Bentley', 'McLaren', 'Porsche', 'Aston Martin']
const VILLA_TITLES = ['Villa', 'Palazzo', 'Masseria', 'Tenuta', 'Residenza', 'Dimora']
const EXP_TITLES = ['Cena Privata', 'Degustazione', 'Tour Esclusivo', 'Masterclass', 'Safari', 'Spa Day']

const UNSPLASH_QUERIES = {
  yacht: ['yacht', 'luxury-boat', 'sailing', 'catamaran', 'motor-yacht'],
  jet: ['private-jet', 'aircraft', 'aviation', 'airplane-interior'],
  auto: ['luxury-car', 'ferrari', 'lamborghini', 'sports-car', 'supercar'],
  villa: ['luxury-villa', 'pool-villa', 'mediterranean-villa', 'italian-villa'],
  esperienza: ['fine-dining', 'luxury-experience', 'gourmet', 'spa', 'yacht-party'],
}

function unsplash(cat, w = 800, h = 600) {
  const id = Math.floor(faker.number.int({ min: 1000000, max: 9999999 }))
  return `https://images.unsplash.com/photo-${1500000000 + (id % 99999999)}?w=${w}&q=80&fit=crop&auto=format`
}

// ── GENERATE 200 LISTINGS (realistic subset) ──
const listings = []

for (let i = 1; i <= 200; i++) {
  const cat = faker.helpers.arrayElement(CATEGORIES)
  const loc = faker.helpers.arrayElement(LOCATIONS)

  let title, price, priceUnit
  switch (cat) {
    case 'yacht': {
      const brand = faker.helpers.arrayElement(YACHT_TITLES)
      const meters = faker.number.int({ min: 12, max: 60 })
      title = `${brand} ${meters}m — ${faker.helpers.arrayElement(['Flybridge', 'Sport Cruiser', 'Open', 'Superyacht', 'Classic'])}`
      price = faker.number.int({ min: 2000, max: 85000 })
      priceUnit = faker.helpers.arrayElement(['giorno', 'settimana', 'weekend'])
      break
    }
    case 'jet': {
      title = `${faker.helpers.arrayElement(JET_TITLES)} — ${faker.helpers.arrayElement(['Light Jet', 'Midsize', 'Heavy Jet', 'VVIP Airliner'])}`
      price = faker.number.int({ min: 4000, max: 180000 })
      priceUnit = faker.helpers.arrayElement(['ora di volo', 'tratta', 'giorno'])
      break
    }
    case 'auto': {
      const autoBrand = faker.helpers.arrayElement(AUTO_TITLES)
      title = `${autoBrand} — ${faker.helpers.arrayElement(['Supercar', 'Gran Turismo', 'Cabrio', 'SUV', 'Berlina'])}`
      price = faker.number.int({ min: 800, max: 12000 })
      priceUnit = faker.helpers.arrayElement(['giorno', 'weekend', 'settimana'])
      break
    }
    case 'villa': {
      title = `${faker.helpers.arrayElement(VILLA_TITLES)} ${faker.person.lastName()} — ${faker.number.int({ min: 4, max: 12 })} camere`
      price = faker.number.int({ min: 3000, max: 45000 })
      priceUnit = 'notte'
      break
    }
    default: {
      title = `${faker.helpers.arrayElement(EXP_TITLES)} — ${faker.helpers.arrayElement(['Esclusivo', 'Privato', 'VIP', 'Riservato'])}`
      price = faker.number.int({ min: 500, max: 15000 })
      priceUnit = faker.helpers.arrayElement(['persona', 'gruppo', 'giornata'])
    }
  }

  const id = `gen-${String(i).padStart(3, '0')}`
  const qualityScore = faker.number.int({ min: 78, max: 99 })
  const certCount = faker.number.int({ min: 1, max: 3 })

  listings.push({
    id,
    title,
    category: cat,
    price,
    priceUnit,
    location: loc,
    image: unsplash(cat),
    images: Array.from({ length: 3 }, () => unsplash(cat)),
    description: faker.lorem.paragraphs(2, '\n\n'),
    trending: faker.datatype.boolean({ probability: 0.15 }),
    lastMinute: faker.datatype.boolean({ probability: 0.08 }),
    features: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.helpers.arrayElement([
      'Chef privato', 'Wi-Fi a bordo', 'Equipaggio incluso', 'Transfer incluso', 'Catering gourmet',
      'Skipper incluso', 'Full kasko', 'Concierge dedicato', 'Champagne benvenuto', 'Autista 24/7',
      'Piscina', 'Jacuzzi', 'Palestra', 'Spa', 'Butler service', 'Elicottero pad', 'Garage',
    ])),
    rating: Math.round((faker.number.float({ min: 4.2, max: 5.0 }) * 10)) / 10,
    reviews: faker.number.int({ min: 3, max: 120 }),
    upgrades: [],
    coords: {
      lat: faker.number.float({ min: 37.5, max: 46.5, fractionDigits: 4 }),
      lng: faker.number.float({ min: 7.0, max: 18.5, fractionDigits: 4 }),
    },
    qualityScore,
    certifications: faker.helpers.arrayElements(CERT_POOL, certCount),
    safetyRating: faker.number.int({ min: 4, max: 5 }),
    classApproved: qualityScore > 85,
  })
}

writeFileSync(join(OUT, 'listings.json'), JSON.stringify(listings, null, 2))
console.log(`✓ Generated ${listings.length} listings`)

// ── GENERATE 100 STORIES ──
const STORY_CATEGORIES = ['Design', 'Viaggi', 'Tecnologia', 'Sostenibilità', 'Auto', 'Nautica', 'Jet Set', 'Investimenti', 'Moda']
const AUTHORS = [
  { name: 'Marco Bellini', avatar: 'MB' }, { name: 'Sofia Esposito', avatar: 'SE' },
  { name: 'Luca Ferretti', avatar: 'LF' }, { name: 'Giulia Romano', avatar: 'GR' },
  { name: 'Alessandro Conti', avatar: 'AC' }, { name: 'Elena Ricci', avatar: 'ER' },
]

const stories = []

for (let i = 1; i <= 100; i++) {
  const cat = faker.helpers.arrayElement(STORY_CATEGORIES)
  const author = faker.helpers.arrayElement(AUTHORS)
  const slug = `story-${i}-${faker.helpers.slugify(faker.lorem.words(3)).toLowerCase()}`

  stories.push({
    id: `gs-${String(i).padStart(3, '0')}`,
    slug,
    title: faker.lorem.sentence({ min: 4, max: 10 }).replace('.', ''),
    excerpt: faker.lorem.sentences(2),
    content: Array.from({ length: faker.number.int({ min: 4, max: 8 }) }, () => faker.lorem.paragraph()).join('\n\n'),
    cover: `https://images.unsplash.com/photo-${1500000000 + (i * 7123456) % 99999999}?w=1200&q=80&fit=crop`,
    category: cat,
    author,
    readTime: faker.number.int({ min: 3, max: 12 }),
    publishedAt: faker.date.between({ from: '2024-01-01', to: '2026-05-01' }).toISOString().slice(0, 10),
    tags: faker.helpers.arrayElements(['luxury', 'lifestyle', 'travel', 'design', 'sustainability', 'tech', 'yachting', 'aviation'], 3),
  })
}

writeFileSync(join(OUT, 'stories.json'), JSON.stringify(stories, null, 2))
console.log(`✓ Generated ${stories.length} stories`)

// ── GENERATE 50 EVENTS ──
const EVENT_CATS = ['Arte & Cultura', 'Vela & Mare', 'Motorsport', 'Fine Dining', 'Wellness', 'Moda', 'Aste', 'Sport Invernali']
const events = []

for (let i = 1; i <= 50; i++) {
  const cat = faker.helpers.arrayElement(EVENT_CATS)
  const date = faker.date.between({ from: '2026-06-01', to: '2027-12-31' })
  events.push({
    id: `gev-${String(i).padStart(3, '0')}`,
    title: `${faker.helpers.arrayElement(['Gala', 'Masterclass', 'Regata', 'Asta', 'Preview', 'Serata'])} — ${faker.lorem.words(3)}`,
    date: date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
    location: faker.helpers.arrayElement(LOCATIONS),
    category: cat,
    description: faker.lorem.sentences(3),
    cover: `https://images.unsplash.com/photo-${1500000000 + (i * 5678901) % 99999999}?w=800&q=80&fit=crop`,
    price: faker.number.int({ min: 500, max: 25000 }),
    spots: faker.number.int({ min: 4, max: 20 }),
    memberOnly: faker.datatype.boolean({ probability: 0.4 }),
    soldOut: faker.datatype.boolean({ probability: 0.15 }),
  })
}

writeFileSync(join(OUT, 'events.json'), JSON.stringify(events, null, 2))
console.log(`✓ Generated ${events.length} events`)

// ── GENERATE GUIDES ──
const GUIDE_TOPICS = [
  'Come scegliere lo yacht perfetto', 'I 50 ristoranti stellati del Mediterraneo',
  'Guida ai jet privati: light vs heavy', 'Itinerari segreti in barca a vela',
  'Ferrari vs Lamborghini: guida alla scelta', 'Le ville più esclusive d\'Italia',
  'Investire in fractional ownership', 'Il galateo del lusso',
  'Come pianificare un honeymoon di lusso', 'Guide al Lago di Como',
]

const guides = GUIDE_TOPICS.map((topic, i) => ({
  id: `guide-${String(i + 1).padStart(2, '0')}`,
  title: topic,
  slug: faker.helpers.slugify(topic).toLowerCase(),
  excerpt: faker.lorem.sentences(2),
  pages: faker.number.int({ min: 8, max: 24 }),
  downloadUrl: '#',
  cover: `https://images.unsplash.com/photo-${1500000000 + (i * 3456789) % 99999999}?w=600&q=80&fit=crop`,
  publishedAt: '2026-01-15',
}))

writeFileSync(join(OUT, 'guides.json'), JSON.stringify(guides, null, 2))
console.log(`✓ Generated ${guides.length} guides`)

console.log('\n✅ Content generation complete. Files in src/data/generated/')
