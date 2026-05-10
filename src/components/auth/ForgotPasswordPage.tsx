/**
 * /forgot-password — sends a reset link to the entered email.
 * On success we keep the user on the page with a confirmation card so they
 * remember which inbox to check.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import AuthShell from './AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Forgot your password?'}
      subtitle={sent
        ? `We've sent a reset link to ${email}. The link expires in 30 minutes.`
        : "Enter your account email and we'll send a reset link."}
      footer={
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/10 p-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            If an account with this email exists, the link is on its way.
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail(''); }}
            className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 underline"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 dark:text-slate-500" />
              <input
                id="email" type="email" autoFocus required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
