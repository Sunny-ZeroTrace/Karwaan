import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { PRIVACY_NOTICE_VERSION } from '../config/privacy';
import { checkGuards, guardMessages } from '../features/volunteer/antiSpam';
import { friendlySubmitError } from '../features/volunteer/errors';
import { buildApplicationFields, referenceFromId } from '../features/volunteer/payload';
import type { VolunteerFormValues } from '../features/volunteer/validation';
import { getDb } from '../lib/db';

export type SubmitResult = { ok: true; referenceCode: string } | { ok: false; message: string };

const LAST_KEY = 'kf_last_submit';
const readLast = (): number | null => {
  try {
    const v = window.localStorage.getItem(LAST_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
};
const writeLast = () => {
  try {
    window.localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {
    /* Private mode: the cooldown is only a convenience. */
  }
};

/**
 * Saves one volunteer application to Cloud Firestore (collection "volunteerApplications").
 * Resolves ok:true ONLY after Firebase has confirmed the write. Timestamps come from the server.
 * Firestore Security Rules (firestore.rules) re-validate everything checked here.
 */
export async function submitVolunteerApplication(
  values: VolunteerFormValues,
  guard: { honeypot: string; elapsedMs: number },
): Promise<SubmitResult> {
  const reason = checkGuards({ ...guard, lastSubmitAt: readLast(), now: Date.now() });
  if (reason) return { ok: false, message: guardMessages[reason] };

  try {
    const db = getDb();
    const ref = doc(collection(db, 'volunteerApplications')); // random ID, generated locally
    const referenceCode = referenceFromId(ref.id);
    const fields = buildApplicationFields(values, { referenceCode, noticeVersion: PRIVACY_NOTICE_VERSION });
    await setDoc(ref, { ...fields, createdAt: serverTimestamp(), consentedAt: serverTimestamp() });
    writeLast();
    return { ok: true, referenceCode };
  } catch (err) {
    return { ok: false, message: friendlySubmitError(err) };
  }
}
