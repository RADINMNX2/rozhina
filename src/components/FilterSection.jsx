import { Check, RotateCcw } from 'lucide-react';
import { FABRICS, COLORS } from '../data/productsData';
import { toFa } from '../utils/format';

const SORTS = [
  { value: 'featured', label: 'پربازدیدترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
];

export const FilterSection = ({ fabric, setFabric, color, setColor, sort, setSort, count }) => (
  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
      {['همه', ...FABRICS].map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setFabric(f)}
          className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
            fabric === f
              ? 'border-espresso bg-espresso text-gold shadow-[0_8px_20px_-8px_rgba(28,25,23,0.4)]'
              : 'border-espresso/15 bg-transparent text-espresso/70 hover:border-gold hover:text-espresso'
          }`}
        >
          {f === 'همه' ? 'همه' : f}
        </button>
      ))}
    </div>

    <div className="flex items-center justify-between gap-6 border-t border-espresso/[0.07] pt-5 md:border-t-0 md:pt-0">
      <div className="flex items-center gap-2.5" role="group" aria-label="فیلتر رنگ">
        {color && (
          <button
            type="button"
            onClick={() => setColor(null)}
            className="flex h-8 items-center gap-1.5 rounded-full border border-espresso/15 px-3 text-[11px] font-medium text-espresso/60 transition-colors hover:border-gold hover:text-espresso"
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
              className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                isActive ? 'ring-2 ring-espresso ring-offset-2 ring-offset-alabaster' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {isActive && (
                <Check size={13} strokeWidth={3} className="text-espresso mix-blend-difference" />
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
            className="appearance-none rounded-full border border-espresso/15 bg-transparent py-2.5 pl-8 pr-4 text-[13px] font-medium text-espresso outline-none transition-colors hover:border-gold focus:border-gold"
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