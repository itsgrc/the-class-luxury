import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): Lenis {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    lerp: 0.05,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 2.5,
    wheelMultiplier: 0.8,
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
