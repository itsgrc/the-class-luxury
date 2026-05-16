// src/components/ScrollProgressBar.tsx
import { useScroll, motion } from 'framer-motion'

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX: scrollYProgress, width: '100%' }}
    />
  )
}
