// src/components/Breadcrumbs.tsx
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const PATH_LABELS: Record<string, string> = {
  servizi: 'Servizi',
  preferiti: 'Preferiti',
  itinerari: 'Itinerari',
  concierge: 'Concierge',
  'richiesta-su-misura': 'Su Misura',
  profilo: 'Profilo',
  admin: 'Admin',
  stories: 'Stories',
  'chi-siamo': 'Chi Siamo',
  contatti: 'Contatti',
  termini: 'Termini',
  faq: 'FAQ',
}

interface Props {
  currentLabel?: string
  className?: string
}

export function Breadcrumbs({ currentLabel, className }: Props) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    const label = PATH_LABELS[seg] ?? (i === segments.length - 1 && currentLabel ? currentLabel : seg)
    const isLast = i === segments.length - 1
    return { path, label, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs text-[#5A4F44]', className)}>
      <Link to="/" className="flex items-center hover:text-[#C5A059] transition-colors">
        <Home size={11} />
      </Link>
      {crumbs.map(({ path, label, isLast }) => (
        <span key={path} className="flex items-center gap-1.5">
          <ChevronRight size={10} className="opacity-40 shrink-0" />
          {isLast ? (
            <span className="text-[#1C1C1C] font-medium truncate max-w-[200px]">{label}</span>
          ) : (
            <Link to={path as '/'} className="hover:text-[#C5A059] transition-colors truncate max-w-[120px]">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
