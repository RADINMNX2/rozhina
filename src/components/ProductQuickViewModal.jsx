import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Ruler, ShoppingBag, Truck, X } from 'lucide-react';
import { badgeStyle } from '../data/productsData';
import { formatPrice, toFa } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { t } from '../utils/text';
import { FabricMagnifier } from './FabricMagnifier';
import { MagneticButton } from './MagneticButton';

const MODAL_SPRING = { type: 'spring', damping: 28, stiffness: 260, mass: 0.8 };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export const ProductQuickViewModal = ({ product, onClose }) => {
  const { addItem, setColor } = useCart();
  const { content: c } = useContent();
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);
  const [selectedHex, setSelectedHex] = useState(null);
  const [added, setAdded] = useState(false);
  const [canDrag, setCanDrag] = useState(true);

  useEffect(() => {
    setSelectedHex(product?.colors?.[0]?.hex ?? null);
    setAdded(false);
    setCanDrag(true);
  }, [product]);

  useEffect(() => {
    if (!product) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const selectedLabel = product.colors.find((c) => c.hex === selectedHex)?.label;
  const lowStock = product.quantity <= 2;
  const outOfStock = product.inStock === false || (product.quantity ?? 0) <= 0;

  const handleScroll = () => {
    setCanDrag((scrollRef.current?.scrollTop ?? 0) <= 0);
  };

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product.id, 1);
    setColor(product.id, selectedHex);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const content = (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`grid grid-cols-1 md:grid-cols-2 ${isMobile ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain' : ''}`}
    >
      {/* Right (first in RTL): magnifier */}
      <div className="p-4 md:p-6 md:pl-5">
        <FabricMagnifier src={product.images[1] ?? product.images[0]} alt={product.name} />
      </div>

      {/* Left: details */}
      <div className="flex flex-col gap-5 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-0 md:py-6 md:pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/25 bg-gold/[0.08] px-3 py-1 text-[11px] font-semibold text-gold">
            {product.fabric}
          </span>
          {product.badges.map((badge) => (
            <span
              key={badge}
              className={`rounded-full px-3 py-1 text-[10px] font-bold ${badgeStyle(badge)}`}
            >
              {badge}
            </span>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-extrabold leading-8 text-pearl md:text-2xl">
            {product.name}
          </h2>
          <p className="mt-1.5 text-xs font-serif tracking-wide text-taupe" dir="ltr">
            {product.enName}
          </p>
          {product.code && (
            <p
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-pearl/50"
              dir="ltr"
            >
              {t(c.quickView.codeLabel, { code: product.code })}
            </p>
          )}
        </div>

        <p className="text-sm leading-7 text-pearl/70">{product.description}</p>

        <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2.5 text-xs text-taupe">
            <Ruler size={14} className="text-gold" strokeWidth={1.7} />
            <span>{t(c.quickView.dimensionsLabel)}&nbsp;</span>
            <span className="font-semibold text-pearl">{product.dimensions}</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-taupe">
            {t(c.quickView.colorLabel)} <span className="font-semibold text-pearl">{selectedLabel}</span>
          </p>
          <div className="mt-2.5 flex items-center gap-2.5" role="group" aria-label="انتخاب رنگ">
            {product.colors.map((c) => {
              const active = selectedHex === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={`رنگ ${c.label}`}
                  aria-pressed={active}
                  onClick={() => setSelectedHex(c.hex)}
                  className={`h-10 w-10 rounded-full transition-all duration-300 ${
                    active
                      ? 'ring-2 ring-gold shadow-dot-glow ring-offset-2 ring-offset-[#121110]'
                      : 'ring-1 ring-inset ring-white/15 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="text-xs text-taupe">{c.quickView.stockLabel}</span>
          <span
            className={`text-sm font-bold ${outOfStock ? 'text-terracotta' : lowStock ? 'text-terracotta' : 'text-pearl'}`}
          >
            {outOfStock
              ? t(c.quickView.outOfStock)
              : lowStock
                ? t(c.quickView.lowStock, { n: toFa(product.quantity) })
                : t(c.quickView.inStock, { n: toFa(product.quantity) })}
          </span>
        </div>

        <div className="flex flex-col gap-3 pt-1 md:mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-pearl">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-taupe">تومان</span>
            {product.oldPrice && (
              <span className="text-sm text-taupe/70 line-through decoration-terracotta/60">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <MagneticButton onClick={handleAdd} disabled={outOfStock} className="btn-gold-modern w-full disabled:cursor-not-allowed disabled:opacity-40">
            {outOfStock ? (
              <span className="flex w-full items-center justify-center gap-2.5">
                <ShoppingBag size={16} strokeWidth={2} />
                {t(c.quickView.outOfStock)}
              </span>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Check size={17} strokeWidth={3} />
                  {t(c.quickView.addedToCart)}
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="flex w-full items-center justify-center gap-2.5"
                >
                  <ShoppingBag size={16} strokeWidth={2} />
                  {t(c.quickView.addToCart)}
                  <span className="whitespace-nowrap rounded-full bg-obsidian/25 px-2.5 py-1 text-xs font-bold tracking-wide">
                    {formatPrice(product.price)}
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
            )}
          </MagneticButton>

          <p className="flex items-center justify-center gap-2 text-[11px] text-taupe">
            <Truck size={12} className="text-gold" strokeWidth={1.7} />
            {c.quickView.shippingNote}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`نمایش سریع ${product.name}`}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-obsidian/80 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />

        <motion.div
          onClick={(e) => e.stopPropagation()}
          drag={isMobile && canDrag ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.y > 90 || info.velocity.y > 700) onClose();
          }}
          initial={
            isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 14 }
          }
          animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 14 }}
          transition={MODAL_SPRING}
          className={`quickview-sheet relative flex w-full flex-col overflow-hidden border-white/10 bg-[#121110]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] ${
            isMobile
              ? 'justify-start rounded-t-3xl border-t'
              : 'max-w-4xl rounded-3xl border'
          }`}
        >
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="absolute left-4 top-4 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-obsidian/60 text-pearl/80 backdrop-blur-md transition-all duration-500 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90 md:top-6 md:left-6"
          >
            <X size={18} strokeWidth={1.8} />
          </button>

          {isMobile && (
            <div className="flex shrink-0 items-center justify-center pb-1.5 pt-3">
              <span
                className={`h-1.5 w-12 rounded-full transition-colors duration-300 ${
                  canDrag
                    ? 'bg-gold/70 shadow-[0_0_12px_rgba(226,201,151,0.45)]'
                    : 'bg-white/[0.14]'
                }`}
                aria-hidden
              />
            </div>
          )}

          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};