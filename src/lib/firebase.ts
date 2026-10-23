import { getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

/**
 * Public Firebase web configuration. These values are NOT secrets: they ship to every visitor's
 * browser. Database safety comes from firestore.rules, not from hiding this config.
 * Each variable is read explicitly so Vite can substitute it at build time.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
const appCheckKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as string | undefined;

/** Names (never values) of the settings that are empty or missing in this build. */
export const missingFirebaseVars: string[] = [
  ['VITE_FIREBASE_API_KEY', config.apiKey],
  ['VITE_FIREBASE_AUTH_DOMAIN', config.authDomain],
  ['VITE_FIREBASE_PROJECT_ID', config.projectId],
  ['VITE_FIREBASE_APP_ID', config.appId],
]
  .filter(([, v]) => typeof v !== 'string' || v.trim() === '' || v.startsWith('YOUR_'))
  .map(([name]) => name as string);

export const isFirebaseConfigured = Object.values(config).every(
  (v) => typeof v === 'string' && v.trim() !== '' && !v.startsWith('YOUR_'),
);

export class FirebaseNotConfiguredError extends Error {
  readonly code = 'app/not-configured';
  constructor() {
    super('Firebase is not configured. Copy .env.example to .env.local and fill in the values.');
  }
}

let cached: FirebaseApp | null = null;

/** Lazily creates the Firebase app. Throws FirebaseNotConfiguredError if the env values are missing. */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new FirebaseNotConfiguredError();
  if (cached) return cached;
  const app = getApps()[0] ?? initializeApp(config as Record<string, string>);
  if (appCheckKey && !useEmulators) {
    try {
      initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appCheckKey), isTokenAutoRefreshEnabled: true });
    } catch {
      /* Already initialised (hot reload). */
    }
  }
  cached = app;
  return app;
}
