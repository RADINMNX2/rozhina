import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useIsMobile } from '../hooks/useIsMobile';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';

const SPRING = { type: 'spring', damping: 30, stiffness: 300, mass: 0.9 };
const FADE = { duration: 0.18 };

const SIZE = {
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  '3xl': 'md:max-w-3xl',
};

export const ModalShell = ({
  open,
  onClose,
  label,
  children,
  footer,
  maxWidth = 'lg',
  dragClose = false,
  showHandle = false,
  className = '',
}) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  useScrollLock(open);
  useFocusTrap(ref, { active: open, onEscape: onClose });

  const sheetEnter = reduced ? { opacity: 0 } : { y: '100%' };
  const cardEnter = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 14 };
  const inAnimate = reduced ? { opacity: 1 } : isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 };
  const exitPose = isMobile ? sheetEnter : cardEnter;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            drag={dragClose && !reduced && isMobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 700) onClose();
            }}
            initial={isMobile ? sheetEnter : cardEnter}
            animate={inAnimate}
            exit={exitPose}
            transition={reduced ? FADE : SPRING}
            className={`modal-sheet ${SIZE[maxWidth]} ${className}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            />
            {showHandle && <div className="modal-handle" aria-hidden />}
            {children}
            {footer && <div className="modal-footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};