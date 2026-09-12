import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import PRODUCTS from '../data/productsData';
import { PLACEHOLDER_IMAGE } from '../data/productsData';
import { fetchRemoteJs, notifyRemoteAttempt } from '../utils/remote';

const cloneQueue = (list) =>
  list.map((p) => ({
    ...p,
    colors: [...(p.colors ?? [])],
    badges: [...(p.badges ?? [])],
    images: [...(p.images ?? [])],
  }));

const clampQuantity = (q) => Math.max(0, Math.min(Number(q) || 0, 99));

export const normalizeProduct = (data, id) => {
  const name = String(data?.name ?? '').trim();
  return {
    id: Number(id),
    name,
    enName: String(data?.enName ?? '').trim(),
    code: String(data?.code ?? '').trim(),
    fabric: String(data?.fabric ?? '').trim() || 'ابریشم',
    dimensions: String(data?.dimensions ?? '').trim(),
    colors:
      Array.isArray(data?.colors) && data.colors.some((c) => c?.label || c?.hex)
        ? data.colors.map((c) => ({
            label: String(c?.label ?? '').trim() || 'کلاسیک',
            hex: String(c?.hex ?? '').trim() || '#E2C997',
          }))
        : [{ label: 'کلاسیک', hex: '#E2C997' }],
    price: Math.max(Number(data?.price) || 0, 0),
    oldPrice: data?.oldPrice ? Math.max(Number(data.oldPrice) || 0, 0) : null,
    quantity: clampQuantity(data?.quantity),
    inStock: data?.inStock !== false,
    badges: Array.isArray(data?.badges) ? data.badges.map(String) : [],
    description: String(data?.description ?? '').trim(),
    images:
      Array.isArray(data?.images) && data.images.some((u) => String(u).trim())
        ? data.images.map((u) => String(u).trim())
        : [PLACEHOLDER_IMAGE],
  };
};

const ProductsContext = createContext(null);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(() => cloneQueue(PRODUCTS));

  useEffect(() => {
    let alive = true;
    fetchRemoteJs(
      'src/data/productsData.js',
      '({ PLACEHOLDER_IMAGE, FABRICS, COLORS, badgeStyle, PRODUCTS })',
    )
      .then((remote) => {
        if (!alive) return;
        if (Array.isArray(remote?.PRODUCTS) && remote.PRODUCTS.length > 0) {
          setProducts(remote.PRODUCTS.map((p, i) => normalizeProduct(p, p.id ?? i + 1)));
        }
      })
      .catch(() => {})
      .finally(() => notifyRemoteAttempt());
    return () => {
      alive = false;
    };
  }, []);

  const productIndex = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const getProduct = useCallback((id) => productIndex.get(id), [productIndex]);

  const addProduct = useCallback((data) => {
    const nextId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
    const created = normalizeProduct(data, nextId);
    setProducts((prev) => [...prev, created]);
    return created;
  }, [products]);

  const updateProduct = useCallback((id, data) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...normalizeProduct(data, id), id } : p)),
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const importProducts = useCallback((list) => {
    if (!Array.isArray(list)) return;
    setProducts(list.map((p, i) => normalizeProduct(p, p.id ?? i + 1)));
  }, []);

  const resetToDefaults = useCallback(() => setProducts(cloneQueue(PRODUCTS)), []);

  const value = useMemo(
    () => ({
      products,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      importProducts,
      resetToDefaults,
    }),
    [products, getProduct, addProduct, updateProduct, deleteProduct, importProducts, resetToDefaults],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};