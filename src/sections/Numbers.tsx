/** Placeholder figures. Only verified numbers should ever replace the dashes. */
const slots = ['People supported', 'Active volunteers', 'Activities held', 'Areas of work'];

export function Numbers() {
  return (
    <section className="band numbers" aria-labelledby="numbers-title">
      <div className="wrap">
        <div className="rowhead"><span>(In numbers)</span><span>04</span></div>
        <h2 id="numbers-title" className="sr-only">Foundation in numbers</h2>
        <ul className="numbers__grid">
          {slots.map((s) => (
            <li key={s}>
              <span className="numbers__n" aria-label="Figure to be provided">&mdash;</span>
              <span className="mono">({s})</span>
              <span className="mono muted">Figure to be provided</span>
            </li>
          ))}
        </ul>
        <p className="note">Placeholder slots. Only verified figures will be shown here.</p>
      </div>
    </section>
  );
}
