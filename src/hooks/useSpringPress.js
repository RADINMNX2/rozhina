import { useCallback, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Press feedback via transform-only scale.
 * Returns pointer handlers + a style object (undefined when reduced-motion).
 */
export function useSpringPress({ scale = 0.97, disabled = false } = {}) {
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  const onPointerDown = useCallback(() => {
    if (disabled) return;
    setPressed(true);
  }, [disabled]);

  const release = useCallback(() => setPressed(false), []);

  const style =
    reduced || disabled
      ? undefined
      : {
          transform: pressed ? `scale(${scale})` : 'scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        };

  return {
    onPointerDown,
    onPointerUp: release,
    onPointerLeave: release,
    onPointerCancel: release,
    style,
  };
}