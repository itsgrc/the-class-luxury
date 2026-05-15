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
          <Outlet />
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  serviziRoute,
  serviziIdRoute,
  preferitiRoute,
  itinerariRoute,
  conciergeRoute,
  suMisuraRoute,
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
