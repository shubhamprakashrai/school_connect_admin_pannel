/** How it works — 4 numbered steps with connector line. */

import { motion } from 'framer-motion';
import {
  Calendar, FileSpreadsheet, Rocket, Settings,
} from 'lucide-react';

const STEPS = [
  {
    icon: Calendar,
    title: 'Book a demo',
    body: '15 minutes. We show the platform on your data, not generic dummy schools.',
    accent: 'from-brand-500 to-accent-cyan',
  },
  {
    icon: FileSpreadsheet,
    title: 'Bulk import',
    body: 'Drop a CSV — students, teachers, classes. We validate and load in minutes.',
    accent: 'from-accent-violet to-accent-pink',
  },
  {
    icon: Settings,
    title: 'Configure',
    body: 'Pick branding, roles and notifications. Defaults work; you tune the rest.',
    accent: 'from-emerald-500 to-accent-cyan',
  },
  {
    icon: Rocket,
    title: 'Go live',
    body: 'Same week. Teachers mark attendance from day one — parents see it on day two.',
    accent: 'from-amber-500 to-accent-pink',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            How it works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            From signup to{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient">live in a week.</span>
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            Four steps. We do the heavy lifting.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand-200 via-accent-violet/40 to-accent-pink/40" />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.accent} text-white flex items-center justify-center shadow-md`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-current text-brand-600 text-xs font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="text-sm text-ink-500 mt-1.5 leading-relaxed max-w-xs">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
