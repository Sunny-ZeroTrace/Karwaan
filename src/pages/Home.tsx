import { Hero } from '../sections/Hero';
import { Marquee } from '../components/ui/Marquee';
import { Statement } from '../sections/Statement';
import { Film } from '../sections/Film';
import { Causes } from '../sections/Causes';
import { WorkStack } from '../sections/WorkStack';
import { Numbers } from '../sections/Numbers';
import { GalleryRows } from '../sections/GalleryRows';
import { Join } from '../sections/Join';
import { ClosingCta } from '../sections/ClosingCta';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { site } from '../data/site';

export default function Home() {
  useDocumentTitle();
  return (
    <>
      <Hero />
      <Marquee items={[site.motto, site.motto]} duration={55} className="marquee--ink" />
      <Statement />
      <Film />
      <Causes />
      <WorkStack />
      <Numbers />
      <GalleryRows />
      <Join />
      <ClosingCta />
    </>
  );
}
