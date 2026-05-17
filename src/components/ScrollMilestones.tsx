import { useEffect, useState } from 'react'

interface Milestone { label: string; progress: number }

export function ScrollMilestones({ milestones }: { milestones: Milestone[] }) {
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScroll(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col gap-3">
      {milestones.map((m) => {
        const isActive = scroll >= m.progress - 0.05 && scroll <= m.progress + 0.1
        return (
          <button
            key={m.label}
            onClick={() => window.scrollTo({ top: m.progress * (document.documentElement.scrollHeight - window.innerHeight), behavior: 'smooth' })}
            className="group relative flex items-center"
          >
            <span className="absolute right-full mr-2 text-[9px] text-[#5A4F44] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {m.label}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#C5A059] scale-150' : 'bg-[rgba(197,160,89,0.3)]'}`} />
          </button>
        )
      })}
    </div>
  )
}
