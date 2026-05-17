import { useDream } from '@/context/DreamContext'

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: 4 + Math.random() * 12,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: 5 + Math.random() * 8,
  delay: Math.random() * 4,
}))

export function DreamOverlay() {
  const { isDream } = useDream()
  if (!isDream) return null

  return (
    <div className="dream-overlay" aria-hidden="true">
      {PARTICLES.map(p => (
        <span
          key={p.id}
          className="dream-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
