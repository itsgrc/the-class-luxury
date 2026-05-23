import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { router } from './router'
import { initSmoothScroll } from './lib/scroll'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import { CurrencyProvider } from './context/CurrencyContext'

// Lenis smooth scroll with GSAP ScrollTrigger sync (lerp 0.07)
initSmoothScroll()

// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
            <CurrencyProvider>
              <LangProvider>
                <RouterProvider router={router} />
                <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#FDF9F2',
                    border: '0.5px solid rgba(197,160,89,0.3)',
                    color: '#1C1C1C',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: '13px',
                  },
                }}
              />
              </LangProvider>
            </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
