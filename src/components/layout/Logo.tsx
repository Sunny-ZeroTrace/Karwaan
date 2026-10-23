import { Link } from 'react-router-dom';
import { site } from '../../data/site';

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" className="logo" aria-label={`${site.name}, home`} onClick={onNavigate}>
      <img src="/brand/logo-mark.png" alt="" width={44} height={44} className="logo__mark" />
      <span className="logo__name">{site.shortName}</span>
    </Link>
  );
}
