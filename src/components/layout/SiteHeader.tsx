import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { site } from '../../data/site';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { Scramble } from '../ui/Scramble';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    // One passive listener; state only changes when the threshold is crossed.
    const onScroll = () => setScrolled((prev) => {
      const next = window.scrollY > 8;
      return prev === next ? prev : next;
    });
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''} ${open ? 'header--open' : ''}`}>
        <div className="header__inner">
          <Logo onNavigate={close} />

          <nav className="header__nav" aria-label="Main">
            <ul>
              {site.nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}><Scramble text={item.label} /></NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <Link to={site.cta.to} className="btn btn--solid header__cta" onClick={close}>
              <span className="btn__dot" aria-hidden="true" />
              <span>{site.cta.label}</span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="header__toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden="true">{open ? '[close]' : '[menu]'}</span>
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} returnFocusTo={menuButton} />
    </>
  );
}
