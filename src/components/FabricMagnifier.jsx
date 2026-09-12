import { useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { withImageFallback } from '../utils/imageFallback';

const hiRes = (src) => src.replace(/w=\d+/, 'w=1600');

export const FabricMagnifier = ({ src, alt, zoom = 2.5, lensSize = 168, className }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPos({
      mx,
      my,
      w: rect.width,
      h: rect.height,
    });
  };

  const lensStyle = pos
    ? {
        width: lensSize,
        height: lensSize,
        left: pos.mx,
        top: pos.my,
        backgroundImage: `url(${hiRes(src)})`,
        backgroundSize: `${pos.w * zoom}px ${pos.h * zoom}px`,
        backgroundPosition: `${-pos.mx * zoom + lensSize / 2}px ${-pos.my * zoom + lensSize / 2}px`,
      }
    : undefined;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group/mag relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] will-change-transform ${className ?? ''}`}
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

      {pos && hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40 shadow-[0_0_0_1px_rgba(226,201,151,0.15),0_0_30px_rgba(226,201,151,0.2)]"
          style={lensStyle}
          role="img"
          aria-label="نمای بزرگ‌شدهٔ بافت"
        />
      )}

      <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian/70 px-3 py-1.5 text-[10px] font-medium text-pearl/80 backdrop-blur-md">
        <ZoomIn size={12} className="text-gold" strokeWidth={2} />
        بافت ۲.۵ برابر
      </span>
    </div>
  );
};