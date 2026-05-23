import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    lerp: 0.06,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 2.5,
    wheelMultiplier: 0.85,
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

// IntersectionObserver per reveal-on-scroll (chiama dopo mount React)
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
