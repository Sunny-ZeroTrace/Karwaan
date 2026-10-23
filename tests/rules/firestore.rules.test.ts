/**
 * Firestore Security Rules tests. They run against the Firebase Emulator, NOT the real project:
 *   npm run test:rules
 * (needs Java 11+ and the firebase-tools package from devDependencies).
 */
import { after, before, beforeEach, describe, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'demo-karwaan';
let env: RulesTestEnvironment;

const ADMIN = { uid: 'admin1', email: 'admin@example.com' };
const asAdmin = () => env.authenticatedContext(ADMIN.uid, { email: ADMIN.email, email_verified: true }).firestore();
const asInactive = () => env.authenticatedContext('inactive1', { email: 'inactive@example.com', email_verified: true }).firestore();
const asStranger = () => env.authenticatedContext('stranger1', { email: 'stranger@example.com', email_verified: true }).firestore();
const asUnverified = () => env.authenticatedContext('unverified1', { email: 'unverified@example.com', email_verified: false }).firestore();
const asMismatch = () => env.authenticatedContext('mismatch1', { email: 'real@example.com', email_verified: true }).firestore();
const asPublic = () => env.unauthenticatedContext().firestore();

/** A valid public application, with server timestamps (as the real form writes it). */
const validApp = (over: Record<string, unknown> = {}) => ({
  fullName: 'Asha Verma',
  age: 24,
  whatsappNumber: '+91 98765 43210',
  email: 'Asha@Example.com',
  city: 'Jamshedpur',
  preference1: 'Education',
  preference2: 'Animal Welfare',
  availability: 'Weekends',
  unexpectedSituationResponse: 'I would regroup.\nThen assign tasks.',
  independentTaskResponse: 'I would ask and plan.',
  initiativeResponse: 'I would tell the lead.',
  additionalInformation: 'Happy to help.',
  privacyConsent: true,
  privacyNoticeVersion: 'placeholder-0',
  status: 'pending',
  referenceCode: 'KF-AB12CD34',
  fullNameLower: 'asha verma',
  emailLower: 'asha@example.com',
  createdAt: serverTimestamp(),
  consentedAt: serverTimestamp(),
  ...over,
});

const SEED_ID = 'seeded1';

before(async () => {
  env = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'admins', ADMIN.uid), { email: ADMIN.email, role: 'admin', active: true });
    await setDoc(doc(db, 'admins', 'inactive1'), { email: 'inactive@example.com', role: 'admin', active: false });
    await setDoc(doc(db, 'admins', 'unverified1'), { email: 'unverified@example.com', role: 'admin', active: true });
    await setDoc(doc(db, 'admins', 'mismatch1'), { email: 'someone-else@example.com', role: 'admin', active: true });
    await setDoc(doc(db, 'volunteerApplications', SEED_ID), validApp({ createdAt: new Date(), consentedAt: new Date() }));
  });
});

describe('public visitors', () => {
  test('can create a valid pending application (all ages allowed)', async () => {
    await assertSucceeds(setDoc(doc(asPublic(), 'volunteerApplications', 'new1'), validApp()));
    for (const [i, age] of [0, 5, 12, 17, 99, 150].entries()) {
      await assertSucceeds(setDoc(doc(asPublic(), 'volunteerApplications', `age${i}`), validApp({ age })));
    }
  });

  test('every submitted field is stored unchanged', async () => {
    await setDoc(doc(asPublic(), 'volunteerApplications', 'keep1'), validApp());
    await env.withSecurityRulesDisabled(async (ctx) => {
      const d = (await getDoc(doc(ctx.firestore(), 'volunteerApplications', 'keep1'))).data()!;
      if (d.fullName !== 'Asha Verma' || d.age !== 24 || d.status !== 'pending' || d.unexpectedSituationResponse !== 'I would regroup.\nThen assign tasks.') {
        throw new Error('stored data differs from the submission');
      }
    });
  });

  test('cannot read, list, update or delete applications', async () => {
    const db = asPublic();
    await assertFails(getDoc(doc(db, 'volunteerApplications', SEED_ID)));
    await assertFails(getDocs(collection(db, 'volunteerApplications')));
    await assertFails(updateDoc(doc(db, 'volunteerApplications', SEED_ID), { status: 'accepted' }));
    await assertFails(deleteDoc(doc(db, 'volunteerApplications', SEED_ID)));
  });

  test('cannot overwrite an existing application by submitting to its id', async () => {
    await assertFails(setDoc(doc(asPublic(), 'volunteerApplications', SEED_ID), validApp({ fullName: 'Hijacked' })));
  });

  test('cannot submit as accepted or declined, or with review fields', async () => {
    const db = asPublic();
    await assertFails(setDoc(doc(db, 'volunteerApplications', 'a'), validApp({ status: 'accepted' })));
    await assertFails(setDoc(doc(db, 'volunteerApplications', 'b'), validApp({ status: 'declined' })));
    await assertFails(setDoc(doc(db, 'volunteerApplications', 'c'), validApp({ reviewedBy: 'admin1' })));
    await assertFails(setDoc(doc(db, 'volunteerApplications', 'd'), validApp({ reviewedAt: serverTimestamp() })));
  });

  test('rejects invalid data', async () => {
    const db = asPublic();
    const bad: Record<string, Record<string, unknown>> = {
      samePreferences: { preference2: 'Education' },
      badPreference: { preference1: 'Gardening' },
      badAvailability: { availability: 'Whenever' },
      noConsent: { privacyConsent: false },
      blankName: { fullName: '   ' },
      blankScenario: { initiativeResponse: ' \n ' },
      negativeAge: { age: -1 },
      fractionalAge: { age: 2.5 },
      stringAge: { age: '24' },
      badEmail: { email: 'not-an-email' },
      badPhone: { whatsappNumber: 'call me' },
      tooLong: { unexpectedSituationResponse: 'x'.repeat(3001) },
      clientClock: { createdAt: new Date('2020-01-01') },
      clientConsentClock: { consentedAt: new Date('2020-01-01') },
      extraField: { isAdmin: true },
      badReference: { referenceCode: 'ABC' },
      badLowerName: { fullNameLower: 'someone else' },
      badLowerEmail: { emailLower: 'x@y.com' },
    };
    for (const [name, over] of Object.entries(bad)) {
      await assertFails(setDoc(doc(db, 'volunteerApplications', `bad-${name}`), validApp(over)));
    }
  });

  test('missing required fields are rejected', async () => {
    const full = validApp() as Record<string, unknown>;
    for (const key of ['fullName', 'age', 'whatsappNumber', 'email', 'city', 'preference1', 'preference2', 'availability',
      'unexpectedSituationResponse', 'independentTaskResponse', 'initiativeResponse', 'privacyConsent', 'privacyNoticeVersion', 'status']) {
      const copy = { ...full };
      delete copy[key];
      await assertFails(setDoc(doc(asPublic(), 'volunteerApplications', `missing-${key}`), copy));
    }
  });

  test('additionalInformation is optional', async () => {
    const copy = validApp() as Record<string, unknown>;
    delete copy.additionalInformation;
    await assertSucceeds(setDoc(doc(asPublic(), 'volunteerApplications', 'noextra'), copy));
  });

  test('cannot create admin records or grant themselves admin', async () => {
    await assertFails(setDoc(doc(asPublic(), 'admins', 'me'), { email: 'me@example.com', role: 'admin', active: true }));
    await assertFails(setDoc(doc(asStranger(), 'admins', 'stranger1'), { email: 'stranger@example.com', role: 'admin', active: true }));
  });

  test('unknown collections are not exposed', async () => {
    await assertFails(getDocs(collection(asPublic(), 'somethingElse')));
    await assertFails(setDoc(doc(asPublic(), 'somethingElse', 'x'), { a: 1 }));
    await assertFails(setDoc(doc(asAdmin(), 'somethingElse', 'x'), { a: 1 }));
  });
});

describe('administrators', () => {
  test('an active, verified, allowlisted admin can read and list applications', async () => {
    await assertSucceeds(getDoc(doc(asAdmin(), 'volunteerApplications', SEED_ID)));
    await assertSucceeds(getDocs(collection(asAdmin(), 'volunteerApplications')));
  });

  test('can review: only status, reviewedAt and reviewedBy change', async () => {
    const ref = doc(asAdmin(), 'volunteerApplications', SEED_ID);
    await assertSucceeds(updateDoc(ref, { status: 'accepted', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid }));
    await assertSucceeds(updateDoc(ref, { status: 'declined', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid }));
    await assertSucceeds(updateDoc(ref, { status: 'pending', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid }));
  });

  test('cannot alter the applicant\'s original answers through a review', async () => {
    const ref = doc(asAdmin(), 'volunteerApplications', SEED_ID);
    const review = { status: 'accepted', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid };
    for (const extra of [{ fullName: 'Changed' }, { email: 'x@y.com' }, { age: 3 }, { preference1: 'Education', preference2: 'Education' },
      { initiativeResponse: 'edited' }, { createdAt: serverTimestamp() }, { privacyConsent: false }, { referenceCode: 'KF-ZZZZZZZZ' }]) {
      await assertFails(updateDoc(ref, { ...review, ...extra }));
    }
    await assertFails(updateDoc(ref, { fullName: 'Changed' }));
  });

  test('review metadata must match the admin and the request time', async () => {
    const ref = doc(asAdmin(), 'volunteerApplications', SEED_ID);
    await assertFails(updateDoc(ref, { status: 'accepted', reviewedAt: serverTimestamp(), reviewedBy: 'someone-else' }));
    await assertFails(updateDoc(ref, { status: 'accepted', reviewedAt: new Date('2020-01-01'), reviewedBy: ADMIN.uid }));
    await assertFails(updateDoc(ref, { status: 'accepted', reviewedBy: ADMIN.uid }));
    await assertFails(updateDoc(ref, { status: 'accepted' }));
  });

  test('status must be a known value and actually change', async () => {
    const ref = doc(asAdmin(), 'volunteerApplications', SEED_ID);
    await assertFails(updateDoc(ref, { status: 'maybe', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid }));
    await assertFails(updateDoc(ref, { status: 'pending', reviewedAt: serverTimestamp(), reviewedBy: ADMIN.uid }));
  });

  test('cannot delete applications', async () => {
    await assertFails(deleteDoc(doc(asAdmin(), 'volunteerApplications', SEED_ID)));
  });

  test('cannot create, list, update or delete admin records from the browser', async () => {
    await assertFails(setDoc(doc(asAdmin(), 'admins', 'newadmin'), { email: 'n@example.com', role: 'admin', active: true }));
    await assertFails(updateDoc(doc(asAdmin(), 'admins', ADMIN.uid), { active: false }));
    await assertFails(deleteDoc(doc(asAdmin(), 'admins', ADMIN.uid)));
    await assertFails(getDocs(collection(asAdmin(), 'admins')));
  });

  test('may read only their own admin record', async () => {
    await assertSucceeds(getDoc(doc(asAdmin(), 'admins', ADMIN.uid)));
    await assertFails(getDoc(doc(asAdmin(), 'admins', 'inactive1')));
    await assertFails(getDoc(doc(asPublic(), 'admins', ADMIN.uid)));
    await assertFails(getDoc(doc(asUnverified(), 'admins', 'unverified1')));
  });
});

describe('accounts that must be refused', () => {
  const review = () => ({ status: 'accepted', reviewedAt: serverTimestamp(), reviewedBy: 'x' });
  const cases: [string, () => ReturnType<typeof asAdmin>][] = [
    ['an authenticated but non-allowlisted user', asStranger],
    ['an inactive administrator', asInactive],
    ['an administrator whose email is unverified', asUnverified],
    ['an administrator whose record email does not match', asMismatch],
  ];
  for (const [name, who] of cases) {
    test(`${name} cannot read or modify applications`, async () => {
      const db = who();
      await assertFails(getDoc(doc(db, 'volunteerApplications', SEED_ID)));
      await assertFails(getDocs(collection(db, 'volunteerApplications')));
      await assertFails(updateDoc(doc(db, 'volunteerApplications', SEED_ID), review()));
    });
  }
});
