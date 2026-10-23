import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { gallery } from '../data/gallery';
import { Photo } from '../components/ui/Photo';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';

/** Two rows of photographs that slide in opposite directions as the section scrolls past. Uses the first twelve gallery entries. */
export function GalleryRows() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['2%', '-26%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-26%', '2%']);
  const rows = [gallery.slice(0, 6), gallery.slice(6, 12)];

  return (
    <section ref={ref} className="band gallery-rows" aria-labelledby="gallery-title">
      <div className="wrap">
        <div className="rowhead"><span>(Gallery)</span><span>05</span></div>
        <div className="gallery-rows__head">
          <h2 id="gallery-title" className="display-l"><Reveal>Moments from the Karwaan</Reveal></h2>
          <Button to="/gallery" variant="line">Open the gallery</Button>
        </div>
      </div>

      {rows.map((items, r) => (
        <div className={`rail ${reduce ? 'rail--static' : ''}`} key={r}>
          <motion.ul className="rail__list" style={reduce ? undefined : { x: r === 0 ? x1 : x2 }}>
            {items.map((it, i) => (
              <li key={it.id} className="rail__item">
                <Link to="/gallery" tabIndex={r === 0 ? 0 : -1} aria-label={`Open the gallery: ${it.caption}`} data-cursor="view">
                  <Photo {...it} ratio={i % 2 ? '4/5' : '3/2'} tone={i + r} />
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>
      ))}
      <p className="wrap note">Placeholder images. Real Foundation photographs will replace them.</p>
    </section>
  );
}
