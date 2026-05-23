import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X, User, Moon, Sun, Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'
import { listings } from '@/data/listings'
import { SkipToMain } from './SkipToMain'
import { OfflineBanner } from './OfflineBanner'
import { useLang } from '@/context/LangContext'
import { ScrollProgressBar } from './ScrollProgressBar'
import { BackToTop } from './BackToTop'
import { BrandLogo } from './BrandLogo'
import { AIConcierge } from './AIConcierge'
import { useTheme } from '@/context/ThemeContext'
import { useCurrency, RATES, type Currency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useInactivityTimer } from '@/hooks/useInactivityTimer'
import { FirstVisitTour } from './FirstVisitTour'

const SURPRISES = [
  'Yacht Azimut a metà prezzo domani — solo per te 🎁',
  'Jet privato Roma-Parigi con champagne incluso',
  'Ferrari SF90 per il weekend: prenota entro 1h',
  'Villa Capri — ultima disponibilità luglio',
]

const NAV = [
  { to: '/servizi', label: 'Servizi' },
  { to: '/itinerari', label: 'Itinerari' },
  { to: '/concierge', label: 'Concierge' },
  { to: '/richiesta-su-misura', label: 'Su Misura' },
  { to: '/eventi', label: 'Eventi' },
  { to: '/stories', label: 'Stories' },
]

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count } = useFavorites()
  const location = useLocation()
  const { lang, toggle } = useLang()
  const { isDark, toggle: toggleTheme } = useTheme()
  const { currency, setCurrency } = useCurrency()
  const { user } = useAuth()
  const [listening, setListening] = useState(false)
  const navigate = useNavigate()

  const [silenceMode, setSilenceMode] = useState(() => localStorage.getItem('theclass_silence') === 'true')

  // Magnetic cursor — desktop only, not on touch devices
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    if (isTouch || silenceMode) return

    const dot = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!dot || !ring) return

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    let rafId: number
    const animate = () => {
      const dx = mousePos.current.x - ringPos.current.x
      const dy = mousePos.current.y - ringPos.current.y
      ringPos.current.x += dx * 0.12
      ringPos.current.y += dy * 0.12
      dot.style.left = `${mousePos.current.x}px`
      dot.style.top = `${mousePos.current.y}px`
      ring.style.left = `${ringPos.current.x}px`
      ring.style.top = `${ringPos.current.y}px`
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    const onEnterLink = () => {
      if (dot) { dot.style.width = '12px'; dot.style.height = '12px' }
      if (ring) { ring.style.width = '48px'; ring.style.height = '48px'; ring.style.borderColor = 'rgba(197,160,89,0.7)' }
    }
    const onLeaveLink = () => {
      if (dot) { dot.style.width = '6px'; dot.style.height = '6px' }
      if (ring) { ring.style.width = '32px'; ring.style.height = '32px'; ring.style.borderColor = 'rgba(197,160,89,0.5)' }
    }
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnterLink)
      el.addEventListener('mouseleave', onLeaveLink)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [silenceMode])

  const toggleSilence = () => setSilenceMode(prev => {
    const next = !prev
    localStorage.setItem('theclass_silence', String(next))
    if (next) document.documentElement.setAttribute('data-silence', 'true')
    else document.documentElement.removeAttribute('data-silence')
    return next
  })

  useEffect(() => {
    if (silenceMode) document.documentElement.setAttribute('data-silence', 'true')
  }, [])

  useInactivityTimer(5 * 60 * 1000)

  // Price drop alerts check on mount
  useEffect(() => {
    const alerts = (() => { try { return JSON.parse(localStorage.getItem('theclass_price_alerts') ?? '[]') as string[] } catch { return [] } })()
    alerts.forEach(id => {
      const sentKey = `theclass_alert_sent_${id}`
      if (!localStorage.getItem(sentKey) && Math.random() > 0.7) {
        localStorage.setItem(sentKey, 'true')
        const listing = listings.find(l => l.id === id)
        if (listing) {
          const discounted = Math.round(listing.price * 0.88)
          setTimeout(() => {
            toast(`💸 Il prezzo di ${listing.title} è sceso del 12%! Da €${listing.price.toLocaleString('it-IT')} a €${discounted.toLocaleString('it-IT')}`, {
              duration: 8000,
            })
          }, 2000 + Math.random() * 3000)
        }
      }
    })
  }, [])

  useEffect(() => {
    const handler = () => {
      toast('Sei ancora lì?', {
        description: 'Redirect alla home tra 2 minuti senza attività.',
        action: { label: 'Resto qui', onClick: () => {} },
        duration: 120000,
      })
      setTimeout(() => navigate({ to: '/' }), 120000)
    }
    window.addEventListener('theclass:inactive', handler)
    return () => window.removeEventListener('theclass:inactive', handler)
  }, [navigate])

  const startVoiceSearch = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { toast.error('Ricerca vocale non supportata'); return }
    const r = new SR()
    r.lang = 'it-IT'
    r.interimResults = false
    r.onresult = (e: any) => {
      const q = e.results[0][0].transcript
      setListening(false)
      window.location.href = `/servizi?loc=${encodeURIComponent(q)}`
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
    setListening(true)
  }, [])

  useKeyboardShortcuts({
    'G': () => navigate({ to: '/stories' }),
    'S': () => window.dispatchEvent(new CustomEvent('theclass:surprise')),
  })

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Breathing idle effect
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>
    const setIdle = () => {
      document.querySelectorAll('.card-shine').forEach(el => el.classList.add('idle-breathe'))
    }
    const clearIdle = () => {
      document.querySelectorAll('.idle-breathe').forEach(el => el.classList.remove('idle-breathe'))
      clearTimeout(idleTimer)
      idleTimer = setTimeout(setIdle, 10000)
    }
    window.addEventListener('mousemove', clearIdle, { passive: true })
    idleTimer = setTimeout(setIdle, 10000)
    return () => { window.removeEventListener('mousemove', clearIdle); clearTimeout(idleTimer) }
  }, [])

  return (
    <div className={cn("min-h-screen flex flex-col transition-all duration-500")}>
      <SkipToMain />
      <ScrollProgressBar />
      {/* ── HEADER ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled ? 'glass shadow-[0_1px_0_rgba(197,160,89,0.2)]' : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <BrandLogo size={32} light={!scrolled} animated={true} />
            <span
              className="font-[family-name:var(--font-family-display)] text-xl font-medium tracking-[-0.02em]"
              style={{ color: scrolled ? '#1C1C1C' : 'white' }}
            >
              the{' '}
              <span className="gold-gradient-text">Class</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'gold-underline font-light text-sm tracking-wide transition-colors duration-200',
                  location.pathname.startsWith(link.to)
                    ? 'text-[#C5A059]'
                    : scrolled
                      ? 'text-[#5A4F44] hover:text-[#1C1C1C]'
                      : 'text-white/80 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Greeting */}
          <div className="hidden lg:flex items-center">
            <span className={cn('text-[11px] font-light italic tracking-wide transition-colors', scrolled ? 'text-[#5A4F44]' : 'text-white/60')}>
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label="Cambia tema"
              className={cn('hidden md:flex items-center transition-colors', scrolled ? 'text-[#5A4F44]' : 'text-white/70')}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={toggle}
              aria-label="Cambia lingua"
              className={cn(
                'hidden md:flex items-center gap-1 text-[11px] font-[family-name:var(--font-family-mono)] tracking-widest transition-colors',
                scrolled ? 'text-[#5A4F44]' : 'text-white/70',
              )}
            >
              <span className={lang === 'it' ? 'text-[#C5A059]' : 'opacity-40'}>IT</span>
              <span className="opacity-30">/</span>
              <span className={lang === 'en' ? 'text-[#C5A059]' : 'opacity-40'}>EN</span>
            </button>
            <button
              onClick={() => toast(SURPRISES[Math.floor(Math.random() * SURPRISES.length)], {
                description: 'Offerta valida per le prossime 2 ore',
                action: { label: 'Scopri', onClick: () => {} },
              })}
              className={cn('hidden md:flex items-center gap-1.5 text-[10px] tracking-widest font-[family-name:var(--font-family-mono)] transition-colors', scrolled ? 'text-[#5A4F44]' : 'text-white/60')}
              aria-label="Offerta Sorpresa"
            >
              ✦
            </button>
            {/* Voice search */}
            <button
              onClick={startVoiceSearch}
              aria-label="Ricerca vocale"
              className={cn('hidden md:flex items-center transition-all duration-300',
                listening ? 'text-[#C5A059] scale-125 animate-pulse' : scrolled ? 'text-[#5A4F44]' : 'text-white/70'
              )}
            >
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Silence mode */}
            <button
              onClick={toggleSilence}
              aria-label={silenceMode ? 'Riattiva animazioni' : 'Silenzio (disattiva animazioni)'}
              className={cn('hidden md:flex items-center text-xs transition-colors', silenceMode ? 'text-[#C5A059]' : scrolled ? 'text-[#5A4F44]' : 'text-white/70')}
            >
              {silenceMode ? '🔇' : '🔔'}
            </button>

            <Link to="/profilo" aria-label="Profilo utente" className="flex items-center">
              <User size={16} className={scrolled ? 'text-[#5A4F44]' : 'text-white/80'} />
            </Link>
            <Link to="/preferiti" aria-label="Preferiti" className="relative flex items-center group">
              <Heart
                size={18}
                className={cn(
                  'transition-all duration-200 group-hover:scale-110',
                  count > 0 ? 'fill-[#C5A059] text-[#C5A059]' : scrolled ? 'text-[#5A4F44]' : 'text-white/80',
                )}
              />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C5A059] text-white text-[9px] font-medium flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
              className={cn('md:hidden p-1 transition-colors', scrolled ? 'text-[#5A4F44]' : 'text-white')}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden glass border-t border-[rgba(197,160,89,0.2)] overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-4">
                {NAV.map(link => (
                  <Link key={link.to} to={link.to} className="text-sm font-light text-[#5A4F44] py-1">
                    {link.label}
                  </Link>
                ))}
                <Link to="/preferiti" className="text-sm font-light text-[#5A4F44] py-1 flex items-center gap-2">
                  <Heart size={13} />
                  Preferiti{count > 0 ? ` (${count})` : ''}
                </Link>
                <button onClick={toggle} className="text-sm font-light text-[#5A4F44] py-1 flex items-center gap-2">
                  {lang === 'it' ? '🇬🇧 English' : '🇮🇹 Italiano'}
                </button>
                <Link to="/profilo" className="text-sm font-light text-[#5A4F44] py-1 flex items-center gap-2">
                  <User size={13} />
                  Profilo
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <OfflineBanner />
      <main id="main-content" className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(197,160,89,0.3)] bg-[#FCFAF5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: 'Servizi', items: [
                { label: 'Yacht', href: '/servizi?cats=yacht' },
                { label: 'Jet Privati', href: '/servizi?cats=jet' },
                { label: 'Auto di Lusso', href: '/servizi?cats=auto' },
                { label: 'Esperienze', href: '/servizi?cats=esperienza' },
              ]},
              { title: 'Magazine', items: [
                { label: 'Stories', href: '/stories' },
                { label: 'Mind Map', href: '/mindmap' },
                { label: 'Factotum Personale', href: '/concierge' },
                { label: 'Chi Siamo', href: '/chi-siamo' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contatti', href: '/contatti' },
              ]},
              { title: 'Legale', items: [
                { label: 'Termini di Servizio', href: '/termini' },
                { label: 'Privacy Policy', href: '/termini' },
                { label: 'Cookie Policy', href: '/termini' },
              ]},
              { title: 'Seguici', items: [
                { label: 'Instagram', href: '#' },
                { label: 'LinkedIn', href: '#' },
                { label: 'WhatsApp Business', href: '#' },
              ]},
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item.label}>
                      {item.href.startsWith('/') ? (
                        <Link to={item.href as '/'} className="gold-underline text-xs text-[#5A4F44] cursor-pointer hover:text-[#C5A059] transition-colors">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="gold-underline text-xs text-[#5A4F44] cursor-pointer">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Partner logos */}
          <div className="pb-6 border-b border-[rgba(197,160,89,0.1)] mb-6">
            <p className="text-[10px] text-[#5A4F44]/50 text-center tracking-widest uppercase mb-4">Partner di Lusso</p>
            <div className="flex flex-wrap justify-center gap-8">
              {['Ferrari', 'Rolex', 'Louis Vuitton', 'Moët & Chandon', 'Bulgari'].map(brand => (
                <span key={brand} className="font-[family-name:var(--font-family-display)] text-sm text-[rgba(197,160,89,0.35)] tracking-widest hover:text-[rgba(197,160,89,0.6)] transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              { icon: '🔒', label: 'SSL Secured', sub: '256-bit encryption' },
              { icon: '💳', label: 'Pagamenti Sicuri', sub: 'Stripe & Visa Verified' },
              { icon: '⚓', label: 'Membro IYBA', sub: 'Int\'l Yacht Brokers Assoc.' },
              { icon: '✈️', label: 'IATA Certified', sub: 'Charter Air Broker' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(197,160,89,0.15)] bg-[rgba(197,160,89,0.03)]">
                <span className="text-sm">{b.icon}</span>
                <div>
                  <p className="text-[10px] font-medium text-[#1C1C1C] leading-none">{b.label}</p>
                  <p className="text-[9px] text-[#5A4F44] leading-none mt-0.5">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[rgba(197,160,89,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-[family-name:var(--font-family-display)] text-lg">
              the <span className="gold-gradient-text">Class</span>
            </span>
            <div className="flex items-center gap-4">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="text-xs text-[#5A4F44] bg-transparent border border-[rgba(197,160,89,0.2)] rounded-lg px-2 py-1 focus:outline-none focus:border-[#C5A059]"
              >
                {(Object.keys(RATES) as Currency[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-xs text-[#5A4F44] font-light">
                © {new Date().getFullYear()} the Class S.r.l. — L'arte del viaggio senza confini.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
      <AIConcierge />
      <FirstVisitTour />
      {/* Magnetic cursor — hidden on touch devices via CSS */}
      <div ref={cursorDotRef} className="cursor-dot pointer-events-none hidden md:block" aria-hidden="true" />
      <div ref={cursorRingRef} className="cursor-ring pointer-events-none hidden md:block" aria-hidden="true" />
    </div>
  )
}
