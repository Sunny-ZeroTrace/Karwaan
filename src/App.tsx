import { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteFooter } from './components/layout/SiteFooter';
import { PageTransition } from './components/layout/PageTransition';
import { Cursor } from './components/ui/Cursor';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Heavier pages load on demand to keep the first visit fast.
const Volunteer = lazy(() => import('./pages/Volunteer'));
const About = lazy(() => import('./pages/About'));
const Work = lazy(() => import('./pages/Work'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
// The admin area (and the Firebase code it needs) is only downloaded when someone opens /admin.
const AdminApp = lazy(() => import('./features/admin/AdminApp'));

export default function App() {
  const location = useLocation();

  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Cursor />
      <SiteHeader />
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/work" element={<Work />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </AnimatePresence>
      <SiteFooter />
    </>
  );
}
