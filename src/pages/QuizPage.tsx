import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { ChevronRight, RotateCcw, ChevronLeft, Share2 } from 'lucide-react'
import { safeWrite } from '@/lib/errorHandler'
import { listings } from '@/data/listings'
import type { Category } from '@/data/listings'
import { ServiceCard } from '@/components/ServiceCard'
import { toast } from 'sonner'

const QUESTIONS = [
  {
    id: 1,
    category: 'Stile di vita',
    question: 'Qual è il tuo stile di vacanza ideale?',
    options: [
      { label: 'Avventura e adrenalina', value: 'adventurer', icon: '🏄' },
      { label: 'Relax totale e lusso', value: 'relaxer', icon: '🛁' },
      { label: 'Cultura ed esperienze', value: 'explorer', icon: '🎭' },
      { label: 'Business e networking', value: 'business', icon: '💼' },
    ],
  },
  {
    id: 2,
    category: 'Preferenze',
    question: 'Quanto tempo hai a disposizione di solito?',
    options: [
      { label: 'Un weekend', value: 'weekend', icon: '⚡' },
      { label: 'Una settimana', value: 'week', icon: '📅' },
      { label: 'Due settimane+', value: 'long', icon: '🌍' },
      { label: 'Giornata singola', value: 'day', icon: '☀️' },
    ],
  },
  {
    id: 3,
    category: 'Stile di vita',
    question: 'Con chi viaggi più spesso?',
    options: [
      { label: 'In coppia', value: 'couple', icon: '💑' },
      { label: 'Con la famiglia', value: 'family', icon: '👨‍👩‍👧' },
      { label: 'Con amici', value: 'friends', icon: '🥂' },
      { label: 'Da solo (business)', value: 'solo', icon: '💼' },
      { label: 'Con colleghi / team building', value: 'team', icon: '🤝' },
    ],
  },
  {
    id: 4,
    category: 'Preferenze',
    question: "Cosa non può mancare in un'esperienza di lusso?",
    options: [
      { label: 'Cucina gourmet e vino', value: 'food', icon: '🍷' },
      { label: 'Velocità e potenza', value: 'speed', icon: '🏎️' },
      { label: 'Privacy assoluta', value: 'privacy', icon: '🔒' },
      { label: 'Vista e posizione', value: 'view', icon: '🌅' },
    ],
  },
  {
    id: 5,
    category: 'Budget',
    question: 'Qual è il tuo budget indicativo per esperienza?',
    options: [
      { label: '€2.000–5.000', value: 'entry', icon: '✦' },
      { label: '€5.000–20.000', value: 'mid', icon: '✦✦' },
      { label: '€20.000–80.000', value: 'premium', icon: '✦✦✦' },
      { label: '€80.000+', value: 'ultra', icon: '♾️' },
    ],
  },
]

const BUDGET_LABELS: Record<string, string> = {
  entry: '€2.000 – €5.000',
  mid: '€5.000 – €20.000',
  premium: '€20.000 – €80.000',
  ultra: 'oltre €80.000',
}

// 5. Estimated value ranges for result page
const BUDGET_RANGES: Record<string, string> = {
  entry: '€2.000 - €5.000',
  mid: '€5.000 - €20.000',
  premium: '€20.000 - €80.000',
  ultra: '€80.000+',
}

interface Profile {
  title: string
  desc: string
  recommend: string
  link: string
  icon: string
  category: Category
}

const PROFILES: Record<string, Profile> = {
  adventurer: {
    title: "L'Avventuriero Luxury",
    icon: '⛵',
    desc: "Cerchi adrenalina senza rinunciare al comfort. Uno yacht tra le isole greche o un heliski nelle Alpi fanno per te.",
    recommend: 'Yacht & Sport d\'Avventura',
    link: '/servizi?cats=yacht',
    category: 'yacht',
  },
  relaxer: {
    title: 'Il Maestro del Relax',
    icon: '🛁',
    desc: 'Il tuo lusso è il tempo. Una villa con spa privata e chef a disposizione è il tuo paradiso.',
    recommend: 'Ville & Spa Esclusivi',
    link: '/servizi?cats=villa',
    category: 'villa',
  },
  explorer: {
    title: "L'Esploratore Culturale",
    icon: '🎭',
    desc: 'Le esperienze ti nutrono. Dal vernissage di Venezia alla cena stellata in masseria, sei nel posto giusto.',
    recommend: 'Esperienze & Cultura',
    link: '/servizi?cats=esperienza',
    category: 'esperienza',
  },
  business: {
    title: 'Il Power Traveler',
    icon: '✈️',
    desc: 'Il tuo tempo vale oro. Un jet privato con lounge dedicata e trasferimento in Rolls-Royce è il tuo standard.',
    recommend: 'Jet & Trasferimenti VIP',
    link: '/servizi?cats=jet',
    category: 'jet',
  },
}

const PROFILE_KEYS = Object.keys(PROFILES)

// 8. Profile distribution data (hardcoded)
const PROFILE_DIST: { key: string; label: string; pct: number }[] = [
  { key: 'explorer', label: 'Esploratore', pct: 34 },
  { key: 'relaxer', label: 'Rilassato', pct: 28 },
  { key: 'adventurer', label: 'Avventuriero', pct: 22 },
  { key: 'business', label: 'Business', pct: 16 },
]

function getProfile(answers: string[]): string {
  const counts: Record<string, number> = {}
  answers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const key = top?.[0] ?? 'relaxer'
  return PROFILE_KEYS.includes(key) ? key : 'relaxer'
}

function ConfettiRain() {
  const emojis = ['✨', '🌟', '🥂', '✦', '🎉', '💫']
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-xl animate-confetti-fall"
          style={{
            left: `${(i / 18) * 100 + Math.random() * 5}%`,
            animationDelay: `${(i * 0.12).toFixed(2)}s`,
            animationDuration: `${2 + Math.random() * 1.5}s`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
    </div>
  )
}

// 3. Profile card 3D flip
function FlipCard({ profile }: { profile: Profile }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className="relative cursor-pointer mx-auto mb-6"
      style={{ perspective: '1000px', width: 260, height: 160 }}
      onClick={() => setFlipped(f => !f)}
      title="Clicca per girare la card"
    >
      <motion.div
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-[#1C1C1C] flex flex-col items-center justify-center gap-2 border border-[rgba(197,160,89,0.3)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-4xl">{profile.icon}</span>
          <p className="text-white font-[family-name:var(--font-family-display)] text-sm font-medium text-center px-4">{profile.title}</p>
          <p className="text-[#C5A059] text-[10px]">Tocca per i dettagli →</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.3)] flex flex-col items-center justify-center gap-2 px-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-[#5A4F44] text-center leading-relaxed">{profile.desc}</p>
          <p className="text-[10px] text-[#C5A059]">Tocca per tornare →</p>
        </div>
      </motion.div>
    </div>
  )
}

export function QuizPage() {
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // 7. Timer
  const startTimeRef = useRef<number>(Date.now())
  const [elapsedSecs, setElapsedSecs] = useState(0)

  // 9. Intro screen — start quiz
  const handleStart = () => {
    startTimeRef.current = Date.now()
    setStarted(true)
  }

  const answer = (value: string) => {
    // 10. Micro animation feedback
    setSelectedOption(value)
    setTimeout(() => {
      setSelectedOption(null)
      const next = [...answers, value]
      if (step < QUESTIONS.length - 1) {
        setAnswers(next)
        setStep(s => s + 1)
      } else {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        setElapsedSecs(elapsed)
        const profile = getProfile(next)
        setResult(profile)
        const resultData = { profile, answers: next, timestamp: Date.now() }
        safeWrite('theclass_quiz_result', resultData)
        safeWrite('theclass_quiz_profile', profile)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3500)
      }
    }, 280)
  }

  const goBack = () => {
    if (step === 0) return
    setAnswers(prev => prev.slice(0, -1))
    setStep(s => s - 1)
  }

  // 4. Reset with fade
  const reset = () => {
    setResult(null)
    setAnswers([])
    setStep(0)
    setStarted(false)
    setElapsedSecs(0)
  }

  const q = QUESTIONS[step]
  const profile = result ? PROFILES[result] : null
  const progressPct = Math.round((step / QUESTIONS.length) * 100)

  const budgetAnswer = answers[4] ?? null
  const budgetLabel = budgetAnswer ? BUDGET_LABELS[budgetAnswer] : null
  const budgetRange = budgetAnswer ? BUDGET_RANGES[budgetAnswer] : null

  const suggestedListings = profile
    ? listings.filter(l => l.category === profile.category).slice(0, 3)
    : []

  const shareProfile = () => {
    if (!result) return
    const url = `${window.location.origin}/quiz?result=${result}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link del profilo copiato!'))
  }

  // 6. Download profile card as SVG blob
  const downloadCard = () => {
    if (!profile || !result) return
    const svg = `<svg width="400" height="220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" rx="20" fill="#1C1C1C"/>
      <text x="200" y="60" text-anchor="middle" font-size="48">${profile.icon}</text>
      <text x="200" y="100" text-anchor="middle" font-family="serif" font-size="18" fill="#C5A059">${profile.title}</text>
      <text x="200" y="130" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#9A8F84">the Class — Lifestyle Quiz</text>
      ${budgetRange ? `<text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#C5A059">Budget: ${budgetRange}</text>` : ''}
      <text x="200" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#5A4F44">theclass.it/quiz?result=${result}</text>
    </svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profilo-${result}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Card profilo scaricata!')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('result')
    if (r && PROFILE_KEYS.includes(r)) { setResult(r); setStarted(true) }
  }, [])

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20 flex items-start justify-center">
      <Helmet>
        <title>Lifestyle Quiz — the Class</title>
        <meta name="description" content="Scopri il tuo profilo luxury con il quiz personalità di the Class. 5 domande per trovare lo stile di viaggio perfetto per te." />
      </Helmet>
      <h1 className="sr-only">Lifestyle Quiz — the Class</h1>

      {showConfetti && <ConfettiRain />}

      <div className="max-w-2xl mx-auto px-6 w-full mt-4">
        <AnimatePresence mode="wait">
          {/* 9. Intro screen */}
          {!started && !result ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-10"
            >
              <p className="text-[11px] tracking-[0.22em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">
                The Class Quiz
              </p>
              <h2 className="font-[family-name:var(--font-family-display)] text-3xl md:text-4xl font-medium text-[#1C1C1C] mb-4 leading-tight">
                Scopri il tuo profilo di lusso
              </h2>
              <p className="text-[#5A4F44] font-light leading-relaxed mb-8 max-w-sm mx-auto">
                Rispondi a {QUESTIONS.length} domande e scopri quale esperienza luxury è fatta per te. Personalizzato in base al tuo stile di vita.
              </p>
              <div className="flex items-center justify-center gap-6 mb-10 text-sm text-[#5A4F44]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A059] font-semibold">{QUESTIONS.length}</span> domande
                </span>
                <span className="w-px h-4 bg-[rgba(197,160,89,0.3)]" />
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A059] font-semibold">~2 min</span> stimati
                </span>
                <span className="w-px h-4 bg-[rgba(197,160,89,0.3)]" />
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A059] font-semibold">4</span> profili unici
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="px-10 py-4 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium hover:bg-[#2a2a2a] transition-colors"
              >
                Inizia il quiz →
              </motion.button>
            </motion.div>
          ) : !result ? (
            /* 1. Animated question transitions */
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {/* Progress bar + percentage */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)]">
                  {progressPct}% completato
                </span>
                <span className="text-[11px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)]">
                  {step + 1}/{QUESTIONS.length}
                </span>
              </div>
              <div className="flex gap-1.5 mb-6">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.2)]'}`}
                  />
                ))}
              </div>

              {/* 2. Question category badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.2)] text-[10px] text-[#C5A059] font-medium tracking-wider uppercase">
                  {q.category}
                </span>
              </div>

              <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">
                Domanda {step + 1} di {QUESTIONS.length}
              </p>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl md:text-3xl font-medium text-[#1C1C1C] mb-8 leading-tight">
                {q.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {q.options.map(opt => (
                  // 10. Micro-animation on selection
                  <motion.button
                    key={opt.value}
                    onClick={() => answer(opt.value)}
                    animate={selectedOption === opt.value ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`p-5 rounded-2xl border bg-white text-left group transition-all duration-200 ${
                      selectedOption === opt.value
                        ? 'border-[#C5A059] shadow-[0_4px_20px_rgba(197,160,89,0.25)] bg-[rgba(197,160,89,0.04)]'
                        : 'border-[rgba(197,160,89,0.18)] hover:border-[#C5A059] hover:shadow-[0_4px_20px_rgba(197,160,89,0.15)] hover:scale-[1.02]'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <p className="text-sm text-[#1C1C1C] font-light group-hover:text-[#C5A059] transition-colors">{opt.label}</p>
                  </motion.button>
                ))}
              </div>

              {step > 0 && (
                <button
                  onClick={goBack}
                  className="mt-6 flex items-center gap-1.5 text-sm text-[#5A4F44] hover:text-[#C5A059] transition-colors"
                >
                  <ChevronLeft size={14} />
                  Precedente
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Result header */}
              <div className="text-center mb-6">
                <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-3">Il tuo profilo</p>

                {/* 3. 3D Flip card */}
                <FlipCard profile={profile!} />

                <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-4">{profile!.title}</h2>
                <p className="text-[#5A4F44] font-light leading-relaxed mb-4 max-w-sm mx-auto">{profile!.desc}</p>

                {budgetLabel && (
                  <div className="inline-block px-4 py-2 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-full mb-6">
                    <span className="text-xs text-[#5A4F44] font-light">Budget consigliato: </span>
                    <span className="text-xs text-[#C5A059] font-medium">{budgetLabel}</span>
                  </div>
                )}

                {/* 5. Estimated value */}
                {budgetRange && (
                  <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-xl px-5 py-4 mb-6 text-left max-w-sm mx-auto">
                    <p className="text-xs text-[#5A4F44]/60 mb-1">Budget ideale per te</p>
                    <p className="font-[family-name:var(--font-family-display)] text-xl text-[#C5A059] font-medium">{budgetRange}</p>
                    <p className="text-[10px] text-[#5A4F44]/50 mt-1">Stima basata sul tuo profilo</p>
                  </div>
                )}

                {/* 7. Quiz stats */}
                <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-xl px-5 py-4 mb-6 max-w-sm mx-auto text-left">
                  <p className="text-xs font-medium text-[#1C1C1C] mb-3">Statistiche quiz</p>
                  <div className="flex justify-between text-xs text-[#5A4F44]">
                    <span>Tempo impiegato</span>
                    <span className="text-[#C5A059] font-medium">{elapsedSecs > 0 ? `${elapsedSecs} secondi` : '< 1 minuto'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#5A4F44] mt-2">
                    <span>Utenti con il tuo profilo</span>
                    <span className="text-[#C5A059] font-medium">
                      {PROFILE_DIST.find(d => d.key === result)?.pct ?? 22}%
                    </span>
                  </div>
                </div>

                {/* 8. Comparison bar chart */}
                <div className="bg-white border border-[rgba(197,160,89,0.15)] rounded-xl px-5 py-4 mb-6 max-w-sm mx-auto text-left">
                  <p className="text-xs font-medium text-[#1C1C1C] mb-3">Distribuzione profili</p>
                  <div className="space-y-2.5">
                    {PROFILE_DIST.map(d => (
                      <div key={d.key}>
                        <div className="flex justify-between text-[10px] text-[#5A4F44] mb-1">
                          <span className={d.key === result ? 'font-semibold text-[#C5A059]' : ''}>{d.label}</span>
                          <span>{d.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[rgba(197,160,89,0.12)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${d.key === result ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.35)]'}`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    to={profile!.link as '/servizi'}
                    className="px-8 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
                  >
                    {profile!.recommend} <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/concierge"
                    className="px-6 py-3 rounded-xl bg-[#C5A059] text-white text-sm font-medium hover:bg-[#b8924a] transition-colors"
                  >
                    Prenota una consulenza gratuita →
                  </Link>
                </div>
                <div className="flex gap-3 justify-center flex-wrap mt-3">
                  <button
                    onClick={shareProfile}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                  >
                    <Share2 size={13} />
                    Condividi il tuo profilo
                  </button>

                  {/* 6. Download card */}
                  <button
                    onClick={downloadCard}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                  >
                    ↓ Scarica card profilo
                  </button>

                  {/* 4. Restart with ripple */}
                  <motion.button
                    onClick={reset}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors"
                  >
                    <RotateCcw size={14} /> Rifai il quiz
                  </motion.button>
                </div>
              </div>

              {/* Suggested listings */}
              {suggestedListings.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2 text-center">
                    Selezionati per te
                  </p>
                  <h3 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] text-center mb-6">
                    I nostri suggerimenti
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {suggestedListings.map((listing, i) => (
                      <ServiceCard key={listing.id} listing={listing} delay={i * 0.08} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          top: 0;
        }
      `}</style>
    </div>
  )
}
