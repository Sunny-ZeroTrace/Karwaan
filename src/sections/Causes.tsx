import { AreaIndex } from './AreaIndex';
import { Reveal } from '../components/ui/Reveal';

export function Causes() {
  return (
    <section className="band theme-dark causes" aria-labelledby="causes-title">
      <div className="wrap">
        <div className="rowhead"><span>(Areas of impact)</span><span>02</span></div>
        <div className="causes__head">
          <h2 id="causes-title" className="display-l"><Reveal>Where we can make a difference</Reveal></h2>
          <p className="lead">
            These are the fields Karwaan Foundation aims to contribute to, support, and build
            initiatives within. Not a finished list, but a direction of travel.
          </p>
        </div>
        <AreaIndex />
      </div>
    </section>
  );
}
