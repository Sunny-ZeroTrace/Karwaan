import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/** Lifts a heading into view from behind a mask, once, when it enters the screen. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`mask ${className}`.trim()}>
      <motion.span
        className="mask__inner"
        initial={reduce ? false : { y: '108%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}
