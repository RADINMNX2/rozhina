import { useEffect } from 'react';

/**
 * Body scroll lock with scrollbar-gutter stability.
 * Compensates for scrollbar width so layout does not shift; restores on unlock.
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}