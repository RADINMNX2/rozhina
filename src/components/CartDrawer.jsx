import { useState } from 'react';
import { CreditCard, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useContent } from '../context/ContentContext';
import { formatPrice, toFa } from '../utils/format';
import { t } from '../utils/text';
import { buildOrderMessage, buildWhatsAppLink } from '../utils/whatsapp';
import { MagneticButton } from './MagneticButton';
import { ModalShell } from './ModalShell';
import { withImageFallback } from '../utils/imageFallback';

export const CartDrawer = ({ open, onClose }) => {
  const { items, totalItems, subtotal, increment, decrement, removeItem, setColor } = useCart();
  const { settings } = useSettings();
  const { content } = useContent();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const threshold = Math.max(Number(settings.freeShippingThreshold) || 0, 0);
  const paymentBase = String(settings.paymentUrl || '').replace(/\/+$/, '');

  const remaining = Math.max(threshold - subtotal, 0);
  const progress = threshold > 0 ? Math.min((subtotal / threshold) * 100, 100) : 100;
  const handleCheckout = () => {
    window.open(
      buildWhatsAppLink(buildOrderMessage(items, content), settings.whatsapp),
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handlePay = async () => {
    if (!paymentBase || paying) return;
    setPaying(true);
    setPayError('');
    try {
      const desc = items.map((i) => `${i.product.name} × ${i.qty}`).join('، ');
      const res = await fetch(`${paymentBase}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(subtotal),
          order_id: `R-${Date.now()}`,
          name: 'مشتری روژینا',
          desc,
        }),
      });
      const data = await res.json();
      if (data.ok && data.link) {
        window.open(data.link, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        setPayError(String(data?.error || content.cart.payError));
      }
    } catch {
      setPayError(content.cart.payError);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      label={content.cart.title}
      showHandle
      footer={
        items.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-taupe">{content.cart.subtotal}</span>
              <span className="text-lg font-extrabold tracking-tight text-pearl">
                {formatPrice(subtotal)}
                <span className="mr-1.5 text-xs font-normal text-taupe">تومان</span>
              </span>
            </div>
            <p className="mt-1 text-[11px] text-taupe">
              {content.cart.checkoutNote}
            </p>

            <MagneticButton
              onClick={handleCheckout}
              className="btn-gold btn-shimmer mt-4 w-full"
            >
              {content.cart.checkoutButton}
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-1.54-.49-3.52-1.64-5.72-3.79-2.13-2.1-3.13-3.91-3.59-5.15-.24-.65-.06-1.4.36-1.88.3-.33.69-.51 1.11-.51h.8c.26 0 .61-.04.94.73.35.82 1.14 2.53 1.23 2.71.14.29.18.63.03.94-.4.82-.87 1.08-.76 1.37.6 1.44 1.66 2.52 2.9 3.31.35.22.62.14.9-.14.33-.34.83-.86.95-1.16.13-.3.18-.52-.03-.88-.21-.36-.94-.94-1.34-1.24-.25-.19-.42-.46-.14-.99.27-.52.66-1.14.92-1.62.14-.3.08-.59-.07-.79-.15-.18-.75-1.11-.92-1.39-.26-.41-.53-.38-1-.38h-.38c-.25 0-.65.09-.99.46-1.14 1.11-1.66 2.93-.61 4.05 1.55 2.09 3.22 3.52 5.13 4.43.67.31 1.19.5 1.6.63.66.22 1.26.19 1.73.12.53-.08 1.64-.67 1.87-1.32z" />
              </svg>
            </MagneticButton>

            <MagneticButton
              onClick={handlePay}
              disabled={!paymentBase || paying}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 bg-transparent px-6 py-4 text-sm font-bold text-gold transition-[background-color,border-color,transform] duration-300 hover:border-gold/60 hover:bg-gold/5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying ? 'در حال اتصال…' : (
                <>
                  <CreditCard size={16} strokeWidth={1.8} />
                  {content.cart.payOnline}
                </>
              )}
            </MagneticButton>
            {payError && (
              <p className="mt-2 text-center text-[11px] leading-5 text-terracotta">{payError}</p>
            )}

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-taupe transition-transform duration-300 hover:-translate-y-0.5">
              <span>{content.cart.trustBadge1}</span>
              <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(226,201,151,0.7)]" />
              <span>{content.cart.trustBadge2}</span>
            </div>
          </div>
        )
      }
    >
      <div className="modal-header">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-gold to-bronze text-obsidian shadow-gold-glow">
            <ShoppingBag size={17} strokeWidth={1.8} />
          </span>
          <h2 className="text-base font-bold text-pearl">
            {t(content.cart.title)} <span className="text-taupe">({toFa(totalItems)})</span>
          </h2>
        </div>
        <button
          type="button"
          aria-label="بستن سبد"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-pearl/70 transition-[transform,background-color,color] duration-300 hover:rotate-90 hover:bg-white/5 hover:text-pearl active:scale-90 focus-ring"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Shipping progress */}
      <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-4 md:px-6">
        <p className="text-xs leading-6 text-pearl/75">
          {remaining > 0 ? (
            t(content.cart.freeShippingLeft, { total: formatPrice(remaining) })
          ) : (
            <span className="font-bold text-gold">{content.cart.freeShippingActive}</span>
          )}
        </p>
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-full origin-right rounded-full bg-gradient-to-r from-bronze via-gold to-gold shadow-[0_0_10px_rgba(226,201,151,0.6)] transition-transform duration-700 ease-out"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 md:px-6">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-taupe">
              <ShoppingBag size={24} strokeWidth={1.4} />
            </span>
            <div>
              <p className="text-sm font-bold text-pearl">{content.cart.emptyTitle}</p>
              <p className="mt-1 text-xs leading-6 text-taupe">
                {content.cart.emptySubtitle}
              </p>
            </div>
            <a href="#collection" onClick={onClose} className="btn-gold !py-3 text-xs">
              {content.cart.viewCollection}
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {items.map(({ product, qty, colorHex }) => (
              <li key={product.id} className="flex gap-4 py-5">
                <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg border border-white/5 bg-white/[0.02]">
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
                      <h3 className="text-[13px] font-bold leading-6 text-pearl">
                        {product.name}
                      </h3>
                      {product.colors.length > 1 && (
                        <div className="mt-1 flex items-center gap-1.5">
                          {product.colors.map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              aria-label={`رنگ ${c.label}`}
                              onClick={() => setColor(product.id, c.hex)}
                              className={`h-4 w-4 rounded-full transition-[transform,box-shadow] duration-300 ${
                                colorHex === c.hex
                                  ? 'ring-2 ring-gold ring-offset-1 ring-offset-[#131211] shadow-dot-glow'
                                  : 'ring-1 ring-inset ring-white/15 hover:scale-110'
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
                      className="text-taupe/60 transition-colors hover:text-terracotta active:scale-90 focus-ring rounded-full"
                    >
                      <Trash2 size={15} strokeWidth={1.6} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.02]">
                      <button
                        type="button"
                        aria-label="افزایش تعداد"
                        onClick={() => increment(product.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-pearl/80 transition-colors hover:text-gold active:scale-90"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </button>
                      <span className="min-w-6 text-center text-xs font-bold text-pearl">
                        {toFa(qty)}
                      </span>
                      <button
                        type="button"
                        aria-label="کاهش تعداد"
                        onClick={() => decrement(product.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-pearl/80 transition-colors hover:text-gold active:scale-90"
                      >
                        <Minus size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold tracking-tight text-gold">
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
    </ModalShell>
  );
};