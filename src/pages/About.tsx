import { PageHero } from '../sections/PageHero';
import { ClosingCta } from '../sections/ClosingCta';
import { Parallax } from '../components/ui/Parallax';
import { Photo } from '../components/ui/Photo';
import { Reveal } from '../components/ui/Reveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Approach points, written from the Foundation's own site copy. */
const approach = [
  ['Start where you are', 'Progress does not always begin with something enormous. It begins when someone chooses to care and then acts on it.'],
  ['Show up where it’s needed', 'We stay open to wherever meaningful action is possible, rather than boxing ourselves into one cause.'],
  ['Move with intention', 'We would rather be honest and deliberate about our early journey than loud about it.'],
];

/** PLACEHOLDER values: replace with the Foundation's real values. */
const placeholderValues = ['Value one', 'Value two', 'Value three'];

export default function About() {
  useDocumentTitle('About');
  return (
    <>
      <PageHero
        label="About"
        title="Change begins when someone decides that things can be better."
        intro="Karwaan Foundation is a growing initiative created to make meaningful contributions wherever they can help improve life."
      />

      <section className="about-image" aria-label="Photograph">
        <Parallax amount={9}><Photo fill alt="Wide photograph for the About page" ratio="16/9" tone={2} priority /></Parallax>
      </section>

      <section className="band about-grid" aria-labelledby="story-title">
        <div className="wrap about-grid__inner">
          <div className="about-sticky">
            <p className="mono muted">(01)</p>
            <h2 id="story-title" className="display-m">Our story</h2>
          </div>
          <div className="prose">
            <p>
              We&rsquo;re not built around a single cause. We&rsquo;re built around a willingness to show up
              wherever meaningful action is possible.
            </p>
            <p>
              That may mean caring for an animal, standing beside a community, supporting
              someone&rsquo;s education, or simply lending a hand where one is needed. The foundation is
              intentionally broad in scope, because the need for good is broad too.
            </p>
            <p>
              We&rsquo;re honest about where we are: a young organization, early in its journey, moving
              with intention rather than noise.
            </p>
            <div className="placeholder-box mono">
              <strong>(Placeholder)</strong>
              <p>
                The fuller story of how Karwaan Foundation began and what it has done so far will be
                added here once the Foundation provides it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mv" aria-label="Mission and vision">
        <div className="mv__panel theme-dark">
          <h2 className="mono">(Our mission)</h2>
          <p className="mv__big"><Reveal>Building a Better Today, for a Brighter Tomorrow.</Reveal></p>
          <p className="mv__small">
            Progress does not always begin with something enormous. Sometimes it starts with feeding
            an animal, helping someone find an opportunity, standing with a community, or simply
            choosing to care, and then acting on it.
          </p>
        </div>
        <div className="mv__panel mv__panel--light">
          <h2 className="mono">(Our vision)</h2>
          <p className="mv__big"><Reveal>To help in each and every possible field where meaningful action can improve lives.</Reveal></p>
          <p className="mv__small">
            Karwaan Foundation doesn&rsquo;t intend to stay boxed into a single cause. As the
            organization grows, so will the range of people, places, and problems it chooses to
            stand beside.
          </p>
        </div>
      </section>

      <section className="band about-grid" aria-labelledby="approach-title">
        <div className="wrap about-grid__inner">
          <div className="about-sticky">
            <p className="mono muted">(02)</p>
            <h2 id="approach-title" className="display-m">How we approach change</h2>
          </div>
          <ul className="approach-list">
            {approach.map(([h, p], i) => (
              <li key={h}>
                <span className="mono muted">({String(i + 1).padStart(2, '0')})</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band about-values theme-dark" aria-labelledby="values-title">
        <div className="wrap">
          <div className="rowhead"><span>(03)</span><span>Placeholder</span></div>
          <h2 id="values-title" className="display-l"><Reveal>Our values</Reveal></h2>
          <p className="note">The Foundation&rsquo;s real values will replace these three.</p>
          <ul className="values-list">
            {placeholderValues.map((v, i) => (
              <li key={v}>
                <span className="mono muted">({String(i + 1).padStart(2, '0')})</span>
                <h3>{v}</h3>
                <p>A short description of this value will be added here.</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band about-journey" aria-labelledby="journey-title">
        <div className="wrap about-journey__grid">
          <div>
            <h2 id="journey-title" className="display-l">This is more than a foundation. This is a Karwaan.</h2>
            <p className="lead">
              A journey becomes powerful when people choose to walk it together. One person can
              volunteer. One person can help an animal. One person can support another person, or
              open a door for someone who needs it. But when people move together, individual
              actions become a movement.
            </p>
          </div>
          <Parallax className="about-journey__photo"><Photo fill alt="Group photograph of the Karwaan Foundation community" ratio="4/5" tone={1} /></Parallax>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
