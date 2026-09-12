import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState([]);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isInWishlist = useCallback((id) => ids.includes(id), [ids]);

  const value = useMemo(
    () => ({ ids, count: ids.length, toggle, isInWishlist }),
    [ids, toggle, isInWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};