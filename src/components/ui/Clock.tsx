import { useEffect, useState } from 'react';

const now = () => {
  const d = new Date();
  return [String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0')] as const;
};

/** Visitor's own local time, with a blinking colon. Labelled by the caller. */
export function Clock({ className = '' }: { className?: string }) {
  const [[h, m], setT] = useState(now);
  useEffect(() => {
    const id = window.setInterval(() => setT(now()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className={`clock ${className}`.trim()}>
      {h}
      <span className="clock__colon" aria-hidden="true">:</span>
      <span className="sr-only">:</span>
      {m}
    </span>
  );
}
