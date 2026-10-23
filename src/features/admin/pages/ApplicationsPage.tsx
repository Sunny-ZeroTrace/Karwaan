import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import type { DocumentSnapshot } from 'firebase/firestore/lite';
import { exportApplications, listApplications, reviewApplication } from '../api';
import { useAdminAuth } from '../auth/AuthContext';
import { ApplicationPanel } from '../components/ApplicationPanel';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { toCsv } from '../csv';
import { STATUSES, statusLabels } from '../types';
import type { ApplicationRecord, Status, StatusFilter } from '../types';

const PAGE_SIZE = 20;
const VIEWS: StatusFilter[] = ['all', ...STATUSES];

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karwaan-volunteers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ApplicationsPage() {
  const { view = 'all' } = useParams();
  const { state } = useAdminAuth();
  const status = view as StatusFilter;
  const validView = (VIEWS as string[]).includes(view);

  const [input, setInput] = useState('');
  const search = useDebounced(input, 400);
  const [items, setItems] = useState<ApplicationRecord[]>([]);
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const reqId = useRef(0);

  const load = useCallback(async () => {
    const my = ++reqId.current;
    setLoading(true);
    setError('');
    try {
      const page = await listApplications({ status, search, pageSize: PAGE_SIZE });
      if (reqId.current !== my) return;
      setItems(page.items);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      if (reqId.current !== my) return;
      setError('Applications could not be loaded. Check your connection and your admin access, then try again.');
      setItems([]);
      setHasMore(false);
    } finally {
      if (reqId.current === my) setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    if (validView) void load();
  }, [validView, load]);

  useEffect(() => { setSelectedId(null); setNotice(''); }, [view]);

  if (!validView) return <Navigate to="/admin/applications/all" replace />;

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await listApplications({ status, search, cursor, pageSize: PAGE_SIZE });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      setError('More applications could not be loaded. Try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const onReview = async (id: string, next: Status) => {
    if (state.status !== 'admin') throw new Error('You are not signed in as an admin.');
    let updated: ApplicationRecord;
    try {
      updated = await reviewApplication(id, next, state.uid);
    } catch {
      throw new Error('The change was not saved. The database refused it or the connection failed. Nothing was changed.');
    }
    setNotice(`${updated.fullName} was marked ${statusLabels[updated.status].toLowerCase()}.`);
    // If this view only shows another status, the application no longer belongs here.
    if (status !== 'all' && updated.status !== status) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      setSelectedId(null);
    } else {
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const doExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      const rows = await exportApplications(status, search);
      downloadCsv(toCsv(rows));
      setExportOpen(false);
    } catch {
      setExportError('The export failed. Nothing was downloaded. Try again.');
    } finally {
      setExporting(false);
    }
  };

  const selected = items.find((r) => r.id === selectedId) ?? null;
  const title = status === 'all' ? 'All applications' : `${statusLabels[status]} applications`;
  const searching = search.trim() !== '';

  return (
    <section aria-labelledby="apps-title">
      <div className="admin-head">
        <h1 id="apps-title" className="admin-title">{title}</h1>
        <button type="button" className="btn btn--line" onClick={() => { setExportError(''); setExportOpen(true); }}>Export CSV</button>
      </div>

      <div className="searchbar">
        <label className="field__label" htmlFor="app-search">Search applicants</label>
        <input id="app-search" type="search" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Name, email or KF- reference" autoComplete="off" />
        <p className="mono muted">
          Matches the start of a name, the start of an email address (type the @), or an exact reference number
          such as KF-AB12CD34. It searches this whole list, not just the rows shown.
        </p>
      </div>

      {notice && <p className="admin-note" role="status">{notice}</p>}
      {error && (
        <p className="admin-error" role="alert">
          {error} <button type="button" className="link-btn" onClick={() => void load()}>Retry</button>
        </p>
      )}

      {loading && <p className="mono" role="status">Loading applications…</p>}

      {!loading && !error && items.length === 0 && (
        <p className="empty-state">
          {searching
            ? 'No applications match that search.'
            : status === 'all'
              ? 'No applications have been received yet.'
              : `There are no ${statusLabels[status].toLowerCase()} applications.`}
        </p>
      )}

      {items.length > 0 && (
        <>
          <ul className="apps" aria-label={title}>
            {items.map((r) => (
              <li key={r.id}>
                <button type="button" className="app-row" onClick={() => setSelectedId(r.id)}>
                  <span className="app-row__who">
                    <strong>{r.fullName}</strong>
                    <span className="muted">{r.email}</span>
                  </span>
                  <span className="app-row__city">{r.city}</span>
                  <span className="app-row__prefs">{r.preference1}<span className="muted">, {r.preference2}</span></span>
                  <span className="app-row__date mono">{r.createdAt ? r.createdAt.toLocaleDateString() : ''}</span>
                  <StatusBadge status={r.status} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mono muted" aria-live="polite">Showing {items.length} application{items.length === 1 ? '' : 's'}{hasMore ? ', more available' : ''}.</p>
          {hasMore && (
            <button type="button" className="btn btn--line" onClick={() => void loadMore()} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}

      {selected && <ApplicationPanel record={selected} onClose={() => setSelectedId(null)} onReview={onReview} />}

      {exportOpen && (
        <ConfirmDialog
          title="Export applications to CSV?"
          confirmLabel="Download CSV"
          busy={exporting}
          error={exportError}
          onConfirm={() => void doExport()}
          onCancel={() => setExportOpen(false)}
        >
          <p>
            This downloads <strong>{title.toLowerCase()}</strong>
            {searching ? <> matching &ldquo;{search.trim()}&rdquo;</> : null} with names, contact details and written
            answers. It is personal information: store it safely and delete it when it is no longer needed.
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
