import { useState } from 'react';
import { Eye, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { badgeStyle } from '../data/productsData';
import { formatPrice, toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { SpotlightCard } from './SpotlightCard';

const TILT_SPRING = { type: 'spring', stiffness: 150, damping: 16, mass: 0.5 };

export const RozhinaProductCard = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addItem(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <SpotlightCard as="article" data-product-id={product.id}>
      <motion.article
        onClick={() => onQuickView?.(product)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="card-lux group relative flex h-full cursor-pointer flex-col transition-all duration-500 hover:border-gold/25 hover:shadow-gold-glow"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-white/[0.02] will-change-transform">
          <div className="sheen absolute inset-0 z-[1]">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-0"
              onError={withImageFallback}
            />
            <img
              src={product.images[1]}
              alt={`استایل ${product.name}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
              onError={withImageFallback}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {product.badges.length > 0 && (
            <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className={`px-2.5 py-1 text-[10px] font-bold tracking-wide backdrop-blur-sm ${badgeStyle(badge)}`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label={inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
            aria-pressed={inWishlist}
            onClick={handleWishlist}
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-obsidian/70 text-pearl/80 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Heart
              size={16}
              strokeWidth={1.8}
              className={`transition-all duration-300 ${
                inWishlist
                  ? 'fill-gold stroke-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.55)]'
                  : 'text-pearl/80'
              }`}
            />
          </button>

          <button
            type="button"
            aria-label={`نمایش سریع ${product.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="absolute left-3 top-[3.25rem] flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-obsidian/70 text-pearl/80 opacity-0 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-gold/40 hover:text-gold active:scale-95 group-hover:opacity-100 max-sm:opacity-100"
          >
            <Eye size={16} strokeWidth={1.8} />
          </button>

          <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100 z-[2]">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex w-full items-center justify-center gap-2 rounded-b-2xl py-3.5 text-sm font-bold backdrop-blur-xl transition-all duration-300 active:scale-[0.99] ${
                added
                  ? 'bg-gradient-to-b from-gold to-bronze text-obsidian shadow-gold-cta'
                  : 'border-t border-white/10 bg-obsidian/80 text-pearl hover:bg-obsidian/90'
              }`}
            >
              {added ? (
                'به سبد اضافه شد ✓'
              ) : (
                <>
                  <Plus size={15} strokeWidth={2.5} aria-hidden />
                  افزودن سریع
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[15px] font-bold leading-6 text-pearl">{product.name}</h3>
            {product.quantity <= 2 && (
              <span className="whitespace-nowrap text-[10px] font-semibold text-terracotta">
                تنها {toFa(product.quantity)} عدد
              </span>
            )}
          </div>

          <p className="mt-0.5 text-[11px] font-serif tracking-wide text-taupe" dir="ltr">
            {product.enName}
          </p>

          <div className="mt-3 flex items-center gap-1.5" role="group" aria-label="رنگ‌های موجود">
            <span className="mr-0.5 text-[11px] text-taupe">{toFa(product.colors.length)} رنگ</span>
            {product.colors.map((c) => (
              <span
                key={c.hex}
                title={c.label}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-white/15"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-extrabold tracking-tight text-pearl">
              {formatPrice(product.price)}
            </span>
            <span className="text-[11px] text-taupe">تومان</span>
            {product.oldPrice && (
              <span className="text-xs text-taupe/70 line-through decoration-terracotta/60">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </SpotlightCard>
  );
};