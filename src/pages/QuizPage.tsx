import { useState, useEffect } from 'react'
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

function getProfile(answers: string[]): string {
  const counts: Record<string, number> = {}
  answers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const key = top?.[0] ?? 'relaxer'
  return PROFILE_KEYS.includes(key) ? key : 'relaxer'
}

// Confetti CSS keyframes are in index.css; we emit emoji particles via inline style
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

export function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const answer = (value: string) => {
    const next = [...answers, value]
    if (step < QUESTIONS.length - 1) {
      setAnswers(next)
      setStep(s => s + 1)
    } else {
      const profile = getProfile(next)
      setResult(profile)
      const resultData = { profile, answers: next, timestamp: Date.now() }
      safeWrite('theclass_quiz_result', resultData)
      safeWrite('theclass_quiz_profile', profile)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
    }
  }

  const goBack = () => {
    if (step === 0) return
    setAnswers(prev => prev.slice(0, -1))
    setStep(s => s - 1)
  }

  const reset = () => { setStep(0); setAnswers([]); setResult(null) }

  const q = QUESTIONS[step]
  const profile = result ? PROFILES[result] : null
  const progressPct = Math.round((step / QUESTIONS.length) * 100)

  // Budget from last answer
  const budgetAnswer = answers[4] ?? null
  const budgetLabel = budgetAnswer ? BUDGET_LABELS[budgetAnswer] : null

  // Suggested listings based on result category
  const suggestedListings = profile
    ? listings.filter(l => l.category === profile.category).slice(0, 3)
    : []

  const shareProfile = () => {
    if (!result) return
    const url = `${window.location.origin}/quiz?result=${result}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link del profilo copiato!'))
  }

  // Apply result from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const r = params.get('result')
    if (r && PROFILE_KEYS.includes(r)) setResult(r)
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
          {!result ? (
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Progress bar + percentage */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)]">
                  {progressPct}% completato
                </span>
                <span className="text-[11px] text-[#5A4F44]/60 font-[family-name:var(--font-family-mono)]">
                  {step + 1}/{QUESTIONS.length}
                </span>
              </div>
              <div className="flex gap-1.5 mb-8">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.2)]'}`}
                  />
                ))}
              </div>

              <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-4">
                Domanda {step + 1} di {QUESTIONS.length}
              </p>
              <h2 className="font-[family-name:var(--font-family-display)] text-2xl md:text-3xl font-medium text-[#1C1C1C] mb-8 leading-tight">
                {q.question}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => answer(opt.value)}
                    className="p-5 rounded-2xl border border-[rgba(197,160,89,0.18)] bg-white hover:border-[#C5A059] hover:shadow-[0_4px_20px_rgba(197,160,89,0.15)] hover:scale-[1.02] transition-all duration-200 text-left group"
                  >
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <p className="text-sm text-[#1C1C1C] font-light group-hover:text-[#C5A059] transition-colors">{opt.label}</p>
                  </button>
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
              <div className="text-center mb-10">
                <span className="text-6xl block mb-4">{profile!.icon}</span>
                <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Il tuo profilo</p>
                <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-4">{profile!.title}</h2>
                <p className="text-[#5A4F44] font-light leading-relaxed mb-4 max-w-sm mx-auto">{profile!.desc}</p>

                {budgetLabel && (
                  <div className="inline-block px-4 py-2 bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] rounded-full mb-6">
                    <span className="text-xs text-[#5A4F44] font-light">Budget consigliato: </span>
                    <span className="text-xs text-[#C5A059] font-medium">{budgetLabel}</span>
                  </div>
                )}

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
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors"
                  >
                    <RotateCcw size={14} /> Rifai il quiz
                  </button>
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

      {/* Confetti keyframes via style tag */}
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
