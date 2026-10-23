interface Props {
  items: string[];
  /** Seconds for one full loop. Larger = slower. */
  duration?: number;
  reverse?: boolean;
  className?: string;
}

/** Decorative looping text band. Hidden from assistive tech (the same words appear elsewhere on the page). */
export function Marquee({ items, duration = 50, reverse = false, className = '' }: Props) {
  const row = (
    <ul className="marquee__row">
      {items.map((t, i) => (
        <li key={i}>
          <span>{t}</span>
          <span className="marquee__sep" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee ${className}`.trim()} aria-hidden="true">
      <div className={`marquee__track ${reverse ? 'marquee__track--rev' : ''}`} style={{ animationDuration: `${duration}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}
