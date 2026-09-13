import { useCallback } from 'react';
import { SearchX } from 'lucide-react';
import { RozhinaProductCard } from './RozhinaProductCard';
import { Stagger, StaggerItem } from './motion/Reveal';
import { useContent } from '../context/ContentContext';

export const ProductGrid = ({ products, onQuickView }) => {
  const { content } = useContent();
  // Stable identity so React.memo'd cards skip re-renders on parent updates.
  const handleQuickView = useCallback(
    (product) => onQuickView?.(product),
    [onQuickView],
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-taupe">
          <SearchX size={26} strokeWidth={1.5} />
        </span>
        <h3 className="text-lg font-bold text-pearl">{content.productGrid.emptyTitle}</h3>
        <p className="max-w-sm text-sm leading-7 text-taupe">
          {content.productGrid.emptyText}
        </p>
      </div>
    );
  }

  return (
    <Stagger className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 md:gap-y-12 lg:grid-cols-3 lg:gap-x-7 xl:grid-cols-4">
      {products.map((product) => (
        <StaggerItem key={product.id}>
          <RozhinaProductCard product={product} onQuickView={handleQuickView} />
        </StaggerItem>
      ))}
    </Stagger>
  );
};