import { useCallback, useState } from 'react';
import { VolunteerForm } from '../features/volunteer/VolunteerForm';
import type { SectionProgress } from '../features/volunteer/validation';
import { Reveal } from '../components/ui/Reveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { site } from '../data/site';

export default function Volunteer() {
  useDocumentTitle('Become a Volunteer');
  const [progress, setProgress] = useState<SectionProgress[]>([]);
  // Only update when something actually changed, so typing does not re-render the whole page.
  const onProgress = useCallback((next: SectionProgress[]) => {
    setProgress((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);
  const done = progress.filter((p) => p.done).length;

  return (
    <div className="band volunteer">
      <div className="wrap volunteer__grid">
        <header className="volunteer__intro">
          <div className="rowhead"><span>(Become a Volunteer)</span><span>Form</span></div>
          <h1 className="volunteer__title"><Reveal>Be a part of the Karwaan.</Reveal></h1>
          <p>
            Karwaan Foundation is a growing social-impact initiative working toward a better world
            through meaningful action, compassion, and community participation.
          </p>
          <p>
            Whether you want to help animals, support people, contribute to community initiatives,
            or simply be part of positive change, every helping hand matters.
          </p>
          <p>Fill out this short form to express your interest in volunteering with Karwaan Foundation.</p>
          <blockquote className="volunteer__motto">&ldquo;{site.motto}&rdquo;</blockquote>
          <p className="volunteer__accuracy">
            Please provide accurate information so that our team can contact you regarding volunteer
            opportunities.
          </p>

          {progress.length > 0 && (
            <nav className="progress" aria-label="Form sections">
              <p className="mono progress__count" aria-live="polite">{done} of {progress.length} sections complete</p>
              <ol>
                {progress.map((s, i) => (
                  <li key={s.id} className={s.done ? 'is-done' : ''}>
                    <a href={`#vsec-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`vsec-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                      <span className="mono">({i + 1})</span>
                      <span>{s.title}</span>
                      <span className="progress__tick mono">{s.done ? '[done]' : ''}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </header>
        <div className="volunteer__form">
          <VolunteerForm onProgress={onProgress} />
        </div>
      </div>
    </div>
  );
}
