/** Contact — premium form + clarifying touchpoint cards. */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, MessageCircle, Phone, Send, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

interface FormState {
  name: string;
  email: string;
  schoolName: string;
  inquiry: 'demo' | 'pricing' | 'support' | 'other';
  message: string;
}

const empty: FormState = {
  name: '', email: '', schoolName: '', inquiry: 'demo', message: '',
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill the required fields'); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Enter a valid email'); return;
    }
    setSubmitting(true);
    // No /contact endpoint yet — UX-only stub.
    setTimeout(() => {
      setSubmitting(false); setDone(true); setForm(empty);
    }, 700);
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-mesh-radial opacity-50" />
      <div className="relative container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Talk to us
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            We reply{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient">within a working day.</span>
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            Whether it's a demo or a sticky question — drop a note. A real human responds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Touchpoints */}
          <div className="space-y-3">
            <Touchpoint
              icon={Mail}
              title="Email"
              line="hello@schoolconnect.example.com"
              hint="Replies within a working day"
              gradient="from-brand-500 to-accent-cyan"
            />
            <Touchpoint
              icon={Phone}
              title="Phone"
              line="+91 98765 43210"
              hint="Mon–Fri · 9am–6pm IST"
              gradient="from-accent-violet to-accent-pink"
            />
            <Touchpoint
              icon={MessageCircle}
              title="Live chat"
              line="In-app, bottom right"
              hint="Tap the bubble after sign-in"
              gradient="from-emerald-500 to-accent-cyan"
            />
            <Touchpoint
              icon={MapPin}
              title="Office"
              line="HSR Layout, Bengaluru"
              hint="By appointment only"
              gradient="from-amber-500 to-accent-pink"
            />
          </div>

          {/* Form */}
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 rounded-3xl bg-white border border-slate-100 shadow-card-soft p-6 md:p-8"
          >
            {done ? (
              <div className="text-center py-12">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-ink-900 font-display">Message sent</h3>
                <p className="text-ink-500 mt-1.5">We'll be in touch within a working day.</p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="mt-4 text-sm font-medium text-brand-600 hover:underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Your name" required value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Email" required type="email" value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })} />
                  <Field label="School name" value={form.schoolName}
                    onChange={(v) => setForm({ ...form, schoolName: v })} />
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">What's this about?</label>
                    <select
                      value={form.inquiry}
                      onChange={(e) => setForm({ ...form, inquiry: e.target.value as FormState['inquiry'] })}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <option value="demo">Book a demo</option>
                      <option value="pricing">Pricing question</option>
                      <option value="support">Customer support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-ink-700 mb-1">Message<span className="text-rose-500"> *</span></label>
                  <textarea
                    required rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your school and what you're hoping to solve…"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-y"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs text-ink-500">
                    We never share your details. <a href="#" className="underline">Privacy</a>.
                  </span>
                  <button
                    type="submit" disabled={submitting}
                    className="inline-flex items-center gap-1 px-6 py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60"
                  >
                    {submitting ? 'Sending…' : <>Send message <Send className="w-4 h-4" /></>}
                  </button>
                </div>
              </>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

interface FieldProps { label: string; required?: boolean; type?: string; value: string; onChange: (v: string) => void; }
function Field({ label, required, type = 'text', value, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={type} required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>
  );
}

interface TouchpointProps {
  icon: typeof Mail; title: string; line: string; hint: string; gradient: string;
}
function Touchpoint({ icon: Icon, title, line, hint, gradient }: TouchpointProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 hover:shadow-card-soft transition-all hover:-translate-y-0.5 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink-900">{title}</div>
        <div className="text-sm text-ink-700 truncate">{line}</div>
        <div className="text-xs text-ink-500 mt-0.5">{hint}</div>
      </div>
    </div>
  );
}
