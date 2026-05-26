import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Download, Search, Undo2, Redo2, Moon, Sun, Save, Layout, FileInput, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
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
  connectionLabel?: string
}

const PRESET_COLORS = [
  { label: 'Gold', value: '#C5A059' },
  { label: 'Dark', value: '#1C1C1C' },
  { label: 'Ivory', value: '#F5EFE0' },
  { label: 'Taupe', value: '#5A4F44' },
]

const NODE_EMOJIS = ['✈️', '🛥️', '🏖️', '🏔️', '🌴', '🎯', '💎', '🍾']

// ── NEW 1. Node templates ──
const NODE_TEMPLATES: Record<string, { name: string; nodes: Omit<Node, 'id'>[] }> = {
  romantic: {
    name: 'Viaggio Romantico',
    nodes: [
      { label: 'Champagne', emoji: '🍾', x: 0, y: -160, color: '#C5A059', isCategory: false },
      { label: 'Suite VIP', emoji: '💎', x: 152, y: -49, color: '#8b5cf6', isCategory: false },
      { label: 'Yacht', emoji: '🛥️', x: 94, y: 128, color: '#1a6b8a', isCategory: true, categoryId: 'yacht' },
      { label: 'Tramonto', emoji: '🌴', x: -94, y: 128, color: '#f59e0b', isCategory: false },
      { label: 'Cena Privata', emoji: '🎯', x: -152, y: -49, color: '#10b981', isCategory: false },
      { label: 'Benessere', emoji: '🏖️', x: 0, y: 80, color: '#ef4444', isCategory: false },
    ],
  },
  business: {
    name: 'Business Trip',
    nodes: [
      { label: 'Jet Privato', emoji: '✈️', x: 0, y: -160, color: '#6b4a1a', isCategory: true, categoryId: 'jet' },
      { label: 'Hotel 5*', emoji: '💎', x: 152, y: -49, color: '#C5A059', isCategory: false },
      { label: 'Meeting', emoji: '🎯', x: 94, y: 128, color: '#1C1C1C', isCategory: false },
      { label: 'Transfer', emoji: '🏔️', x: -94, y: 128, color: '#5A4F44', isCategory: true, categoryId: 'auto' },
      { label: 'Concierge', emoji: '🍾', x: -152, y: -49, color: '#8b5cf6', isCategory: false },
    ],
  },
  family: {
    name: 'Family Vacation',
    nodes: [
      { label: 'Yacht', emoji: '🛥️', x: 0, y: -160, color: '#1a6b8a', isCategory: true, categoryId: 'yacht' },
      { label: 'Villa', emoji: '🏖️', x: 152, y: -49, color: '#4a6b1a', isCategory: true, categoryId: 'villa' },
      { label: 'Spiaggia', emoji: '🌴', x: 94, y: 128, color: '#f59e0b', isCategory: false },
      { label: 'Avventura', emoji: '🏔️', x: -94, y: 128, color: '#8b5cf6', isCategory: false },
      { label: 'Gastronomia', emoji: '🍾', x: -152, y: -49, color: '#C5A059', isCategory: false },
      { label: 'Relax', emoji: '💎', x: 0, y: 80, color: '#10b981', isCategory: false },
      { label: 'Cultura', emoji: '🎯', x: 80, y: -100, color: '#ef4444', isCategory: false },
    ],
  },
  wellness: {
    name: 'Wellness Retreat',
    nodes: [
      { label: 'Spa', emoji: '🌴', x: 0, y: -160, color: '#10b981', isCategory: false },
      { label: 'Yoga', emoji: '🏖️', x: 152, y: -49, color: '#8b5cf6', isCategory: false },
      { label: 'Meditazione', emoji: '🎯', x: 94, y: 128, color: '#C5A059', isCategory: false },
      { label: 'Nutrizione', emoji: '🍾', x: -94, y: 128, color: '#f59e0b', isCategory: false },
      { label: 'Natura', emoji: '🏔️', x: -152, y: -49, color: '#4a6b1a', isCategory: false },
    ],
  },
}

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

// ── Serialize/deserialize map for URL sharing ──
function serializeMap(nodes: Node[], positions: PositionMap): string {
  try {
    return btoa(JSON.stringify({ nodes, positions }))
  } catch {
    return ''
  }
}

function deserializeMap(encoded: string): { nodes: Node[]; positions: PositionMap } | null {
  try {
    const parsed = JSON.parse(atob(encoded))
    if (parsed.nodes && parsed.positions) return parsed as { nodes: Node[]; positions: PositionMap }
    return null
  } catch {
    return null
  }
}

export function MindMapPage() {
  const [nodes, setNodes] = useState<Node[]>(() => {
    // NEW 10. Restore from URL on mount
    const params = new URLSearchParams(window.location.search)
    const mapParam = params.get('map')
    if (mapParam) {
      const restored = deserializeMap(mapParam)
      if (restored) return restored.nodes
    }
    return INITIAL_NODES
  })
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [positions, setPositions] = useState<PositionMap>(() => {
    const params = new URLSearchParams(window.location.search)
    const mapParam = params.get('map')
    if (mapParam) {
      const restored = deserializeMap(mapParam)
      if (restored) return restored.positions
    }
    return {}
  })
  const [posHistory, setPosHistory] = useState<PositionMap[]>([{}])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()

  // NEW 2. Inline label editing
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  // NEW 3. Connection label editing
  const [editingConnLabel, setEditingConnLabel] = useState<string | null>(null)
  const [connLabelText, setConnLabelText] = useState('')

  // NEW 4. Zoom
  const [scale, setScale] = useState(1.0)

  // NEW 5. Import from text modal
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  // NEW 1. Template modal
  const [showTemplates, setShowTemplates] = useState(false)

  // NEW 7. Scale nodes by importance
  const [scaleByImportance, setScaleByImportance] = useState(false)

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

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prev = posHistory[historyIndex - 1]
    setHistoryIndex(i => i - 1)
    setPositions(prev)
    toast.info('Undo')
  }, [historyIndex, posHistory])

  const redo = useCallback(() => {
    if (historyIndex >= posHistory.length - 1) return
    const next = posHistory[historyIndex + 1]
    setHistoryIndex(i => i + 1)
    setPositions(next)
    toast.info('Redo')
  }, [historyIndex, posHistory])

  // NEW 8. Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
      if (e.key === 'Delete' && selectedNodeId) {
        setNodes(prev => prev.filter(n => n.id !== selectedNodeId))
        setSelectedNodeId(null)
        toast.info('Nodo eliminato')
      }
      if (e.key === 'Escape') {
        setSelectedNodeId(null)
        setActiveNode(null)
        setEditingNodeId(null)
        setEditingConnLabel(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedNodeId])

  const handleExportPNG = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h2c = (window as any).html2canvas
      if (h2c && svgRef.current) {
        const canvas = await h2c(svgRef.current.parentElement)
        const a = document.createElement('a')
        a.href = canvas.toDataURL('image/png')
        a.download = 'mappa-viaggio.png'
        a.click()
      } else {
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

  // NEW 1. Apply template
  const applyTemplate = (key: string) => {
    const tpl = NODE_TEMPLATES[key]
    if (!tpl) return
    setNodes(tpl.nodes.map((n, i) => ({ ...n, id: `tpl-${i}-${Date.now()}` })))
    setPositions({})
    setPosHistory([{}])
    setHistoryIndex(0)
    setShowTemplates(false)
    toast.success(`Template "${tpl.name}" applicato`)
  }

  // NEW 2. Save inline label edit
  const saveLabel = () => {
    if (!editingNodeId) return
    setNodes(prev => prev.map(n => n.id === editingNodeId ? { ...n, label: editingLabel } : n))
    setEditingNodeId(null)
  }

  // NEW 3. Save connection label
  const saveConnLabel = () => {
    if (!editingConnLabel) return
    setNodes(prev => prev.map(n => n.id === editingConnLabel ? { ...n, connectionLabel: connLabelText } : n))
    setEditingConnLabel(null)
    setConnLabelText('')
  }

  // NEW 6. Auto-layout
  const autoLayout = () => {
    const total = nodes.length
    const r = 200
    const cx = 0
    const cy = 0
    const newPos: PositionMap = {}
    nodes.forEach((node, i) => {
      const angle = (i / total) * 2 * Math.PI
      newPos[node.id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      }
    })
    pushHistory(newPos)
    toast.success('Auto-layout applicato')
  }

  // NEW 5. Import from text
  const handleImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) { toast.error('Inserisci almeno un nodo per riga'); return }
    const total = lines.length
    const r = 180
    const imported: Node[] = lines.map((label, i) => {
      const angle = (i / total) * 2 * Math.PI
      return {
        id: `imp-${i}-${Date.now()}`,
        label,
        emoji: '✦',
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        color: '#C5A059',
        isCategory: false,
      }
    })
    setNodes(imported)
    setPositions({})
    setShowImport(false)
    setImportText('')
    toast.success(`${imported.length} nodi importati`)
  }

  // NEW 10. Share map URL
  const handleShareMap = () => {
    const encoded = serializeMap(nodes, positions)
    const url = `${window.location.origin}${window.location.pathname}?map=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('URL mappa copiato in clipboard')
    }).catch(() => {
      toast.error('Impossibile copiare negli appunti')
    })
  }

  // NEW 7. Node radius by degree (connections = 1 per node since all connect to center)
  const getNodeRadius = (node: Node) => {
    if (!scaleByImportance) return 40
    const connections = nodes.filter(n => n.id !== node.id).length
    return Math.min(55, 30 + connections * 1.5)
  }

  // NEW 9. Assign emoji to selected node
  const assignEmoji = (emoji: string) => {
    if (!selectedNodeId) return
    setNodes(prev => prev.map(n =>
      n.id === selectedNodeId
        ? { ...n, label: emoji + ' ' + n.label.replace(/^[\p{Emoji}\s]+/u, '') }
        : n
    ))
  }

  const totalConnections = nodes.length

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
              style={{ borderColor, color: textColor }}
            />
          </div>

          {/* NEW 1. Template button */}
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}`, color: '#C5A059' }}
            title="Template"
          >
            <Layout size={12} /> Template
          </button>

          {/* NEW 5. Import from text */}
          <button
            onClick={() => setShowImport(true)}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Importa da testo"
          >
            <FileInput size={14} className="text-[#C5A059]" />
          </button>

          {/* NEW 6. Auto-layout */}
          <button
            onClick={autoLayout}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Auto-layout radiale"
          >
            <Maximize2 size={14} className="text-[#C5A059]" />
          </button>

          {/* NEW 4. Zoom controls */}
          <button
            onClick={() => setScale(s => Math.min(2.0, +(s + 0.1).toFixed(1)))}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Zoom in"
          >
            <ZoomIn size={14} className="text-[#C5A059]" />
          </button>
          <span className="text-[10px] font-[family-name:var(--font-family-mono)] text-[#C5A059]">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(1)))}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }}
            title="Zoom out"
          >
            <ZoomOut size={14} className="text-[#C5A059]" />
          </button>
          <button
            onClick={() => setScale(1.0)}
            className="text-[10px] px-2 py-1 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}`, color: '#C5A059' }}
            title="Reset zoom"
          >
            Reset
          </button>

          {/* Undo/Redo */}
          <button onClick={undo} disabled={historyIndex <= 0}
            className="p-1.5 rounded-full disabled:opacity-30 transition-opacity"
            style={{ border: `1px solid ${borderColor}` }} title="Undo (Ctrl+Z)">
            <Undo2 size={14} className="text-[#C5A059]" />
          </button>
          <button onClick={redo} disabled={historyIndex >= posHistory.length - 1}
            className="p-1.5 rounded-full disabled:opacity-30 transition-opacity"
            style={{ border: `1px solid ${borderColor}` }} title="Redo (Ctrl+Y)">
            <Redo2 size={14} className="text-[#C5A059]" />
          </button>

          {/* Export PNG */}
          <button onClick={handleExportPNG}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }} title="Esporta PNG">
            <Download size={14} className="text-[#C5A059]" />
          </button>

          {/* NEW 10. Share map */}
          <button
            onClick={handleShareMap}
            className="text-[10px] px-2.5 py-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}`, color: '#C5A059' }}
            title="Condividi mappa"
          >
            Condividi
          </button>

          {/* Dark mode toggle */}
          <button onClick={() => setDarkMode(d => !d)}
            className="p-1.5 rounded-full transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${borderColor}` }} title="Toggle dark mode">
            {darkMode ? <Sun size={14} className="text-[#C5A059]" /> : <Moon size={14} className="text-[#C5A059]" />}
          </button>

          {/* Save itinerary */}
          <button onClick={handleSaveItinerary}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
            style={{ background: 'rgba(197,160,89,0.15)', color: '#C5A059', border: `1px solid ${borderColor}` }}>
            <Save size={12} />
            <span className="hidden sm:block">Salva come itinerario</span>
          </button>

          <button onClick={handleRequestItinerary}
            className="flex items-center gap-2 bg-[#C5A059] text-white text-sm px-4 py-2 rounded-full hover:bg-[#b8924a] transition-colors">
            Richiedi itinerario
          </button>
        </div>
      </div>

      {/* Color picker + emoji picker + importance toggle for selected node */}
      {selectedNodeId && (
        <div
          className="flex items-center gap-3 px-4 py-2 text-xs flex-wrap"
          style={{ borderBottom: `1px solid ${borderColor}`, color: textColor }}
        >
          <span className="opacity-60">Colore:</span>
          {PRESET_COLORS.map(c => (
            <button key={c.value} onClick={() => handleColorChange(c.value)} title={c.label}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: c.value,
                borderColor: nodes.find(n => n.id === selectedNodeId)?.color === c.value ? '#fff' : 'transparent',
              }}
            />
          ))}

          {/* NEW 9. Emoji picker */}
          <span className="opacity-60 ml-2">Emoji:</span>
          {NODE_EMOJIS.map(em => (
            <button key={em} onClick={() => assignEmoji(em)}
              className="text-sm hover:scale-125 transition-transform" title={`Assegna ${em}`}>
              {em}
            </button>
          ))}

          {/* NEW 7. Scale by importance toggle */}
          <label className="flex items-center gap-1.5 ml-2 cursor-pointer opacity-80 hover:opacity-100" title="Scala nodi per importanza">
            <input
              type="checkbox"
              checked={scaleByImportance}
              onChange={e => setScaleByImportance(e.target.checked)}
              className="accent-[#C5A059]"
            />
            <span className="text-[10px]">Scala per importanza</span>
          </label>

          <button onClick={() => setSelectedNodeId(null)} className="ml-auto opacity-50 hover:opacity-100" style={{ color: textColor }}>
            ✕
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 640"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
        >
          {/* Connection lines with optional labels */}
          {nodes.map(node => {
            const pos = getNodePos(node)
            const isMatch = matchesSearch(node)
            const midX = (centerX + pos.x) / 2
            const midY = (centerY + pos.y) / 2
            return (
              <g key={`line-${node.id}`}>
                <line
                  x1={centerX} y1={centerY}
                  x2={pos.x} y2={pos.y}
                  stroke={isMatch && searchQuery ? '#C5A059' : 'rgba(197,160,89,0.35)'}
                  strokeWidth={isMatch && searchQuery ? '2' : '1.5'}
                  strokeDasharray="6 4"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEditingConnLabel(node.id)
                    setConnLabelText(node.connectionLabel ?? '')
                  }}
                />
                {/* NEW 3. Connection label */}
                {node.connectionLabel && (
                  <text
                    x={midX} y={midY}
                    textAnchor="middle"
                    fill="rgba(197,160,89,0.8)"
                    fontSize="8"
                    fontFamily="var(--font-family-mono)"
                  >
                    {node.connectionLabel}
                  </text>
                )}
              </g>
            )
          })}

          {/* Central node */}
          <g>
            <circle cx={centerX} cy={centerY} r={52} fill="#1C1C1C" stroke="#C5A059" strokeWidth="1.5" />
            <text x={centerX} y={centerY - 6} textAnchor="middle" fill="#C5A059" fontSize="10"
              fontFamily="var(--font-family-mono)" letterSpacing="0.1em">IL MIO</text>
            <text x={centerX} y={centerY + 10} textAnchor="middle" fill="#C5A059" fontSize="10"
              fontFamily="var(--font-family-mono)" letterSpacing="0.1em">VIAGGIO</text>
            <text x={centerX} y={centerY + 26} textAnchor="middle" fill="rgba(197,160,89,0.5)" fontSize="16">✦</text>
          </g>

          {/* Nodes */}
          {nodes.map(node => {
            const pos = getNodePos(node)
            const isActive = activeNode === node.id
            const isSelected = selectedNodeId === node.id
            const isMatch = matchesSearch(node)
            const highlight = searchQuery && isMatch
            const radius = getNodeRadius(node)

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
                onDoubleClick={() => {
                  // NEW 2. Double-click to edit label
                  setEditingNodeId(node.id)
                  setEditingLabel(node.label)
                }}
                className="cursor-pointer"
                opacity={searchQuery && !isMatch ? 0.25 : 1}
              >
                <circle
                  cx={0} cy={0} r={radius}
                  fill={isActive ? node.color : '#1C1C1C'}
                  stroke={highlight ? '#fff' : isSelected ? '#fff' : node.color}
                  strokeWidth={highlight || isSelected ? '3' : '1.5'}
                />
                <text x={0} y={-4} textAnchor="middle" fill="white" fontSize="18">{node.emoji}</text>
                <text x={0} y={13} textAnchor="middle" fill={isActive ? '#fff' : node.color}
                  fontSize="9" fontFamily="var(--font-family-mono)" letterSpacing="0.08em">
                  {node.label.toUpperCase()}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* NEW 2. Inline label editor (floating) */}
        <AnimatePresence>
          {editingNodeId && (() => {
            const node = nodes.find(n => n.id === editingNodeId)
            if (!node) return null
            const pos = getNodePos(node)
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-20"
                style={{ left: `${(pos.x / 800) * 100}%`, top: `${(pos.y / 640) * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <input
                  autoFocus
                  value={editingLabel}
                  onChange={e => setEditingLabel(e.target.value)}
                  onBlur={saveLabel}
                  onKeyDown={e => { if (e.key === 'Enter') saveLabel(); if (e.key === 'Escape') setEditingNodeId(null) }}
                  className="bg-[#1C1C1C] text-[#C5A059] border border-[#C5A059] rounded-lg px-2 py-1 text-xs text-center focus:outline-none w-28"
                />
              </motion.div>
            )
          })()}
        </AnimatePresence>

        {/* NEW 3. Connection label editor (floating input) */}
        <AnimatePresence>
          {editingConnLabel && (() => {
            const node = nodes.find(n => n.id === editingConnLabel)
            if (!node) return null
            const pos = getNodePos(node)
            const midX = (centerX + pos.x) / 2
            const midY = (centerY + pos.y) / 2
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-20"
                style={{ left: `${(midX / 800) * 100}%`, top: `${(midY / 640) * 100}%`, transform: 'translate(-50%, -50%)' }}
              >
                <input
                  autoFocus
                  value={connLabelText}
                  onChange={e => setConnLabelText(e.target.value)}
                  onBlur={saveConnLabel}
                  onKeyDown={e => { if (e.key === 'Enter') saveConnLabel(); if (e.key === 'Escape') setEditingConnLabel(null) }}
                  placeholder="Etichetta connessione..."
                  className="bg-[#1C1C1C] text-[#C5A059] border border-[rgba(197,160,89,0.5)] rounded-lg px-2 py-1 text-[10px] text-center focus:outline-none w-32"
                />
              </motion.div>
            )
          })()}
        </AnimatePresence>

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
                        <p className="text-xs font-medium line-clamp-1" style={{ color: tooltipText }}>{s.title}</p>
                        <p className="text-[#5A4F44] text-[10px] mt-0.5">{s.location}</p>
                        <p className="text-[#C5A059] text-[10px] font-[family-name:var(--font-family-mono)] mt-1">
                          € {s.price.toLocaleString('it-IT')} / {s.priceUnit}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setActiveNode(null)}
                  className="w-full text-[10px] text-[#5A4F44] hover:text-[#C5A059] transition-colors text-center">
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
              return <circle key={`mini-${node.id}`} cx={pos.x} cy={pos.y} r={12} fill={node.color} opacity={0.7} />
            })}
          </svg>
          <span className="absolute bottom-1 left-1 text-[8px] text-[#C5A059] font-[family-name:var(--font-family-mono)]">mini-map</span>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
          <p className="text-[10px] text-[rgba(197,160,89,0.4)] font-light tracking-wide whitespace-nowrap">
            Clicca per suggerimenti · Doppio click per modificare etichetta · Clicca linea per etichettarla · Del = elimina nodo
          </p>
        </div>
      </div>

      {/* NEW 1. Template modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplates(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 w-full max-w-md">
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">Template Mappa</h2>
              <p className="text-xs text-[#5A4F44] mb-6">Sostituirà i nodi correnti.</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(NODE_TEMPLATES).map(([key, tpl]) => (
                  <button key={key} onClick={() => applyTemplate(key)}
                    className="p-4 rounded-xl border border-[rgba(197,160,89,0.2)] hover:border-[#C5A059] text-left transition-colors bg-white">
                    <p className="text-sm font-medium text-[#1C1C1C] mb-1">{tpl.name}</p>
                    <p className="text-[10px] text-[#5A4F44]">{tpl.nodes.length} nodi pre-connessi</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(false)} className="mt-4 w-full text-xs text-[#5A4F44] hover:text-[#C5A059] transition-colors">
                Annulla
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW 5. Import from text modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImport(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#FDF9F2] rounded-2xl border border-[rgba(197,160,89,0.25)] p-8 w-full max-w-md">
              <h2 className="font-[family-name:var(--font-family-display)] text-xl font-medium text-[#1C1C1C] mb-2">Importa da testo</h2>
              <p className="text-xs text-[#5A4F44] mb-4">Un nodo per riga. I nodi saranno disposti in layout circolare.</p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={"Yacht nel Mediterraneo\nJet privato\nVilla in Toscana\nCena con chef stellato"}
                rows={6}
                className="w-full border border-[rgba(197,160,89,0.25)] rounded-xl px-4 py-3 text-sm text-[#1C1C1C] bg-white focus:outline-none focus:border-[#C5A059] resize-none transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button onClick={handleImport}
                  className="flex-1 py-2.5 rounded-xl bg-[#C5A059] text-white text-sm font-medium hover:bg-[#b8924a] transition-colors">
                  Importa nodi
                </button>
                <button onClick={() => setShowImport(false)}
                  className="px-4 py-2.5 rounded-xl border border-[rgba(197,160,89,0.25)] text-sm text-[#5A4F44] hover:border-[#C5A059] transition-colors">
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
