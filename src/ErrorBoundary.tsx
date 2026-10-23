import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Shows the real error on screen instead of a blank white page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1.25rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
        <p style={{ marginBottom: '1rem' }}>
          Please reload the page. If it keeps happening, send a screenshot of the message below.
        </p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f1f1f1', padding: '1rem', fontSize: '0.85rem' }}>
          {String(this.state.error.message || this.state.error)}
        </pre>
        <button type="button" onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.6rem 1.2rem' }}>
          Reload
        </button>
      </div>
    );
  }
}