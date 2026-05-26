// src/pages/StoryDetailPage.tsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, BookmarkCheck, ChevronUp, Printer, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { stories } from '@/data/stories'

type TextSize = 'sm' | 'base' | 'lg'

const TEXT_SIZE_CLASSES: Record<TextSize, string> = {
  sm: 'text-sm',
  base: 'text-[15px]',
  lg: 'text-lg',
}

const REACTION_EMOJIS: { key: string; emoji: string }[] = [
  { key: 'heart', emoji: '❤️' },
  { key: 'fire', emoji: '🔥' },
  { key: 'gem', emoji: '💎' },
  { key: 'mind', emoji: '🤯' },
]

function timeSincePublished(dateStr: string): string {
  if (!dateStr) return 'Pubblicato di recente'
  const published = new Date(dateStr).getTime()
  const now = Date.now()
  const days = Math.floor((now - published) / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Pubblicato oggi'
  if (days === 1) return 'Pubblicato ieri'
  return `Pubblicato ${days} giorni fa`
}

export function StoryDetailPage() {
  const { slug } = useParams({ from: '/stories/$slug' })
  const story = stories.find(s => s.slug === slug)
  const [bookmarked, setBookmarked] = useState(false)
  const [readProgress, setReadProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>('base')
  const [readingMode, setReadingMode] = useState(false)
  const [reactions, setReactions] = useState<Record<string, number>>({ heart: 47, fire: 31, gem: 18, mind: 22 })
  const [votedReactions, setVotedReactions] = useState<Set<string>>(new Set())
  const [opinionVote, setOpinionVote] = useState<'up' | 'down' | null>(null)
  const [opinionCounts, setOpinionCounts] = useState({ up: 143, down: 12 })
  const contentRef = useRef<HTMLDivElement>(null)

  // Restore bookmark
  useEffect(() => {
    if (!story) return
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('theclass_bookmarks') ?? '[]')
      setBookmarked(saved.includes(story.id))
    } catch { /* ignore */ }
  }, [story])

  // Load reactions from localStorage
  useEffect(() => {
    if (!story) return
    try {
      const saved = JSON.parse(localStorage.getItem(`theclass_story_reactions_${story.id}`) ?? 'null')
      if (saved) {
        setReactions(saved.counts ?? reactions)
        setVotedReactions(new Set(saved.voted ?? []))
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story])

  // Load opinion vote
  useEffect(() => {
    if (!story) return
    try {
      const saved = localStorage.getItem(`theclass_opinion_${story.id}`)
      if (saved === 'up' || saved === 'down') {
        setOpinionVote(saved)
      }
    } catch { /* ignore */ }
  }, [story])

  // Reading progress + scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight
      const read = Math.max(0, -rect.top)
      setReadProgress(Math.min(100, Math.round((read / total) * 100)))
      setShowScrollTop(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!story) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="font-[family-name:var(--font-family-display)] text-2xl text-[#1C1C1C] mb-4">Storia non trovata</p>
          <Link to="/stories" className="text-[#C5A059] text-sm underline">Torna alle Stories</Link>
        </div>
      </div>
    )
  }

  const related = stories.filter(s => s.id !== story.id && s.category === story.category).slice(0, 3)
  const moreSuggested = stories.filter(s => s.id !== story.id && s.category !== story.category).slice(0, 2)

  // Estimated finish time
  const remainingMinutes = Math.round(story.readTime * (100 - readProgress) / 100)
  const finishTime = (() => {
    const d = new Date(Date.now() + remainingMinutes * 60 * 1000)
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  })()

  // Extract headings from body (paragraphs as plain text — simulate headings from content structure)
  const paragraphs = story.content.split('\n\n')
  // For TOC: check if any paragraph starts with a single-line capital phrase (simulates headings)
  const headings = paragraphs
    .filter(p => p.length < 80 && p.trim().length > 0 && !p.includes('.') && p === p.trim())
    .slice(0, 4)

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('theclass_bookmarks') ?? '[]')
      const next = bookmarked ? saved.filter(id => id !== story.id) : [...saved, story.id]
      localStorage.setItem('theclass_bookmarks', JSON.stringify(next))
      setBookmarked(!bookmarked)
      toast(bookmarked ? 'Rimosso dai segnalibri' : 'Aggiunto ai segnalibri ✦', { description: story.title })
    } catch { /* ignore */ }
  }

  const shareStory = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success('Link copiato!', { description: 'Condividi questa storia' }))
  }

  const handleReaction = (key: string) => {
    if (!story) return
    const alreadyVoted = votedReactions.has(key)
    const newCounts = { ...reactions, [key]: reactions[key] + (alreadyVoted ? -1 : 1) }
    const newVoted = new Set(votedReactions)
    if (alreadyVoted) newVoted.delete(key)
    else newVoted.add(key)
    setReactions(newCounts)
    setVotedReactions(newVoted)
    try {
      localStorage.setItem(`theclass_story_reactions_${story.id}`, JSON.stringify({ counts: newCounts, voted: Array.from(newVoted) }))
    } catch { /* ignore */ }
  }

  const handleOpinion = (vote: 'up' | 'down') => {
    if (!story) return
    if (opinionVote === vote) return
    const prevVote = opinionVote
    const newCounts = { ...opinionCounts }
    if (prevVote) newCounts[prevVote] = Math.max(0, newCounts[prevVote] - 1)
    newCounts[vote] += 1
    setOpinionCounts(newCounts)
    setOpinionVote(vote)
    try {
      localStorage.setItem(`theclass_opinion_${story.id}`, vote)
    } catch { /* ignore */ }
    toast.success('Grazie per il tuo feedback!')
  }

  const storyUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedTitle = encodeURIComponent(story.title)
  const encodedUrl = encodeURIComponent(storyUrl)
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(story.title + ' ' + storyUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`

  const midIndex = Math.floor(paragraphs.length * 0.4)

  return (
    <div className={`min-h-screen bg-[#FDF9F2] pb-20 ${readingMode ? 'reading-mode' : ''}`}>
      <Helmet>
        <title>{story.title} — the Class Stories</title>
        <meta name="description" content={story.excerpt} />
        <meta property="og:image" content={story.cover} />
        <meta property="og:title" content={story.title} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-[rgba(197,160,89,0.15)] z-50">
        <div
          className="h-full bg-[#C5A059] transition-all duration-100"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Floating text-size + reading mode toolbar (desktop only) */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">
        <div className="bg-white rounded-2xl border border-[rgba(197,160,89,0.2)] shadow-sm p-2 flex flex-col gap-1.5">
          <button
            onClick={() => setTextSize('sm')}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-colors ${textSize === 'sm' ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:bg-[rgba(197,160,89,0.1)]'}`}
          >A-</button>
          <button
            onClick={() => setTextSize('base')}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${textSize === 'base' ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:bg-[rgba(197,160,89,0.1)]'}`}
          >A</button>
          <button
            onClick={() => setTextSize('lg')}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-base font-bold transition-colors ${textSize === 'lg' ? 'bg-[#C5A059] text-white' : 'text-[#5A4F44] hover:bg-[rgba(197,160,89,0.1)]'}`}
          >A+</button>
        </div>
        {/* Reading mode toggle */}
        <button
          onClick={() => setReadingMode(r => !r)}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border text-[10px] font-medium transition-colors ${readingMode ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white border-[rgba(197,160,89,0.2)] text-[#5A4F44] hover:border-[#C5A059]'}`}
          title="Modalità lettura"
        >
          <Eye size={14} />
        </button>
        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[rgba(197,160,89,0.2)] bg-white text-[#5A4F44] hover:border-[#C5A059] transition-colors"
          title="Stampa"
        >
          <Printer size={14} />
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-[58vh] overflow-hidden">
        <img
          src={story.cover} alt={story.title}
          className="w-full h-full object-cover"
          loading="eager" decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F2] via-[#1C1C1C]/20 to-[#1C1C1C]/55" />
        <Link to="/stories"
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(28,28,28,0.5)] backdrop-blur-sm text-white text-xs hover:bg-[rgba(28,28,28,0.7)] transition-colors">
          <ArrowLeft size={13} /> Stories
        </Link>
        {/* Share + Bookmark */}
        <div className="absolute top-6 right-6 flex gap-2">
          <button onClick={shareStory}
            className="w-9 h-9 rounded-full bg-[rgba(28,28,28,0.5)] backdrop-blur-sm flex items-center justify-center text-white hover:bg-[rgba(28,28,28,0.7)] transition-colors">
            <Share2 size={14} />
          </button>
          <button onClick={toggleBookmark}
            className="w-9 h-9 rounded-full bg-[rgba(28,28,28,0.5)] backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-[rgba(28,28,28,0.7)]">
            {bookmarked
              ? <BookmarkCheck size={14} className="text-[#C5A059]" />
              : <Bookmark size={14} className="text-white" />
            }
          </button>
        </div>
      </div>

      <div className={`mx-auto px-6 ${readingMode ? 'max-w-xl' : 'max-w-2xl'} transition-all duration-300`}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="-mt-12 relative z-10 mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[10px] bg-[#C5A059] text-white px-2.5 py-1 rounded-full uppercase tracking-widest">
              {story.category}
            </span>
            <span className="text-[10px] border border-[rgba(197,160,89,0.3)] text-[#5A4F44] px-2.5 py-1 rounded-full">
              {story.readTime} min di lettura
            </span>
            <span className="text-[10px] text-[#5A4F44] font-[family-name:var(--font-family-mono)]">
              {readProgress}% letto
            </span>
            {readProgress > 0 && readProgress < 100 && (
              <span className="text-[10px] text-[#C5A059] font-[family-name:var(--font-family-mono)]">
                · Finisci alle {finishTime}
              </span>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl md:text-4xl font-medium text-[#1C1C1C] leading-tight mb-5">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap pb-5 border-b border-[rgba(197,160,89,0.15)]">
            <div className="flex items-center gap-2">
              <img src={story.author.avatar} alt={story.author.name} className="w-9 h-9 rounded-full object-cover border border-[rgba(197,160,89,0.3)]" loading="lazy" decoding="async" />
              <div>
                <p className="text-sm text-[#1C1C1C] font-medium">{story.author.name}</p>
                <p className="text-[10px] text-[#5A4F44]">Editor, the Class</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#5A4F44]">
              <Calendar size={12} className="text-[#C5A059]" />
              <span className="text-xs">{new Date(story.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5A4F44]">
              <Clock size={12} className="text-[#C5A059]" />
              <span className="text-xs">{story.readTime} min · {timeSincePublished(story.date)}</span>
            </div>
          </div>
        </motion.div>

        {/* Fake engagement counter */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-[#5A4F44]/70">
          <span>👁 1.847 letture</span>
          <span>·</span>
          <span>❤️ 312 salvataggi</span>
          <span>·</span>
          <span>💬 47 commenti</span>
        </div>

        {/* Social share pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/10 text-[#25D366] text-[11px] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors"
          >
            📱 WhatsApp
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1C]/5 text-[#1C1C1C] text-[11px] border border-[#1C1C1C]/10 hover:bg-[#1C1C1C]/10 transition-colors"
          >
            𝕏 X/Twitter
          </a>
          <button
            onClick={shareStory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(197,160,89,0.1)] text-[#C5A059] text-[11px] border border-[rgba(197,160,89,0.2)] hover:bg-[rgba(197,160,89,0.2)] transition-colors"
          >
            🔗 Copia link
          </button>
        </div>

        {/* Excerpt */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-lg text-[#5A4F44] font-light leading-relaxed mb-8 italic border-l-2 border-[#C5A059] pl-5">
          {story.excerpt}
        </motion.p>

        {/* Floating Table of Contents (desktop sidebar — shown only if headings found) */}
        {headings.length > 0 && (
          <div className="hidden lg:block float-right ml-8 mb-6 w-48 bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] rounded-xl p-4 sticky top-24 text-xs">
            <p className="text-[#C5A059] font-medium uppercase tracking-wider text-[10px] mb-3">Indice</p>
            <ul className="space-y-2">
              {headings.map((h, idx) => (
                <li key={idx}>
                  <span className="text-[#5A4F44] leading-snug line-clamp-2 cursor-pointer hover:text-[#C5A059] transition-colors">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <motion.div ref={contentRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <div key={i}>
                <p className={`text-[#5A4F44] font-light leading-[1.9] ${TEXT_SIZE_CLASSES[textSize]} ${i === 0 ? 'font-normal' : ''}`}>
                  {para}
                </p>
                {/* "Condividi la tua opinione" box after ~40% */}
                {i === midIndex && (
                  <div className="my-8 p-5 rounded-2xl bg-[#FAF6EE] border border-[rgba(197,160,89,0.2)] text-center">
                    <p className="font-[family-name:var(--font-family-display)] text-base text-[#1C1C1C] mb-1">
                      Cosa ne pensi di questo articolo?
                    </p>
                    <p className="text-xs text-[#5A4F44]/60 mb-4">Il tuo feedback ci aiuta a migliorare</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleOpinion('up')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-colors ${opinionVote === 'up' ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'}`}
                      >
                        👍 <span className="font-medium">{opinionCounts.up}</span>
                      </button>
                      <button
                        onClick={() => handleOpinion('down')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-colors ${opinionVote === 'down' ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#1C1C1C]'}`}
                      >
                        👎 <span className="font-medium">{opinionCounts.down}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA inline */}
        <div className="my-12 p-6 rounded-2xl bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-center">
          <p className="font-[family-name:var(--font-family-display)] text-lg text-[#1C1C1C] mb-2">
            Hai letto fin qui? Allora sai già cosa cerchi.
          </p>
          <p className="text-sm text-[#5A4F44] mb-4">Il concierge trasforma questa ispirazione in realtà.</p>
          <Link to="/concierge"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1C1C] text-white rounded-full font-[family-name:var(--font-family-mono)] text-[11px] tracking-widest uppercase hover:bg-[#C5A059] hover:text-[#1C1C1C] transition-colors">
            Parla con il concierge →
          </Link>
        </div>

        {/* Emoji reactions */}
        <div className="mb-10 p-5 rounded-2xl bg-white border border-[rgba(197,160,89,0.15)]">
          <p className="text-xs text-[#5A4F44] mb-4 text-center">Come ti ha fatto sentire questo articolo?</p>
          <div className="flex items-center justify-center gap-4">
            {REACTION_EMOJIS.map(({ key, emoji }) => (
              <button
                key={key}
                onClick={() => handleReaction(key)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                  votedReactions.has(key)
                    ? 'bg-[rgba(197,160,89,0.15)] scale-110'
                    : 'hover:bg-[rgba(197,160,89,0.06)]'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] text-[#5A4F44] font-medium">{reactions[key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[story.category, 'Luxury', 'The Class', 'Esclusivo'].map(tag => (
            <span key={tag} className="text-[9px] font-[family-name:var(--font-family-mono)] text-[#5A4F44] border border-[rgba(197,160,89,0.2)] rounded-full px-3 py-1 uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>

        {/* Share strip */}
        <div className="flex items-center justify-between py-5 border-y border-[rgba(197,160,89,0.15)] mb-12">
          <div className="flex items-center gap-3">
            <img src={story.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" loading="lazy" decoding="async" />
            <div>
              <p className="text-xs text-[#1C1C1C] font-medium">{story.author.name}</p>
              <p className="text-[10px] text-[#5A4F44]">{story.readTime} min · {story.category}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={shareStory}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[rgba(197,160,89,0.3)] text-[#5A4F44] text-xs hover:border-[#C5A059] hover:text-[#C5A059] transition-colors">
              <Share2 size={11} /> Condividi
            </button>
            <button onClick={toggleBookmark}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs transition-colors ${
                bookmarked ? 'border-[#C5A059] text-[#C5A059] bg-[rgba(197,160,89,0.06)]' : 'border-[rgba(197,160,89,0.3)] text-[#5A4F44] hover:border-[#C5A059]'
              }`}>
              {bookmarked ? <BookmarkCheck size={11} /> : <Bookmark size={11} />}
              {bookmarked ? 'Salvato' : 'Salva'}
            </button>
          </div>
        </div>

        {/* Related same category */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-6">
              Leggi anche — {story.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map(s => (
                <Link key={s.id} to="/stories/$slug" params={{ slug: s.slug }} className="group">
                  <div className="rounded-xl overflow-hidden border border-[rgba(197,160,89,0.12)] bg-white">
                    <img src={s.cover} alt={s.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" decoding="async" />
                    <div className="p-4">
                      <span className="text-[9px] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase tracking-widest">{s.category}</span>
                      <p className="text-sm font-medium text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors mt-1 line-clamp-2">{s.title}</p>
                      <p className="text-[10px] text-[#5A4F44] mt-1">{s.readTime} min</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Suggested from other categories */}
        {moreSuggested.length > 0 && (
          <div className="mb-12">
            <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-6">
              Potresti apprezzare
            </h2>
            <div className="space-y-4">
              {moreSuggested.map(s => (
                <Link key={s.id} to="/stories/$slug" params={{ slug: s.slug }}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-[rgba(197,160,89,0.12)] group hover:border-[rgba(197,160,89,0.3)] transition-colors">
                  <img src={s.cover} alt={s.title} className="w-20 h-16 object-cover rounded-lg shrink-0" loading="lazy" decoding="async" />
                  <div>
                    <span className="text-[9px] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase tracking-widest">{s.category}</span>
                    <p className="text-sm font-medium text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors mt-0.5 line-clamp-2">{s.title}</p>
                    <p className="text-[10px] text-[#5A4F44] mt-1">{s.readTime} min di lettura</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="rounded-2xl bg-[#1C1C1C] p-8 text-center mb-10">
          <p className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] uppercase tracking-widest mb-2">Magazine esclusivo</p>
          <h3 className="font-[family-name:var(--font-family-display)] text-2xl text-white mb-3">Non perderti nessuna storia</h3>
          <p className="text-white/60 text-sm mb-6">Una selezione curata ogni settimana. Solo i contenuti che meritano davvero.</p>
          <form onSubmit={e => { e.preventDefault(); toast.success('Iscrizione confermata ✦') }} className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email" required placeholder="la tua email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#C5A059]"
            />
            <button type="submit" className="px-5 py-3 rounded-full bg-[#C5A059] text-[#1C1C1C] text-sm font-[family-name:var(--font-family-mono)] tracking-wider whitespace-nowrap hover:opacity-90 transition">
              Iscriviti
            </button>
          </form>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-10 h-10 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-lg hover:opacity-90 transition z-40">
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  )
}
