/**
 * Light client-side spam friction. This is NOT real protection: anyone can call Firestore directly.
 * It only discourages careless bots and accidental double sends. See setup.md (App Check) for more.
 */
export const MIN_FILL_MS = 4000;
export const COOLDOWN_MS = 60_000;

export type GuardReason = 'bot' | 'too-fast' | 'cooldown';

export const guardMessages: Record<GuardReason, string> = {
  bot: 'We could not accept this submission. Please try again.',
  'too-fast': 'That was very quick. Please check your answers and submit again.',
  cooldown: 'You already submitted a moment ago. Please wait a minute before sending another.',
};

export function checkGuards(input: {
  honeypot: string;
  elapsedMs: number;
  lastSubmitAt: number | null;
  now: number;
}): GuardReason | null {
  if (input.honeypot.trim() !== '') return 'bot';
  if (input.elapsedMs < MIN_FILL_MS) return 'too-fast';
  if (input.lastSubmitAt !== null && input.now - input.lastSubmitAt < COOLDOWN_MS) return 'cooldown';
  return null;
}
