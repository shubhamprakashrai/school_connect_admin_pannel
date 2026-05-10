/**
 * Premium hero — animated gradient mesh + glassmorphism dashboard mockup +
 * trust badges. Designed to look like a modern SaaS landing page.
 */

import { useState } from 'react';
import { ArrowRight, Play, Sparkles, Star, Users, GraduationCap, BookOpen, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import RequestDemoModal from './RequestDemoModal';

const Hero = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section className="relative pt-28 pb-24 overflow-hidden">
      {/* Layered backgrounds: subtle grid + radial mesh + animated blobs */}
      <div className="absolute inset-0 bg-grid-light bg-grid-light opacity-50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]" />
      <div className="absolute inset-0 bg-mesh-radial" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-accent-violet/30 rounded-full blur-3xl animate-blob [animation-delay:4s]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent-pink/20 rounded-full blur-3xl animate-blob [animation-delay:8s]" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-slate-200 shadow-card-soft text-sm text-ink-700 mb-6">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="font-medium">New: Bulk import + parent portal</span>
            <span className="text-ink-300">·</span>
            <span className="text-ink-500">v2.4 just shipped</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-ink-900 mb-6 leading-[1.05] tracking-tight font-display">
            The school OS your <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-brand-gradient bg-[length:200%_200%] animate-gradient-x">
                team will love
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-brand-100 rounded-full -z-0" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-ink-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            One platform for admins, teachers and parents — students, attendance, exams,
            calendar, fees, and reports. Built for schools that want to stop juggling spreadsheets.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold bg-brand-gradient shadow-glow-brand hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Book a 15-min demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/80 backdrop-blur border border-slate-200 text-ink-700 font-semibold hover:border-brand-300 hover:text-brand-600 transition-all">
              <Play className="w-4 h-4" />
              Watch product tour
            </button>
            <RequestDemoModal
              isOpen={isDemoModalOpen}
              onClose={() => setIsDemoModalOpen(false)}
            />
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-ink-500">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-400 to-accent-violet"
                  />
                ))}
              </div>
              <span className="text-sm font-medium ml-1">500+ schools onboarded</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <Star className="w-4 h-4 fill-accent-amber text-accent-amber" />
              <span className="text-sm font-medium ml-1">4.9 average rating</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
              ISO 27001 · GDPR ready
            </div>
          </div>
        </motion.div>

        {/* Dashboard mockup card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 relative max-w-6xl mx-auto"
        >
          <div className="absolute -inset-2 bg-brand-gradient opacity-30 blur-2xl rounded-[32px]" />
          <div className="relative rounded-3xl bg-white/80 backdrop-blur border border-white/80 shadow-2xl p-3">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 px-3 py-1 rounded-md bg-slate-100 text-xs text-ink-500 font-mono">
                acme.schoolconnect.com/dashboard
              </span>
            </div>
            {/* Dashboard body */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 grid md:grid-cols-3 gap-4 min-h-[420px]">
              {[
                { label: 'Students', value: '2,148', delta: '+4.2%', icon: GraduationCap, gradient: 'from-brand-500 to-accent-cyan' },
                { label: 'Teachers', value: '142', delta: '+1.8%', icon: Users, gradient: 'from-accent-violet to-accent-pink' },
                { label: 'Avg attendance', value: '94.6%', delta: '+0.7%', icon: Activity, gradient: 'from-accent-emerald to-accent-cyan' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white shadow-card-soft p-5 border border-slate-100">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white mb-3`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-ink-900">{s.value}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{s.label}</div>
                  <div className="text-xs font-semibold text-emerald-600 mt-3">{s.delta} this month</div>
                </div>
              ))}
              <div className="md:col-span-2 rounded-2xl bg-white shadow-card-soft p-5 border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-ink-900">Attendance — last 7 days</div>
                  <BookOpen className="w-4 h-4 text-ink-300" />
                </div>
                <div className="flex-1 flex items-end gap-2">
                  {[60, 75, 68, 82, 90, 86, 94].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-md bg-brand-gradient" style={{ height: `${v}%` }} />
                      <span className="text-[10px] text-ink-300">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white shadow-card-soft p-5 border border-slate-100">
                <div className="text-sm font-semibold text-ink-900 mb-2">Recent activity</div>
                <ul className="space-y-2 text-xs text-ink-500">
                  {[
                    'Sarah marked Class 10A attendance',
                    'Holiday added: Foundation Day',
                    'New student enrolled: Class 6B',
                    'Bulk import: 47 students imported',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
