/** Parent-side school calendar — read-only month view. */

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays as Today, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import calendarEventService from '../services/calendarEvent.service';
import type {
  CalendarEventResponse, CalendarEventType,
} from '../types/calendarEvent';

const TYPE_COLORS: Record<CalendarEventType, string> = {
  WORKING_DAY: '#10b981',
  HOLIDAY: '#ef4444',
  HALF_DAY: '#f59e0b',
  EXAM: '#7c3aed',
  EVENT: '#2563eb',
  TEACHER_MEETING: '#06b6d4',
  SPORTS_DAY: '#84cc16',
  PARENT_TEACHER_MEETING: '#ec4899',
};

/** Local YYYY-MM-DD — toISOString shifts dates by ±1 day in non-UTC timezones. */
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ParentCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    setLoading(true);
    calendarEventService.byRange(ymd(start), ymd(end))
      .then(setEvents)
      .catch((err) => toast.error(err.message || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, [cursor]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEventResponse[]>();
    const norm = (raw: string | undefined) => (raw || '').slice(0, 10);
    events.forEach((e) => {
      const start = norm(e.eventDate);
      const end = norm(e.endDate) || start;
      if (!start) return;
      const s = new Date(start);
      const en = new Date(end);
      for (let d = new Date(s); d <= en; d.setDate(d.getDate() + 1)) {
        const key = ymd(d);
        const list = m.get(key) || [];
        list.push(e);
        m.set(key, list);
      }
    });
    return m;
  }, [events]);

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const totalDays = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-sm text-ink-500 dark:text-slate-400">School calendar</div>
          <div className="text-2xl font-bold text-ink-900 dark:text-slate-100 font-display">
            {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date())}
            className="p-2 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Today"
          >
            <Today className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-2 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-2 rounded-lg text-ink-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/60">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-ink-500 dark:text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const today = cell && ymd(cell) === ymd(new Date());
            const dayEvents = cell ? eventsByDate.get(ymd(cell)) || [] : [];
            return (
              <div
                key={i}
                className={`min-h-[100px] p-1.5 border-t border-slate-100 dark:border-slate-800 ${
                  i % 7 ? 'border-l border-slate-100 dark:border-slate-800' : ''
                } ${today ? 'bg-rose-50/50 dark:bg-rose-500/5' : ''}`}
              >
                {cell && (
                  <>
                    <div className={`text-xs font-semibold ${today ? 'text-rose-600' : 'text-ink-500 dark:text-slate-400'}`}>
                      {cell.getDate()}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          title={e.description || e.title}
                          className="text-[10px] px-1 py-0.5 rounded text-white truncate"
                          style={{ background: TYPE_COLORS[e.eventType] }}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-ink-300 dark:text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="text-xs text-ink-300 dark:text-slate-500">Loading…</div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(TYPE_COLORS) as CalendarEventType[]).map((t) => (
          <span
            key={t}
            className="text-[10px] px-2 py-1 rounded-full text-white"
            style={{ background: TYPE_COLORS[t] }}
          >
            {t.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
