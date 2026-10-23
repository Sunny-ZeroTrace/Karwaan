import { Button } from '../components/ui/Button';
import { Parallax } from '../components/ui/Parallax';
import { Photo } from '../components/ui/Photo';
import { ScrollWords } from '../components/ui/ScrollWords';

export function Statement() {
  return (
    <section className="band statement">
      <div className="wrap">
        <div className="rowhead"><span>(About Karwaan)</span><span>01</span></div>
        <ScrollWords
          className="statement__text"
          text="Change begins when someone decides that things can be better."
        />
        <div className="statement__body">
          <div className="statement__photos">
            <Parallax className="statement__p1"><Photo fill alt="Photograph for the introduction, tall" ratio="4/5" tone={0} /></Parallax>
            <Parallax className="statement__p2" amount={12}><Photo fill alt="Photograph for the introduction, square" ratio="1/1" tone={3} /></Parallax>
          </div>
          <div className="statement__cols">
            <p>
              Karwaan Foundation is a growing initiative created to make meaningful contributions
              wherever they can help improve life. We&rsquo;re not built around a single cause. We&rsquo;re
              built around a willingness to show up wherever meaningful action is possible.
            </p>
            <p>
              We&rsquo;re honest about where we are: a young organization, early in its journey,
              moving with intention rather than noise.
            </p>
            <div className="statement__actions">
              <Button to="/about" variant="line">About Karwaan</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
