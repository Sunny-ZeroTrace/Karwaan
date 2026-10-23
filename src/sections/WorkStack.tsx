import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { areaName } from '../data/areas';
import { Photo } from '../components/ui/Photo';
import { Parallax } from '../components/ui/Parallax';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { Scramble } from '../components/ui/Scramble';

/**
 * Projects as full-width panels that stack over each other as you scroll (pure CSS sticky).
 * Driven by data/projects.ts, so real projects replace the placeholders without layout changes.
 */
export function WorkStack() {
  return (
    <section className="band stack" aria-labelledby="work-title">
      <div className="wrap">
        <div className="rowhead"><span>(Our work)</span><span>03</span></div>
        <div className="stack__head">
          <h2 id="work-title" className="display-l"><Reveal>Our work</Reveal></h2>
          <p className="lead">
            Initiatives will appear here with their own photographs and details. These panels are
            placeholders until the real projects are added.
          </p>
        </div>
      </div>

      <ol className="stack__list">
        {projects.map((p, i) => (
          <li key={p.slug} className="stack__card" style={{ '--i': i } as CSSProperties}>
            <Link to={`/work?area=${p.area}`} className="stack__link" data-cursor="view">
              <div className="stack__media">
                <Parallax amount={6}><Photo {...p.photos[0]} fill ratio="16/10" tone={i} /></Parallax>
              </div>
              <div className="stack__info">
                <span className="mono">({String(i + 1).padStart(2, '0')})</span>
                <h3 className="stack__title">{p.title}</h3>
                <dl className="stack__facts mono">
                  <div><dt>Area</dt><dd>{areaName(p.area)}</dd></div>
                  <div><dt>Where</dt><dd>{p.where ?? 'To be provided'}</dd></div>
                  <div><dt>When</dt><dd>{p.when ?? 'To be provided'}</dd></div>
                </dl>
                <span className="mono stack__go"><Scramble text="[view work]" /></span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="wrap stack__foot">
        <Button to="/work" variant="line">See all work</Button>
      </div>
    </section>
  );
}
