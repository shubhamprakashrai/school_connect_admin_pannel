/**
 * /first-login?token=…
 *
 * Welcome-email landing page. Calls GET /auth/first-login-info to show the
 * user "Setting password for {Name} ({email}) — {tenant}", then POSTs the
 * token + chosen password to /auth/first-login. The backend response is
 * a full AuthResponse, so the user is auto-logged-in (no second login round-trip).
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';
import AuthShell from './AuthShell';

const PASSWORD_RULE = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

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

interface TokenInfo {
  userId: string; email: string; fullName: string; tenantId: string; valid: boolean;
}

export default function FirstLoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [info, setInfo] = useState<TokenInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rules = useMemo(() => checkRules(pw), [pw]);
  const valid = rules.every((r) => r.ok) && pw === confirm;

  useEffect(() => {
    if (!token) { setLoadingInfo(false); return; }
    authService.firstLoginInfo(token)
      .then((res) => {
        setInfo(res);
        if (!res.valid) setInfoError('This welcome link has expired or already been used.');
      })
      .catch((err) => {
        setInfoError((err as { message?: string }).message || 'Could not validate this link');
      })
      .finally(() => setLoadingInfo(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Welcome token missing from the link'); return; }
    if (!PASSWORD_RULE.test(pw)) { toast.error('Password does not meet requirements'); return; }
    if (pw !== confirm) { toast.error('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const res = await authService.firstLogin({ token, newPassword: pw });
      toast.success(`Welcome, ${res.user.firstName || res.user.email}!`);
      // Route to the right portal based on role.
      const role = String(res.user.role || '').toUpperCase();
      const dest = role === 'PARENT' ? '/parent'
        : role === 'STUDENT' ? '/student'
        : '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not complete first-login');
    } finally {
      setSubmitting(false);
    }
  };

  // No token in URL.
  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This welcome link is missing its token.">
        <Link to="/" className="text-brand-600 dark:text-brand-300 hover:underline">
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  // Loading the token info.
  if (loadingInfo) {
    return (
      <AuthShell title="Verifying your link" subtitle="Just a moment…">
        <div className="flex justify-center py-6 text-ink-500 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </AuthShell>
    );
  }

  // Token rejected.
  if (infoError || !info) {
    return (
      <AuthShell title="Link unusable" subtitle={infoError || 'This link is no longer valid.'}>
        <Link to="/forgot-password" className="text-brand-600 dark:text-brand-300 hover:underline">
          Request a password-reset link instead
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set your password"
      subtitle={`Setting up account for ${info.fullName} (${info.email}) — ${info.tenantId}`}
      footer={
        <Link to="/" className="text-brand-600 dark:text-brand-300 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <PasswordInput id="pw" label="New password" value={pw} onChange={setPw}
          show={show} onToggleShow={() => setShow((v) => !v)} autoFocus />
        <PasswordInput id="confirm" label="Confirm password" value={confirm} onChange={setConfirm}
          show={show} onToggleShow={() => setShow((v) => !v)} />

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

        <button type="submit" disabled={submitting || !valid}
          className="w-full py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Setting password…' : 'Activate my account'}
        </button>
      </form>
    </AuthShell>
  );
}

interface PasswordInputProps {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void;
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
        <input id={id} type={show ? 'text' : 'password'} required autoFocus={autoFocus}
          autoComplete="new-password"
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-ink-300 dark:text-slate-500 hover:text-ink-900 dark:hover:text-slate-100"
          aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
