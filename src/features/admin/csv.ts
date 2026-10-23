import type { ApplicationRecord } from './types';

export const csvColumns: { header: string; get: (r: ApplicationRecord) => string | number }[] = [
  { header: 'Reference', get: (r) => r.referenceCode },
  { header: 'Registered at', get: (r) => iso(r.createdAt) },
  { header: 'Status', get: (r) => r.status },
  { header: 'Full name', get: (r) => r.fullName },
  { header: 'Age', get: (r) => r.age },
  { header: 'WhatsApp number', get: (r) => r.whatsappNumber },
  { header: 'Email', get: (r) => r.email },
  { header: 'City', get: (r) => r.city },
  { header: 'Preference 1', get: (r) => r.preference1 },
  { header: 'Preference 2', get: (r) => r.preference2 },
  { header: 'Availability', get: (r) => r.availability },
  { header: 'Unexpected situation response', get: (r) => r.unexpectedSituationResponse },
  { header: 'Independent task response', get: (r) => r.independentTaskResponse },
  { header: 'Initiative response', get: (r) => r.initiativeResponse },
  { header: 'Additional information', get: (r) => r.additionalInformation },
  { header: 'Privacy notice version', get: (r) => r.privacyNoticeVersion },
  { header: 'Consented at', get: (r) => iso(r.consentedAt) },
  { header: 'Reviewed at', get: (r) => iso(r.reviewedAt) },
  { header: 'Reviewed by (admin UID)', get: (r) => r.reviewedBy },
];

function iso(d: Date | null): string {
  return d ? d.toISOString() : '';
}

/**
 * One CSV cell. Quotes are doubled, and text starting with = + - @ (or a tab/CR) gets a leading
 * apostrophe so spreadsheet programs do not run it as a formula ("CSV injection").
 */
export function csvCell(value: string | number): string {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s) && typeof value === 'string') s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Builds the CSV text (with a byte-order mark so Excel reads UTF-8 correctly). */
export function toCsv(records: ApplicationRecord[]): string {
  const lines = [csvColumns.map((c) => csvCell(c.header)).join(',')];
  for (const r of records) lines.push(csvColumns.map((c) => csvCell(c.get(r))).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}
