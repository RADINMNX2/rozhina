import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const MAIN = 560;
const ECHO = 320;
const IDLE_MS = 1000;

const MAIN_BG = `radial-gradient(circle at center, transparent 55%, rgba(226,201,151,0.10) 66%, transparent 78%),
  radial-gradient(circle at center, rgba(226,201,151,0.30) 0%, rgba(226,201,151,0.16) 20%, rgba(196,164,124,0.07) 42%, rgba(226,201,151,0) 68%)`;
const ECHO_BG = `radial-gradient(circle at center, rgba(226,201,151,0.14) 0%, rgba(196,164,124,0.06) 38%, rgba(226,201,151,0) 64%)`;

export const CursorGlow = () => {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(FINE_POINTER);
    setEnabled(mql.matches);
    const onChange = (e) => setEnabled(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const opacity = useMotionValue(0);
  const mainX = useSpring(mx, { stiffness: 140, damping: 22, mass: 0.6 });
  const mainY = useSpring(my, { stiffness: 140, damping: 22, mass: 0.6 });
  const echoX = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.8 });
  const echoY = useSpring(my, { stiffness: 55, damping: 18, mass: 0.8 });
  const fade = useSpring(opacity, { stiffness: 120, damping: 24 });
  const lastMove = useRef(0);

  useEffect(() => {
    if (!enabled || reduced) return undefined;
    const onMove = (e) => {
      lastMove.current = performance.now();
      mx.set(e.clientX);
      my.set(e.clientY);
      opacity.set(1);
    };
    const tick = window.setInterval(() => {
      if (performance.now() - lastMove.current > IDLE_MS) opacity.set(0);
    }, 250);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearInterval(tick);
    };
  }, [enabled, reduced, mx, my, opacity]);

  if (reduced || !enabled) return null;

  return (
    <div id="cursor-glow" aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <motion.div
        className="absolute rounded-full will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: MAIN,
          height: MAIN,
          x: mainX,
          y: mainY,
          marginLeft: -MAIN / 2,
          marginTop: -MAIN / 2,
          opacity: fade,
          mixBlendMode: 'screen',
          background: MAIN_BG,
        }}
      />
      <motion.div
        className="absolute rounded-full will-change-transform"
        style={{
          left: 0,
          top: 0,
          width: ECHO,
          height: ECHO,
          x: echoX,
          y: echoY,
          marginLeft: -ECHO / 2,
          marginTop: -ECHO / 2,
          opacity: fade,
          background: ECHO_BG,
        }}
      />
    </div>
  );
};