import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FilterSection } from './FilterSection';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toFa } from '../utils/format';

const SPRING = { type: 'spring', damping: 30, stiffness: 300, mass: 0.9 };

export const FilterSheet = ({
  open,
  onClose,
  fabric,
  setFabric,
  color,
  setColor,
  sort,
  setSort,
  count,
}) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useScrollLock(open);
  useFocusTrap(ref, { active: open, onEscape: onClose });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-[80] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="فیلتر محصولات"
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            className="modal-sheet absolute inset-x-0 bottom-0 md:mx-auto md:max-w-lg"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={reduced ? { duration: 0.2 } : SPRING}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
            />
            <div className="modal-handle" />

            <div className="modal-header">
              <h2 className="text-base font-bold text-pearl">فیلترها</h2>
              <button
                type="button"
                aria-label="بستن فیلترها"
                onClick={onClose}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-pearl/70 transition-[transform,background-color,color] duration-300 hover:rotate-90 hover:bg-white/5 hover:text-pearl active:scale-90"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="modal-body py-5">
              <FilterSection
                variant="panel"
                fabric={fabric}
                setFabric={setFabric}
                color={color}
                setColor={setColor}
                sort={sort}
                setSort={setSort}
                count={count}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-gold-modern focus-ring w-full min-h-12"
              >
                مشاهده {toFa(count)} محصول
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};