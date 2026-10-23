import {
  collection,
  doc,
  getCount as getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore/lite';
import type { DocumentSnapshot, QueryConstraint } from 'firebase/firestore/lite';
import { getDb } from '../../lib/db';
import { planSearch } from './searchPlan';
import type { SearchPlan } from './searchPlan';
import { STATUSES } from './types';
import type { ApplicationRecord, Status, StatusFilter } from './types';

const COLLECTION = 'volunteerApplications';

const asDate = (v: unknown): Date | null =>
  v && typeof (v as { toDate?: unknown }).toDate === 'function' ? (v as { toDate: () => Date }).toDate() : null;
const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

export function recordFromSnapshot(snap: DocumentSnapshot): ApplicationRecord {
  const d = (snap.data() ?? {}) as Record<string, unknown>;
  return {
    id: snap.id,
    referenceCode: asString(d.referenceCode),
    fullName: asString(d.fullName),
    age: typeof d.age === 'number' ? d.age : NaN,
    whatsappNumber: asString(d.whatsappNumber),
    email: asString(d.email),
    city: asString(d.city),
    preference1: asString(d.preference1),
    preference2: asString(d.preference2),
    availability: asString(d.availability),
    unexpectedSituationResponse: asString(d.unexpectedSituationResponse),
    independentTaskResponse: asString(d.independentTaskResponse),
    initiativeResponse: asString(d.initiativeResponse),
    additionalInformation: asString(d.additionalInformation),
    privacyNoticeVersion: asString(d.privacyNoticeVersion),
    status: (STATUSES as readonly string[]).includes(asString(d.status)) ? (d.status as Status) : 'pending',
    createdAt: asDate(d.createdAt),
    consentedAt: asDate(d.consentedAt),
    reviewedAt: asDate(d.reviewedAt),
    reviewedBy: asString(d.reviewedBy),
  };
}

/** Counts per status using server-side aggregation (cheap: no documents are downloaded). */
export async function getStatusCounts(): Promise<Record<Status, number> & { total: number }> {
  const col = collection(getDb(), COLLECTION);
  const counts = await Promise.all(
    STATUSES.map(async (s) => (await getCountFromServer(query(col, where('status', '==', s)))).data().count),
  );
  const out = { pending: 0, accepted: 0, declined: 0, total: 0 };
  STATUSES.forEach((s, i) => {
    out[s] = counts[i];
    out.total += counts[i];
  });
  return out;
}

function constraintsFor(status: StatusFilter, plan: SearchPlan): QueryConstraint[] {
  const c: QueryConstraint[] = [];
  if (status !== 'all') c.push(where('status', '==', status));
  switch (plan.kind) {
    case 'none':
      c.push(orderBy('createdAt', 'desc'));
      break;
    case 'name':
      c.push(where('fullNameLower', '>=', plan.term), where('fullNameLower', '<=', plan.term + '\uf8ff'), orderBy('fullNameLower'));
      break;
    case 'email':
      c.push(where('emailLower', '>=', plan.term), where('emailLower', '<=', plan.term + '\uf8ff'), orderBy('emailLower'));
      break;
    case 'reference':
      c.push(where('referenceCode', '==', plan.term));
      break;
  }
  return c;
}

export interface ApplicationPage {
  items: ApplicationRecord[];
  cursor: DocumentSnapshot | null;
  hasMore: boolean;
}

/** One page of applications. Pass the previous page's `cursor` to continue. */
export async function listApplications(opts: {
  status: StatusFilter;
  search: string;
  cursor?: DocumentSnapshot | null;
  pageSize?: number;
}): Promise<ApplicationPage> {
  const db = getDb();
  const pageSize = opts.pageSize ?? 20;
  const constraints = constraintsFor(opts.status, planSearch(opts.search));
  if (opts.cursor) constraints.push(startAfter(opts.cursor));
  constraints.push(limit(pageSize + 1)); // one extra row tells us whether another page exists
  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const visible = hasMore ? docs.slice(0, pageSize) : docs;
  return {
    items: visible.map(recordFromSnapshot),
    cursor: hasMore ? visible[visible.length - 1] : null,
    hasMore,
  };
}

/**
 * Changes only status, reviewedAt and reviewedBy (firestore.rules rejects anything else).
 * Returns the freshly read record so server timestamps are real values.
 */
export async function reviewApplication(id: string, status: Status, adminUid: string): Promise<ApplicationRecord> {
  const ref = doc(getDb(), COLLECTION, id);
  await updateDoc(ref, { status, reviewedAt: serverTimestamp(), reviewedBy: adminUid });
  return recordFromSnapshot(await getDoc(ref));
}

/** Reads every application matching the current view and search, 500 at a time (one read each). */
export async function exportApplications(status: StatusFilter, search: string, maxRecords = 10000): Promise<ApplicationRecord[]> {
  const all: ApplicationRecord[] = [];
  let cursor: DocumentSnapshot | null = null;
  for (;;) {
    const page: ApplicationPage = await listApplications({ status, search, cursor, pageSize: 500 });
    all.push(...page.items);
    if (!page.hasMore || all.length >= maxRecords) break;
    cursor = page.cursor;
  }
  return all;
}
