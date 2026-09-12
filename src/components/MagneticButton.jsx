import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MAGNET_SPRING = { type: 'spring', stiffness: 260, damping: 18, mass: 0.35 };

export const MagneticButton = ({
  children,
  className,
  onClick,
  strength = 0.22,
  cap = 9,
  ...rest
}) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setOffset({
      x: Math.max(-cap, Math.min(cap, dx)),
      y: Math.max(-cap / 1.6, Math.min(cap / 1.6, dy)),
    });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.button
      type="button"
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      animate={{ x: offset.x, y: offset.y }}
      transition={MAGNET_SPRING}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
};