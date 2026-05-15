import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/servizi', label: 'Servizi' },
  { to: '/itinerari', label: 'Itinerari' },
  { to: '/concierge', label: 'Concierge' },
  { to: '/richiesta-su-misura', label: 'Su Misura' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count } = useFavorites()
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── HEADER ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled ? 'glass shadow-[0_1px_0_rgba(197,160,89,0.2)]' : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0">
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

          {/* Right */}
          <div className="flex items-center gap-4">
            <Link to="/preferiti" className="relative flex items-center group">
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
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(197,160,89,0.3)] bg-[#FCFAF5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: 'Servizi', items: ['Yacht', 'Jet Privati', 'Auto di Lusso', 'Fractional Ownership'] },
              { title: 'Esperienze', items: ['Fine Dining', 'Aste d\'Arte', 'Wellness Privato', 'Avventura'] },
              { title: 'Info', items: ['Chi Siamo', 'Privacy Policy', 'Termini di Servizio', 'Contatti'] },
              { title: 'Seguici', items: ['Instagram', 'LinkedIn', 'WhatsApp Business'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium text-[#1C1C1C] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item}>
                      <span className="gold-underline text-xs text-[#5A4F44] cursor-pointer">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[rgba(197,160,89,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-[family-name:var(--font-family-display)] text-lg">
              the <span className="gold-gradient-text">Class</span>
            </span>
            <p className="text-xs text-[#5A4F44] font-light">
              © {new Date().getFullYear()} the Class S.r.l. — L'arte del viaggio senza confini.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
