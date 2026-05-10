/**
 * Class schedule — month view of calendar events. Filter by class to see
 * events that mention the class via `applicableSections` (server-side
 * filter would be ideal; for now we fetch the month and tag relevant ones).
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Chip, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { toast } from 'react-toastify';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import calendarEventService from '../../../services/calendarEvent.service';
import EmptyState from '../../../components/ui/EmptyState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { CalendarEventResponse, CalendarEventType } from '../../../types/calendarEvent';

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

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

const ClassSchedule = () => {
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
    setSectionId('');
  }, [classId]);

  useEffect(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    setLoading(true);
    calendarEventService.byRange(ymd(start), ymd(end))
      .then(setEvents)
      .catch((err) => toast.error(err.message || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, [cursor]);

  const filtered = useMemo(() => {
    if (!sectionId) return events;
    return events.filter((e) => {
      if (!e.applicableSections) return true; // null = all sections
      return e.applicableSections.split(',').map((s) => s.trim()).includes(sectionId);
    });
  }, [events, sectionId]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEventResponse[]>();
    filtered.forEach((e) => {
      const list = m.get(e.eventDate) || [];
      list.push(e);
      m.set(e.eventDate, list);
    });
    return m;
  }, [filtered]);

  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const totalDays = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Class schedule</Typography>
          <Typography variant="body2" color="text.secondary">
            View events for any class · {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Today"><IconButton onClick={() => setCursor(new Date())}><Today /></IconButton></Tooltip>
          <IconButton onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight />
          </IconButton>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select size="small" label="Class" value={classId}
            onChange={(e) => setClassId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Section" value={sectionId} disabled={!classId}
            onChange={(e) => setSectionId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All sections</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {loading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : filtered.length === 0 && classId ? (
        <EmptyState
          title="No events for this filter"
          description="Try a different class/section or jump to a different month."
        />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(37,99,235,0.04)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} sx={{ p: 1.5, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                {d}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((cell, i) => {
              const today = cell && ymd(cell) === ymd(new Date());
              const dayEvents = cell ? eventsByDate.get(ymd(cell)) || [] : [];
              return (
                <Box key={i} sx={{
                  minHeight: 110, p: 1, borderTop: '1px solid', borderColor: 'divider',
                  borderLeft: i % 7 ? '1px solid' : 'none',
                  background: today ? 'rgba(37,99,235,0.04)' : 'transparent',
                }}>
                  {cell && (
                    <>
                      <Typography variant="caption"
                        sx={{ fontWeight: today ? 700 : 500, color: today ? 'primary.main' : 'text.secondary' }}>
                        {cell.getDate()}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        {dayEvents.slice(0, 3).map((e) => (
                          <Box key={e.id} title={e.description || e.title}
                            sx={{
                              background: TYPE_COLORS[e.eventType], color: 'white',
                              borderRadius: 1, px: 0.75, py: 0.25,
                              fontSize: 11, fontWeight: 500,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                            {e.title}
                          </Box>
                        ))}
                        {dayEvents.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{dayEvents.length - 3} more
                          </Typography>
                        )}
                      </Stack>
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Legend */}
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mt: 2 }}>
        {(Object.keys(TYPE_COLORS) as CalendarEventType[]).map((t) => (
          <Chip key={t} size="small" label={t.replace(/_/g, ' ')}
            sx={{ background: TYPE_COLORS[t], color: 'white', fontSize: 11 }} />
        ))}
      </Stack>
    </Box>
  );
};

export default ClassSchedule;
