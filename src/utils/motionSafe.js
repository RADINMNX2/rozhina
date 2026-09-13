/**
 * Shared framer-motion preset that collapses to a ≤150ms fade
 * when the user prefers reduced motion. Transform/opacity only.
 */
export const motionSafe = (reduced) => ({
  initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1 },
  transition: reduced
    ? { duration: 0.15 }
    : { type: 'spring', damping: 28, stiffness: 320, mass: 0.8 },
});