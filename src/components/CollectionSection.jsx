import { FilterSection } from './FilterSection';
import { ProductGrid } from './ProductGrid';

export const CollectionSection = ({
  products,
  fabric,
  setFabric,
  color,
  setColor,
  sort,
  setSort,
}) => (
  <section id="collection" className="scroll-mt-20 py-16 md:py-24">
    <div className="container-lux">
      <div className="flex flex-col items-center text-center">
        <span className="eyebrow inline-flex items-center gap-3">
          <span className="h-px w-8 bg-gold" />
          THE COLLECTION
          <span className="h-px w-8 bg-gold" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold leading-snug text-espresso md:text-4xl">
          کالکشن شال و روسری روژینا
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-8 text-taupe">
          هر قطعه با دقت از الیاف طبیعی و پارچه‌های وارداتیِ انتخابی دوخته شده است.
        </p>
      </div>

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
        <ProductGrid products={products} />
      </div>
    </div>
  </section>
);