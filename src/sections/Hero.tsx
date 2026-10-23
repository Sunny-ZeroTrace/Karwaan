import { motion, useReducedMotion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Clock } from '../components/ui/Clock';
import { Parallax } from '../components/ui/Parallax';
import { Photo } from '../components/ui/Photo';
import { site } from '../data/site';

const letters = 'KARWAAN'.split('');
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Opening: a full-width wordmark whose letters rise one by one (the single orchestrated moment on load),
 * the motto, the volunteer call to action, and a large hero photograph that drifts as you scroll.
 */
export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <div className="hero__meta mono">
          <span>(Karwaan Foundation)</span>
          <span className="hero__meta-mid">A growing social-impact initiative</span>
          <span>(Local time) <Clock /></span>
        </div>

        <h1 id="hero-title" className="hero__title">
          <span className="sr-only">Karwaan Foundation</span>
          <span className="hero__word" aria-hidden="true">
            {letters.map((c, i) => (
              <span className="hero__ch" key={i}>
                <motion.span
                  initial={reduce ? false : { y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.1 + i * 0.07, ease }}
                >
                  {c}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <div className="hero__grid">
          <p className="hero__motto">Building a Better Today, for a Brighter Tomorrow.</p>
          <div className="hero__side">
            <p className="hero__intro">
              Karwaan Foundation is a growing social-impact movement built around a simple belief:
              meaningful change begins when people choose to act.
            </p>
            <div className="hero__actions">
              <Button to={site.cta.to} size="lg" dot>{site.cta.label}</Button>
              <Button to="/work" variant="line" size="lg">See our work</Button>
            </div>
          </div>
        </div>
      </div>

      <Parallax className="hero__image" amount={9}>
        <Photo fill alt="Hero photograph for the home page" ratio="16/9" tone={2} priority />
      </Parallax>
      <p className="hero__scroll mono" aria-hidden="true">[scroll]</p>
    </section>
  );
}
