import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApplicationFields, referenceFromId } from '../../src/features/volunteer/payload';
import type { VolunteerFormValues } from '../../src/features/volunteer/validation';

const form: VolunteerFormValues = {
  fullName: '  Asha Verma ',
  age: '7',
  whatsapp: ' +91 98765 43210 ',
  email: ' Asha@Example.COM ',
  city: ' Jamshedpur ',
  preference1: 'Education',
  preference2: 'Animal Welfare',
  availability: 'Both weekdays and weekends',
  scenario1: ' one ',
  scenario2: ' two ',
  scenario3: ' three ',
  notes: ' extra ',
  consent: true,
};
const ctx = { referenceCode: 'KF-AB12CD34', noticeVersion: 'placeholder-0' };

test('every submitted answer is preserved under the documented field names', () => {
  const f = buildApplicationFields(form, ctx);
  assert.equal(f.fullName, 'Asha Verma');
  assert.equal(f.age, 7);
  assert.equal(f.whatsappNumber, '+91 98765 43210');
  assert.equal(f.email, 'Asha@Example.COM');
  assert.equal(f.city, 'Jamshedpur');
  assert.equal(f.preference1, 'Education');
  assert.equal(f.preference2, 'Animal Welfare');
  assert.equal(f.availability, 'Both weekdays and weekends');
  assert.equal(f.unexpectedSituationResponse, 'one');
  assert.equal(f.independentTaskResponse, 'two');
  assert.equal(f.initiativeResponse, 'three');
  assert.equal(f.additionalInformation, 'extra');
});

test('new applications are always pending with consent recorded and no review fields', () => {
  const f = buildApplicationFields(form, ctx) as unknown as Record<string, unknown>;
  assert.equal(f.status, 'pending');
  assert.equal(f.privacyConsent, true);
  assert.equal(f.privacyNoticeVersion, 'placeholder-0');
  assert.ok(!('reviewedAt' in f) && !('reviewedBy' in f));
  assert.ok(!('createdAt' in f) && !('consentedAt' in f), 'timestamps must come from the server, not the browser');
});

test('search helper fields are lower-case copies', () => {
  const f = buildApplicationFields(form, ctx);
  assert.equal(f.fullNameLower, 'asha verma');
  assert.equal(f.emailLower, 'asha@example.com');
});

test('empty additional information is left out', () => {
  assert.ok(!('additionalInformation' in buildApplicationFields({ ...form, notes: '  ' }, ctx)));
});

test('reference numbers come from the random id and look like KF-XXXXXXXX', () => {
  assert.equal(referenceFromId('aB3dE5fG7hJ9kL1mN2oP'), 'KF-AB3DE5FG');
  assert.match(referenceFromId('xyz-12_345abcdef'), /^KF-[A-Z0-9]{1,8}$/);
});
