import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { PRODUCTS } from '../data/productsData';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = useCallback((id, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i,
        );
      }
      const product = PRODUCTS.find((p) => p.id === id);
      return [...prev, { id, qty, colorHex: product?.colors?.[0]?.hex }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const increment = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i)),
    );
  }, []);

  const decrement = useCallback((id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(i.qty - 1, 1) } : i)),
    );
  }, []);

  const setColor = useCallback((id, colorHex) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, colorHex } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const detail = useMemo(
    () =>
      items
        .map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) }))
        .filter((i) => Boolean(i.product)),
    [items],
  );

  const totalItems = useMemo(() => detail.reduce((sum, i) => sum + i.qty, 0), [detail]);

  const subtotal = useMemo(
    () => detail.reduce((sum, i) => sum + i.qty * i.product.price, 0),
    [detail],
  );

  const value = useMemo(
    () => ({
      items: detail,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      increment,
      decrement,
      setColor,
      clear,
    }),
    [detail, totalItems, subtotal, addItem, removeItem, increment, decrement, setColor, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};