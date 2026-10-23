import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

/** Clips its child and drifts it slowly against the scroll. The child should fill 100% height. */
export function Parallax({ children, amount = 7, className = '' }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={`parallax ${className}`.trim()}>
      <motion.div className="parallax__inner" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
