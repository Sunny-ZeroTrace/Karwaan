import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useFinePointer } from '../../hooks/useMediaQuery';

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789#/+*';

/**
 * Text that scrambles into place when its parent link or button is hovered or focused.
 * Use it on monospace text only (fixed glyph widths, so nothing shifts). Screen readers get the real text.
 */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  const fine = useFinePointer();
  const reduce = useReducedMotion();

  useEffect(() => setOut(text), [text]);

  useEffect(() => {
    if (!fine || reduce) return;
    const host = ref.current?.closest('a, button') as HTMLElement | null;
    if (!host) return;
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const duration = 420;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const done = Math.floor(p * text.length);
        setOut(
          text
            .split('')
            .map((c, i) => (c === ' ' || i < done ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        );
        if (p < 1) raf = requestAnimationFrame(tick);
        else setOut(text);
      };
      raf = requestAnimationFrame(tick);
    };
    host.addEventListener('pointerenter', run);
    host.addEventListener('focus', run);
    return () => {
      host.removeEventListener('pointerenter', run);
      host.removeEventListener('focus', run);
      cancelAnimationFrame(raf);
    };
  }, [fine, reduce, text]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{out}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
