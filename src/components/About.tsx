/** About — story + values + team highlights. */

import { motion } from 'framer-motion';
import { Award, Heart, Sparkles, Target, Users } from 'lucide-react';

const VALUES = [
  {
    icon: Heart,
    title: 'Educators first',
    body: 'Every feature ships only after a teacher has used it for a week without breaking a sweat.',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    icon: Target,
    title: 'Daily-use simple',
    body: 'Beautiful is nice. Easy is non-negotiable. We optimise for the 9am rush, not the demo reel.',
    accent: 'from-brand-500 to-accent-cyan',
  },
  {
    icon: Award,
    title: 'Built to last',
    body: 'ISO 27001 audited, GDPR ready, daily off-site backups. Your data, your rules.',
    accent: 'from-amber-500 to-accent-pink',
  },
  {
    icon: Sparkles,
    title: 'Quietly delightful',
    body: 'Sub-second pages, keyboard shortcuts, dark mode and Hindi support. Tools you reach for.',
    accent: 'from-accent-violet to-accent-pink',
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-light bg-grid-light opacity-40 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />

      <div className="relative container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
              About us
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display leading-tight">
              We're building the school OS{' '}
              <span className="text-transparent bg-clip-text bg-brand-gradient">we wish we'd had.</span>
            </h2>
            <p className="text-ink-500 mt-5 text-lg leading-relaxed">
              School Connect started in 2024 when a principal complained, in a single sentence,
              about juggling six different tools just to run morning attendance. One year and
              500+ schools later, we're still chasing the same goal: a single, calm platform
              that gets out of the way of teaching.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="Schools" value="500+" />
              <Stat label="Students" value="220K" />
              <Stat label="Up-time" value="99.97%" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-gradient opacity-25 blur-2xl rounded-[36px]" />
            <div className="relative rounded-3xl bg-white border border-slate-100 p-6 shadow-card-soft">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-brand-600" />
                <span className="text-sm font-semibold text-ink-900">Our team</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gradient-to-br from-brand-400 via-accent-violet to-accent-pink"
                    style={{ filter: `hue-rotate(${i * 25}deg)` }}
                  />
                ))}
              </div>
              <p className="text-sm text-ink-500 leading-relaxed">
                A 24-person team based in Bengaluru, India — engineers, designers, ex-teachers
                and a stubbornly curious customer success crew. We answer your tickets ourselves.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-2xl border border-slate-100 bg-white p-5 hover:shadow-card-soft transition-all hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.accent} text-white flex items-center justify-center mb-3`}>
                <v.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink-900">{v.title}</h3>
              <p className="text-ink-500 mt-1.5 text-sm leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-bold text-ink-900 font-display">{value}</div>
      <div className="text-xs uppercase text-ink-500 tracking-widest mt-0.5">{label}</div>
    </div>
  );
}
