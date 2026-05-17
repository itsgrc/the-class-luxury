// src/data/stories.ts
export interface Story {
  id: string
  title: string
  slug: string
  cover: string
  excerpt: string
  content: string // markdown-like (paragraphs separated by \n\n)
  date: string
  author: { name: string; avatar: string }
  category: string
  readTime: number // minutes
}

export const stories: Story[] = [
  {
    id: 'st-001',
    slug: 'viaggio-amalfi-yacht',
    title: 'Sette giorni lungo la Costiera: l\'itinerario definitivo in yacht',
    cover: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1200&q=80&fm=webp',
    excerpt: 'Da Napoli a Positano, Ravello, Capri e ritorno: il viaggio via mare che ridefinisce il significato di libertà.',
    category: 'Yacht',
    readTime: 6,
    date: '2025-04-12',
    author: { name: 'Giulia Ferrara', avatar: 'https://ui-avatars.com/api/?name=Giulia+Ferrara&background=c5a059&color=fff&bold=true&size=150' },
    content: `Da Napoli, il golfo si apre come un teatro naturale. Il Sunseeker salpa all'alba, quando le acque sono ancora piatte e l'aria profuma di agrumi e salsedine.

Il primo ancoraggio è Positano. Arrivare via mare cambia tutto: la città si svela verticalmente, case color pastello agganciate alla roccia, scalinate infinite e la campana della chiesa che suona le nove. Si scende in tender, si cammina tra i vicoli prima che i turisti arrivino.

Il secondo giorno è dedicato a Ravello. Dal mare si sale con il taxi-boat, si visita Villa Cimbrone e il suo belvedere sull'Infinito: nessun panorama in Europa regge il confronto. La sera, cena da Rossellinis con la stellata Fausta Coppi che prepara i paccheri di Gragnano come li mangiava Eduardo De Filippo.

Capri è il capitolo più seducente. Si entra nella Grotta Azzurra all'alba, con il tender, quando la luce è ancora bassa e l'acqua diventa di un blu irreale. Poi Anacapri, Villa San Michele, i Faraglioni visti dalla barca con un calice di Greco di Tufo ghiacciato.

L'ultimo giorno, di rientro verso Napoli, si circumnaviga Ischia e si sosta a Procida, la più autentica: nessuna boutique di lusso, solo pescatori che tirano le reti e il profumo del limone di Procida ovunque.

Sette giorni che cambiano la percezione dello spazio e del tempo.`,
  },
  {
    id: 'st-002',
    slug: 'jet-privato-maldive',
    title: 'Milano–Malé: il viaggio di nozze perfetto in jet privato',
    cover: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80&fm=webp',
    excerpt: 'Come organizzare il viaggio di nozze più esclusivo al mondo, dal decollo privato all\'overwater bungalow.',
    category: 'Jet Privati',
    readTime: 5,
    date: '2025-03-28',
    author: { name: 'Alessandro Moretti', avatar: 'https://ui-avatars.com/api/?name=Alessandro+Moretti&background=c5a059&color=fff&bold=true&size=150' },
    content: `Il Gulfstream G700 decolla da Linate alle 22:00. La coppia sale dalla scaletta privata, senza check-in, senza code, senza l'umiliante rito dell'aeroporto di massa. Il pilota saluta personalmente. I sedili in pelle color avorio reclinano completamente.

A bordo, lo chef ha preparato il menù concordato settimane prima: ostriche di Bretagna, risotto al Champagne Krug, dolce milanese della pasticceria Marchesi. Il sommelier ha selezionato una verticale di Sassicaia 2018 e 2019. La moglie si addormenta sopra il Mediterraneo orientale.

Arrivo a Malé alle 8:30 ora locale. L'idrovolante privato della struttura attende in pista. Quindici minuti di volo e un atollo deserto appare sotto: laguna turchese, barriera corallina visibile a occhio nudo, il resort con 12 ville sull'acqua.

La villa ha una vasca sul deck con vista sull'oceano. Ogni mattina arriva la colazione in canoa. Il concierge del resort conosce già i nomi dei due sposi.

Il ritorno è altrettanto perfetto: trasferimento dall'atollo a Malé, volo notturno verso Milano, breakfast a bordo sopra l'Arabia Saudita e atterraggio alle 6:15 del mattino a Linate. Pronti per il lavoro, o per un altro week-end così.`,
  },
  {
    id: 'st-003',
    slug: 'ferrari-sf90-esperienza',
    title: 'Guidare la Ferrari SF90: 1000 CV e la pista di Fiorano',
    cover: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=80&fm=webp',
    excerpt: 'Cosa si prova a portare la Ferrari più potente di sempre in pista, dove nasce ogni cavallo del Cavallino.',
    category: 'Auto',
    readTime: 4,
    date: '2025-03-10',
    author: { name: 'Lorenzo Bianchi', avatar: 'https://ui-avatars.com/api/?name=Lorenzo+Bianchi&background=c5a059&color=fff&bold=true&size=150' },
    content: `La SF90 Stradale è un'equazione impossibile risolta dall'ingegneria. 1000 CV da un motore V8 biturbo affiancato da tre motori elettrici. Ibrido plug-in che fa zero emissioni in città e zero a cento in 2,5 secondi in pista.

Il ritiro è alle 9:00 alla portineria dello stabilimento di Maranello. La guida entra nell'headquarter, firma e in cinque minuti ha in mano le chiavi di una macchina che costa quanto una villa a Como.

Il giro del museo è incluso: gli occhi cadono sulla 250 GTO del 1962, poi sulla 312 T di Niki Lauda, poi sulla prima Formula 1 di Michael Schumacher. Tutto fa senso quando si pensa che ogni Ferrari nasce in questo posto.

In pista a Fiorano, l'istruttore pilota siede a fianco. Il primo giro è scoperta: i freni in carbonio fermano il tempo, lo sterzo trasmette ogni imprecisione del fondo. Al terzo giro si comincia a capire la traiettoria ideale della curva 3. Al quinto giro, per un momento, si dimentica tutto il resto.

Il pranzo nel ristorante degli ingegneri è diverso da qualunque esperienza foodie: si mangia circondata da tecnici Ferrari che parlano di aerodinamica e scarico del calore. Il risotto con aceto balsamico invecchiato 25 anni è tra i migliori della vita.

Una giornata che ridefinisce il concetto di prestazione.`,
  },
  {
    id: 'st-004',
    slug: 'alba-tartufo-piemonte',
    title: 'L\'alba con i cercatori di tartufo nelle Langhe',
    cover: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=1200&q=80&fm=webp',
    excerpt: 'Tra boschi di querce e nebbia padana, alla scoperta del diamante bianco d\'Alba con i maestri della tradizione.',
    category: 'Esperienze',
    readTime: 5,
    date: '2025-02-15',
    author: { name: 'Camille Dupont', avatar: 'https://ui-avatars.com/api/?name=Camille+Dupont&background=c5a059&color=fff&bold=true&size=150' },
    content: `La sveglia suona alle 5:30. Fuori è ancora buio e la nebbia delle Langhe ammanta le vigne di Barolo. Gianni aspetta al cancello: 68 anni, tre campionati nazionali di cerca al tartufo, uno sguardo che ha visto tutto ma si illumina ancora quando Dante trova qualcosa.

Dante è il lagotto romagnolo: pelo riccio, naso infallibile, un'energia contenuta ma pronta a esplodere. Si parte verso il bosco di quercia e nocciolo dove Gianni va da quando aveva dieci anni. Il percorso non è su Google Maps.

La prima alba nel bosco è un'esperienza sensoriale completa: terra umida, foglie marcite, il suono dei passi sul fondo morbido. Dante si ferma. Scrapa. Gianni si inginocchia e con una bacchetta di legno scava delicatamente. Emerge: un tartufo bianco delle dimensioni di una noce, profumo intenso e terroso che sale nell'aria fredda del mattino.

In tre ore si trovano sette tartufi. Il più grande pesa 80 grammi: valore di mercato superiore a €800.

Il pranzo nella cantina Fontanafredda è il degno erede dell'alba: tajarin al tartufo bianco fresco rasato al momento, finanziera reale, plin al burro e salvia, Barolo 2016 versato dal produttore stesso. Una verticale che racconta il tempo delle Langhe.

Si torna con un vasetto di tartufo in olio di oliva DOP, un Barolo firmato e il ricordo di un mattino che nessun resort può replicare.`,
  },
  {
    id: 'st-005',
    slug: 'montecarlo-grand-prix',
    title: 'Grand Prix di Monaco: come viverlo dall\'alto (e dall\'acqua)',
    cover: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80&fm=webp',
    excerpt: 'Il circuito più iconico del mondo visto dalla penthouse e dallo yacht ormeggiato in porto: la guida definitiva.',
    category: 'Esperienze',
    readTime: 7,
    date: '2025-01-30',
    author: { name: 'Giulia Ferrara', avatar: 'https://ui-avatars.com/api/?name=Giulia+Ferrara&background=c5a059&color=fff&bold=true&size=150' },
    content: `Il Grand Prix di Monaco non è solo una gara: è un rituale collettivo di 78 anni, il più difficile da vivere bene e il più facile da vivere male.

Vivere male significa: hotel a 5km di distanza, taxi impossibili, tribune lontane, coda al buffet. Vivere bene significa scegliere dove stare prima di scegliere cosa vedere.

L'opzione A è lo yacht ormeggiato in porto. Un Sunseeker da 25 metri costa tra i €40.000 e €120.000 per i cinque giorni del week-end del GP. La posizione è insuperabile: curva della piscina davanti agli occhi, i box visibili con il binocolo, Haas e Williams che escono dalla chicane a 200 metri. Il servizio è completo: chef, hostess, open bar, musica fino alle 3 del mattino.

L'opzione B è la penthouse dell'Hotel de Paris, sulla Place du Casino. 450 mq di terrazzo affacciato sulla curva del casinò: le macchine sfrecciano a 6 metri. Si vede la staccata della Santa Devota, la salita verso il Beau Rivage, i movimenti dei pit-stop. Il Rolls-Royce porta gli ospiti ai box per la visita pre-gara.

La mattina della gara si cammina sul circuito (riservato, con pass speciale). Si tocca il guardrail del tunnel. Si sta fermi sul rettilineo del porto e si cerca di immaginare i piloti a 280 km/h su questo asfalto stretto.

Poi la gara. Tre ore di suoni, odori di gomme bruciate, strategia. Un'esperienza irripetibile.`,
  },
  {
    id: 'st-006',
    slug: 'rolls-royce-toscana',
    title: 'Toscana in Rolls-Royce: l\'itinerario lento dei cinque sensi',
    cover: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&q=80&fm=webp',
    excerpt: 'Firenze, Siena, Montalcino, Pienza: cinque giorni tra vigneti e borghi medievali a bordo del Cullinan.',
    category: 'Auto',
    readTime: 6,
    date: '2025-01-08',
    author: { name: 'Alessandro Moretti', avatar: 'https://ui-avatars.com/api/?name=Alessandro+Moretti&background=c5a059&color=fff&bold=true&size=150' },
    content: `La Toscana non si attraversa: si assapora. E nessun mezzo è più adatto a questa filosofia del Rolls-Royce Cullinan: sospensioni che assorbono ogni pietra dei sterrati senesi, silenzio assoluto che permette di sentire la campagna, interni che trasformano ogni tratto di strada in un salotto mobile.

Si parte da Firenze. L'autista Lorenzo conosce ogni curva, ogni trattoria con prenotazione impossibile, ogni fattoria che vende olio extravergine DOP direttamente dal produttore.

Il primo giorno è per Siena e il Chianti: strade bianche tra cipressi e vigneti, sosta a una cantina Chianti Classico DOCG dove si degusta la nuova annata con il produttore, pranzo in un'osteria con cucina del quinto quarto e vino a peso.

Il secondo giorno scende verso Montalcino. La strada panoramica è tra le più belle d'Europa. Si visita una cantina Brunello: la degustazione nella barricaia è un'esperienza sensoriale densa. La sera, agriturismo di design con vista sulla Val d'Orcia illuminata dal tramonto.

Pienza è il terzo capitolo: il formaggio pecorino più famoso del mondo, le strade lastricate del centro medievale, il Duomo che si apre su una vallata senza fine. Si acquistano pecorini stagionati 12 e 24 mesi da portare a casa.

Il ritorno verso Firenze passa per Arezzo, con sosta facoltativa alla basilica di San Francesco. Lorenzo sa dove parcheggiare il Cullinan senza rischi.

Cinque giorni che ridefiniscono il concetto di viaggio lento.`,
  },
]
