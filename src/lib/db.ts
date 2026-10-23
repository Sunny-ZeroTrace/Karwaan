import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore/lite';
import type { Firestore } from 'firebase/firestore/lite';
import { getFirebaseApp, useEmulators } from './firebase';

let cached: Firestore | null = null;

/** Firestore (Lite build: no realtime listeners, smaller download). Used by the public form and the admin area. */
export function getDb(): Firestore {
  if (cached) return cached;
  const db = getFirestore(getFirebaseApp());
  if (useEmulators) {
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    } catch {
      /* Already connected (hot reload). */
    }
  }
  cached = db;
  return db;
}
