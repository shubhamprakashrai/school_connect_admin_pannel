/**
 * Parent profile — pulls /parent-portal/profile, renders contact info +
 * a quick list of linked children.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Mail, Phone, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentPortalService } from '../services/parent.service';
import { PageSpinner } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import type { ParentProfile as ProfileType } from '../types/parent';

export default function ParentProfile() {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentPortalService.myProfile()
      .then(setProfile)
      .catch((err) => toast.error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;
  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Try again later." />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto print-area">
      <div className="flex justify-end print-hide">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-ink-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-amber-500/15" />
        <div className="relative p-6 flex items-center gap-4 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white text-3xl font-bold flex items-center justify-center shadow-glow-pink">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">
              {profile.fullName}
            </div>
            <div className="text-sm text-ink-500 dark:text-slate-400 mt-0.5">
              <Heart className="inline w-3.5 h-3.5 mr-1 text-rose-500" /> Parent
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-ink-700 dark:text-slate-300">
              {profile.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-card-soft">
        <div className="text-sm text-ink-500 dark:text-slate-400">Linked children</div>
        <div className="text-lg font-semibold text-ink-900 dark:text-slate-100 font-display mb-3">
          {profile.children.length} record{profile.children.length === 1 ? '' : 's'}
        </div>
        {profile.children.length === 0 ? (
          <div className="text-sm text-ink-300 dark:text-slate-500 py-6 text-center">
            No linked children yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {profile.children.map((c) => (
              <li key={c.studentId}>
                <Link
                  to={`/parent/children/${c.studentId}`}
                  className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 text-white text-sm font-bold flex items-center justify-center">
                    {c.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 dark:text-slate-100">{c.fullName}</div>
                    <div className="text-xs text-ink-500 dark:text-slate-400">
                      {c.className || '—'}{c.sectionName ? ` · ${c.sectionName}` : ''}
                      {c.rollNumber ? ` · Roll ${c.rollNumber}` : ''}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-300 dark:text-slate-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
