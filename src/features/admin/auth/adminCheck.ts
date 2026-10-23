export interface AdminRecord {
  role?: unknown;
  active?: unknown;
  email?: unknown;
}

export type AdminDecision =
  | { ok: true }
  | { ok: false; reason: 'unverified' | 'no-record' | 'not-admin-role' | 'inactive' | 'email-mismatch' };

/**
 * The client-side half of admin authorisation (the rules in firestore.rules enforce the same checks
 * on the server, and are the real protection). All of these must hold:
 *  - the account's email is verified
 *  - an admins/{uid} record exists with role "admin" and active === true
 *  - the record's email matches the signed-in user's email
 */
export function evaluateAdminRecord(
  record: AdminRecord | null,
  user: { email: string | null; emailVerified: boolean },
): AdminDecision {
  if (!user.emailVerified) return { ok: false, reason: 'unverified' };
  if (!record) return { ok: false, reason: 'no-record' };
  if (record.role !== 'admin') return { ok: false, reason: 'not-admin-role' };
  if (record.active !== true) return { ok: false, reason: 'inactive' };
  const a = typeof record.email === 'string' ? record.email.trim().toLowerCase() : '';
  const b = (user.email ?? '').trim().toLowerCase();
  if (!a || a !== b) return { ok: false, reason: 'email-mismatch' };
  return { ok: true };
}
