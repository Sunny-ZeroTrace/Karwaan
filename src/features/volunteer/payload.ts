import type { VolunteerFormValues } from './validation';

/** The exact application fields written by the browser (server timestamps are added by the service). */
export interface ApplicationFields {
  fullName: string;
  age: number;
  whatsappNumber: string;
  email: string;
  city: string;
  preference1: string;
  preference2: string;
  availability: string;
  unexpectedSituationResponse: string;
  independentTaskResponse: string;
  initiativeResponse: string;
  additionalInformation?: string;
  privacyConsent: true;
  privacyNoticeVersion: string;
  status: 'pending';
  /** Human-friendly reference shown to the applicant. Derived from the random document ID, never sequential. */
  referenceCode: string;
  /** Lower-case copies used only for prefix search in the admin dashboard. */
  fullNameLower: string;
  emailLower: string;
}

/** "KF-" plus the first 8 letters/digits of the random Firestore ID, upper-cased. */
export function referenceFromId(id: string): string {
  return 'KF-' + id.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
}

/** Maps the form's values to the Firestore field names. Trims text; never alters meaning. */
export function buildApplicationFields(
  v: VolunteerFormValues,
  ctx: { referenceCode: string; noticeVersion: string },
): ApplicationFields {
  const fullName = v.fullName.trim();
  const email = v.email.trim();
  const fields: ApplicationFields = {
    fullName,
    age: Number(v.age.trim()),
    whatsappNumber: v.whatsapp.trim(),
    email,
    city: v.city.trim(),
    preference1: v.preference1,
    preference2: v.preference2,
    availability: v.availability,
    unexpectedSituationResponse: v.scenario1.trim(),
    independentTaskResponse: v.scenario2.trim(),
    initiativeResponse: v.scenario3.trim(),
    privacyConsent: true,
    privacyNoticeVersion: ctx.noticeVersion,
    status: 'pending',
    referenceCode: ctx.referenceCode,
    fullNameLower: fullName.toLowerCase(),
    emailLower: email.toLowerCase(),
  };
  const extra = v.notes.trim();
  if (extra) fields.additionalInformation = extra;
  return fields;
}
