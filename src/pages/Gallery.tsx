import { useCallback, useMemo, useState } from 'react';
import { PageHero } from '../sections/PageHero';
import { ClosingCta } from '../sections/ClosingCta';
import { Photo } from '../components/ui/Photo';
import { Lightbox } from '../components/ui/Lightbox';
import { gallery, galleryCategories } from '../data/gallery';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Gallery() {
  useDocumentTitle('Gallery');
  const [category, setCategory] = useState<string>('All');
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo(
    () => (category === 'All' ? gallery : gallery.filter((g) => g.category === category)),
    [category],
  );
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <PageHero
        label={`Gallery, ${gallery.length}`}
        title="Gallery"
        intro="Photographs from Karwaan Foundation activities, grouped by the kind of work they show."
      >
        <p className="template-flag mono">
          (Template preview) Placeholder frames in different shapes, so the layout can be reviewed.
        </p>
      </PageHero>

      <section className="band gallery" aria-label="Photographs">
        <div className="wrap">
          <div className="chips" role="group" aria-label="Filter by category">
            {['All', ...galleryCategories].map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>

          <ul className="masonry">
            {items.map((it, i) => (
              <li key={it.id} className="masonry__item">
                <button type="button" className="masonry__btn" onClick={() => setOpen(i)} aria-label={`Open photo: ${it.caption}`} data-cursor="view">
                  <Photo {...it} tone={i} />
                  <span className="masonry__cap mono">
                    <span>({String(i + 1).padStart(2, '0')})</span>
                    <span>{it.category}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Lightbox items={items} index={open} onClose={close} onIndex={setOpen} />
      <ClosingCta />
    </>
  );
}
