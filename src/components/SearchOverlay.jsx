import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useContent } from '../context/ContentContext';
import { formatPrice, toFa } from '../utils/format';
import { t } from '../utils/text';
import { withImageFallback } from '../utils/imageFallback';

export const SearchOverlay = ({ open, onClose, onSelect }) => {
  const { products } = useProducts();
  const { content } = useContent();
  const c = content.search ?? {};
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return products.filter(
      (p) => p.name.includes(q) || p.enName.toLowerCase().includes(q.toLowerCase()) || p.fabric.includes(q),
    );
  }, [query, products]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-obsidian/[0.97] backdrop-blur-xl transition-opacity duration-500 ${
        open ? 'animate-fade-in opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-label="جستجو در کالکشن"
      onClick={onClose}
    >
      <div
        className="container-lux mx-auto flex max-h-full flex-col py-16 md:py-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-4 border-b-2 border-white/10 pb-4 transition-colors duration-300 focus-within:border-gold/60">
          <Search size={22} strokeWidth={1.5} className="text-gold" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder={c.placeholder}
            className="w-full bg-transparent text-lg font-medium text-pearl outline-none placeholder:text-taupe/60 md:text-xl"
          />
          <button
            type="button"
            aria-label="بستن جستجو"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pearl/70 transition-colors hover:bg-white/5 hover:text-pearl active:scale-95"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mx-auto mt-8 w-full max-w-2xl overflow-y-auto">
          {query.trim() === '' ? (
            <p className="py-10 text-center text-sm leading-7 text-taupe">
              {c.hint}
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-taupe">
              {t(c.noResults, { q: query })}
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelect(product);
                    }}
                    className="flex w-full items-center gap-4 rounded-lg py-4 text-right transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-md border border-white/5 bg-white/[0.02]">
                      <img
                        src={product.images[0]}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={withImageFallback}
                      />
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-sm font-bold text-pearl">{product.name}</span>
                      <span className="mt-1 text-[11px] text-taupe">{product.fabric}</span>
                    </span>
                    <span className="text-sm font-extrabold tracking-tight text-gold">
                      {formatPrice(product.price)}
                      <span className="mr-1 text-[10px] font-normal text-taupe">تومان</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-auto pt-6 text-center text-[11px] text-taupe">
          {t(c.resultCount, { n: toFa(products.length) })}
        </p>
      </div>
    </div>
  );
};