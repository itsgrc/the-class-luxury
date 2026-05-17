import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { safeWrite } from '@/lib/errorHandler'

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

const PROFILES: Record<string, { title: string; desc: string; recommend: string; link: string; icon: string }> = {
  adventurer: {
    title: "L'Avventuriero Luxury",
    icon: '⛵',
    desc: "Cerchi adrenalina senza rinunciare al comfort. Uno yacht tra le isole greche o un heliski nelle Alpi fanno per te.",
    recommend: 'Yacht & Sport d\'Avventura',
    link: '/servizi?cats=yacht',
  },
  relaxer: {
    title: 'Il Maestro del Relax',
    icon: '🛁',
    desc: 'Il tuo lusso è il tempo. Una villa con spa privata e chef a disposizione è il tuo paradiso.',
    recommend: 'Ville & Spa Esclusivi',
    link: '/servizi?cats=villa',
  },
  explorer: {
    title: "L'Esploratore Culturale",
    icon: '🎭',
    desc: 'Le esperienze ti nutrono. Dal vernissage di Venezia alla cena stellata in masseria, sei nel posto giusto.',
    recommend: 'Esperienze & Cultura',
    link: '/servizi?cats=esperienza',
  },
  business: {
    title: 'Il Power Traveler',
    icon: '✈️',
    desc: 'Il tuo tempo vale oro. Un jet privato con lounge dedicata e trasferimento in Rolls-Royce è il tuo standard.',
    recommend: 'Jet & Trasferimenti VIP',
    link: '/servizi?cats=jet',
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

export function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)

  const answer = (value: string) => {
    const next = [...answers, value]
    if (step < QUESTIONS.length - 1) {
      setAnswers(next)
      setStep(s => s + 1)
    } else {
      const profile = getProfile(next)
      setResult(profile)
      safeWrite('theclass_quiz_profile', profile)
    }
  }

  const reset = () => { setStep(0); setAnswers([]); setResult(null) }
  const q = QUESTIONS[step]
  const profile = result ? PROFILES[result] : null

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20 flex items-center">
      <Helmet>
        <title>Lifestyle Quiz — the Class</title>
        <meta name="description" content="Scopri il tuo profilo luxury con il quiz personalità di the Class. 5 domande per trovare lo stile di viaggio perfetto per te." />
      </Helmet>
      <h1 className="sr-only">Lifestyle Quiz — the Class</h1>
      <div className="max-w-xl mx-auto px-6 w-full">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Progress */}
              <div className="flex gap-1.5 mb-8">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#C5A059]' : 'bg-[rgba(197,160,89,0.2)]'}`} />
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
                  <button key={opt.value} onClick={() => answer(opt.value)}
                    className="p-5 rounded-2xl border border-[rgba(197,160,89,0.18)] bg-white hover:border-[#C5A059] hover:shadow-[0_4px_20px_rgba(197,160,89,0.15)] transition-all text-left group">
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <p className="text-sm text-[#1C1C1C] font-light group-hover:text-[#C5A059] transition-colors">{opt.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center">
              <span className="text-6xl block mb-4">{profile!.icon}</span>
              <p className="text-[11px] tracking-[0.2em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">Il tuo profilo</p>
              <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] mb-4">{profile!.title}</h2>
              <p className="text-[#5A4F44] font-light leading-relaxed mb-8 max-w-sm mx-auto">{profile!.desc}</p>
              <div className="flex gap-3 justify-center">
                <Link to={profile!.link as '/servizi'}
                  className="px-8 py-3 rounded-xl bg-[#1C1C1C] text-white text-sm font-medium hover:bg-[#2a2a2a] transition-colors flex items-center gap-2">
                  {profile!.recommend} <ChevronRight size={14} />
                </Link>
                <button onClick={reset}
                  className="px-5 py-3 rounded-xl border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-sm hover:border-[#C5A059] transition-colors flex items-center gap-2">
                  <RotateCcw size={14} /> Rifai
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
