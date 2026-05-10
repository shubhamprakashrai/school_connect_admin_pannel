/**
 * Parent notices — placeholder until a NoticeController exists in the
 * backend. Kept simple and informative so the route doesn't 404.
 */

import { Bell } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function ParentNotices() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8">
        <EmptyState
          icon={Bell}
          title="No notices yet"
          description="Once your school posts an announcement here, you'll see it instantly."
        />
      </div>
    </div>
  );
}
