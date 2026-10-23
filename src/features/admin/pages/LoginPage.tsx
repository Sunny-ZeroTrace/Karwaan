import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/AuthContext';
import { friendlyAuthError } from '../auth/authErrors';
import { AdminGate } from './AdminGate';
import { missingFirebaseVars } from '../../../lib/firebase';

export default function LoginPage() {
  const { state, signIn, sendReset } = useAdminAuth();
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (state.status === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim()) return setError('Enter your email address.');
    if (mode === 'signin' && !password) return setError('Enter your password.');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await sendReset(email);
        setNotice('If an admin account exists for that address, a password reset email has been sent.');
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <div className="login__box">
        <Link to="/" className="login__brand">
          <img src="/brand/logo-mark.png" alt="" width={44} height={44} />
          <span>Karwaan Foundation</span>
        </Link>

        {state.status === 'not-configured' && (
          <p className="admin-error" role="alert">
            Firebase is not configured for this site yet. Missing in this build: {missingFirebaseVars.join(', ') || 'nothing'}.
            Add them in Vercel (Settings, Environment Variables) and redeploy.
          </p>
        )}

        {(state.status === 'needs-verification' || state.status === 'not-authorised' || state.status === 'error') ? (
          <AdminGate state={state} />
        ) : state.status === 'loading' ? (
          <p className="mono" role="status">Checking your access…</p>
        ) : (
          <form onSubmit={submit} noValidate aria-labelledby="login-title">
            <h1 id="login-title" className="login__title">{mode === 'signin' ? 'Admin sign in' : 'Reset your password'}</h1>
            <div className="field">
              <label className="field__label" htmlFor="admin-email">Email address</label>
              <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode === 'signin' && (
              <div className="field">
                <label className="field__label" htmlFor="admin-password">Password</label>
                <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {error && <p className="admin-error" role="alert">{error}</p>}
            {notice && <p className="admin-note" role="status">{notice}</p>}
            <button type="submit" className="btn btn--solid btn--lg" disabled={busy || state.status === 'not-configured'}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Send reset email'}
            </button>
            <p className="login__switch">
              {mode === 'signin' ? (
                <button type="button" className="link-btn" onClick={() => { setMode('reset'); setError(''); setNotice(''); }}>Forgot your password?</button>
              ) : (
                <button type="button" className="link-btn" onClick={() => { setMode('signin'); setError(''); setNotice(''); }}>Back to sign in</button>
              )}
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
