import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterSection, SORTS } from './FilterSection';
import { FilterSheet } from './FilterSheet';
import { ProductGrid } from './ProductGrid';
import { Reveal } from './motion/Reveal';
import { useContent } from '../context/ContentContext';

export const CollectionSection = ({
  products,
  fabric,
  setFabric,
  color,
  setColor,
  sort,
  setSort,
  onQuickView,
}) => {
  const { content } = useContent();
  const [sheetOpen, setSheetOpen] = useState(false);
  const filtersActive = fabric !== 'همه' || !!color;

  return (
    <section id="collection" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(226,201,151,0.04),transparent_65%)]" />
      <div className="container-lux relative">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="eyebrow inline-flex items-center gap-3">
              <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
              {content.collection.eyebrow}
              <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-snug text-pearl md:text-4xl">
              {content.collection.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-8 text-taupe">
              {content.collection.subtitle}
            </p>
          </div>
        </Reveal>

        {/* Mobile / tablet: compact control bar */}
        <div className="mt-10 flex items-center justify-between gap-3 md:mt-12 lg:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            aria-haspopup="dialog"
            className="focus-ring flex min-h-11 items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-4 text-xs font-bold text-gold transition-[transform,background-color,color] duration-300 hover:bg-gold/10 active:scale-[0.97]"
          >
            <SlidersHorizontal size={14} strokeWidth={1.8} />
            فیلترها
            {filtersActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(226,201,151,0.8)]" />
            )}
          </button>
          <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSort(s.value)}
                aria-pressed={sort === s.value}
                className={`focus-ring whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] font-bold transition-[transform,background-color,border-color,color] duration-300 active:scale-[0.96] ${
                  sort === s.value
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/10 text-pearl/60 hover:border-gold/30 hover:text-pearl'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: sticky filter rail + grid */}
        <div className="mt-10 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-12 md:mt-12">
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:pt-2">
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 transition-[border-color] duration-300 hover:border-gold/20">
              <FilterSection
                variant="panel"
                fabric={fabric}
                setFabric={setFabric}
                color={color}
                setColor={setColor}
                sort={sort}
                setSort={setSort}
                count={products.length}
              />
            </div>
          </aside>

          <div className="mt-8 lg:mt-0">
            <ProductGrid products={products} onQuickView={onQuickView} />
          </div>
        </div>

        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          fabric={fabric}
          setFabric={setFabric}
          color={color}
          setColor={setColor}
          sort={sort}
          setSort={setSort}
          count={products.length}
        />
      </div>
    </section>
  );
};