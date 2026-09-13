import { useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { withImageFallback } from '../utils/imageFallback';
import { useRafThrottle } from '../hooks/useRafThrottle';

const hiRes = (src) => src.replace(/w=\d+/, 'w=1600');

export const FabricMagnifier = ({ src, alt, zoom = 2.5, lensSize = 168, className }) => {
  const ref = useRef(null);
  const lensRef = useRef(null);
  const [hover, setHover] = useState(false);

  // Zero re-renders: lens position + zoomed background are written straight
  // to the DOM inside a single rAF tick via CSS custom properties.
  const onMove = useRafThrottle((e) => {
    const el = ref.current;
    const lens = lensRef.current;
    if (!el || !lens) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    el.style.setProperty('--lens-x', `${mx}px`);
    el.style.setProperty('--lens-y', `${my}px`);
    lens.style.backgroundImage = `url(${hiRes(src)})`;
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    lens.style.backgroundPosition = `${-mx * zoom + lensSize / 2}px ${-my * zoom + lensSize / 2}px`;
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group/mag relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] ${
        hover ? 'will-change-transform' : ''
      } ${className ?? ''}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/mag:scale-[1.03]"
        onError={withImageFallback}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/35 via-transparent to-obsidian/10"
        aria-hidden
      />

      {hover && (
        <div
          ref={lensRef}
          className="pointer-events-none absolute left-0 top-0 z-10 rounded-full border border-gold/40 shadow-[0_0_0_1px_rgba(226,201,151,0.15),0_0_30px_rgba(226,201,151,0.2)]"
          style={{
            width: lensSize,
            height: lensSize,
            transform:
              'translate3d(calc(var(--lens-x, 50%) - 50%), calc(var(--lens-y, 50%) - 50%), 0)',
          }}
          role="img"
          aria-label="نمای بزرگ‌شدهٔ بافت"
        />
      )}

      <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian/70 px-3 py-1.5 text-[10px] font-medium text-pearl/80">
        <ZoomIn size={12} className="text-gold" strokeWidth={2} />
        بافت ۲.۵ برابر
      </span>
    </div>
  );
};