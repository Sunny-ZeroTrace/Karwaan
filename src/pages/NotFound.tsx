import { PageHero } from '../sections/PageHero';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <PageHero label="404" title="This page doesn’t exist." intro="The link may be old or mistyped. Head back to the start.">
      <div className="page-hero__actions">
        <Button to="/">Go to the home page</Button>
      </div>
    </PageHero>
  );
}
