import { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAdminAuth } from './auth/AuthContext';
import { AdminGate } from './pages/AdminGate';
import ApplicationsPage from './pages/ApplicationsPage';
import LoginPage from './pages/LoginPage';
import Overview from './pages/Overview';
import './admin.css';

function Shell() {
  const { state, signOut } = useAdminAuth();

  if (state.status === 'loading') return <p className="admin-loading mono" role="status">Checking your access…</p>;
  if (state.status === 'signed-out' || state.status === 'not-configured') return <Navigate to="/admin/login" replace />;
  if (state.status !== 'admin') {
    return (
      <div className="admin-gate-wrap">
        <AdminGate state={state} />
      </div>
    );
  }

  const links = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/applications/all', label: 'All' },
    { to: '/admin/applications/pending', label: 'Pending' },
    { to: '/admin/applications/accepted', label: 'Accepted' },
    { to: '/admin/applications/declined', label: 'Declined' },
  ];

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__brand">
          <img src="/brand/logo-mark.png" alt="" width={36} height={36} />
          <span className="mono">(Admin)</span>
        </div>
        <nav className="admin__nav" aria-label="Admin">
          <ul>
            {links.map((l) => (
              <li key={l.to}><NavLink to={l.to} end={l.end}>{l.label}</NavLink></li>
            ))}
          </ul>
        </nav>
        <div className="admin__user">
          <span className="mono muted admin__email">{state.email}</span>
          <button type="button" className="btn btn--line" onClick={() => void signOut()}>Sign out</button>
        </div>
      </header>
      <main className="admin__main" id="main">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="applications/:view" element={<ApplicationsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/** Everything under /admin. Loaded lazily so visitors never download the dashboard code. */
export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prev = document.title;
    document.title = 'Admin | Karwaan Foundation';
    return () => {
      meta.remove();
      document.title = prev;
    };
  }, []);

  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<Shell />} />
      </Routes>
    </AuthProvider>
  );
}
