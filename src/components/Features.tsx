/** Features — bento grid layout with mixed card sizes. */

import { motion } from 'framer-motion';
import {
  Users, GraduationCap, MessageSquare, BarChart3, Calendar, Shield,
  Zap, BookOpen, FileSpreadsheet,
} from 'lucide-react';

const features = [
  {
    title: 'Student lifecycle',
    description: 'Admissions, profiles, promotions, transfers — one source of truth.',
    icon: GraduationCap,
    gradient: 'from-brand-500 to-accent-cyan',
    span: 'md:col-span-2',
  },
  {
    title: 'Bulk operations',
    description: 'CSV import 1000s of students in minutes with validation.',
    icon: FileSpreadsheet,
    gradient: 'from-accent-violet to-accent-pink',
    span: 'md:col-span-1',
  },
  {
    title: 'Attendance, daily',
    description: 'Mark a whole section in seconds. Auto-summaries, monthly trends.',
    icon: Calendar,
    gradient: 'from-accent-emerald to-accent-cyan',
    span: 'md:col-span-1',
  },
  {
    title: 'Analytics & reports',
    description: 'Live dashboards by class, department, and performance band.',
    icon: BarChart3,
    gradient: 'from-amber-500 to-accent-pink',
    span: 'md:col-span-2',
  },
  {
    title: 'Parent portal',
    description: 'Real-time updates for parents — attendance, fees, notices.',
    icon: Users,
    gradient: 'from-brand-500 to-accent-violet',
    span: 'md:col-span-1',
  },
  {
    title: 'Multi-tenant',
    description: 'Run multiple schools on one platform with isolated data.',
    icon: Shield,
    gradient: 'from-accent-cyan to-brand-500',
    span: 'md:col-span-1',
  },
  {
    title: 'Smart messaging',
    description: 'Targeted notices to a class, section, or individual parent.',
    icon: MessageSquare,
    gradient: 'from-accent-pink to-amber-500',
    span: 'md:col-span-1',
  },
  {
    title: 'Built for speed',
    description: 'Sub-second responses backed by edge-cached APIs.',
    icon: Zap,
    gradient: 'from-amber-500 to-brand-500',
    span: 'md:col-span-2',
  },
  {
    title: 'Curriculum tools',
    description: 'Subjects, teacher assignments, and timetabling — handled.',
    icon: BookOpen,
    gradient: 'from-accent-violet to-brand-500',
    span: 'md:col-span-1',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            Everything you need
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-ink-900 font-display">
            One platform.{' '}
            <span className="text-transparent bg-clip-text bg-brand-gradient">Every workflow.</span>
          </h2>
          <p className="text-ink-500 mt-4 text-lg">
            From the first admission form to a parent's evening notification — everything connects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`group relative ${f.span} rounded-3xl border border-slate-100 bg-white p-6 overflow-hidden hover:shadow-card-soft transition-all hover:-translate-y-0.5`}
            >
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${f.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="text-ink-500 mt-1.5 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
