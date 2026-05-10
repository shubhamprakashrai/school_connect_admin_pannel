/**
 * Public "/register" — schools sign themselves up.
 * Uses `POST /tenants/register` (the public, unauthenticated endpoint).
 *
 * Multi-step wizard mirrors the AddSchoolForm shape but is presented in a
 * public, marketing-y AuthShell.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthShell from './AuthShell';
import { tenantService } from '../../services/tenant.service';
import type {
  SubscriptionPlan,
  TenantRegistrationRequest,
} from '../../types/tenant';

const STEPS = ['School', 'Address', 'Plan & admin'] as const;

const PLANS: Array<{ value: SubscriptionPlan; label: string; tagline: string; recommended?: boolean }> = [
  { value: 'TRIAL',    label: 'Trial',    tagline: 'Free for 30 days', recommended: true },
  { value: 'STANDARD', label: 'Standard', tagline: '$39 / school / mo' },
  { value: 'PREMIUM',  label: 'Premium',  tagline: '$79 / school / mo' },
];

const empty: TenantRegistrationRequest = {
  name: '', subdomain: '', email: '', phone: '',
  address: '', city: '', state: '', country: 'India', postalCode: '',
  subscriptionPlan: 'TRIAL', website: '',
  userRequest: { firstName: '', middleName: '', lastName: '', email: '', phone: '' },
  createDefaultClasses: true, studentLoginRequired: false,
};

type Errors = Record<string, string>;

function validate(step: number, f: TenantRegistrationRequest): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = 'Required';
    else if (f.name.length < 3) e.name = 'At least 3 characters';
    if (!f.subdomain.trim()) e.subdomain = 'Required';
    else if (!/^[a-z0-9-]+$/.test(f.subdomain)) e.subdomain = 'lowercase, digits, hyphens only';
    if (!f.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Invalid email';
    if (!f.phone.trim()) e.phone = 'Required';
    else if (!/^[0-9]{10}$/.test(f.phone)) e.phone = '10 digits';
  }
  if (step === 1) {
    if (!f.address.trim()) e.address = 'Required';
    if (!f.city.trim()) e.city = 'Required';
    if (!f.state.trim()) e.state = 'Required';
    if (!f.country.trim()) e.country = 'Required';
  }
  if (step === 2) {
    const u = f.userRequest;
    if (!u.firstName.trim()) e.firstName = 'Required';
    if (!u.lastName.trim()) e.lastName = 'Required';
    if (!u.email.trim()) e.userEmail = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(u.email)) e.userEmail = 'Invalid email';
    if (!u.phone.trim()) e.userPhone = 'Required';
    else if (!/^[0-9]{10}$/.test(u.phone)) e.userPhone = '10 digits';
  }
  return e;
}

interface InputProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  helper?: string;
  prefix?: string;
  suffix?: string;
  maxLength?: number;
}

function Input({ label, required, value, onChange, type = 'text', error, helper, prefix, suffix, maxLength }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="relative flex">
        {prefix && (
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-ink-500 dark:text-slate-400">
            {prefix}
          </span>
        )}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className={`flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-ink-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
            prefix ? 'rounded-r-lg' : suffix ? 'rounded-l-lg' : 'rounded-lg'
          } ${error ? 'border-rose-400' : ''}`}
        />
        {suffix && (
          <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-ink-500 dark:text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {(error || helper) && (
        <div className={`text-xs mt-1 ${error ? 'text-rose-500' : 'text-ink-400 dark:text-slate-500'}`}>
          {error || helper}
        </div>
      )}
    </div>
  );
}

export default function RegisterSchoolPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TenantRegistrationRequest>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ accessUrl: string; adminEmail: string } | null>(null);

  const setField = <K extends keyof TenantRegistrationRequest>(k: K, v: TenantRegistrationRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));
  const setUser = (k: keyof TenantRegistrationRequest['userRequest'], v: string) =>
    setForm((p) => ({ ...p, userRequest: { ...p.userRequest, [k]: v } }));

  const isLast = step === STEPS.length - 1;

  const next = () => {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (isLast) void submit();
    else setStep((s) => s + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await tenantService.register(form);
      setDone({ accessUrl: res.accessUrl, adminEmail: form.userRequest.email });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <AuthShell
        title="School registered"
        subtitle="Your account is being set up. Login credentials are on the way."
      >
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            We've sent the admin password to <strong>{done.adminEmail}</strong>.
          </p>
          {done.accessUrl && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
              Access URL: <span className="font-mono">{done.accessUrl}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full mt-5 py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition"
        >
          Continue to sign in
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Onboard your school"
      subtitle="Three quick steps and you're live. Free 30-day trial — no card needed."
      footer={
        <Link to="/" className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < step ? 'bg-brand-gradient text-white' : i === step ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border-2 border-brand-500' : 'bg-slate-100 dark:bg-slate-800 text-ink-300 dark:text-slate-500'
            }`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-ink-900 dark:text-slate-100' : 'text-ink-500 dark:text-slate-400'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <Input label="School name" required value={form.name} onChange={(v) => setField('name', v)} error={errors.name} />
          <Input
            label="Subdomain" required value={form.subdomain}
            onChange={(v) => setField('subdomain', v.toLowerCase())}
            error={errors.subdomain} suffix=".schoolconnect.com"
            helper="Your school's unique URL"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Contact email" required type="email" value={form.email} onChange={(v) => setField('email', v)} error={errors.email} />
            <Input label="Contact phone" required value={form.phone}
              onChange={(v) => setField('phone', v.replace(/\D/g, ''))}
              error={errors.phone} helper="10 digits" maxLength={10} />
          </div>
          <Input label="Website (optional)" value={form.website || ''} onChange={(v) => setField('website', v)} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <Input label="Address" required value={form.address} onChange={(v) => setField('address', v)} error={errors.address} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" required value={form.city} onChange={(v) => setField('city', v)} error={errors.city} />
            <Input label="State" required value={form.state} onChange={(v) => setField('state', v)} error={errors.state} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Country" required value={form.country} onChange={(v) => setField('country', v)} error={errors.country} />
            <Input label="Postal code" value={form.postalCode}
              onChange={(v) => setField('postalCode', v.toUpperCase())} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-2">Plan</label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((p) => {
                const selected = form.subscriptionPlan === p.value;
                return (
                  <button
                    key={p.value} type="button"
                    onClick={() => setField('subscriptionPlan', p.value)}
                    className={`relative px-3 py-2.5 rounded-lg border-2 text-left transition-all ${
                      selected
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                    }`}
                  >
                    {p.recommended && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-semibold">
                        Recommended
                      </span>
                    )}
                    <div className="text-sm font-semibold text-ink-900 dark:text-slate-100">{p.label}</div>
                    <div className="text-[11px] text-ink-500 dark:text-slate-400">{p.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-ink-500 dark:text-slate-400 pt-2">
            Initial admin user — credentials will be emailed.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" required value={form.userRequest.firstName} onChange={(v) => setUser('firstName', v)} error={errors.firstName} />
            <Input label="Last name" required value={form.userRequest.lastName} onChange={(v) => setUser('lastName', v)} error={errors.lastName} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Admin email" required type="email" value={form.userRequest.email} onChange={(v) => setUser('email', v)} error={errors.userEmail} />
            <Input label="Admin phone" required value={form.userRequest.phone}
              onChange={(v) => setUser('phone', v.replace(/\D/g, ''))}
              error={errors.userPhone} helper="10 digits" maxLength={10} />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-ink-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={submitting}
          className="inline-flex items-center gap-1 px-5 py-2 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60"
        >
          {submitting ? 'Creating…' : isLast ? 'Create school' : 'Continue'}
          {!isLast && !submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </AuthShell>
  );
}
