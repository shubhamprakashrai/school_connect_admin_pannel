/**
 * /reset-password?token=...
 * Reads the token from the URL, lets the user pick a new password.
 *
 * Backend has two reset endpoints:
 *   - /auth/reset-password         — normal email-flow reset
 *   - /auth/Initialreset-password  — first-login forced reset
 * Pass `?initial=1` in the query string to use the initial-reset variant.
 */

import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import AuthShell from './AuthShell';

const PASSWORD_RULE =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

interface RuleResult { ok: boolean; label: string }

function checkRules(pw: string): RuleResult[] {
  return [
    { ok: pw.length >= 8,            label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(pw),          label: 'One uppercase letter' },
    { ok: /[a-z]/.test(pw),          label: 'One lowercase letter' },
    { ok: /[0-9]/.test(pw),          label: 'One digit' },
    { ok: /[@#$%^&+=!]/.test(pw),    label: 'One special character (@#$%^&+=!)' },
  ];
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const initial = params.get('initial') === '1';

  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const rules = useMemo(() => checkRules(pw), [pw]);
  const valid = rules.every((r) => r.ok) && pw === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Reset token missing from the link'); return; }
    if (!PASSWORD_RULE.test(pw)) { toast.error('Password does not meet requirements'); return; }
    if (pw !== confirm) { toast.error('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const fn = initial ? authService.initialResetPassword : authService.resetPassword;
      await fn({ token, newPassword: pw });
      setDone(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Reset failed — link may have expired');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This reset link is missing its token.">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={done ? 'Password updated' : initial ? 'Set your password' : 'Reset your password'}
      subtitle={done
        ? 'Redirecting you to sign in…'
        : initial
          ? 'Choose a strong password for your new account.'
          : 'Choose a new password to access your account.'}
      footer={!done && (
        <Link to="/" className="text-brand-600 dark:text-brand-300 hover:underline">
          Back to sign in
        </Link>
      )}
    >
      {done ? (
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/10 p-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput
            id="pw" label="New password" value={pw} onChange={setPw}
            show={show} onToggleShow={() => setShow((v) => !v)}
            autoFocus
          />
          <PasswordInput
            id="confirm" label="Confirm password" value={confirm} onChange={setConfirm}
            show={show} onToggleShow={() => setShow((v) => !v)}
          />

          <ul className="space-y-1 text-xs">
            {rules.map((r) => (
              <li key={r.label}
                className={`flex items-center gap-1.5 ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-500 dark:text-slate-400'}`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                  r.ok ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                }`}>
                  {r.ok ? <Check className="w-2.5 h-2.5" /> : null}
                </span>
                {r.label}
              </li>
            ))}
            {confirm && (
              <li className={`flex items-center gap-1.5 ${pw === confirm ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                  pw === confirm ? 'bg-emerald-500 text-white' : 'border border-rose-400'
                }`}>
                  {pw === confirm ? <Check className="w-2.5 h-2.5" /> : null}
                </span>
                Passwords match
              </li>
            )}
          </ul>

          <button
            type="submit" disabled={submitting || !valid}
            className="w-full py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoFocus?: boolean;
}

function PasswordInput({ id, label, value, onChange, show, onToggleShow, autoFocus }: PasswordInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 dark:text-slate-500" />
        <input
          id={id} type={show ? 'text' : 'password'} required autoFocus={autoFocus}
          autoComplete="new-password"
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
        <button
          type="button" onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-300 dark:text-slate-500 hover:text-ink-900 dark:hover:text-slate-100"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
