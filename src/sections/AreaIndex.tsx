import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { areas } from '../data/areas';
import { Photo } from '../components/ui/Photo';
import { Scramble } from '../components/ui/Scramble';
import { useFinePointer } from '../hooks/useMediaQuery';

/**
 * Areas of impact as a numbered index. Hovering a row inverts it, and on devices with a mouse
 * a photo follows the cursor from row to row. On touch devices the rows simply stack.
 */
export function AreaIndex() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const showPreview = fine && !reduce;
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 28, mass: 0.6 });

  const onMove = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <div
      ref={box}
      className="area-index"
      onPointerMove={showPreview ? onMove : undefined}
      onPointerLeave={() => setActive(null)}
    >
      <ul>
        {areas.map((a, i) => (
          <li key={a.id} onPointerEnter={() => setActive(i)}>
            <Link to={`/work?area=${a.id}`} className="area-row">
              <span className="area-row__num mono">({String(i + 1).padStart(2, '0')})</span>
              <span className="area-row__name">{a.name}</span>
              <span className="area-row__summary">{a.summary}</span>
              <span className="area-row__go mono"><Scramble text="[explore]" /></span>
            </Link>
          </li>
        ))}
      </ul>

      {showPreview && (
        <motion.div className="area-index__preview" style={{ x: sx, y: sy }} aria-hidden="true">
          <AnimatePresence mode="wait">
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
              >
                <Photo
                  {...(areas[active].photo ?? { alt: `Photo for ${areas[active].name}`, ratio: '4/5' as const })}
                  tone={active + 1}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
