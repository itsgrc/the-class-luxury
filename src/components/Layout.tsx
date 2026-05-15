import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'

const navLinks = [
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
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'glass border-b border-[rgba(197,160,89,0.2)] shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-[family-name:var(--font-family-display)] text-xl font-medium tracking-[-0.02em] text-[#1C1C1C]">
              the <span className="gold-gradient-text">Class</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'gold-underline font-[family-name:var(--font-family-sans)] font-light text-sm tracking-wide transition-colors duration-200',
                  location.pathname.startsWith(link.to)
                    ? 'text-[#C5A059]'
                    : 'text-[#5A4F44] hover:text-[#1C1C1C]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link to="/preferiti" className="relative group flex items-center gap-1.5">
              <Heart
                size={18}
                className={cn(
                  'transition-all duration-200',
                  count > 0 ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#5A4F44] group-hover:text-[#C5A059]'
                )}
              />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#C5A059] text-white text-[10px] font-medium flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1 text-[#5A4F44]"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
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
              className="md:hidden glass border-t border-[rgba(197,160,89,0.2)]"
            >
              <nav className="flex flex-col px-6 py-4 gap-4">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="font-light text-sm text-[#5A4F44] py-1"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/preferiti" className="font-light text-sm text-[#5A4F44] py-1 flex items-center gap-2">
                  <Heart size={14} />
                  Preferiti {count > 0 && `(${count})`}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(197,160,89,0.3)] bg-[#FCFAF5] mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium mb-4 text-[#1C1C1C]">
                Servizi
              </h4>
              <ul className="space-y-2">
                {['Yacht', 'Jet Privati', 'Auto di Lusso', 'Fractional'].map(s => (
                  <li key={s}>
                    <Link to="/servizi" className="text-xs text-[#5A4F44] gold-underline">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium mb-4 text-[#1C1C1C]">
                Esperienze
              </h4>
              <ul className="space-y-2">
                {['Fine Dining', 'Aste d\'Arte', 'Wellness', 'Avventura'].map(s => (
                  <li key={s}>
                    <span className="text-xs text-[#5A4F44]">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium mb-4 text-[#1C1C1C]">
                Info
              </h4>
              <ul className="space-y-2">
                {['Chi Siamo', 'Privacy Policy', 'Termini', 'Contatti'].map(s => (
                  <li key={s}>
                    <span className="text-xs text-[#5A4F44]">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-[family-name:var(--font-family-display)] text-sm font-medium mb-4 text-[#1C1C1C]">
                Seguici
              </h4>
              <ul className="space-y-2">
                {['Instagram', 'LinkedIn', 'WhatsApp'].map(s => (
                  <li key={s}>
                    <span className="text-xs text-[#5A4F44] gold-underline cursor-pointer">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[rgba(197,160,89,0.2)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-[family-name:var(--font-family-display)] text-lg font-medium">
              the <span className="gold-gradient-text">Class</span>
            </span>
            <p className="text-xs text-[#5A4F44] font-light">
              © {new Date().getFullYear()} the Class. L'arte del viaggio senza confini.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
