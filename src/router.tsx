import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ServiziPage } from './pages/ServiziPage'
import { DettaglioPage } from './pages/DettaglioPage'
import { PrefertiPage } from './pages/PrefertiPage'
import { ItinerariPage } from './pages/ItinerariPage'
import { ConciergePage } from './pages/ConciergePage'
import { RichiestaSuMisuraPage } from './pages/RichiestaSuMisuraPage'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={window.location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </Layout>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const serviziRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/servizi',
  component: ServiziPage,
})

const serviziIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/servizi/$id',
  component: DettaglioPage,
})

const prefertiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preferiti',
  component: PrefertiPage,
})

const itinerariRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/itinerari',
  component: ItinerariPage,
})

const conciergeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/concierge',
  component: ConciergePage,
})

const richiestaSuMisuraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/richiesta-su-misura',
  component: RichiestaSuMisuraPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  serviziRoute,
  serviziIdRoute,
  prefertiRoute,
  itinerariRoute,
  conciergeRoute,
  richiestaSuMisuraRoute,
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
