import { lazy, Suspense } from 'react'
import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ServiziPage } from './pages/ServiziPage'
import { DettaglioPage } from './pages/DettaglioPage'
import { PreferitiPage } from './pages/PreferitiPage'
import { ItinerariPage } from './pages/ItinerariPage'
import { ConciergePage } from './pages/ConciergePage'
import { RichiestaSuMisuraPage } from './pages/RichiestaSuMisuraPage'

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={typeof window !== 'undefined' ? window.location.pathname : '/'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Suspense fallback={<div className="min-h-screen bg-[#FDF9F2]" />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  ),
})

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })

const serviziRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/servizi', component: ServiziPage,
})

const serviziIdRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/servizi/$id', component: DettaglioPage,
})

const preferitiRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/preferiti', component: PreferitiPage,
})

const itinerariRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/itinerari', component: ItinerariPage,
})

const conciergeRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/concierge', component: ConciergePage,
})

const suMisuraRoute = createRoute({
  getParentRoute: () => rootRoute, path: '/richiesta-su-misura', component: RichiestaSuMisuraPage,
})

const profiloRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profilo',
  component: lazy(() => import('./pages/ProfiloPage').then(m => ({ default: m.ProfiloPage }))),
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage }))),
})

const chiSiamoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chi-siamo',
  component: lazy(() => import('./pages/ChiSiamoPage').then(m => ({ default: m.ChiSiamoPage }))),
})

const contattiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contatti',
  component: lazy(() => import('./pages/ContattiPage').then(m => ({ default: m.ContattiPage }))),
})

const terminiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/termini',
  component: lazy(() => import('./pages/TerminiPage').then(m => ({ default: m.TerminiPage }))),
})

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/faq',
  component: lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage }))),
})

const storiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories',
  component: lazy(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage }))),
})

const storyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stories/$slug',
  component: lazy(() => import('./pages/StoryDetailPage').then(m => ({ default: m.StoryDetailPage }))),
})

const eventiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/eventi',
  component: lazy(() => import('./pages/EventiPage').then(m => ({ default: m.EventiPage }))),
})

const pacchettiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pacchetti',
  component: lazy(() => import('./pages/PacchettiPage').then(m => ({ default: m.PacchettiPage }))),
})

const crowdConciergeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crowd-concierge',
  component: lazy(() => import('./pages/CrowdConciergePage').then(m => ({ default: m.CrowdConciergePage }))),
})

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage }))),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  serviziRoute,
  serviziIdRoute,
  preferitiRoute,
  itinerariRoute,
  conciergeRoute,
  suMisuraRoute,
  profiloRoute,
  adminRoute,
  chiSiamoRoute,
  contattiRoute,
  terminiRoute,
  faqRoute,
  storiesRoute,
  storyDetailRoute,
  eventiRoute,
  pacchettiRoute,
  crowdConciergeRoute,
  quizRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
