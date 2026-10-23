import { Link } from 'react-router-dom';
import { site } from '../../data/site';
import { Clock } from '../ui/Clock';
import { Marquee } from '../ui/Marquee';
import { Scramble } from '../ui/Scramble';
import { InstagramIcon } from '../ui/Icons';

export function SiteFooter() {
  const year = new Date().getFullYear();
  const links = [{ to: '/', label: 'Home' }, ...site.nav, { to: site.cta.to, label: 'Volunteer registration' }];
  return (
    <footer className="footer theme-dark">
      <Marquee items={['Building a Better Today', 'for a Brighter Tomorrow']} duration={60} className="footer__marquee" />

      <div className="wrap footer__grid">
        <div className="footer__brand">
          <img src="/brand/logo-mark.png" alt="" width={64} height={64} className="footer__mark" />
          <p className="footer__motto">{site.motto}</p>
          <Link to={site.cta.to} className="btn btn--solid btn--lg">
            <span className="btn__dot" aria-hidden="true" />
            <span>{site.cta.label}</span>
          </Link>
        </div>

        <nav className="footer__col" aria-label="Footer">
          <h2 className="footer__head mono">(Explore)</h2>
          <ul>
            {links.map((l, i) => (
              <li key={l.to}>
                <Link to={l.to} className="footer__link">
                  <span className="mono muted">{String(i + 1).padStart(2, '0')}</span>
                  <Scramble text={l.label} className="mono" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h2 className="footer__head mono">(Get in touch)</h2>
          <ul className="footer__contact">
            <li className="muted">{site.contact.person}</li>
            <li><a href={site.contact.emailHref}>{site.contact.email}</a></li>
            <li><a href={site.contact.whatsappHref} target="_blank" rel="noopener noreferrer">{site.contact.phoneDisplay} (WhatsApp)</a></li>
            <li>
              <a href={site.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer__ig">
                <InstagramIcon size={18} /> {site.contact.instagramHandle}
              </a>
            </li>
          </ul>
          <p className="mono muted footer__time">(Your local time) <Clock /></p>
        </div>
      </div>

      <p className="footer__giant" aria-hidden="true">Karwaan</p>

      <div className="wrap footer__legal mono">
        <p>&copy; {year} {site.name}. All rights reserved.</p>
        <button type="button" className="footer__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Scramble text="[back to top]" />
        </button>
      </div>
    </footer>
  );
}
