import { useState } from 'react';
import { useAdminAuth } from '../auth/AuthContext';
import type { AdminState } from '../auth/AuthContext';
import { friendlyAuthError } from '../auth/authErrors';

/** What a signed-in person sees when they are not (yet) allowed into the admin area. */
export function AdminGate({ state }: { state: Extract<AdminState, { status: 'needs-verification' | 'not-authorised' | 'error' }> }) {
  const { signOut, resendVerification, recheck } = useAdminAuth();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const resend = async () => {
    setBusy(true);
    try {
      await resendVerification();
      setNotice('Verification email sent. Open the link in it, then choose "I have verified my email".');
    } catch (e) {
      setNotice(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gate" role="region" aria-labelledby="gate-title">
      {state.status === 'needs-verification' && (
        <>
          <h1 id="gate-title" className="gate__title">Verify your email address</h1>
          <p>
            Admin access needs a verified email address. We can send a verification link to{' '}
            <strong>{state.email}</strong>.
          </p>
          <div className="gate__actions">
            <button type="button" className="btn btn--solid" onClick={resend} disabled={busy}>Send verification email</button>
            <button type="button" className="btn btn--line" onClick={() => void recheck()}>I have verified my email</button>
          </div>
        </>
      )}
      {state.status === 'not-authorised' && (
        <>
          <h1 id="gate-title" className="gate__title">This account cannot use the admin area</h1>
          <p>
            You are signed in as <strong>{state.email}</strong>, but this account has not been given admin
            access. If you should have access, ask the person who manages the Foundation&rsquo;s admins.
          </p>
          <p className="mono" style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
            Reason: {state.reason ?? 'unknown'}
            <br />
            Your UID: {state.uid ?? 'unknown'}
          </p>
        </>
      )}
      {state.status === 'error' && (
        <>
          <h1 id="gate-title" className="gate__title">We could not check your access</h1>
          <p>{state.message}</p>
          <div className="gate__actions">
            <button type="button" className="btn btn--solid" onClick={() => void recheck()}>Try again</button>
          </div>
        </>
      )}
      {notice && <p className="admin-note" role="status">{notice}</p>}
      <p className="gate__out">
        <button type="button" className="link-btn" onClick={() => void signOut()}>Sign out</button>
      </p>
    </div>
  );
}
