// src/pages/ChiSiamoPage.tsx
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Users, Globe, Award } from 'lucide-react'

const TEAM = [
  { name: 'Alessandro Moretti', role: 'CEO & Founder', avatar: 'https://i.pravatar.cc/150?img=11', bio: '20 anni nel lusso. Ex Goldman Sachs, appassionato di vela e aviazione.' },
  { name: 'Giulia Ferrara', role: 'Head of Concierge', avatar: 'https://i.pravatar.cc/150?img=5', bio: 'Ex Four Seasons Dubai. Parla 5 lingue, conosce ogni maitre d\'hôtel di Montecarlo.' },
  { name: 'Lorenzo Bianchi', role: 'CTO', avatar: 'https://i.pravatar.cc/150?img=15', bio: 'Ingegnere del software con 10 anni in Silicon Valley. Ora costruisce il futuro del luxury tech.' },
  { name: 'Camille Dupont', role: 'Partnerships Director', avatar: 'https://i.pravatar.cc/150?img=45', bio: 'Rete esclusiva di 300+ armatori, operatori jet e proprietari di ville in 40 paesi.' },
]

const VALUES = [
  { icon: Shield, title: 'Fiducia', desc: 'Ogni partner è verificato direttamente dal nostro team. Nessuna lista aggregata.' },
  { icon: Users, title: 'Discrezione', desc: 'NDA standard, server europei, zero dati condivisi con terze parti.' },
  { icon: Globe, title: 'Presenza', desc: 'Uffici a Milano, Monaco, Dubai e Singapore. Reperibili ovunque tu sia.' },
  { icon: Award, title: 'Eccellenza', desc: 'Solo il top 3% degli asset richiesti entra nel nostro portfolio.' },
]

export function ChiSiamoPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F2] pt-24 pb-20">
      <Helmet>
        <title>Chi Siamo — the Class</title>
        <meta name="description" content="the Class: la piattaforma luxury italiana per yacht, jet privati, auto e esperienze esclusive. Scopri il team e i valori." />
      </Helmet>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#C5A059] uppercase tracking-[0.3em] mb-4"
        >
          Chi siamo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-[family-name:var(--font-family-display)] text-5xl md:text-6xl font-medium text-[#1C1C1C] leading-tight mb-6"
        >
          Il lusso come dovrebbe essere.<br />
          <span className="gold-gradient-text">Sempre.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-[#5A4F44] font-light leading-relaxed max-w-2xl mx-auto"
        >
          Nati a Milano nel 2019, the Class è la risposta italiana alla frammentazione del mercato luxury.
          Una piattaforma costruita da appassionati per chi non accetta compromessi: yacht, jet, auto d'epoca
          e esperienze irripetibili in un unico ecosistema curato.
        </motion.p>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-[rgba(197,160,89,0.15)] p-7 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-[rgba(197,160,89,0.1)] flex items-center justify-center mx-auto mb-4">
                <Icon size={20} className="text-[#C5A059]" />
              </div>
              <h3 className="font-[family-name:var(--font-family-display)] text-base font-medium text-[#1C1C1C] mb-2">{title}</h3>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-[#1C1C1C] py-16 mb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: '500+', label: 'Asset verificati' },
              { n: '40', label: 'Paesi coperti' },
              { n: '2.400+', label: 'Clienti soddisfatti' },
              { n: '< 2h', label: 'Tempo risposta medio' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p className="font-[family-name:var(--font-family-mono)] text-3xl text-[#C5A059] mb-1">{n}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-[family-name:var(--font-family-display)] text-3xl font-medium text-[#1C1C1C] text-center mb-12">Il Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-[rgba(197,160,89,0.3)]" loading="lazy" decoding="async" />
              <h3 className="font-medium text-[#1C1C1C] text-sm mb-0.5">{p.name}</h3>
              <p className="text-[11px] text-[#C5A059] mb-2">{p.role}</p>
              <p className="text-xs text-[#5A4F44] font-light leading-relaxed">{p.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
