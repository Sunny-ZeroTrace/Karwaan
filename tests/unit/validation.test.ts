import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyValues, validate } from '../../src/features/volunteer/validation';
import type { VolunteerFormValues } from '../../src/features/volunteer/validation';

const good: VolunteerFormValues = {
  fullName: 'Asha Verma',
  age: '24',
  whatsapp: '+91 98765 43210',
  email: 'asha@example.com',
  city: 'Jamshedpur',
  preference1: 'Education',
  preference2: 'Animal Welfare',
  availability: 'Weekends',
  scenario1: 'I would regroup the team.',
  scenario2: 'I would ask questions and write a plan.',
  scenario3: 'I would tell the lead and help.',
  notes: '',
  consent: true,
};

test('a complete valid form has no errors (optional notes may be empty)', () => {
  assert.deepEqual(validate(good), {});
});

test('every required field is reported when the form is empty', () => {
  const e = validate(emptyValues);
  for (const k of ['fullName', 'age', 'whatsapp', 'email', 'city', 'preference1', 'preference2', 'availability', 'scenario1', 'scenario2', 'scenario3', 'consent']) {
    assert.ok(e[k as keyof typeof e], `expected an error for ${k}`);
  }
  assert.equal(e.notes, undefined);
});

test('identical first and second preference is rejected', () => {
  const e = validate({ ...good, preference2: good.preference1 });
  assert.match(e.preference2 ?? '', /different/i);
});

test('consent must be ticked', () => {
  assert.ok(validate({ ...good, consent: false }).consent);
});

test('all ages are accepted: no minimum or maximum eligibility cutoff', () => {
  for (const age of ['0', '5', '12', '17', '18', '65', '99', '150']) {
    assert.equal(validate({ ...good, age }).age, undefined, `age ${age} should be accepted`);
  }
});

test('age must still be a whole non-negative number', () => {
  for (const age of ['-3', '2.5', 'abc', '', '1000']) {
    assert.ok(validate({ ...good, age }).age, `age "${age}" should be rejected`);
  }
});

test('international phone formats are accepted, junk is not', () => {
  for (const w of ['+91 98765 43210', '9876543210', '+44 20 7946 0958', '+1 (415) 555-2671']) {
    assert.equal(validate({ ...good, whatsapp: w }).whatsapp, undefined, w);
  }
  for (const w of ['12345', 'call me', '+++9876543210']) assert.ok(validate({ ...good, whatsapp: w }).whatsapp, w);
});

test('email format is checked', () => {
  assert.ok(validate({ ...good, email: 'not-an-email' }).email);
  assert.equal(validate({ ...good, email: 'a.b+c@sub.example.org' }).email, undefined);
});

test('whitespace-only answers count as empty', () => {
  assert.ok(validate({ ...good, scenario1: '   \n ' }).scenario1);
  assert.ok(validate({ ...good, fullName: '   ' }).fullName);
});
