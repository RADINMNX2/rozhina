import { useMemo } from 'react';
import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { COLORS } from '../data/productsData';
import { useProducts } from '../context/ProductsContext';
import { toFa } from '../utils/format';

export const SORTS = [
  { value: 'featured', label: 'پربازدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
];

export const FilterSection = ({
  variant = 'row',
  fabric,
  setFabric,
  color,
  setColor,
  sort,
  setSort,
  count,
}) => {
  const { products } = useProducts();

  const fabrics = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const p of products) {
      const f = p.fabric?.trim();
      if (f && !seen.has(f)) {
        seen.add(f);
        list.push(f);
      }
    }
    return list;
  }, [products]);

  const fabricList = ['همه', ...fabrics];
  const reset = () => {
    setFabric('همه');
    setColor(null);
  };

  if (variant === 'panel') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <span className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-taupe">
            <SlidersHorizontal size={13} strokeWidth={1.8} className="text-gold" />
            جنس پارچه
          </span>
          <div className="mt-3 flex flex-col gap-1.5">
            {fabricList.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFabric(f)}
                aria-pressed={fabric === f}
                className={`focus-ring min-h-11 rounded-xl border px-4 text-[13px] font-medium transition-[transform,background-color,border-color,color] duration-300 active:scale-[0.99] ${
                  fabric === f
                    ? 'border-gold/35 bg-gold/10 text-gold'
                    : 'border-white/10 text-pearl/65 hover:border-gold/30 hover:text-pearl'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold tracking-wide text-taupe">رنگ</span>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {color && (
              <button
                type="button"
                onClick={() => setColor(null)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[11px] font-medium text-pearl/60 transition-colors hover:border-gold/40 hover:text-pearl active:scale-[0.97] focus-ring"
                aria-label="حذف فیلتر رنگ"
              >
                <RotateCcw size={11} strokeWidth={2} />
                همه
              </button>
            )}
            {COLORS.map((c) => {
              const isActive = color === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  aria-label={`فیلتر رنگ ${c.label}`}
                  aria-pressed={isActive}
                  onClick={() => setColor(isActive ? null : c.hex)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-[transform,box-shadow] duration-300 focus-ring ${
                    isActive
                      ? 'ring-2 ring-gold shadow-dot-glow ring-offset-2 ring-offset-[#131211]'
                      : 'ring-1 ring-inset ring-white/15 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isActive && (
                    <Check size={13} strokeWidth={3} className="text-white mix-blend-difference" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
          <span className="text-xs text-taupe">نمایش {toFa(count)} محصول</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-full border border-white/10 bg-[#0F0E0D] py-2.5 pl-8 pr-4 text-[13px] font-medium text-pearl outline-none transition-colors hover:border-gold/40 focus:border-gold/60 focus-ring"
              aria-label="مرتب‌سازی محصولات"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
        {fabricList.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFabric(f)}
            className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[13px] font-medium transition-[transform,box-shadow,border-color,background-color] duration-300 active:scale-[0.97] focus-ring ${
              fabric === f
                ? 'border-gold/35 bg-gold/10 text-gold shadow-[0_8px_24px_-8px_rgba(226,201,151,0.45)]'
                : 'border-white/10 bg-transparent text-pearl/60 hover:border-gold/40 hover:text-pearl'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-6 border-t border-white/[0.06] pt-5 md:border-t-0 md:pt-0">
        <div className="flex items-center gap-2.5" role="group" aria-label="فیلتر رنگ">
          {color && (
            <button
              type="button"
              onClick={() => setColor(null)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-[11px] font-medium text-pearl/60 transition-colors hover:border-gold/40 hover:text-pearl active:scale-[0.97] focus-ring"
              aria-label="حذف فیلتر رنگ"
            >
              <RotateCcw size={11} strokeWidth={2} />
              همه
            </button>
          )}
          {COLORS.map((c) => {
            const isActive = color === c.hex;
            return (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                aria-label={`فیلتر رنگ ${c.label}`}
                aria-pressed={isActive}
                onClick={() => setColor(isActive ? null : c.hex)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-[transform,box-shadow] duration-300 focus-ring ${
                  isActive
                    ? 'ring-2 ring-gold shadow-dot-glow ring-offset-2 ring-offset-obsidian'
                    : 'ring-1 ring-inset ring-white/15 hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isActive && (
                  <Check size={13} strokeWidth={3} className="text-white mix-blend-difference" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-taupe sm:block">نمایش {toFa(count)} محصول</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-full border border-white/10 bg-[#0F0E0D]/90 py-2.5 pl-8 pr-4 text-[13px] font-medium text-pearl outline-none transition-colors hover:border-gold/40 focus:border-gold/60 focus-ring"
              aria-label="مرتب‌سازی محصولات"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};