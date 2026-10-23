import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { site } from '../../data/site';
import { Clock } from '../ui/Clock';
import { InstagramIcon } from '../ui/Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  /** The button that opened the menu; focus returns to it on close. */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({ open, onClose, returnFocusTo }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const trigger = returnFocusTo.current;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href]') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Keep Tab inside the menu and the toggle button that closes it.
      const items = [...focusables(), ...(trigger ? [trigger] : [])];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      trigger?.focus();
    };
  }, [open, onClose, returnFocusTo]);

  const items = [{ to: '/', label: 'Home' }, ...site.nav, { to: site.cta.to, label: site.cta.label }];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panel}
          className="menu theme-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: reduce ? 0.15 : 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav className="menu__nav" aria-label="Main">
            <ul>
              {items.map((item, i) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === '/'} onClick={onClose}>
                    <span className="menu__num mono">({String(i + 1).padStart(2, '0')})</span>
                    <span className="menu__label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu__foot mono">
            <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="menu__social">
              <InstagramIcon size={16} /> {site.contact.instagramHandle}
            </a>
            <a href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp {site.contact.phoneDisplay}</a>
            <a href={site.contact.emailHref}>{site.contact.email}</a>
            <span>(Local time) <Clock /></span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
