import { Button } from '../components/ui/Button';
import { Marquee } from '../components/ui/Marquee';
import { site } from '../data/site';

export function ClosingCta() {
  return (
    <section className="closing" aria-labelledby="closing-title">
      <Marquee items={['Become a Volunteer', 'Be a part of the Karwaan']} duration={40} reverse className="closing__marquee" />
      <div className="band">
        <div className="wrap closing__inner">
          <h2 id="closing-title" className="display-xl">Be a part of the Karwaan.</h2>
          <div className="closing__side">
            <p className="lead">
              You don&rsquo;t need to have everything figured out. You just need to be willing to take
              the first step.
            </p>
            <div className="closing__actions">
              <Button to={site.cta.to} size="lg" dot>{site.cta.label}</Button>
              <Button to="/contact" variant="line" size="lg">Talk to us first</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
