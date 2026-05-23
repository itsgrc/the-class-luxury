import Lenis from 'lenis'

let _lenis: Lenis | null = null

export function initSmoothScroll(): void {
  _lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 2.2,
    wheelMultiplier: 1.3,
  })
  function raf(time: number) {
    _lenis!.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}

export function getLenis(): Lenis | null { return _lenis }

export function scrollTo(target: string | number | HTMLElement, options?: { offset?: number }) {
  if (_lenis) {
    _lenis.scrollTo(target as string, { offset: options?.offset ?? 0 })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else if (target instanceof HTMLElement) {
    const top = target.getBoundingClientRect().top + window.scrollY - (options?.offset ?? 0)
    window.scrollTo({ top, behavior: 'smooth' })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
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
