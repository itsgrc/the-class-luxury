// src/pages/StoryDetailPage.tsx
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { stories } from '@/data/stories'

export function StoryDetailPage() {
  const { slug } = useParams({ from: '/stories/$slug' })
  const story = stories.find(s => s.slug === slug)

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

  const related = stories.filter(s => s.id !== story.id && s.category === story.category).slice(0, 2)

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-16 pb-20">
      <Helmet>
        <title>{story.title} — the Class Stories</title>
        <meta name="description" content={story.excerpt} />
        <meta property="og:image" content={story.cover} />
        <meta property="og:title" content={story.title} />
      </Helmet>

      {/* Hero */}
      <div className="relative h-[55vh] overflow-hidden">
        <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF9F2] via-[#1C1C1C]/20 to-[#1C1C1C]/50" />
        <Link to="/stories" className="absolute top-6 left-6 glass-dark flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs hover:bg-white/20 transition-colors">
          <ArrowLeft size={13} /> Stories
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="-mt-12 relative z-10 mb-10">
          <span className="text-[10px] bg-[#C5A059] text-white px-2.5 py-1 rounded-full uppercase tracking-widest">
            {story.category}
          </span>
          <h1 className="font-[family-name:var(--font-family-display)] text-3xl md:text-4xl font-medium text-[#1C1C1C] leading-tight mt-4 mb-4">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <img src={story.author.avatar} alt={story.author.name} className="w-8 h-8 rounded-full object-cover border border-[rgba(197,160,89,0.3)]" />
              <span className="text-sm text-[#5A4F44]">{story.author.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5A4F44]">
              <Calendar size={12} />
              <span className="text-xs">{new Date(story.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#5A4F44]">
              <Clock size={12} />
              <span className="text-xs">{story.readTime} min di lettura</span>
            </div>
          </div>
        </motion.div>

        {/* Excerpt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-[#5A4F44] font-light leading-relaxed mb-8 italic border-l-2 border-[#C5A059] pl-5"
        >
          {story.excerpt}
        </motion.p>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-5">
            {story.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-[#5A4F44] font-light leading-[1.9] text-[15px]">
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[rgba(197,160,89,0.2)]">
            <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-6">
              Leggi anche
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {related.map(s => (
                <Link key={s.id} to="/stories/$slug" params={{ slug: s.slug }} className="group">
                  <div className="rounded-xl overflow-hidden border border-[rgba(197,160,89,0.12)] bg-white">
                    <img src={s.cover} alt={s.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-4">
                      <p className="text-sm font-medium text-[#1C1C1C] group-hover:text-[#C5A059] transition-colors line-clamp-2">{s.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
