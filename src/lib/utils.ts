import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return `TC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function formatPrice(price: number, currency = '€'): string {
  return `${currency}${price.toLocaleString('it-IT')}`
}

export function getABVariant(): 'A' | 'B' {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  return params.get('variant') === 'B' ? 'B' : 'A'
}

export function addRipple(e: React.MouseEvent<HTMLElement>) {
  const btn = e.currentTarget
  const circle = document.createElement('span')
  const diameter = Math.max(btn.clientWidth, btn.clientHeight)
  const radius = diameter / 2
  const rect = btn.getBoundingClientRect()
  circle.style.cssText = `
    width:${diameter}px;height:${diameter}px;
    left:${e.clientX - rect.left - radius}px;
    top:${e.clientY - rect.top - radius}px;
  `
  circle.classList.add('ripple')
  btn.querySelector('.ripple')?.remove()
  btn.appendChild(circle)
}
