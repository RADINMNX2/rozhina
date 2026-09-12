import { useRef } from 'react';

export const SpotlightCard = ({ children, className, radius = 400, as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMouseMove}
      className={className}
      style={{ '--spot-x': '50%', '--spot-y': '50%' }}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at var(--spot-x) var(--spot-y), rgba(226,201,151,0.16), transparent 42%)`,
        }}
        aria-hidden
      />
      {children}
    </Tag>
  );
};