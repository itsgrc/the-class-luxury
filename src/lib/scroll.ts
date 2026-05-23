import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

export function initSmoothScroll(): Lenis {
  lenisInstance = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 2,
    wheelMultiplier: 1.2,
    infinite: false,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
  })

  // Use only GSAP ticker — do NOT also use requestAnimationFrame(raf) or lenis.raf() runs twice per frame
  lenisInstance.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenisInstance
}

export function getLenis(): Lenis | null {
  return lenisInstance
}

export function scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
  lenisInstance?.scrollTo(target, { offset: options?.offset ?? 0, duration: options?.duration ?? 1.2 })
}
