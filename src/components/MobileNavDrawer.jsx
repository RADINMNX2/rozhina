import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Instagram, Lock, X } from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../context/SettingsContext';
import { useContent } from '../context/ContentContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SPRING = { type: 'spring', damping: 30, stiffness: 320, mass: 0.9 };

export const MobileNavDrawer = ({ open, onClose }) => {
  const { settings } = useSettings();
  const { content } = useContent();
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const navLinks = content.nav ?? [];

  useScrollLock(open);
  useFocusTrap(ref, { active: open, onEscape: onClose });

  const rowBase =
    'focus-ring flex min-h-12 items-center justify-between gap-3 px-3 text-lg font-medium text-pearl/90 transition-[background-color,color,transform] duration-300 hover:bg-white/[0.04] hover:text-gold active:scale-[0.99]';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="منوی روژینا"
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.aside
            className="absolute inset-y-0 start-0 flex w-[85%] max-w-80 flex-col border-e border-white/[0.08] bg-[#0F0E0D] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={reduced ? { duration: 0.2 } : SPRING}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
            />

            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <Logo compact />
              <button
                type="button"
                aria-label="بستن منو"
                onClick={onClose}
                className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-pearl/70 transition-[transform,background-color,color] duration-300 hover:rotate-90 hover:bg-white/5 hover:text-pearl active:scale-90"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-4 pt-2" aria-label="منوی موبایل">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  initial={reduced ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduced ? { duration: 0.2 } : { delay: 0.08 + i * 0.05, ...SPRING }}
                  className={rowBase}
                >
                  {link.label}
                  <ChevronLeft size={18} strokeWidth={1.6} className="text-gold/70" />
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto space-y-4 border-t border-gold/15 px-4 py-5 pb-safe">
              <a
                href="#/admin"
                onClick={onClose}
                className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-pearl/80 transition-colors hover:bg-white/[0.04] hover:text-gold"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold">
                  <Lock size={15} strokeWidth={1.7} />
                </span>
                استودیو مدیریت
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-pearl/75 transition-colors hover:bg-white/[0.04] hover:text-gold"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-pearl/80">
                  <Instagram size={16} strokeWidth={1.6} />
                </span>
                {settings.instagramHandle}
              </a>
              <p className="px-3 text-xs leading-6 text-taupe">{content.menu.shippingNote}</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};