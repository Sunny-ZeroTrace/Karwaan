import { statusLabels } from '../types';
import type { Status } from '../types';

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status status--${status}`}>{statusLabels[status]}</span>;
}
