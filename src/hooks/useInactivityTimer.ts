import { useEffect, useRef } from 'react'

export function useInactivityTimer(warningMs = 5 * 60 * 1000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shown = useRef(false)

  useEffect(() => {
    const reset = () => {
      shown.current = false
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (!shown.current) {
          shown.current = true
          window.dispatchEvent(new CustomEvent('theclass:inactive'))
        }
      }, warningMs)
    }

    const EVENTS = ['mousedown', 'keypress', 'scroll', 'touchstart']
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, reset))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [warningMs])
}
