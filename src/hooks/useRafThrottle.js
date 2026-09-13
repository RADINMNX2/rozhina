import { useEffect, useRef } from 'react';

/**
 * rAF-scheduled throttle: trailing call wins, cancelled on unmount.
 * Keeps pointermove handlers at compositor frame rate with zero re-renders.
 */
export function useRafThrottle(fn) {
  const rafRef = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const throttled = useRef((...args) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      fnRef.current(...args);
    });
  }).current;

  return throttled;
}