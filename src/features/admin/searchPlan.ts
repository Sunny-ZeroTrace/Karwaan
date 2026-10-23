export type SearchPlan =
  | { kind: 'none' }
  | { kind: 'name'; term: string }
  | { kind: 'email'; term: string }
  | { kind: 'reference'; term: string };

/**
 * Decides how a search box entry is answered. Search is server-side and PREFIX based:
 *  - contains "@"      -> applicants whose email STARTS WITH the text
 *  - starts with "KF-" -> the application with exactly that reference number
 *  - anything else     -> applicants whose full name STARTS WITH the text
 * Matching is case-insensitive. It does not search the middle of a name or the written answers.
 */
export function planSearch(raw: string): SearchPlan {
  const term = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!term) return { kind: 'none' };
  if (term.includes('@')) return { kind: 'email', term };
  if (term.startsWith('kf-')) return { kind: 'reference', term: term.toUpperCase() };
  return { kind: 'name', term };
}
