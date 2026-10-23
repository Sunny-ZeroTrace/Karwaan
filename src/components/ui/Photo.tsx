import type { CSSProperties } from 'react';
import type { PhotoRef } from '../../types';

interface Props extends PhotoRef {
  className?: string;
  /** Varies the placeholder pattern so neighbouring placeholders look different. */
  tone?: number;
  /** Load immediately instead of lazily (use for the first image on a page). */
  priority?: boolean;
  /** Fill the parent's height instead of using the ratio (used inside parallax frames). */
  fill?: boolean;
}

/**
 * The only image component used across the site.
 * With `src` it renders a cropped photo that respects `ratio` and `focal`.
 * Without `src` it renders a clearly labelled placeholder (a dot-grid contact-sheet frame)
 * with the same shape, so swapping in the real photo never shifts the layout.
 */
export function Photo({ src, alt, ratio, focal, className = '', tone = 0, priority = false, fill = false }: Props) {
  const style: CSSProperties = fill ? { height: '100%' } : { aspectRatio: ratio };

  if (src) {
    return (
      <div className={`photo ${className}`.trim()} style={style}>
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{ objectPosition: focal ? `${focal.x}% ${focal.y}%` : '50% 50%' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`photo photo--ph photo--t${tone % 4} ${className}`.trim()}
      style={style}
      role="img"
      aria-label={`Placeholder: ${alt}`}
    >
      <span className="photo__label">(Placeholder photo)</span>
      <span className="photo__ratio">{ratio.replace('/', ':')}</span>
    </div>
  );
}
