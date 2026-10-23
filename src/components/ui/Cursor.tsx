import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useFinePointer } from '../../hooks/useMediaQuery';

/**
 * A small follower ring for mouse users. It grows and shows a word when the pointer is over
 * an element with data-cursor="word" (for example "view" or "play"). The real cursor stays visible.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!fine || reduce) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setShown(true);
      const el = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      setLabel(el?.dataset.cursor ?? null);
    };
    const leave = () => setShown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;
  return (
    <motion.div className={`cursor ${label ? 'cursor--label' : ''} ${shown ? 'cursor--on' : ''}`} style={{ x: sx, y: sy }} aria-hidden="true">
      <span>{label}</span>
    </motion.div>
  );
}
