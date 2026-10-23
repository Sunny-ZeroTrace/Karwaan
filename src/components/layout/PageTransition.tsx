import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';

// Module-level so the "skip focus on first load" rule survives the keyed remount on every route change.
let hasMounted = false;

/**
 * Wraps each route. The old page fades out, the new page lifts in, a black curtain
 * rises off it, and keyboard focus moves to the new page. Reduced motion: instant swap.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const animate = hasMounted && !reduce;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!hasMounted) {
      hasMounted = true;
      return;
    }
    ref.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <motion.main
      id="main"
      ref={ref}
      tabIndex={-1}
      initial={animate ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {animate && (
        <motion.div
          className="curtain"
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
        />
      )}
      {children}
    </motion.main>
  );
}
