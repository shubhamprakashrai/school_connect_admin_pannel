/**
 * /verify-email?token=...
 * Auto-runs the verify call on mount, shows success or error with a
 * "resend verification" form when the token is invalid/expired.
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import AuthShell from './AuthShell';

type Status = 'verifying' | 'success' | 'invalid';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'invalid');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resend form state
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resentTo, setResentTo] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    authService.verifyEmail({ token })
      .then(() => alive && setStatus('success'))
      .catch((err) => {
        if (!alive) return;
        setStatus('invalid');
        setErrorMsg((err as { message?: string }).message || 'Verification link is invalid or expired.');
      });
    return () => { alive = false; };
  }, [token]);

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(resendEmail)) {
      toast.error('Please enter a valid email');
      return;
    }
    setResending(true);
    try {
      await authService.resendVerification({ email: resendEmail });
      setResentTo(resendEmail);
      setResendEmail('');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not resend');
    } finally {
      setResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <AuthShell title="Verifying your email" subtitle="Hang tight — this only takes a second.">
        <div className="flex justify-center py-6">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-brand-100" />
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          </div>
        </div>
      </AuthShell>
    );
  }

  if (status === 'success') {
    return (
      <AuthShell
        title="Email verified ✓"
        subtitle="Your account is fully activated. You can sign in now."
        footer={
          <Link to="/" className="text-brand-600 dark:text-brand-300 hover:underline">
            Continue to sign in
          </Link>
        }
      >
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Welcome aboard — your school account is ready.
          </p>
        </div>
      </AuthShell>
    );
  }

  // status === 'invalid'
  return (
    <AuthShell
      title="Link is invalid or expired"
      subtitle={errorMsg || 'We could not verify this link. Request a new one below.'}
      footer={
        <Link to="/" className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      }
    >
      <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-500/10 p-5 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Verification links expire after a short window. Enter your email and we'll send a fresh one.
          </p>
        </div>
      </div>

      {resentTo ? (
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/10 p-5 text-sm text-emerald-800 dark:text-emerald-200">
          A new verification link has been sent to <strong>{resentTo}</strong>.
          <button
            type="button"
            onClick={() => setResentTo(null)}
            className="block mt-3 text-sm text-emerald-700 dark:text-emerald-300 underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={resend} className="space-y-3">
          <div>
            <label htmlFor="resend-email" className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
              Account email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 dark:text-slate-500" />
              <input
                id="resend-email" type="email" autoComplete="email" required
                value={resendEmail} onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@school.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>
          <button
            type="submit" disabled={resending}
            className="w-full py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60"
          >
            {resending ? 'Sending…' : 'Resend verification email'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
