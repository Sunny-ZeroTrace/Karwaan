import { Photo } from '../components/ui/Photo';

/** Placeholder for the Foundation's film. Replace the frame with a real <video> or embed when one exists. */
export function Film() {
  return (
    <section className="band theme-dark film" aria-labelledby="film-title">
      <div className="wrap">
        <div className="rowhead"><span>(Foundation film)</span><span>Coming soon</span></div>
        <h2 id="film-title" className="sr-only">Foundation film</h2>
        <div className="film__frame" data-cursor="soon">
          <Photo fill alt="Frame for the Foundation film" ratio="16/9" tone={1} />
          <span className="film__play" aria-hidden="true"><i /></span>
        </div>
        <p className="note">Placeholder: a film or highlights reel from the Foundation can play here.</p>
      </div>
    </section>
  );
}
