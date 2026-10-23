import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { PageHero } from '../sections/PageHero';
import { CopyButton } from '../components/ui/CopyButton';
import { Clock } from '../components/ui/Clock';
import { InstagramIcon, WhatsAppIcon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { Scramble } from '../components/ui/Scramble';
import { site } from '../data/site';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Contact() {
  useDocumentTitle('Contact');
  const c = site.contact;

  return (
    <>
      <PageHero
        label="Contact"
        title="Write to us, call us, or find us on Instagram."
        intro={<>Your contact person at Karwaan Foundation is <strong>{c.person}</strong>.</>}
      />

      <section className="band contact" aria-label="Contact details">
        <div className="wrap">
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row__icon"><Mail size={22} aria-hidden="true" /></span>
              <div className="contact-row__main">
                <span className="mono muted">(Email)</span>
                <a className="contact-row__value" href={c.emailHref}>{c.email}</a>
              </div>
              <CopyButton value={c.email} label="email address" />
            </li>
            <li className="contact-row">
              <span className="contact-row__icon"><WhatsAppIcon size={22} /></span>
              <div className="contact-row__main">
                <span className="mono muted">(WhatsApp and phone)</span>
                <a className="contact-row__value" href={c.whatsappHref} target="_blank" rel="noopener noreferrer">
                  {c.phoneDisplay}
                  <ArrowUpRight size={28} aria-hidden="true" />
                  <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                </a>
                <a className="contact-row__sub mono" href={c.phoneHref}>
                  <Phone size={14} aria-hidden="true" /> Prefer a call? <span>[call this number]</span>
                </a>
              </div>
              <CopyButton value={c.phoneDisplay} label="WhatsApp and phone number" />
            </li>
            <li className="contact-row">
              <span className="contact-row__icon"><InstagramIcon size={22} /></span>
              <div className="contact-row__main">
                <span className="mono muted">(Instagram)</span>
                <a className="contact-row__value" href={c.instagramUrl} target="_blank" rel="noopener noreferrer">
                  {c.instagramHandle}
                  <ArrowUpRight size={28} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              <a className="copy-btn mono" href={c.instagramUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
                <Scramble text="[follow]" />
              </a>
            </li>
          </ul>
          <p className="mono muted contact__time">(Your local time) <Clock /></p>
        </div>
      </section>

      <section className="band theme-dark donate" aria-labelledby="donate-title">
        <div className="wrap">
          <div className="rowhead"><span>(Donations)</span><span>Direct contact only</span></div>
          <div className="donate__grid">
            <h2 id="donate-title" className="display-l"><Reveal>Want to support the work with a donation?</Reveal></h2>
            <div>
              <p className="lead">
                Please get in touch with us directly and we will talk you through how to help. We
                handle donations personally, so there is no online payment on this website.
              </p>
              <div className="donate__actions">
                <Button href={c.emailHref} size="lg">Email us</Button>
                <Button href={c.whatsappHref} variant="line" size="lg" external>WhatsApp {c.phoneDisplay}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band contact-volunteer">
        <div className="wrap contact-volunteer__inner">
          <p className="display-m">Want to give your time instead?</p>
          <Button to={site.cta.to} size="lg" dot>{site.cta.label}</Button>
        </div>
      </section>
    </>
  );
}
