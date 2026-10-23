import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHero } from '../sections/PageHero';
import { ClosingCta } from '../sections/ClosingCta';
import { Photo } from '../components/ui/Photo';
import { Button } from '../components/ui/Button';
import { Parallax } from '../components/ui/Parallax';
import { Scramble } from '../components/ui/Scramble';
import { projects } from '../data/projects';
import { areas, areaName } from '../data/areas';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type View = 'index' | 'features';

export default function Work() {
  useDocumentTitle('Our work');
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('features');
  const current = params.get('area') ?? 'all';
  const visible = current === 'all' ? projects : projects.filter((p) => p.area === current);

  const choose = (id: string) => {
    if (id === 'all') setParams({}, { replace: true });
    else setParams({ area: id }, { replace: true });
  };

  return (
    <>
      <PageHero
        label="Our work"
        title="Our work"
        intro="Every initiative gets its own section: photographs, what it is, where and when it happened, and how to take part."
      >
        <p className="template-flag mono">
          (Template preview) The initiatives below are placeholders and do not describe real activities.
        </p>
      </PageHero>

      <section className="band work-list" aria-label="Initiatives">
        <div className="wrap">
          <div className="work-tools">
            <div className="chips" role="group" aria-label="Filter by area">
              <button type="button" className="chip" aria-pressed={current === 'all'} onClick={() => choose('all')}>All areas</button>
              {areas.map((a) => (
                <button key={a.id} type="button" className="chip" aria-pressed={current === a.id} onClick={() => choose(a.id)}>{a.name}</button>
              ))}
            </div>
            <div className="viewtoggle mono" role="group" aria-label="Layout">
              <button type="button" aria-pressed={view === 'features'} onClick={() => setView('features')}>[features]</button>
              <button type="button" aria-pressed={view === 'index'} onClick={() => setView('index')}>[index]</button>
            </div>
          </div>

          {visible.length === 0 && (
            <p className="empty">
              No initiatives are listed under {areaName(current)} yet. Check back soon, or{' '}
              <button type="button" className="link-btn" onClick={() => choose('all')}>view all areas</button>.
            </p>
          )}

          {view === 'features' ? (
            <ol className="feature-list">
              {visible.map((p, i) => (
                <li key={p.slug} className={`feature ${i % 2 ? 'feature--flip' : ''}`}>
                  <div className="feature__media">
                    <Parallax amount={5} className="feature__main"><Photo {...p.photos[0]} fill ratio="4/3" tone={i} priority={i === 0} /></Parallax>
                    <ul className="feature__thumbs">
                      {p.photos.slice(1, 4).map((ph, j) => (
                        <li key={j}><Photo {...ph} tone={i + j + 1} /></li>
                      ))}
                    </ul>
                  </div>
                  <div className="feature__body">
                    <p className="feature__meta mono">
                      <span>({String(i + 1).padStart(2, '0')})</span>
                      {p.placeholder && <span className="badge">Placeholder</span>}
                      <span>{areaName(p.area)}</span>
                    </p>
                    <h2 className="feature__title">{p.title}</h2>
                    <p className="feature__summary">{p.summary}</p>
                    <dl className="facts mono">
                      <div><dt>Where</dt><dd>{p.where ?? 'To be provided'}</dd></div>
                      <div><dt>When</dt><dd>{p.when ?? 'To be provided'}</dd></div>
                    </dl>
                    <Button to="/volunteer" variant="line">Volunteer with us</Button>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ol className="index-list">
              {visible.map((p, i) => (
                <li key={p.slug}>
                  <Link to="/volunteer" className="index-row" data-cursor="join">
                    <span className="mono">({String(i + 1).padStart(2, '0')})</span>
                    <span className="index-row__title">{p.title}</span>
                    <span className="mono index-row__area">{areaName(p.area)}</span>
                    <span className="mono index-row__where">{p.where ?? 'Where: to be provided'}</span>
                    <span className="mono index-row__go"><Scramble text="[volunteer]" /></span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
