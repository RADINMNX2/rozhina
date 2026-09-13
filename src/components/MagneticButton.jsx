import { useRef, useState } from 'react';
import { useRafThrottle } from '../hooks/useRafThrottle';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSpringPress } from '../hooks/useSpringPress';

export const MagneticButton = ({
  children,
  className,
  onClick,
  strength = 0.22,
  cap = 9,
  disabled = false,
  ...rest
}) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [canHover] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );
  const press = useSpringPress({ scale: 0.97, disabled });

  // Zero re-renders: offset is written to CSS vars inside a rAF tick.
  const onMouseMove = useRafThrottle((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    el.style.setProperty('--mx', `${Math.max(-cap, Math.min(cap, dx))}px`);
    el.style.setProperty('--my', `${Math.max(-cap / 1.6, Math.min(cap / 1.6, dy))}px`);
  });

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mx', '0px');
    el.style.setProperty('--my', '0px');
  };

  const magnetic = canHover && !reduced;

  return (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      onMouseMove={magnetic ? onMouseMove : undefined}
      onMouseLeave={magnetic ? reset : undefined}
      {...press}
      style={
        reduced
          ? undefined
          : {
              transform: `translate3d(var(--mx, 0px), var(--my, 0px), 0) ${
                press.style?.transform ?? ''
              }`,
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }
      }
      className={className}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};