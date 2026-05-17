import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { listings } from '@/data/listings'
import type { Category } from '@/data/listings'

interface Node {
  id: Category
  label: string
  emoji: string
  x: number
  y: number
  color: string
}

const NODES: Node[] = [
  { id: 'yacht', label: 'Yacht', emoji: '⛵', x: 0, y: -180, color: '#1a6b8a' },
  { id: 'jet', label: 'Jet', emoji: '✈️', x: 171, y: -56, color: '#6b4a1a' },
  { id: 'villa', label: 'Villa', emoji: '🏛️', x: 106, y: 146, color: '#4a6b1a' },
  { id: 'esperienza', label: 'Esperienza', emoji: '✨', x: -106, y: 146, color: '#6b1a6b' },
  { id: 'auto', label: 'Auto', emoji: '🚗', x: -171, y: -56, color: '#8a2a1a' },
]

function getSuggestions(category: Category) {
  return listings.filter(l => l.category === category).slice(0, 2)
}

export function MindMapPage() {
  const [activeNode, setActiveNode] = useState<Category | null>(null)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  const centerX = 400
  const centerY = 320

  const getNodePos = (node: Node) => ({
    x: centerX + (positions[node.id]?.x ?? node.x),
    y: centerY + (positions[node.id]?.y ?? node.y),
  })

  const handleRequestItinerary = () => {
    const activeLabel = activeNode ? NODES.find(n => n.id === activeNode)?.label ?? '' : ''
    const message = activeLabel
      ? `Vorrei un itinerario completo con ${activeLabel} di lusso — yacht, jet, villa e un'esperienza gastronomica esclusiva.`
      : 'Vorrei un itinerario di lusso completo: yacht nel Mediterraneo, jet privato, villa esclusiva ed esperienze premium.'
    window.dispatchEvent(new CustomEvent('theclass:concierge:open', { detail: { message } }))
  }

  return (
    <div className="min-h-screen bg-[#0D0B08] [data-theme='dark']:bg-[#0A0A0A] flex flex-col">
      <title>Mappa del Mio Viaggio — the Class</title>
      <meta name="description" content="Visualizza il tuo viaggio luxury su una mappa interattiva. Connetti yacht, jet, ville ed esperienze in un unico percorso esclusivo." />
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(197,160,89,0.15)]">
        <div className="flex items-center gap-3">
          <Map size={20} className="text-[#C5A059]" />
          <h1 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-white tracking-tight">
            Mappa del Mio Viaggio
          </h1>
        </div>
        <button
          onClick={handleRequestItinerary}
          className="flex items-center gap-2 bg-[#C5A059] text-white text-sm px-5 py-2.5 rounded-full hover:bg-[#b8924a] transition-colors"
        >
          Richiedi questo itinerario
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 640"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines */}
          {NODES.map(node => {
            const pos = getNodePos(node)
            return (
              <line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke="rgba(197,160,89,0.35)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            )
          })}

          {/* Central node */}
          <g>
            <circle cx={centerX} cy={centerY} r={52} fill="#1C1C1C" stroke="#C5A059" strokeWidth="1.5" />
            <text x={centerX} y={centerY - 6} textAnchor="middle" fill="#C5A059" fontSize="10" fontFamily="var(--font-family-mono)" letterSpacing="0.1em">IL MIO</text>
            <text x={centerX} y={centerY + 10} textAnchor="middle" fill="#C5A059" fontSize="10" fontFamily="var(--font-family-mono)" letterSpacing="0.1em">VIAGGIO</text>
            <text x={centerX} y={centerY + 26} textAnchor="middle" fill="rgba(197,160,89,0.5)" fontSize="16">✦</text>
          </g>

          {/* Category nodes */}
          {NODES.map(node => {
            const pos = getNodePos(node)
            const isActive = activeNode === node.id
            return (
              <motion.g
                key={node.id}
                drag
                dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                onDragEnd={(_, info) => {
                  setPositions(prev => ({
                    ...prev,
                    [node.id]: {
                      x: (prev[node.id]?.x ?? node.x) + info.offset.x,
                      y: (prev[node.id]?.y ?? node.y) + info.offset.y,
                    },
                  }))
                }}
                initial={{ x: pos.x - centerX, y: pos.y - centerY }}
                style={{ x: pos.x - centerX + centerX, y: pos.y - centerY + centerY }}
                animate={false as unknown as undefined}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveNode(isActive ? null : node.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={0}
                  cy={0}
                  r={40}
                  fill={isActive ? '#C5A059' : '#1C1C1C'}
                  stroke={isActive ? '#f0c878' : '#C5A059'}
                  strokeWidth="1.5"
                />
                <text x={0} y={-4} textAnchor="middle" fill="white" fontSize="18">{node.emoji}</text>
                <text x={0} y={13} textAnchor="middle" fill={isActive ? '#1C1C1C' : '#C5A059'} fontSize="9" fontFamily="var(--font-family-mono)" letterSpacing="0.08em">
                  {node.label.toUpperCase()}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* Tooltip for active node */}
        {activeNode && (() => {
          const node = NODES.find(n => n.id === activeNode)!
          const suggestions = getSuggestions(activeNode)
          const pos = getNodePos(node)
          const isRight = pos.x > centerX
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute z-10 w-64 bg-[#1C1C1C] border border-[rgba(197,160,89,0.3)] rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{
                left: isRight ? `${(pos.x / 800) * 100 + 2}%` : 'auto',
                right: !isRight ? `${((800 - pos.x) / 800) * 100 + 2}%` : 'auto',
                top: `${(pos.y / 640) * 100 - 5}%`,
                transform: 'translateY(-50%)',
              }}
            >
              <p className="text-[10px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">
                {node.emoji} {node.label}
              </p>
              <div className="space-y-3">
                {suggestions.map(s => (
                  <div key={s.id} className="border border-[rgba(197,160,89,0.15)] rounded-xl p-3">
                    <p className="text-white text-xs font-medium line-clamp-1">{s.title}</p>
                    <p className="text-[#5A4F44] text-[10px] mt-0.5">{s.location}</p>
                    <p className="text-[#C5A059] text-[10px] font-[family-name:var(--font-family-mono)] mt-1">
                      € {s.price.toLocaleString('it-IT')} / {s.priceUnit}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveNode(null)}
                className="mt-3 w-full text-[10px] text-[#5A4F44] hover:text-white transition-colors text-center"
              >
                Chiudi
              </button>
            </motion.div>
          )
        })()}

        {/* Instructions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[10px] text-[rgba(197,160,89,0.4)] font-light tracking-wide">
            Clicca un nodo per vedere i suggerimenti · Trascina per riorganizzare
          </p>
        </div>
      </div>
    </div>
  )
}
