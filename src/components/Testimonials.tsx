/**
 * Testimonials — auto-scrolling logo strip + a featured 3-up quote grid.
 * Uses pure CSS marquee for the logo strip and framer-motion for the
 * quotes' enter animation.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const FEATURED = [
  {
    quote:
      'We replaced four tools with School Connect. Attendance that used to take 30 minutes now takes 4. Parents finally know what is going on.',
    name: 'Anjali Rao',
    role: 'Principal · Greenwood International',
    rating: 5,
    accent: 'from-brand-500 to-accent-cyan',
  },
  {
    quote:
      'The bulk import shipped a year of data in an afternoon. The team was up and running on day one. Support is genuinely responsive.',
    name: 'Rahul Mehta',
    role: 'Operations Lead · Sunrise Academy',
    rating: 5,
    accent: 'from-accent-violet to-accent-pink',
  },
  {
    quote:
      'My favorite is the parent portal. Every weeknight, my notifications stay quiet — parents have what they need on their phone.',
    name: 'Priya Iyer',
    role: 'Class teacher · Future Leaders Institute',
    rating: 5,
    accent: 'from-emerald-500 to-accent-cyan',
  },
];

const LOGOS = [
  'Greenwood International',
  'Sunrise Academy',
  'Future Leaders Institute',
  'Modern Education Hub',
  'Lakeside School',
  'Crestwood Public',
  'Riverside Academy',
  'Wellspring Schools',
];

export default function Testimonials() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-radial opacity-40" />

      <div className="relative container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Loved by educators
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            Real schools.{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient">Real outcomes.</span>
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            500+ institutions ship daily ops on School Connect. Here's what they say.
          </p>
        </div>

        {/* Logo marquee */}
        <div
          className="relative mb-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex gap-12 whitespace-nowrap py-3"
            style={{
              animation: paused ? 'none' : 'marquee 35s linear infinite',
              minWidth: 'max-content',
            }}
          >
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span
                key={i}
                className="text-sm font-semibold text-ink-300 tracking-wide hover:text-ink-700 transition"
              >
                {l}
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>

        {/* Featured quotes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {FEATURED.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative group rounded-3xl border border-slate-100 bg-white p-6 hover:shadow-card-soft transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <Quote className="w-7 h-7 text-brand-500/40 mb-3" />
              <p className="text-ink-700 text-[15px] leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, n) => (
                  <Star key={n} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.accent} text-white text-sm font-semibold flex items-center justify-center`}>
                  {t.name.charAt(0)}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-ink-900">{t.name}</div>
                  <div className="text-xs text-ink-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
