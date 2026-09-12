import { useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, toFa } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../data/constants';
import { buildOrderMessage, buildWhatsAppLink } from '../utils/whatsapp';
import { withImageFallback } from '../utils/imageFallback';

export const CartDrawer = ({ open, onClose }) => {
  const { items, totalItems, subtotal, increment, decrement, removeItem, setColor } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const handleCheckout = () => {
    window.open(buildWhatsAppLink(buildOrderMessage(items)), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      role="dialog"
      aria-label="سبد خرید"
    >
      <div
        className={`absolute inset-0 bg-espresso/45 backdrop-blur-sm transition-opacity duration-500 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-alabaster shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Head */}
        <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <h2 className="text-base font-bold">
              سبد خرید <span className="text-taupe">({toFa(totalItems)})</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label="بستن سبد"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-espresso/5"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Shipping progress */}
        <div className="border-b border-espresso/[0.07] bg-cream/40 px-6 py-4">
          <p className="text-xs leading-6 text-espresso/80">
            {remaining > 0 ? (
              <>
                با خرید <span className="font-bold text-espresso">{formatPrice(remaining)}</span>{' '}
                تومان دیگر، ارسال رایگان می‌شود
              </>
            ) : (
              <span className="font-bold text-emeraldDeep">ارسال رایگان شما فعال شد ✓</span>
            )}
          </p>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-espresso/10">
            <div
              className="h-full rounded-full bg-gold transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-espresso/[0.05] text-taupe">
                <ShoppingBag size={24} strokeWidth={1.4} />
              </span>
              <div>
                <p className="text-sm font-bold text-espresso">سبد خرید شما خالی است</p>
                <p className="mt-1 text-xs leading-6 text-taupe">
                  زیبایی کالکشن روژینا منتظر شماست
                </p>
              </div>
              <a href="#collection" onClick={onClose} className="btn-gold !py-3 text-xs">
                مشاهده کالکشن
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-espresso/[0.07]">
              {items.map(({ product, qty, colorHex }) => (
                <li key={product.id} className="flex gap-4 py-5">
                  <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-espresso/[0.05]">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={withImageFallback}
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-bold leading-6">{product.name}</h3>
                        {product.colors.length > 1 && (
                          <div className="mt-1 flex items-center gap-1.5">
                            {product.colors.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                aria-label={`رنگ ${c.label}`}
                                onClick={() => setColor(product.id, c.hex)}
                                className={`h-4 w-4 rounded-full transition-all ${
                                  colorHex === c.hex
                                    ? 'ring-2 ring-espresso ring-offset-1 ring-offset-alabaster'
                                    : 'ring-1 ring-inset ring-espresso/15 hover:scale-110'
                                }`}
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="حذف از سبد"
                        onClick={() => removeItem(product.id)}
                        className="text-taupe/60 transition-colors hover:text-terracotta"
                      >
                        <Trash2 size={15} strokeWidth={1.6} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-espresso/15">
                        <button
                          type="button"
                          aria-label="افزایش تعداد"
                          onClick={() => increment(product.id)}
                          className="flex h-7 w-7 items-center justify-center text-espresso transition-colors hover:text-gold"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                        <span className="min-w-6 text-center text-xs font-bold">
                          {toFa(qty)}
                        </span>
                        <button
                          type="button"
                          aria-label="کاهش تعداد"
                          onClick={() => decrement(product.id)}
                          className="flex h-7 w-7 items-center justify-center text-espresso transition-colors hover:text-gold"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold tracking-tight">
                        {formatPrice(product.price * qty)}
                        <span className="mr-1 text-[10px] font-normal text-taupe">تومان</span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-espresso/10 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-taupe">مجموع فاکتور</span>
              <span className="text-lg font-extrabold tracking-tight">
                {formatPrice(subtotal)}
                <span className="mr-1.5 text-xs font-normal text-taupe">تومان</span>
              </span>
            </div>
            <p className="mt-1 text-[11px] text-taupe">
              زمان تحویل و هزینه نهایی پس از هماهنگی در واتس‌اپ اعلام می‌شود.
            </p>

            <button type="button" onClick={handleCheckout} className="btn-gold mt-4 w-full">
              سفارش از طریق واتس‌اپ
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-1.54-.49-3.52-1.64-5.72-3.79-2.13-2.1-3.13-3.91-3.59-5.15-.24-.65-.06-1.4.36-1.88.3-.33.69-.51 1.11-.51h.8c.26 0 .61-.04.94.73.35.82 1.14 2.53 1.23 2.71.14.29.18.63.03.94-.4.82-.87 1.08-.76 1.37.6 1.44 1.66 2.52 2.9 3.31.35.22.62.14.9-.14.33-.34.83-.86.95-1.16.13-.3.18-.52-.03-.88-.21-.36-.94-.94-1.34-1.24-.25-.19-.42-.46-.14-.99.27-.52.66-1.14.92-1.62.14-.3.08-.59-.07-.79-.15-.18-.75-1.11-.92-1.39-.26-.41-.53-.38-1-.38h-.38c-.25 0-.65.09-.99.46-1.14 1.11-1.66 2.93-.61 4.05 1.55 2.09 3.22 3.52 5.13 4.43.67.31 1.19.5 1.6.63.66.22 1.26.19 1.73.12.53-.08 1.64-.67 1.87-1.32z" />
              </svg>
            </button>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-taupe">
              <span>پرداخت امن هنگام تحویل</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span>۷ روز ضمانت بازگشت</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};