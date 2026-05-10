/**
 * Backend-pending state — clear, branded "we're waiting on the API" view.
 * Used by Notices and Exams pages until those controllers ship.
 */

import { Construction, GitBranch, Server } from 'lucide-react';

interface Props {
  feature: string;
  description?: string;
  expectedEndpoints: string[];
}

export default function BackendPendingState({ feature, description, expectedEndpoints }: Props) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-500/10 dark:to-orange-500/5 overflow-hidden">
        <div className="px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mb-4 shadow-lg">
            <Construction className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">
            {feature} — coming soon
          </h1>
          <p className="text-sm text-ink-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            {description ||
              `The frontend for ${feature} is fully designed; the backend controller is still in progress. As soon as it ships, the page will populate live.`}
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-amber-100 dark:border-amber-900/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">
              <Server className="w-3.5 h-3.5" />
              Expected backend endpoints
            </div>
            <ul className="space-y-1">
              {expectedEndpoints.map((e) => (
                <li key={e} className="text-xs font-mono text-ink-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GitBranch className="w-3 h-3 text-amber-500" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[11px] text-ink-300 dark:text-slate-500 mt-3 text-center">
            Once these are live, this page will switch to the real implementation —
            no further frontend work needed.
          </p>
        </div>
      </div>
    </div>
  );
}
