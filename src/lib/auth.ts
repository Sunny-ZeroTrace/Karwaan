import { connectAuthEmulator, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirebaseApp, useEmulators } from './firebase';

let cached: Auth | null = null;

/** Firebase Authentication. Only the admin area imports this, so public visitors never download it. */
export function getAuthInstance(): Auth {
  if (cached) return cached;
  const auth = getAuth(getFirebaseApp());
  if (useEmulators) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    } catch {
      /* Already connected (hot reload). */
    }
  }
  cached = auth;
  return auth;
}
