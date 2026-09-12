import { SearchX } from 'lucide-react';
import { RozhinaProductCard } from './RozhinaProductCard';
import { Stagger, StaggerItem } from './motion/Reveal';

export const ProductGrid = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-taupe">
          <SearchX size={26} strokeWidth={1.5} />
        </span>
        <h3 className="text-lg font-bold text-pearl">محصولی یافت نشد</h3>
        <p className="max-w-sm text-sm leading-7 text-taupe">
          فیلترها را تغییر دهید یا عبارت دیگری را جستجو کنید تا زیبایی کالکشن روژینا را ببینید.
        </p>
      </div>
    );
  }

  return (
    <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-7 lg:grid-cols-3 md:gap-y-14">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <RozhinaProductCard product={product} />
        </StaggerItem>
      ))}
    </Stagger>
  );
};