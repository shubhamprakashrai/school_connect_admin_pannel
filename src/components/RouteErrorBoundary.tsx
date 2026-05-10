/**
 * Route-aware error boundary.
 *
 * - Catches render errors and shows a friendly fallback (no white-screen-of-death).
 * - Resets automatically on navigation (so the fallback doesn't stick around
 *   after the user clicks "go home").
 * - Logs to console so dev/Sentry can pick it up.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, RotateCw, AlertOctagon } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<
  { children: ReactNode; resetKey: string; onReset: () => void },
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Caught by RouteErrorBoundary:', error, info);
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-2xl mb-5">
            <AlertOctagon className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">Something went wrong</h1>
          <p className="text-ink-500 mt-2 text-sm">
            We hit an unexpected error rendering this page. The team has been notified.
          </p>
          {this.state.error?.message && (
            <pre className="mt-4 text-left text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-40 overflow-auto text-ink-700">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-ink-700 hover:bg-slate-50 transition"
            >
              <RotateCw className="w-4 h-4" /> Try again
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white bg-brand-gradient shadow-glow-brand hover:opacity-95 transition"
            >
              <Home className="w-4 h-4" /> Take me home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

/** Wrapper that resets the boundary whenever the URL changes. */
export default function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundaryInner resetKey={location.pathname} onReset={() => window.location.reload()}>
      {children}
    </ErrorBoundaryInner>
  );
}
