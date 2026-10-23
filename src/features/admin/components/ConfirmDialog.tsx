import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Small modal that asks before an important action. Esc cancels; Tab stays inside. */
export function ConfirmDialog({ title, children, confirmLabel, busy, error, onConfirm, onCancel }: Props) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('[data-cancel]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (!busy) onCancel();
      } else if (e.key === 'Tab') {
        const f = Array.from(box.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? []);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      opener?.focus();
    };
  }, [busy, onCancel]);

  return (
    <div className="modal" data-confirm-open>
      <div className="modal__box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" ref={box}>
        <h2 id="confirm-title" className="modal__title">{title}</h2>
        <div className="modal__body">{children}</div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--line" data-cancel onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn--solid" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
