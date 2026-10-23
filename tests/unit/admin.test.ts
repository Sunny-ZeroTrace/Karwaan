import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAdminRecord } from '../../src/features/admin/auth/adminCheck';
import { friendlyAuthError } from '../../src/features/admin/auth/authErrors';
import { planSearch } from '../../src/features/admin/searchPlan';
import { csvCell, toCsv } from '../../src/features/admin/csv';
import type { ApplicationRecord } from '../../src/features/admin/types';

const user = { email: 'Admin@Example.com', emailVerified: true };
const rec = { role: 'admin', active: true, email: 'admin@example.com' };

test('an active, verified, matching admin is authorised (email compared case-insensitively)', () => {
  assert.deepEqual(evaluateAdminRecord(rec, user), { ok: true });
});
test('unverified email is refused even with a valid record', () => {
  assert.deepEqual(evaluateAdminRecord(rec, { ...user, emailVerified: false }), { ok: false, reason: 'unverified' });
});
test('no record, wrong role, inactive and email mismatch are all refused', () => {
  assert.equal(evaluateAdminRecord(null, user).ok, false);
  assert.equal(evaluateAdminRecord({ ...rec, role: 'viewer' }, user).ok, false);
  assert.equal(evaluateAdminRecord({ ...rec, active: false }, user).ok, false);
  assert.equal(evaluateAdminRecord({ ...rec, active: 'true' }, user).ok, false, 'active must be the boolean true');
  assert.equal(evaluateAdminRecord({ ...rec, email: 'someone@else.com' }, user).ok, false);
  assert.equal(evaluateAdminRecord({ ...rec, email: undefined }, user).ok, false);
});

test('sign-in errors never reveal whether an account exists', () => {
  const a = friendlyAuthError({ code: 'auth/user-not-found' });
  const b = friendlyAuthError({ code: 'auth/wrong-password' });
  const c = friendlyAuthError({ code: 'auth/invalid-credential' });
  assert.equal(a, b);
  assert.equal(b, c);
  assert.match(friendlyAuthError({ code: 'auth/too-many-requests' }), /too many/i);
});

test('search plan: name prefix, email prefix, reference, or none', () => {
  assert.deepEqual(planSearch('  '), { kind: 'none' });
  assert.deepEqual(planSearch('  Asha  Ve '), { kind: 'name', term: 'asha ve' });
  assert.deepEqual(planSearch('Asha@exa'), { kind: 'email', term: 'asha@exa' });
  assert.deepEqual(planSearch('kf-ab12cd34'), { kind: 'reference', term: 'KF-AB12CD34' });
});

const record = (over: Partial<ApplicationRecord> = {}): ApplicationRecord => ({
  id: 'x1', referenceCode: 'KF-AB12CD34', fullName: 'Asha "Ace" Verma', age: 24, whatsappNumber: '+91 98765 43210',
  email: 'asha@example.com', city: 'Jamshedpur', preference1: 'Education', preference2: 'Animal Welfare',
  availability: 'Weekends', unexpectedSituationResponse: 'line1\nline2, with comma', independentTaskResponse: 'b',
  initiativeResponse: 'c', additionalInformation: '', privacyNoticeVersion: 'placeholder-0', status: 'pending',
  createdAt: new Date('2026-10-22T10:00:00Z'), consentedAt: new Date('2026-10-22T10:00:00Z'), reviewedAt: null, reviewedBy: '', ...over,
});

test('CSV escapes quotes, commas and newlines, and neutralises spreadsheet formulas', () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell('+91 98765'), '"\'+91 98765"');
  assert.equal(csvCell(24), '"24"');
  const out = toCsv([record()]);
  assert.ok(out.startsWith('\uFEFF"Reference"'));
  assert.ok(out.includes('"line1\nline2, with comma"'));
  assert.ok(out.includes('"Asha ""Ace"" Verma"'));
});

test('CSV never includes internal search helper fields', () => {
  const header = toCsv([]).split('\r\n')[0];
  assert.ok(!/lower/i.test(header));
  assert.ok(header.includes('Full name') && header.includes('Initiative response'));
});
