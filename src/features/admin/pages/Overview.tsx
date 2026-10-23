import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatusCounts, listApplications } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import type { ApplicationRecord, Status } from '../types';
import { statusLabels } from '../types';

type Counts = Record<Status, number> & { total: number };

export default function Overview() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<ApplicationRecord[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setCounts(null);
    setRecent(null);
    try {
      const [c, page] = await Promise.all([getStatusCounts(), listApplications({ status: 'pending', search: '', pageSize: 5 })]);
      setCounts(c);
      setRecent(page.items);
    } catch {
      setError('The overview could not be loaded. Check your connection and your admin access, then try again.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const cards: { key: 'total' | Status; label: string; to: string }[] = [
    { key: 'total', label: 'Total applications', to: '/admin/applications/all' },
    { key: 'pending', label: 'Pending', to: '/admin/applications/pending' },
    { key: 'accepted', label: 'Accepted', to: '/admin/applications/accepted' },
    { key: 'declined', label: 'Declined', to: '/admin/applications/declined' },
  ];

  return (
    <section aria-labelledby="ov-title">
      <div className="admin-head">
        <h1 id="ov-title" className="admin-title">Overview</h1>
        <button type="button" className="btn btn--line" onClick={() => void load()}>Refresh</button>
      </div>
      <p className="mono muted">Figures are read from the database when this page opens. Use Refresh to update them.</p>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <ul className="stats">
        {cards.map((c) => (
          <li key={c.key}>
            <Link to={c.to} className="stat">
              <span className="stat__n" aria-live="polite">{counts ? counts[c.key] : '…'}</span>
              <span className="mono">({c.label})</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="admin-sub">Waiting for review</h2>
      {recent === null && !error && <p className="mono" role="status">Loading…</p>}
      {recent && recent.length === 0 && <p className="empty-state">No applications are waiting for review.</p>}
      {recent && recent.length > 0 && (
        <ul className="recent">
          {recent.map((r) => (
            <li key={r.id}>
              <Link to="/admin/applications/pending" className="recent__row">
                <span className="recent__name">{r.fullName}</span>
                <span className="muted">{r.city}</span>
                <span className="mono muted">{r.createdAt ? r.createdAt.toLocaleDateString() : ''}</span>
                <StatusBadge status={r.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {counts && <p className="note">Showing the newest {recent?.length ?? 0} of {counts[('pending' as Status)]} {statusLabels.pending.toLowerCase()} applications.</p>}
    </section>
  );
}
