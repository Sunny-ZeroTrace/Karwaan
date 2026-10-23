import type { ReactNode } from 'react';
import { Reveal } from '../components/ui/Reveal';

interface Props {
  /** Short mono label shown in the top row, e.g. "About". */
  label: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}

/** Opening block shared by the inner pages. */
export function PageHero({ label, title, intro, children }: Props) {
  return (
    <header className="band page-hero">
      <div className="wrap">
        <div className="rowhead"><span>(Karwaan Foundation)</span><span>({label})</span></div>
        <h1 className="page-hero__title"><Reveal>{title}</Reveal></h1>
        {intro && <p className="lead page-hero__intro">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
