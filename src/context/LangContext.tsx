import { createContext, useContext, useState, useCallback } from 'react'
import { safeRead, safeWrite } from '@/lib/errorHandler'

export type Lang = 'it' | 'en'

const translations = {
  it: {
    nav_servizi: 'Servizi',
    nav_itinerari: 'Itinerari',
    nav_concierge: 'Concierge',
    nav_suMisura: 'Su Misura',
    nav_profilo: 'Profilo',
    nav_preferiti: 'Preferiti',
    hero_headline: 'Il lusso non si insegue.',
    hero_headline2: 'Si sceglie.',
    hero_sub: 'Yacht, jet privati, auto da sogno e\nesperienze esclusive in tutto il mondo.',
    hero_cta: 'Esplora i servizi',
    hero_concierge: 'Parla col Concierge',
    footer_tagline: "L'arte del viaggio senza confini.",
    servizi_title: 'I Nostri Servizi',
    servizi_sub: 'Ogni esperienza, curata nei minimi dettagli.',
    request_title: 'Richiedi Disponibilità',
    request_name: 'Nome *',
    request_email: 'Email *',
    request_phone: 'Telefono',
    request_message: 'Messaggio Speciale',
    request_submit: 'Invia Richiesta',
    request_success: 'Richiesta inviata!',
    request_sending: 'Invio in corso...',
    request_contact: 'Preferenza Contatto',
    request_dates: 'Date richieste',
    request_upgrades: 'Upgrade Opzionali',
    request_pdf: 'Scarica Preventivo PDF',
    coupon_label: 'Codice promozionale',
    coupon_apply: 'Applica',
    coupon_ok: 'Codice applicato!',
    coupon_invalid: 'Codice non valido',
    reviews_title: 'Recensioni',
    reviews_write: 'Scrivi recensione',
    reviews_cancel: 'Annulla',
    reviews_publish: 'Pubblica recensione',
    reviews_rating: 'Valutazione *',
    reviews_exp: 'La tua esperienza *',
    reviews_none: 'Nessuna recensione ancora. Sii il primo.',
    calendar_add: 'Calendario',
    share_title: 'Condividi',
    profile_title: 'Il tuo profilo',
    profile_requests: 'Richieste',
    profile_favorites: 'Preferiti',
    profile_since: 'Membro da',
    profile_history: 'Storico Richieste',
    profile_none: 'Nessuna richiesta ancora. Esplora i nostri servizi.',
    profile_login: 'Accedi',
    profile_logout: 'Esci',
    offline: 'Sei offline — le modifiche verranno sincronizzate al ripristino della connessione',
    skip: 'Salta al contenuto principale',
  },
  en: {
    nav_servizi: 'Services',
    nav_itinerari: 'Itineraries',
    nav_concierge: 'Concierge',
    nav_suMisura: 'Bespoke',
    nav_profilo: 'Profile',
    nav_preferiti: 'Wishlist',
    hero_headline: 'Luxury is not chased.',
    hero_headline2: 'It is chosen.',
    hero_sub: 'Yachts, private jets, dream cars and\nexclusive experiences worldwide.',
    hero_cta: 'Explore services',
    hero_concierge: 'Talk to Concierge',
    footer_tagline: 'The art of travel without limits.',
    servizi_title: 'Our Services',
    servizi_sub: 'Every experience, curated in every detail.',
    request_title: 'Request Availability',
    request_name: 'Name *',
    request_email: 'Email *',
    request_phone: 'Phone',
    request_message: 'Special Request',
    request_submit: 'Send Request',
    request_success: 'Request sent!',
    request_sending: 'Sending...',
    request_contact: 'Contact Preference',
    request_dates: 'Requested dates',
    request_upgrades: 'Optional Upgrades',
    request_pdf: 'Download Quote PDF',
    coupon_label: 'Promo code',
    coupon_apply: 'Apply',
    coupon_ok: 'Code applied!',
    coupon_invalid: 'Invalid code',
    reviews_title: 'Reviews',
    reviews_write: 'Write a review',
    reviews_cancel: 'Cancel',
    reviews_publish: 'Publish review',
    reviews_rating: 'Rating *',
    reviews_exp: 'Your experience *',
    reviews_none: 'No reviews yet. Be the first.',
    calendar_add: 'Add to Calendar',
    share_title: 'Share',
    profile_title: 'Your profile',
    profile_requests: 'Requests',
    profile_favorites: 'Favorites',
    profile_since: 'Member since',
    profile_history: 'Request History',
    profile_none: 'No requests yet. Explore our services.',
    profile_login: 'Sign in',
    profile_logout: 'Sign out',
    offline: 'You are offline — changes will sync when connection is restored',
    skip: 'Skip to main content',
  },
} satisfies Record<Lang, Record<string, string>>

export type TranslationKey = keyof typeof translations.it

interface LangContextValue {
  lang: Lang
  t: (key: TranslationKey) => string
  toggle: () => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => safeRead<Lang>('theclass_lang', 'it'))

  const toggle = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'it' ? 'en' : 'it'
      safeWrite('theclass_lang', next)
      return next
    })
  }, [])

  const t = useCallback((key: TranslationKey) => translations[lang][key] ?? key, [lang])

  return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
