/**
 * Error state — used for failed API calls. Pairs nicely with `apiService`
 * which throws an `ApiError` with a `message` property.
 */

import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  size = 'md',
}: ErrorStateProps) {
  const padding = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-16' : 'py-12';
  return (
    <div className={`text-center ${padding}`}>
      <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4 border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-ink-900 font-display">{title}</h3>
      {message && (
        <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">{message}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white bg-brand-gradient shadow-glow-brand hover:opacity-95 transition"
        >
          <RotateCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
