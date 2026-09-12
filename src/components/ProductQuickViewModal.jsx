import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ruler, Truck, X } from 'lucide-react';
import { badgeStyle } from '../data/productsData';
import { formatPrice, toFa } from '../utils/format';
import { useCart } from '../context/CartContext';
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
  const isMobile = useIsMobile();
  const [selectedHex, setSelectedHex] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSelectedHex(product?.colors?.[0]?.hex ?? null);
    setAdded(false);
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

  const handleAdd = () => {
    addItem(product.id, 1);
    setColor(product.id, selectedHex);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const content = (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${isMobile ? 'max-h-full overflow-y-auto' : ''}`}>
      {/* Right (first in RTL): magnifier */}
      <div className="p-4 md:p-6">
        <FabricMagnifier src={product.images[1] ?? product.images[0]} alt={product.name} />
      </div>

      {/* Left: details */}
      <div className="flex flex-col gap-5 px-4 pb-4 md:px-0 md:py-6 md:pl-6">
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
        </div>

        <p className="text-sm leading-7 text-pearl/70">{product.description}</p>

        <div className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2.5 text-xs text-taupe">
            <Ruler size={14} className="text-gold" strokeWidth={1.7} />
            <span>ابعاد:&nbsp;</span>
            <span className="font-semibold text-pearl">{product.dimensions}</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-taupe">
            رنگ: <span className="font-semibold text-pearl">{selectedLabel}</span>
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
                  className={`h-9 w-9 rounded-full transition-all duration-300 ${
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
          <span className="text-xs text-taupe">موجودی انبار</span>
          <span
            className={`text-sm font-bold ${lowStock ? 'text-terracotta' : 'text-pearl'}`}
          >
            {lowStock
              ? `تنها ${toFa(product.quantity)} عدد باقی مانده`
              : `${toFa(product.quantity)} عدد موجود`}
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

          <MagneticButton onClick={handleAdd} className="btn-gold btn-shimmer w-full">
            {added ? (
              'به سبد اضافه شد ✓'
            ) : (
              <>
                افزودن به سبد خرید
                <span className="rounded-full bg-obsidian/20 px-2 py-0.5 text-xs font-bold">
                  {formatPrice(product.price)}
                </span>
              </>
            )}
          </MagneticButton>

          <p className="flex items-center justify-center gap-2 text-[11px] text-taupe">
            <Truck size={12} className="text-gold" strokeWidth={1.7} />
            ارسال رایگان برای خریدهای بالای ۱ میلیون تومان
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
          drag={isMobile ? 'y' : false}
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
          className={`relative w-full overflow-hidden border-white/10 bg-[#121110]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] ${
            isMobile
              ? 'max-h-[92vh] rounded-t-3xl border-t'
              : 'max-w-4xl rounded-3xl border'
          }`}
        >
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-obsidian/60 text-pearl/80 backdrop-blur-md transition-all duration-500 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};