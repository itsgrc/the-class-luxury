// src/components/AIConcierge.tsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listings } from '@/data/listings'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp: number
}

const PATTERNS: Array<{ regex: RegExp; answer: (q: string) => string }> = [
  {
    regex: /yacht|barca|vela|mare/i,
    answer: () => {
      const yachts = listings.filter(l => l.category === 'yacht').slice(0, 2)
      return `Abbiamo ${listings.filter(l => l.category === 'yacht').length} yacht disponibili. I più richiesti: **${yachts[0]?.title}** (${yachts[0]?.location}) e **${yachts[1]?.title}** (${yachts[1]?.location}). Vuole conoscere disponibilità e prezzi?`
    },
  },
  {
    regex: /jet|aereo|volo|privato/i,
    answer: () => `La nostra flotta conta ${listings.filter(l => l.category === 'jet').length} jet privati, dal light jet per brevi tratte fino al Gulfstream G700 intercontinentale. Qual è la vostra destinazione?`,
  },
  {
    regex: /auto|macchina|ferrari|rolls|bentley|lamborghini/i,
    answer: () => `Il nostro garage include Ferrari SF90, Rolls-Royce Cullinan, Bentley GT Speed e Lamborghini Urus Performante. Con o senza autista privato. Quale modello desidera?`,
  },
  {
    regex: /prezzo|costo|quanto|budget/i,
    answer: () => `I nostri servizi partono da €1.200/giorno per auto di lusso fino a €125.000 per tratte jet intercontinentali. Il concierge prepara un preventivo personalizzato entro 2 ore. Posso mettervi in contatto?`,
  },
  {
    regex: /agosto|luglio|giugno|estate/i,
    answer: () => `L'estate è la stagione più richiesta. Per luglio e agosto consiglio di prenotare con almeno 6 settimane di anticipo, in particolare per yacht in Sardegna e Amalfi. Vuole verificare la disponibilità?`,
  },
  {
    regex: /capri|sardegna|amalfi|portofino|positano|costa smeralda/i,
    answer: (q) => `${q.match(/capri|sardegna|amalfi|portofino|positano|costa smeralda/i)?.[0]} è una delle destinazioni più esclusive del nostro portfolio. Abbiamo yacht e ville disponibili lì. Preferisce navigare o soggiornare a terra?`,
  },
  {
    regex: /monaco|montecarlo|saint.tropez|côte d'azur|nizza/i,
    answer: () => `La Côte d'Azur è il nostro mercato di punta. Dal Pershing nel porto di Monaco alla Bentley GT Speed da Nizza a Saint-Tropez. Periodo di interesse?`,
  },
  {
    regex: /regalo|anniversario|compleanno|nozze|honeymoon|luna di miele/i,
    answer: () => `Siamo specialisti in esperienze su misura per occasioni speciali. Il nostro team concierge cura ogni dettaglio: dal bouquet di fiori rari a bordo alla cena privata con stelle Michelin. Raccontatemi di più sull'occasione.`,
  },
  {
    regex: /cancella|rimborso|modifica|cambio/i,
    answer: () => `La nostra politica prevede cancellazione gratuita fino a 48 ore prima. Per modifiche, il team concierge gestisce ogni richiesta entro 2 ore. Posso aiutarla con una prenotazione specifica?`,
  },
  {
    regex: /contatt|telefon|email|chiamar/i,
    answer: () => `Può raggiungerci a concierge@theclass.it o al +39 02 8724 3300. Il team è operativo Lun–Ven 9–21, Sab–Dom 10–18. Per clienti Platinum: reperibilità 24/7.`,
  },
  {
    regex: /grazie|perfetto|ottimo|bene|capito/i,
    answer: () => `Prego, è un piacere assisterla. Se ha altre domande o desidera procedere con una prenotazione, sono a disposizione. The Class — l'arte del viaggio senza confini.`,
  },
  {
    regex: /villa/i,
    answer: () => `Abbiamo ${listings.filter(l => l.category === 'villa').length} ville esclusive nel nostro portfolio: da Capri al Lago di Como, dalla Puglia a Portofino. Quale destinazione preferisce?`,
  },
]

const GREETING = `Benvenuto in the Class. Sono il vostro assistente concierge digitale. Posso aiutarla a trovare lo yacht perfetto, il jet giusto per la vostra destinazione, o suggerire un'esperienza esclusiva. Come posso servirla oggi?`

function matchResponse(input: string): string {
  for (const p of PATTERNS) {
    if (p.regex.test(input)) return p.answer(input)
  }
  return `Capisco la sua richiesta. Il nostro team concierge si occuperà personalmente di "${input.slice(0, 40)}${input.length > 40 ? '...' : ''}". Desidera che la contattino via email o telefono?`
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

export function AIConcierge() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'g0', role: 'ai', text: GREETING, timestamp: Date.now() },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message } = (e as CustomEvent).detail
      setOpen(true)
      setInput(message)
    }
    window.addEventListener('theclass:concierge:open', handler)
    return () => window.removeEventListener('theclass:concierge:open', handler)
  }, [])

  const send = async (text: string) => {
    const t = text.trim()
    if (!t) return
    setInput('')
    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text: t, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)
    // Simulate AI thinking delay (800–1400ms)
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
    const aiText = matchResponse(t)
    setTyping(false)
    setMessages(prev => [...prev, { id: `a${Date.now()}`, role: 'ai', text: aiText, timestamp: Date.now() }])
  }

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const recognition = new SR()
    recognition.lang = 'it-IT'
    recognition.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }

  return (
    <>
      {/* Trigger button */}
      <motion.button
        initial={false}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 z-40 rounded-full bg-[#1C1C1C] border border-[rgba(197,160,89,0.4)] flex items-center justify-center shadow-[0_4px_24px_rgba(26,24,22,0.3)] hover:border-[#C5A059] hover:scale-110 transition-all duration-200 group"
        aria-label="Apri concierge AI"
        style={{ width: 52, height: 52 }}
      >
        <MessageCircle size={20} className="text-[#C5A059]" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1C1C1C] animate-pulse" />
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-8 left-8 z-50 w-[340px] max-h-[520px] flex flex-col bg-[#FDF9F2] border border-[rgba(197,160,89,0.25)] rounded-2xl shadow-[0_24px_64px_rgba(26,24,22,0.18)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#1C1C1C] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(197,160,89,0.2)] border border-[rgba(197,160,89,0.4)] flex items-center justify-center">
                  <MessageCircle size={14} className="text-[#C5A059]" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">Concierge AI</p>
                  <p className="text-white/40 text-[10px]">the Class — sempre disponibile</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={14} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: 320 }}>
              {messages.map(m => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed',
                    m.role === 'user'
                      ? 'bg-[#C5A059] text-white rounded-br-sm'
                      : 'bg-white border border-[rgba(197,160,89,0.15)] text-[#1C1C1C] rounded-bl-sm shadow-[0_1px_4px_rgba(26,24,22,0.06)]',
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[rgba(197,160,89,0.15)] px-4 py-3 rounded-xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[rgba(197,160,89,0.12)] shrink-0 flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={cn(
                  'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  listening ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:bg-[rgba(197,160,89,0.1)]',
                )}
                aria-label={listening ? 'Ferma ascolto' : 'Attiva microfono'}
              >
                {listening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder="Scrivi o parla..."
                className="flex-1 bg-transparent text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="shrink-0 w-8 h-8 rounded-lg bg-[#C5A059] text-white flex items-center justify-center hover:bg-[#b8924a] transition-colors disabled:opacity-30"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
