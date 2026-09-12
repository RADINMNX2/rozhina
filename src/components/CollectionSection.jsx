import { FilterSection } from './FilterSection';
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
};