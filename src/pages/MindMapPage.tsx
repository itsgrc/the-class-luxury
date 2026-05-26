import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Map, Download, Search, Undo2, Redo2, Moon, Sun, Save } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { listings } from '@/data/listings'
import type { Category } from '@/data/listings'
import { cn } from '@/lib/utils'

interface Node {
  id: string
  label: string
  emoji: string
  x: number
  y: number
  color: string
  isCategory: boolean
  categoryId?: Category
}

const PRESET_COLORS = [
  { label: 'Gold', value: '#C5A059' },
  { label: 'Dark', value: '#1C1C1C' },
  { label: 'Ivory', value: '#F5EFE0' },
  { label: 'Taupe', value: '#5A4F44' },
]

const INITIAL_NODES: Node[] = [
  { id: 'yacht', label: 'Yacht', emoji: '⛵', x: 0, y: -180, color: '#1a6b8a', isCategory: true, categoryId: 'yacht' },
  { id: 'jet', label: 'Jet', emoji: '✈️', x: 171, y: -56, color: '#6b4a1a', isCategory: true, categoryId: 'jet' },
  { id: 'villa', label: 'Villa', emoji: '🏛️', x: 106, y: 146, color: '#4a6b1a', isCategory: true, categoryId: 'villa' },
  { id: 'esperienza', label: 'Esperienza', emoji: '✨', x: -106, y: 146, color: '#6b1a6b', isCategory: true, categoryId: 'esperienza' },
  { id: 'auto', label: 'Auto', emoji: '🚗', x: -171, y: -56, color: '#8a2a1a', isCategory: true, categoryId: 'auto' },
  { id: 'factotum', label: 'Factotum', emoji: '🎩', x: 0, y: 80, color: '#C5A059', isCategory: false },
]

type PositionMap = Record<string, { x: number; y: number }>

function getSuggestions(categoryId: Category) {
  return listings.filter(l => l.category === categoryId).slice(0, 2)
}

export function MindMapPage() {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES)
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [positions, setPositions] = useState<PositionMap>({})
  const [posHistory, setPosHistory] = useState<PositionMap[]>([{}])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()

  const centerX = 400
  const centerY = 320

  const getNodePos = useCallback(
    (node: Node) => ({
      x: centerX + (positions[node.id]?.x ?? node.x),
      y: centerY + (positions[node.id]?.y ?? node.y),
    }),
    [positions],
  )

  const pushHistory = (newPos: PositionMap) => {
    const trimmed = posHistory.slice(0, historyIndex + 1)
    setPosHistory([...trimmed, newPos])
    setHistoryIndex(trimmed.length)
    setPositions(newPos)
  }

  const undo = () => {
    if (historyIndex <= 0) return
    const prev = posHistory[historyIndex - 1]
    setHistoryIndex(i => i - 1)
    setPositions(prev)
    toast.info('Undo')
  }

  const redo = () => {
    if (historyIndex >= posHistory.length - 1) return
    const next = posHistory[historyIndex + 1]
    setHistoryIndex(i => i + 1)
    setPositions(next)
    toast.info('Redo')
  }

  const handleExportPNG = async () => {
    try {
      // Try html2canvas if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h2c = (window as any).html2canvas
      if (h2c && svgRef.current) {
        const canvas = await h2c(svgRef.current.parentElement)
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = 'mappa-viaggio.png'
        a.click()
      } else {
        // Fallback: SVG serialise to blob
        if (!svgRef.current) return
        const serializer = new XMLSerializer()
        const src = serializer.serializeToString(svgRef.current)
        const blob = new Blob([src], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'mappa-viaggio.svg'
        a.click()
        URL.revokeObjectURL(url)
      }
      toast.success('Mappa esportata')
    } catch {
      window.print()
    }
  }

  const handleSaveItinerary = () => {
    const nodeLabels = nodes.map(n => n.label).join(', ')
    const suggestion = `Itinerario con: ${nodeLabels}`
    localStorage.setItem('theclass_itinerary_suggestion', suggestion)
    toast.success('Salvato come itinerario', { description: 'Apertura pagina itinerari...' })
    navigate({ to: '/itinerari' })
  }

  const handleColorChange = (color: string) => {
    if (!selectedNodeId) return
    setNodes(prev =>
      prev.map(n => (n.id === selectedNodeId ? { ...n, color } : n)),
    )
  }

  const handleRequestItinerary = () => {
    const active = nodes.find(n => n.id === activeNode)
    const message = active
      ? `Vorrei un itinerario completo con ${active.label} di lusso — yacht, jet, villa e un'esperienza gastronomica esclusiva.`
      : 'Vorrei un itinerario di lusso completo: yacht nel Mediterraneo, jet privato, villa esclusiva ed esperienze premium.'
    window.dispatchEvent(new CustomEvent('theclass:concierge:open', { detail: { message } }))
  }

  const matchesSearch = (node: Node) =>
    searchQuery.trim() === '' ||
    node.label.toLowerCase().includes(searchQuery.toLowerCase())

  const totalConnections = nodes.length // each node connects to center

  const bg = darkMode ? '#0D0B08' : '#FDF9F2'
  const textColor = darkMode ? '#C5A059' : '#1C1C1C'
  const borderColor = darkMode ? 'rgba(197,160,89,0.15)' : 'rgba(197,160,89,0.25)'
  const tooltipBg = darkMode ? '#1C1C1C' : '#FFFFFF'
  const tooltipText = darkMode ? 'white' : '#1C1C1C'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <title>Mappa del Mio Viaggio — the Class</title>
      <meta
        name="description"
        content="Visualizza il tuo viaggio luxury su una mappa interattiva. Connetti yacht, jet, ville ed esperienze in un unico percorso esclusivo."
      />

      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-wrap gap-3"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-3">
          <Map size={20} className="text-[#C5A059]" />
          <h1
            className="font-[family-name:var(--font-family-display)] text-xl font-medium tracking-tight"
            style={{ color: textColor }}
          >
            Mappa del Mio Viaggio
          </h1>
          {/* Node/connection counter */}
          <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059] opacity-70 hidden sm:block">
            {nodes.length} nodi | {totalConnections} connessioni
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C5A059] opacity-60" />
            <input
              type="text"
              placeholder="Cerca nodo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs rounded-full bg-transparent border focus:outline-none"
              style={{
                borderColor,
                color: textColor,
              }}
            />
          </div>

          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-full disabled:opacity-30 transition-opacity"
            style={{ border: `1px solid ${borderColor}` }}
            title="Undo"
          >
            <Undo2 size={14} className="text-[#C5A059]" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= posHistory.length - 1}
            className="p-1.5 rounded-full disabled:opacity-30 transition-opacity"
            style={{ border: `1px solid ${borderColor}` }}
            title="Redo"
          >
            <Redo2 size={14} className="text-[#C5A059]" />
          </button>

          {/* Export PNG */}
          <button
            onClick={handleExportPNG}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Esporta PNG"
          >
            <Download size={14} className="text-[#C5A059]" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={14} className="text-[#C5A059]" /> : <Moon size={14} className="text-[#C5A059]" />}
          </button>

          {/* Save itinerary */}
          <button
            onClick={handleSaveItinerary}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
            style={{ background: 'rgba(197,160,89,0.15)', color: '#C5A059', border: `1px solid ${borderColor}` }}
          >
            <Save size={12} />
            <span className="hidden sm:block">Salva come itinerario</span>
          </button>

          <button
            onClick={handleRequestItinerary}
            className="flex items-center gap-2 bg-[#C5A059] text-white text-sm px-4 py-2 rounded-full hover:bg-[#b8924a] transition-colors"
          >
            Richiedi itinerario
          </button>
        </div>
      </div>

      {/* Color picker for selected node */}
      {selectedNodeId && (
        <div
          className="flex items-center gap-3 px-4 py-2 text-xs"
          style={{ borderBottom: `1px solid ${borderColor}`, color: textColor }}
        >
          <span className="opacity-60">Colore nodo:</span>
          {PRESET_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              title={c.label}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c.value,
                borderColor:
                  nodes.find(n => n.id === selectedNodeId)?.color === c.value
                    ? '#fff'
                    : 'transparent',
              }}
            />
          ))}
          <button
            onClick={() => setSelectedNodeId(null)}
            className="ml-auto opacity-50 hover:opacity-100"
            style={{ color: textColor }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" viewBox="0 0 800 640" preserveAspectRatio="xMidYMid meet">
          {/* Connection lines */}
          {nodes.map(node => {
            const pos = getNodePos(node)
            const isMatch = matchesSearch(node)
            return (
              <line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={pos.x}
                y2={pos.y}
                stroke={isMatch && searchQuery ? '#C5A059' : 'rgba(197,160,89,0.35)'}
                strokeWidth={isMatch && searchQuery ? '2' : '1.5'}
                strokeDasharray="6 4"
              />
            )
          })}

          {/* Central node */}
          <g>
            <circle cx={centerX} cy={centerY} r={52} fill="#1C1C1C" stroke="#C5A059" strokeWidth="1.5" />
            <text
              x={centerX}
              y={centerY - 6}
              textAnchor="middle"
              fill="#C5A059"
              fontSize="10"
              fontFamily="var(--font-family-mono)"
              letterSpacing="0.1em"
            >
              IL MIO
            </text>
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              fill="#C5A059"
              fontSize="10"
              fontFamily="var(--font-family-mono)"
              letterSpacing="0.1em"
            >
              VIAGGIO
            </text>
            <text x={centerX} y={centerY + 26} textAnchor="middle" fill="rgba(197,160,89,0.5)" fontSize="16">
              ✦
            </text>
          </g>

          {/* Nodes */}
          {nodes.map(node => {
            const pos = getNodePos(node)
            const isActive = activeNode === node.id
            const isSelected = selectedNodeId === node.id
            const isMatch = matchesSearch(node)
            const highlight = searchQuery && isMatch
            return (
              <motion.g
                key={node.id}
                drag
                dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
                onDragEnd={(_, info) => {
                  const newPos: PositionMap = {
                    ...positions,
                    [node.id]: {
                      x: (positions[node.id]?.x ?? node.x) + info.offset.x,
                      y: (positions[node.id]?.y ?? node.y) + info.offset.y,
                    },
                  }
                  pushHistory(newPos)
                }}
                initial={{ x: pos.x - centerX, y: pos.y - centerY }}
                style={{ x: pos.x - centerX + centerX, y: pos.y - centerY + centerY }}
                animate={false as unknown as undefined}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveNode(isActive ? null : node.id)
                  setSelectedNodeId(node.id)
                }}
                className="cursor-pointer"
                opacity={searchQuery && !isMatch ? 0.25 : 1}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={40}
                  fill={isActive ? node.color : '#1C1C1C'}
                  stroke={highlight ? '#fff' : isSelected ? '#fff' : node.color}
                  strokeWidth={highlight || isSelected ? '3' : '1.5'}
                />
                <text x={0} y={-4} textAnchor="middle" fill="white" fontSize="18">
                  {node.emoji}
                </text>
                <text
                  x={0}
                  y={13}
                  textAnchor="middle"
                  fill={isActive ? '#fff' : node.color}
                  fontSize="9"
                  fontFamily="var(--font-family-mono)"
                  letterSpacing="0.08em"
                >
                  {node.label.toUpperCase()}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* Tooltip for active node */}
        {activeNode &&
          (() => {
            const node = nodes.find(n => n.id === activeNode)
            if (!node) return null
            const suggestions = node.isCategory && node.categoryId ? getSuggestions(node.categoryId) : []
            const pos = getNodePos(node)
            const isRight = pos.x > centerX
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-10 w-64 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                style={{
                  background: tooltipBg,
                  border: '1px solid rgba(197,160,89,0.3)',
                  left: isRight ? `${(pos.x / 800) * 100 + 2}%` : 'auto',
                  right: !isRight ? `${((800 - pos.x) / 800) * 100 + 2}%` : 'auto',
                  top: `${(pos.y / 640) * 100 - 5}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                <p className="text-[10px] tracking-[0.18em] text-[#C5A059] font-[family-name:var(--font-family-mono)] uppercase mb-2">
                  {node.emoji} {node.label}
                </p>
                {suggestions.length > 0 && (
                  <div className="space-y-3 mb-3">
                    {suggestions.map(s => (
                      <div key={s.id} className="border border-[rgba(197,160,89,0.15)] rounded-xl p-3">
                        <p className="text-xs font-medium line-clamp-1" style={{ color: tooltipText }}>
                          {s.title}
                        </p>
                        <p className="text-[#5A4F44] text-[10px] mt-0.5">{s.location}</p>
                        <p className="text-[#C5A059] text-[10px] font-[family-name:var(--font-family-mono)] mt-1">
                          € {s.price.toLocaleString('it-IT')} / {s.priceUnit}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setActiveNode(null)}
                  className="w-full text-[10px] text-[#5A4F44] hover:text-[#C5A059] transition-colors text-center"
                >
                  Chiudi
                </button>
              </motion.div>
            )
          })()}

        {/* Mini-map */}
        <div
          className="absolute bottom-14 right-4 w-28 h-20 rounded-xl overflow-hidden opacity-60 hover:opacity-100 transition-opacity"
          style={{ background: darkMode ? '#1C1C1C' : '#F5EFE0', border: '1px solid rgba(197,160,89,0.3)' }}
          title="Mini-map"
        >
          <svg viewBox="0 0 800 640" className="w-full h-full">
            <circle cx={400} cy={320} r={20} fill="#C5A059" opacity={0.8} />
            {nodes.map(node => {
              const pos = getNodePos(node)
              return (
                <circle
                  key={`mini-${node.id}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill={node.color}
                  opacity={0.7}
                />
              )
            })}
          </svg>
          <span className="absolute bottom-1 left-1 text-[8px] text-[#C5A059] font-[family-name:var(--font-family-mono)]">
            mini-map
          </span>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[10px] text-[rgba(197,160,89,0.4)] font-light tracking-wide whitespace-nowrap">
            Clicca un nodo per vedere i suggerimenti · Trascina per riorganizzare · Seleziona per cambiare colore
          </p>
        </div>
      </div>
    </div>
  )
}
