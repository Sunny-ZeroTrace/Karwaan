import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore/lite';
import { getAuthInstance } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import { isFirebaseConfigured } from '../../../lib/firebase';
import { evaluateAdminRecord } from './adminCheck';

export type AdminState =
  | { status: 'not-configured' }
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'needs-verification'; email: string }
  | { status: 'not-authorised'; email: string; uid?: string; reason?: string }
  | { status: 'error'; email: string; message: string }
  | { status: 'admin'; uid: string; email: string };

interface AuthApi {
  state: AdminState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  /** Re-reads the account (for example after the person clicked the verification link). */
  recheck: () => Promise<void>;
}

const Ctx = createContext<AuthApi | null>(null);

export function useAdminAuth(): AuthApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdminAuth must be used inside AuthProvider');
  return v;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(isFirebaseConfigured ? { status: 'loading' } : { status: 'not-configured' });
  const run = useRef(0); // ignores results of superseded checks

  const evaluate = useCallback(async (user: User) => {
    const my = ++run.current;
    const email = user.email ?? '';
    const apply = (s: AdminState) => {
      if (run.current === my) setState(s);
    };
    try {
      await user.reload(); // fresh emailVerified value
      if (!user.emailVerified) return apply({ status: 'needs-verification', email });
      await user.getIdToken(true); // fresh token so rules see email_verified === true
      const db = getDb();
      let record: Record<string, unknown> | null = null;
      let readError = '';
      try {
        const snap = await getDoc(doc(db, 'admins', user.uid));
        record = snap.exists() ? (snap.data() as Record<string, unknown>) : null;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        if (code !== 'permission-denied') throw err;
        record = null; // rules refused: treat as not authorised
        readError = 'permission-denied (Firestore rules refused reading admins/' + user.uid + ')';
      }
      const decision = evaluateAdminRecord(record, { email: user.email, emailVerified: user.emailVerified });
      apply(
        decision.ok
          ? { status: 'admin', uid: user.uid, email }
          : { status: 'not-authorised', email, uid: user.uid, reason: readError || decision.reason },
      );
    } catch {
      apply({ status: 'error', email, message: 'We could not check your access. Check your connection and try again.' });
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const auth = getAuthInstance();
    // Firebase keeps the session in the browser, so refreshing the page keeps an admin signed in.
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        run.current++;
        setState({ status: 'signed-out' });
        return;
      }
      setState({ status: 'loading' });
      void evaluate(user);
    });
  }, [evaluate]);

  const api = useMemo<AuthApi>(
    () => ({
      state,
      signIn: async (email, password) => {
        const auth = getAuthInstance();
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signOut: async () => {
        const auth = getAuthInstance();
        await fbSignOut(auth);
      },
      sendReset: async (email) => {
        const auth = getAuthInstance();
        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (err) {
          const code = (err as { code?: string })?.code;
          // Never reveal whether an account exists; only report problems unrelated to the address.
          if (code === 'auth/network-request-failed' || code === 'auth/too-many-requests') throw err;
        }
      },
      resendVerification: async () => {
        const auth = getAuthInstance();
        if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      },
      recheck: async () => {
        const auth = getAuthInstance();
        if (auth.currentUser) {
          setState({ status: 'loading' });
          await evaluate(auth.currentUser);
        }
      },
    }),
    [state, evaluate],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
