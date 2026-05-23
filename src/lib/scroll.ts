import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    lerp: 0.12,           // higher = snappier (0.02 would be sluggish)
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 3,
    wheelMultiplier: 1.5,
    infinite: false,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })

  function raf(time: number) {
    lenisInstance?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return lenisInstance
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

export function scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
  lenisInstance?.scrollTo(target, { offset: options?.offset ?? 0, duration: options?.duration ?? 1.2 })
}

export function observeReveal(): () => void {
  const elements = document.querySelectorAll<HTMLElement>('.reveal-on-scroll')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  elements.forEach(el => observer.observe(el))
  return () => observer.disconnect()
}
