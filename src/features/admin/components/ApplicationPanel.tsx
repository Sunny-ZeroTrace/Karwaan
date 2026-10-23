import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { statusLabels } from '../types';
import type { ApplicationRecord, Status } from '../types';

const when = (d: Date | null) => (d ? d.toLocaleString() : 'Not recorded');

interface Props {
  record: ApplicationRecord;
  onClose: () => void;
  /** Applies a status change. Must reject with an Error if the database refuses it. */
  onReview: (id: string, status: Status) => Promise<void>;
}

/** Side panel with every answer of one application, plus the review actions. */
export function ApplicationPanel({ record, onClose, onReview }: Props) {
  const [pending, setPending] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const box = useRef<HTMLElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    box.current?.querySelector<HTMLElement>('[data-close]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[data-confirm-open]')) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus();
    };
  }, [onClose]);

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    setError('');
    try {
      await onReview(record.id, pending);
      setPending(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The change could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const actions: { to: Status; label: string; variant: 'solid' | 'line' }[] = (
    [
      { to: 'accepted', label: 'Accept', variant: 'solid' },
      { to: 'declined', label: 'Decline', variant: 'line' },
      { to: 'pending', label: 'Move back to pending', variant: 'line' },
    ] as const
  ).filter((a) => a.to !== record.status);

  return (
    <div className="panel-wrap">
      <button type="button" className="panel-wrap__scrim" aria-label="Close details" onClick={onClose} tabIndex={-1} />
      <aside className="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" ref={box}>
        <div className="panel__head">
          <div>
            <p className="mono muted">{record.referenceCode || 'No reference'}</p>
            <h2 id="panel-title" className="panel__title">{record.fullName}</h2>
          </div>
          <button type="button" className="round-btn" data-close onClick={onClose} aria-label="Close details">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="panel__status">
          <StatusBadge status={record.status} />
          {record.reviewedAt && (
            <span className="mono muted">Reviewed {when(record.reviewedAt)}</span>
          )}
        </div>

        <div className="panel__actions">
          {actions.map((a) => (
            <button key={a.to} type="button" className={`btn btn--${a.variant}`} onClick={() => { setError(''); setPending(a.to); }}>
              {a.label}
            </button>
          ))}
        </div>

        <dl className="detail">
          <div><dt>Email</dt><dd><a href={`mailto:${record.email}`}>{record.email}</a></dd></div>
          <div><dt>WhatsApp number</dt><dd>{record.whatsappNumber}</dd></div>
          <div><dt>Age</dt><dd>{Number.isNaN(record.age) ? 'Not recorded' : record.age}</dd></div>
          <div><dt>City</dt><dd>{record.city}</dd></div>
          <div><dt>First preference</dt><dd>{record.preference1}</dd></div>
          <div><dt>Second preference</dt><dd>{record.preference2}</dd></div>
          <div><dt>Availability</dt><dd>{record.availability}</dd></div>
          <div className="detail__long"><dt>When something unexpected goes wrong</dt><dd>{record.unexpectedSituationResponse}</dd></div>
          <div className="detail__long"><dt>When nobody tells you how to do a task</dt><dd>{record.independentTaskResponse}</dd></div>
          <div className="detail__long"><dt>When you notice a problem that is not yours</dt><dd>{record.initiativeResponse}</dd></div>
          <div className="detail__long"><dt>Anything else</dt><dd>{record.additionalInformation || 'Nothing added'}</dd></div>
          <div><dt>Registered</dt><dd>{when(record.createdAt)}</dd></div>
          <div><dt>Consent given</dt><dd>{when(record.consentedAt)} (notice {record.privacyNoticeVersion || 'unknown'})</dd></div>
          {record.reviewedBy && <div><dt>Reviewed by (admin UID)</dt><dd className="mono">{record.reviewedBy}</dd></div>}
        </dl>
      </aside>

      {pending && (
        <ConfirmDialog
          title={pending === 'accepted' ? 'Accept this application?' : pending === 'declined' ? 'Decline this application?' : 'Move this application back to pending?'}
          confirmLabel={pending === 'accepted' ? 'Yes, accept' : pending === 'declined' ? 'Yes, decline' : 'Yes, move to pending'}
          busy={busy}
          error={error}
          onConfirm={confirm}
          onCancel={() => setPending(null)}
        >
          <p>
            <strong>{record.fullName}</strong> ({record.referenceCode}) will be marked{' '}
            <strong>{statusLabels[pending].toLowerCase()}</strong>. You can change this later.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}
