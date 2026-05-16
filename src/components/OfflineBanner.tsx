import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useOffline } from '@/hooks/useOffline'

export function OfflineBanner() {
  const offline = useOffline()
  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-[#5A4F44] text-white text-xs py-2 px-4"
          role="alert"
          aria-live="polite"
        >
          <WifiOff size={12} />
          Sei offline — le modifiche verranno sincronizzate al ripristino della connessione
        </motion.div>
      )}
    </AnimatePresence>
  )
}
