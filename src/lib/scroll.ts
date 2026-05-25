// Native CSS smooth scroll — permanent solution.
// Lenis + Framer Motion useScroll created double-tick jitter; native wins.

export function initSmoothScroll(): void {
  document.documentElement.style.scrollBehavior = 'smooth'
}

export function getLenis() { return null }

export function scrollTo(target: string | number | HTMLElement, options?: { offset?: number }) {
  if (typeof target === 'string') {
    const el = document.querySelector(target)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - (options?.offset ?? 0)
      window.scrollTo({ top, behavior: 'smooth' })
    }
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
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
  elements.forEach(el => observer.observe(el))
  return () => observer.disconnect()
}
