/** FAQ — accordion with search filter. */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

const QA = [
  {
    q: 'How long does onboarding take?',
    a: 'Most schools are live in under a week. Bulk-import a year of student data in an afternoon, invite teachers from a CSV, and start marking attendance the same day.',
  },
  {
    q: 'Is there a free trial?',
    a: '30-day full-access trial, no credit card. Migrate everything in, decide later. If you cancel, you keep an export of your data.',
  },
  {
    q: 'Can parents see fees and attendance?',
    a: 'Yes — the parent portal shows attendance summaries, calendar events, and receipts. Push notifications for absences are opt-in.',
  },
  {
    q: 'How does multi-school work?',
    a: 'School Connect is multi-tenant by design. One platform can host independent schools or a district network with isolated data and a shared SuperAdmin.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Encrypted at rest in your region of choice (AP-South-1 by default). ISO 27001 audited, GDPR-ready DPA available on request.',
  },
  {
    q: 'Can we integrate with our existing systems?',
    a: 'REST APIs cover every entity, plus webhooks for student/attendance events. SSO via SAML / Google / Microsoft on the Premium and Enterprise plans.',
  },
  {
    q: 'What devices work for teachers?',
    a: 'Anything with a modern browser. Native iOS and Android apps cover attendance, notices and quick lookups for teachers and parents.',
  },
  {
    q: 'How is pricing structured?',
    a: 'Per school, per month — not per student. Pick the tier that matches your size; switch up or down any time. Annual billing saves 20%.',
  },
];

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return QA;
    const q = query.toLowerCase();
    return QA.filter(({ q: question, a }) =>
      question.toLowerCase().includes(q) || a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section id="faq" className="py-24 relative bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            Answers, before you ask.
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            Still curious? Hit us up via the contact form.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-ink-500">
              No questions match "{query}".
            </div>
          )}
          {filtered.map((item, i) => {
            const open = openIdx === i;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-all ${
                  open
                    ? 'border-brand-200 bg-gradient-to-br from-brand-50/40 to-white shadow-card-soft'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-ink-900">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-500 transition-transform flex-shrink-0 ${
                      open ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-0 text-ink-700 text-[15px] leading-relaxed">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
