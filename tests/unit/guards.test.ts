import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkGuards, COOLDOWN_MS, MIN_FILL_MS } from '../../src/features/volunteer/antiSpam';
import { friendlySubmitError } from '../../src/features/volunteer/errors';

const base = { honeypot: '', elapsedMs: MIN_FILL_MS + 1, lastSubmitAt: null, now: 1_000_000 };

test('a normal submission passes', () => assert.equal(checkGuards(base), null));
test('a filled honeypot is blocked', () => assert.equal(checkGuards({ ...base, honeypot: 'x' }), 'bot'));
test('an instant submission is blocked', () => assert.equal(checkGuards({ ...base, elapsedMs: 500 }), 'too-fast'));
test('a repeat within the cooldown is blocked, after it is allowed', () => {
  assert.equal(checkGuards({ ...base, lastSubmitAt: base.now - 1000 }), 'cooldown');
  assert.equal(checkGuards({ ...base, lastSubmitAt: base.now - COOLDOWN_MS - 1 }), null);
});

test('Firebase error codes become friendly text and never leak raw details', () => {
  for (const code of ['permission-denied', 'unavailable', 'resource-exhausted', 'app/not-configured', 'weird-code']) {
    const m = friendlySubmitError({ code, message: 'RAW INTERNAL DETAIL' });
    assert.ok(m.length > 10);
    assert.ok(!m.includes('RAW INTERNAL DETAIL') && !m.includes(code === 'weird-code' ? code : '\u0000'));
  }
  assert.match(friendlySubmitError(new Error('boom')), /something went wrong/i);
});
