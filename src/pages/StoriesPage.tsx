// src/pages/StoriesPage.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Clock, ArrowRight, Search, Share2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { stories } from '@/data/stories'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Tutto', 'Yacht', 'Jet Privati', 'Auto', 'Esperienze', 'Villa'] as const
type Category = typeof CATEGORIES[number]

export function StoriesPage() {
  const [featured, ...rest] = stories
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('Tutto')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const filteredStories = rest.filter(s => {
    const matchesCategory = activeCategory === 'Tutto' || s.category === activeCategory
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const mostRead = [...stories]
    .sort((a, b) => b.readTime - a.readTime)
    .slice(0, 3)

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/stories/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiato!', { description: 'Condividi questa storia con chi vuoi.' })
    }).catch(() => {
      toast.error('Impossibile copiare il link')
    })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Inserisci un\'email valida')
      return
    }
    toast.success('Iscritto!', { description: 'Benvenuto nella nostra newsletter esclusiva.' })
    setNewsletterEmail('')
  }

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Stories — the Class</title>
        <meta name="description" content="Reportage, itinerari e ispirazioni dal mondo del lusso. Storie di yacht, jet e esperienze irripetibili." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Magazine</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C]">
            Stories
          </h1>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-5"
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca una storia..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[rgba(197,160,89,0.22)] rounded-xl text-sm text-[#1C1C1C] placeholder:text-[#5A4F44]/40 focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </motion.div>

        {/* Category filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium transition-colors border',
                activeCategory === cat
                  ? 'bg-[#C5A059] text-white border-[#C5A059]'
                  : 'bg-white text-[#5A4F44] border-[rgba(197,160,89,0.3)] hover:border-[#C5A059]'
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Story counter */}
        <p className="text-xs text-[#5A4F44] mb-8">
          <span className="text-[#C5A059] font-medium">{filteredStories.length}</span> {filteredStories.length === 1 ? 'storia' : 'storie'}
        </p>

        {/* Featured */}
        <div className="relative mb-10 group">
          {/* In evidenza badge */}
          <span className="absolute top-4 left-4 z-10 text-[10px] bg-white text-[#C5A059] border border-[#C5A059] px-2.5 py-1 rounded-full uppercase tracking-widest font-medium">
            In evidenza
          </span>
          <Link to="/stories/$slug" params={{ slug: featured.slug }} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-[55vh] rounded-2xl overflow-hidden card-shine"
            >
              <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-[10px] bg-[#C5A059] text-white px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {featured.category}
                </span>
                <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-white mt-3 mb-2 group-hover:text-[#C5A059] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/70 text-sm font-light max-w-2xl">{featured.excerpt}</p>
                <div className="flex items-center gap-3 mt-4">
                  <img src={featured.author.avatar} alt={featured.author.name} className="w-7 h-7 rounded-full object-cover" loading="lazy" decoding="async" />
                  <span className="text-white/60 text-xs">{featured.author.name}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock size={9} />
                    {featured.readTime} min
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
          <button
            onClick={() => handleShare(featured.slug)}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Share2 size={13} className="text-[#C5A059]" />
          </button>
        </div>

        {/* Più lette */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <Star size={14} className="text-[#C5A059] fill-[#C5A059]" />
            <h2 className="font-[family-name:var(--font-family-display)] text-lg font-medium text-[#1C1C1C]">Più lette</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mostRead.map((story, i) => (
              <Link key={story.id} to="/stories/$slug" params={{ slug: story.slug }}>
                <div className="group flex gap-3 bg-white rounded-xl border border-[rgba(197,160,89,0.15)] p-4 hover:border-[#C5A059] transition-colors">
                  <span className="font-[family-name:var(--font-family-mono)] text-2xl font-bold text-[rgba(197,160,89,0.25)] shrink-0">0{i + 1}</span>
                  <div className="min-w-0">
                    <span className="inline-block text-[9px] bg-[rgba(197,160,89,0.15)] text-[#C5A059] px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                      {story.category}
                    </span>
                    <h3 className="text-sm font-medium text-[#1C1C1C] leading-snug group-hover:text-[#C5A059] transition-colors line-clamp-2 mb-1">
                      {story.title}
                    </h3>
                    <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <Clock size={9} />
                      {story.readTime} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-[family-name:var(--font-family-display)] text-xl text-[#1C1C1C] mb-2">Nessuna storia trovata</p>
            <p className="text-sm text-[#5A4F44] font-light">Prova un termine diverso o un'altra categoria.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('Tutto') }}
              className="mt-4 text-xs text-[#C5A059] underline underline-offset-2"
            >
              Azzera filtri
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, i) => (
              <div key={story.id} className="relative">
                <Link to="/stories/$slug" params={{ slug: story.slug }}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden card-shine"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={story.cover} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                      <span className="absolute top-3 left-3 text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {story.category}
                      </span>
                      {/* readTime pill */}
                      <span className="absolute top-3 right-3 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={9} />
                        {story.readTime} min
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] leading-snug mb-2 group-hover:text-[#C5A059] transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-xs text-[#5A4F44] font-light leading-relaxed mb-4 line-clamp-2">{story.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={story.author.avatar} alt={story.author.name} className="w-5 h-5 rounded-full object-cover" loading="lazy" decoding="async" />
                          <span className="text-[10px] text-[#5A4F44]">{story.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#C5A059]">
                          <span className="text-[10px]">Leggi</span>
                          <ArrowRight size={10} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
                {/* Share button */}
                <button
                  onClick={() => handleShare(story.slug)}
                  className="absolute top-52 right-3 w-7 h-7 bg-white rounded-full border border-[rgba(197,160,89,0.2)] flex items-center justify-center hover:border-[#C5A059] transition-colors shadow-sm z-10"
                  title="Condividi"
                >
                  <Share2 size={11} className="text-[#C5A059]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-[#1C1C1C] rounded-2xl p-10 text-center"
        >
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Newsletter</p>
          <h2 className="font-[family-name:var(--font-family-display)] text-2xl font-medium text-white mb-2">
            Resta aggiornato
          </h2>
          <p className="text-white/60 font-light text-sm mb-6">
            Iscriviti alla nostra newsletter esclusiva — storie, itinerari e accesso anticipato alle novità.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="la-tua@email.it"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#C5A059] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#b8924a] transition-colors shrink-0"
            >
              Iscriviti
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
