/**
 * Empty state — soft illustration + headline + helper + optional CTA.
 * Pass `icon` (Lucide component) to override the default sparkle.
 */

import { Sparkles } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const padding = size === 'sm' ? 'py-8' : size === 'lg' ? 'py-16' : 'py-12';
  return (
    <div className={`text-center ${padding}`}>
      <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-soft flex items-center justify-center mb-4 border border-brand-100">
        <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center shadow-glow-brand">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-ink-900 font-display">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4 inline-flex">{action}</div>}
    </div>
  );
}
