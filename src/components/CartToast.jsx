import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useContent } from '../context/ContentContext';
import { formatPrice } from '../utils/format';
import { useReducedMotion } from '../hooks/useReducedMotion';

const AUTO_DISMISS_MS = 3500;

export const CartToast = ({ threshold = 480 }) => {
  const { lastAdded } = useCart();
  const { getProduct } = useProducts();
  const { content } = useContent();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    if (!lastAdded) return undefined;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (window.innerWidth < threshold && isMobile) {
      setProductId(null);
      setVisible(false);
      return undefined;
    }
    setProductId(lastAdded.id);
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [lastAdded, threshold]);

  const product = productId ? getProduct(productId) : null;

  return (
    <AnimatePresence>
      {product && visible && (
        <motion.div
          key={`${product.id}-${lastAdded?.at}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
          transition={
            reduced
              ? { duration: 0.15 }
              : { type: 'spring', damping: 24, stiffness: 300, mass: 0.7 }
          }
          role="status"
          aria-live="polite"
          onClick={() => setVisible(false)}
          className="fixed bottom-6 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 cursor-pointer overflow-hidden rounded-2xl border border-gold/20 bg-[#161413] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md"
        >
          <div className="flex items-center gap-3 px-4 pb-3.5 pt-4">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-full w-full object-cover"
              />
              <span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-obsidian">
                <Check size={13} strokeWidth={3} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-pearl">{content.cartToast.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-taupe">{product.name}</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-extrabold text-gold">
                {formatPrice(product.price)}
              </p>
              <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-taupe">
                <ShoppingBag size={11} className="text-gold" strokeWidth={1.8} />
                تومان
              </span>
            </div>
          </div>

          <div className="h-0.5 w-full bg-white/[0.04]">
            <div className="animate-toast-countdown h-full origin-right rounded-full bg-gradient-to-l from-gold to-bronze" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};