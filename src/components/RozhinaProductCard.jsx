import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { badgeStyle } from '../data/productsData';
import { formatPrice, toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const RozhinaProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleQuickAdd = () => {
    addItem(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group relative flex flex-col" data-product-id={product.id}>
      <div className="relative aspect-[3/4] overflow-hidden bg-espresso/[0.04]">
        {/* Main / lifestyle shot */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.045] group-hover:opacity-0"
          onError={withImageFallback}
        />
        {/* Drape / model shot on hover */}
        <img
          src={product.images[1]}
          alt={`استایل ${product.name}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-all duration-[800ms] ease-out group-hover:scale-100 group-hover:opacity-100"
          onError={withImageFallback}
        />

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className={`px-2.5 py-1 text-[10px] font-bold tracking-wide ${badgeStyle(badge)}`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          aria-label={inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          aria-pressed={inWishlist}
          onClick={() => toggle(product.id)}
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-alabaster/90 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110"
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            className={`transition-all duration-300 ${
              inWishlist ? 'fill-terracotta stroke-terracotta' : 'stroke-espresso'
            }`}
          />
        </button>

        {/* Quick Add — slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold backdrop-blur transition-all duration-300 ${
              added
                ? 'bg-gold text-espresso'
                : 'bg-espresso/95 text-alabaster hover:bg-gold hover:text-espresso'
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

      <div className="flex flex-col pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-6 text-espresso">{product.name}</h3>
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
              className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-espresso/15"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-extrabold tracking-tight text-espresso">
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
    </article>
  );
};