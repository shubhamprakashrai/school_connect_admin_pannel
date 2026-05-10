/** Pricing section — monthly/yearly toggle + comparison cards. */

import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Cadence = 'monthly' | 'yearly';

const PLANS = [
  {
    name: 'Trial',
    tagline: 'Test the waters',
    monthly: 0,
    yearly: 0,
    cta: 'Start free trial',
    features: [
      '30 days, full access',
      'Up to 100 students',
      'Email support',
      'No credit card needed',
    ],
    badge: null as string | null,
  },
  {
    name: 'Standard',
    tagline: 'Most schools start here',
    monthly: 49,
    yearly: 39,
    cta: 'Get started',
    features: [
      'Up to 1,000 students',
      'Bulk import + parent portal',
      'Attendance + calendar',
      'Priority email support',
      'Quarterly product reviews',
    ],
    badge: 'Most popular',
  },
  {
    name: 'Premium',
    tagline: 'For growing networks',
    monthly: 99,
    yearly: 79,
    cta: 'Talk to sales',
    features: [
      'Up to 5,000 students',
      'Multi-tenant + analytics',
      'API access + integrations',
      'Dedicated success manager',
      'Custom training & onboarding',
    ],
    badge: null,
  },
  {
    name: 'Enterprise',
    tagline: 'Districts & networks',
    monthly: null,
    yearly: null,
    cta: 'Contact us',
    features: [
      'Unlimited students',
      'White-label + SSO',
      'Custom SLAs',
      '24/7 phone support',
      'On-prem deployment available',
    ],
    badge: null,
  },
];

const Pricing = () => {
  const [cadence, setCadence] = useState<Cadence>('yearly');

  const priceFor = (p: typeof PLANS[number]) =>
    p.monthly == null ? null : cadence === 'monthly' ? p.monthly : p.yearly;

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-mesh-radial opacity-50" />
      <div className="container relative mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            Honest pricing. <span className="text-transparent bg-clip-text bg-brand-gradient">No surprises.</span>
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            Pay per school, not per student. Switch plans any time.
          </p>

          <div className="mt-8 inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-card-soft">
            {(['monthly', 'yearly'] as Cadence[]).map((c) => (
              <button
                key={c}
                onClick={() => setCadence(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  cadence === c ? 'bg-brand-gradient text-white shadow-glow-brand' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {c === 'monthly' ? 'Monthly' : 'Yearly'}
                {c === 'yearly' && (
                  <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                    -20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {PLANS.map((plan, i) => {
            const price = priceFor(plan);
            const popular = plan.badge === 'Most popular';
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`relative rounded-3xl border p-6 flex flex-col ${
                  popular
                    ? 'border-transparent bg-gradient-to-b from-brand-50 to-white shadow-glow-brand ring-2 ring-brand-500/30'
                    : 'border-slate-200 bg-white shadow-card-soft'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gradient text-white text-xs font-semibold flex items-center gap-1 shadow-glow-brand">
                    <Sparkles className="w-3 h-3" /> {plan.badge}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-ink-900">{plan.name}</h3>
                <p className="text-sm text-ink-500 mt-0.5">{plan.tagline}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  {price == null ? (
                    <span className="text-3xl font-bold text-ink-900">Custom</span>
                  ) : price === 0 ? (
                    <span className="text-4xl font-bold text-ink-900">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-ink-900">${price}</span>
                      <span className="text-ink-500 text-sm">/ school / mo</span>
                    </>
                  )}
                </div>
                {cadence === 'yearly' && price != null && price > 0 && (
                  <div className="text-xs text-emerald-600 font-medium mt-1">
                    Billed annually — save 20%
                  </div>
                )}

                <ul className="mt-6 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-6 inline-flex items-center justify-center gap-1 px-5 py-3 rounded-xl font-semibold transition-all ${
                    popular
                      ? 'bg-brand-gradient text-white shadow-glow-brand hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
