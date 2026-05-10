/** Premium footer with newsletter signup, link columns, social row. */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Send, Sparkles, ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email');
      return;
    }
    setSubmitting(true);
    // No /newsletter endpoint yet — keep this client-side until one ships.
    setTimeout(() => {
      setSubmitting(false);
      setEmail('');
      toast.success('Subscribed — see you in your inbox');
    }, 600);
  };

  const year = new Date().getFullYear();

  const cols = [
    {
      heading: 'Product',
      links: [
        { label: 'Features',    href: '#features' },
        { label: 'Pricing',     href: '#pricing' },
        { label: 'Demo',        href: '#product-demo' },
        { label: 'Roadmap',     href: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About',       href: '#about' },
        { label: 'Contact',     href: '#contact' },
        { label: 'Careers',     href: '#' },
        { label: 'Blog',        href: '#' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Help center', href: '#' },
        { label: 'Status',      href: '#' },
        { label: 'API docs',    href: '#' },
        { label: 'Changelog',   href: '#' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy',     href: '#' },
        { label: 'Terms',       href: '#' },
        { label: 'Security',    href: '#' },
        { label: 'GDPR',        href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink-900 text-slate-300 mt-12">
      {/* Decorative top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-24 w-72 h-72 rounded-full bg-accent-pink/20 blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6 py-16">
        {/* Newsletter band */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 text-xs font-medium mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span className="text-white">Monthly product update</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white font-display">
              School operations tips, in your inbox.
            </h3>
            <p className="text-sm text-white/70 mt-1">
              Once a month — no spam. Unsubscribe any time.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex w-full md:w-auto md:min-w-[420px] gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-lg text-white font-semibold bg-brand-gradient shadow-glow-brand hover:opacity-95 transition disabled:opacity-60"
            >
              {submitting ? 'Subscribing…' : <>Subscribe <Send className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        {/* Top: brand + cols */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-bold shadow-glow-brand">
                SC
              </div>
              <div className="leading-tight">
                <div className="text-base font-bold text-white font-display">School Connect</div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">School OS</div>
              </div>
            </Link>
            <p className="text-sm text-white/70 max-w-xs leading-relaxed">
              The all-in-one platform admins, teachers and parents actually love using.
            </p>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> hello@schoolconnect.example.com</div>
              <div className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3" /> +91 98765 43210</div>
              <div className="inline-flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Bengaluru · India</div>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.heading}>
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">
                {c.heading}
              </div>
              <ul className="space-y-2 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}
                      className="text-white/70 hover:text-white transition">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: trust + social */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
            <span>© {year} School Connect. All rights reserved.</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> ISO 27001 · GDPR
            </span>
          </div>
          <div className="flex items-center gap-3">
            {[
              { Icon: Twitter,   label: 'Twitter',   href: '#' },
              { Icon: Linkedin,  label: 'LinkedIn',  href: '#' },
              { Icon: Instagram, label: 'Instagram', href: '#' },
              { Icon: Github,    label: 'GitHub',    href: '#' },
            ].map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
