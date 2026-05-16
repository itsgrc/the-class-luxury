import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import Lenis from 'lenis'
import './index.css'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'

// Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.15,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
})
function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
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
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
