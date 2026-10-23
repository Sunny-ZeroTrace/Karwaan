import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  );
}

function AnimatedWords({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 88%', 'end 55%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
      ))}
    </p>
  );
}

/**
 * Text that fills in word by word as it scrolls into view.
 * With reduced motion enabled it renders as ordinary, fully visible text.
 */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  return reduce ? <p className={className}>{text}</p> : <AnimatedWords text={text} className={className} />;
}
