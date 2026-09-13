import { useEffect, useRef, useState } from 'react';
import { useRafThrottle } from '../hooks/useRafThrottle';

export const SpotlightCard = ({ children, className, radius = 260, as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  const [hoverable, setHoverable] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHoverable(mql.matches);
    const handler = (e) => setHoverable(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const onMouseMove = useRafThrottle((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  });

  return (
    <Tag
      ref={ref}
      onMouseMove={hoverable ? onMouseMove : undefined}
      className={className}
      style={{ '--spot-x': '50%', '--spot-y': '50%' }}
      {...rest}
    >
      {hoverable && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:will-change-opacity"
          style={{
            background: `radial-gradient(${radius}px circle at var(--spot-x) var(--spot-y), rgba(226,201,151,0.16), transparent 42%)`,
          }}
          aria-hidden
        />
      )}
      {children}
    </Tag>
  );
};