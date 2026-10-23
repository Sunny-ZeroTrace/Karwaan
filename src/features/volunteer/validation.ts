import { availabilityOptions, preferenceOptions } from '../../data/volunteer';

export interface VolunteerFormValues {
  fullName: string;
  age: string;
  whatsapp: string;
  email: string;
  city: string;
  preference1: string;
  preference2: string;
  availability: string;
  scenario1: string;
  scenario2: string;
  scenario3: string;
  notes: string;
  consent: boolean;
}

export type FieldKey = keyof VolunteerFormValues;
export type FieldErrors = Partial<Record<FieldKey, string>>;

export const emptyValues: VolunteerFormValues = {
  fullName: '',
  age: '',
  whatsapp: '',
  email: '',
  city: '',
  preference1: '',
  preference2: '',
  availability: '',
  scenario1: '',
  scenario2: '',
  scenario3: '',
  notes: '',
  consent: false,
};

/** Order the errors appear in the summary (matches the order on the page). */
export const fieldOrder: FieldKey[] = [
  'fullName',
  'age',
  'whatsapp',
  'email',
  'city',
  'preference1',
  'preference2',
  'availability',
  'scenario1',
  'scenario2',
  'scenario3',
  'consent',
];

/** Short names used in the error summary, so each message says which field it belongs to. */
export const fieldLabels: Record<FieldKey, string> = {
  fullName: 'Full name',
  age: 'Age',
  whatsapp: 'WhatsApp number',
  email: 'Email address',
  city: 'City',
  preference1: 'First preference',
  preference2: 'Second preference',
  availability: 'Availability',
  scenario1: 'Scenario 1',
  scenario2: 'Scenario 2',
  scenario3: 'Scenario 3',
  notes: 'Anything else',
  consent: 'Consent',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(values: VolunteerFormValues): FieldErrors {
  const e: FieldErrors = {};

  if (!values.fullName.trim()) e.fullName = 'Enter your full name.';

  // All ages are welcome. This only checks that a plausible non-negative whole number was typed
  // (0 to 150 is a data-sanity range, not an eligibility rule).
  const age = values.age.trim();
  if (!age) e.age = 'Enter your age.';
  else if (!/^\d{1,3}$/.test(age) || Number(age) > 150)
    e.age = 'Enter your age as a whole number, for example 24.';

  const phone = values.whatsapp.replace(/[\s\-().]/g, '');
  if (!phone) e.whatsapp = 'Enter your WhatsApp number.';
  else if (!/^\+?\d{10,15}$/.test(phone))
    e.whatsapp = 'Enter a number with 10 to 15 digits, for example +91 98765 43210.';

  if (!values.email.trim()) e.email = 'Enter your email address.';
  else if (!EMAIL.test(values.email.trim()))
    e.email = 'Enter a valid email address, for example name@example.com.';

  if (!values.city.trim()) e.city = 'Enter your city.';

  if (!values.preference1) e.preference1 = 'Choose your first preference.';
  else if (!(preferenceOptions as readonly string[]).includes(values.preference1))
    e.preference1 = 'Choose one of the listed options.';

  if (!values.preference2) e.preference2 = 'Choose your second preference.';
  else if (values.preference2 === values.preference1)
    e.preference2 = 'Choose a different area from your first preference.';

  if (!values.availability) e.availability = 'Choose your availability.';
  else if (!(availabilityOptions as readonly string[]).includes(values.availability))
    e.availability = 'Choose one of the listed options.';

  (['scenario1', 'scenario2', 'scenario3'] as const).forEach((k) => {
    if (!values[k].trim()) e[k] = 'Write your answer here. A few sentences is plenty.';
  });

  if (!values.consent) e.consent = 'Tick the box to confirm you agree before you submit.';

  return e;
}

/** The form's sections, in order. Used for the numbered headings and the progress list. */
export const sections = [
  { id: 'about', title: 'About you', fields: ['fullName', 'age', 'whatsapp', 'email', 'city'] },
  { id: 'help', title: 'Where you would like to help', fields: ['preference1', 'preference2'] },
  { id: 'availability', title: 'Your availability', fields: ['availability'] },
  { id: 'scenarios', title: 'A few scenarios', fields: ['scenario1', 'scenario2', 'scenario3'] },
  { id: 'consent', title: 'Privacy and consent', fields: ['consent'] },
] as const satisfies readonly { id: string; title: string; fields: readonly FieldKey[] }[];

export interface SectionProgress {
  id: string;
  title: string;
  done: boolean;
}

export function sectionProgress(errors: FieldErrors): SectionProgress[] {
  return sections.map((s) => ({ id: s.id, title: s.title, done: s.fields.every((f) => !errors[f]) }));
}
