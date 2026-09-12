import { FilterSection } from './FilterSection';
import { ProductGrid } from './ProductGrid';
import { Reveal } from './motion/Reveal';

export const CollectionSection = ({
  products,
  fabric,
  setFabric,
  color,
  setColor,
  sort,
  setSort,
  onQuickView,
}) => (
  <section id="collection" className="relative scroll-mt-20 py-16 md:py-24">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(226,201,151,0.04),transparent_65%)]" />
    <div className="container-lux relative">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
            THE COLLECTION
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug text-pearl md:text-4xl">
            کالکشن شال و روسری روژینا
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-8 text-taupe">
            هر قطعه با دقت از الیاف طبیعی و پارچه‌های وارداتیِ انتخابی دوخته شده است.
          </p>
        </div>
      </Reveal>

      <div className="mt-12">
        <FilterSection
          fabric={fabric}
          setFabric={setFabric}
          color={color}
          setColor={setColor}
          sort={sort}
          setSort={setSort}
          count={products.length}
        />
      </div>

      <div className="mt-10 md:mt-12">
        <ProductGrid products={products} onQuickView={onQuickView} />
      </div>
    </div>
  </section>
);