// src/pages/StoriesPage.tsx
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from '@tanstack/react-router'
import { Clock, ArrowRight } from 'lucide-react'
import { stories } from '@/data/stories'

export function StoriesPage() {
  const [featured, ...rest] = stories

  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Stories — the Class</title>
        <meta name="description" content="Reportage, itinerari e ispirazioni dal mondo del lusso. Storie di yacht, jet e esperienze irripetibili." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-3">Magazine</p>
          <h1 className="font-[family-name:var(--font-family-display)] text-4xl font-medium text-[#1C1C1C]">
            Stories
          </h1>
        </motion.div>

        {/* Featured */}
        <Link to="/stories/$slug" params={{ slug: featured.slug }} className="block mb-10 group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[55vh] rounded-2xl overflow-hidden card-shine"
          >
            <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
                <img src={featured.author.avatar} alt={featured.author.name} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-white/60 text-xs">{featured.author.name}</span>
                <span className="text-white/30">·</span>
                <Clock size={11} className="text-white/40" />
                <span className="text-white/40 text-xs">{featured.readTime} min</span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((story, i) => (
            <Link key={story.id} to="/stories/$slug" params={{ slug: story.slug }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl border border-[rgba(197,160,89,0.12)] overflow-hidden card-shine"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={story.cover} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 text-[10px] bg-[#C5A059] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {story.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] leading-snug mb-2 group-hover:text-[#C5A059] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#5A4F44] font-light leading-relaxed mb-4 line-clamp-2">{story.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={story.author.avatar} alt={story.author.name} className="w-5 h-5 rounded-full object-cover" />
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
          ))}
        </div>
      </div>
    </div>
  )
}
