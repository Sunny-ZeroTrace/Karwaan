import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { GalleryItem } from '../../data/gallery';
import { Photo } from './Photo';

interface Props {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const count = items.length;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onIndex((index + 1) % count);
      else if (e.key === 'ArrowLeft') onIndex((index - 1 + count) % count);
      else if (e.key === 'Tab') {
        const f = Array.from(panel.current?.querySelectorAll<HTMLElement>('button') ?? []);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, count, onClose, onIndex]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          ref={panel}
          className="lightbox theme-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
        >
          <button type="button" className="lightbox__close round-btn" onClick={onClose} aria-label="Close photo viewer" data-autofocus>
            <X size={22} aria-hidden="true" />
          </button>

          <figure className="lightbox__figure">
            <Photo {...item} tone={index} priority />
            <figcaption>
              <span>{item.caption}</span>
              <span className="lightbox__count" aria-live="polite">{index + 1} of {count}</span>
            </figcaption>
          </figure>

          <div className="lightbox__nav">
            <button type="button" className="round-btn" onClick={() => onIndex((index - 1 + count) % count)} aria-label="Previous photo">
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" className="round-btn" onClick={() => onIndex((index + 1) % count)} aria-label="Next photo">
              <ArrowRight size={22} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
