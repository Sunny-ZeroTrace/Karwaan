import { Link } from 'react-router-dom';
import { Reveal } from '../components/ui/Reveal';
import { preferenceOptions } from '../data/volunteer';

export function Join() {
  return (
    <section className="band theme-dark join" aria-labelledby="join-title">
      <div className="wrap">
        <div className="rowhead"><span>(The Karwaan)</span><span>06</span></div>
        <h2 id="join-title" className="display-xl join__title">
          <Reveal>This is more than a foundation.</Reveal>
          <Reveal delay={0.12}>This is a Karwaan.</Reveal>
        </h2>
        <div className="join__cols">
          <p className="lead">
            A journey becomes powerful when people choose to walk it together. One person can
            volunteer. One person can help an animal. One person can support another person, or open
            a door for someone who needs it. But when people move together, individual actions become
            a movement.
          </p>
          <div>
            <p className="mono muted join__label">(Where you can help)</p>
            <ul className="join__chips">
              {preferenceOptions.map((o) => (
                <li key={o}><Link to="/volunteer" className="chip">{o}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
