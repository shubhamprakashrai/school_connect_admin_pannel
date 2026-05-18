/**
 * Timetable editor — pick a section, see/edit the weekly grid.
 *
 * Grid: rows = time slots, columns = weekdays. Each cell shows the
 * assigned (subject + teacher) for that section. Click a cell to assign
 * or clear it; backend rejects teacher conflicts (same teacher in two
 * sections at the same slot) with a 400 + message we surface as a toast.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { Clear, Save } from '@mui/icons-material';
import { Grid3X3 } from 'lucide-react';
import { toast } from 'react-toastify';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import timeSlotService from '../../../services/timeSlot.service';
import timetableService from '../../../services/timetable.service';
import subjectService from '../../../services/subject.service';
import teacherService from '../../../services/teacher.service';
import { useAcademicYear } from '../../../contexts/AcademicYearContext';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { TimeSlotResponse } from '../../../types/timeSlot';
import type {
  DayOfWeek,
  TimetableEntryRequest,
  TimetablePeriodEntry,
  TimetableResponse,
} from '../../../types/timetable';
import type { SubjectResponse } from '../../../types/subject';
import type { TeacherResponse } from '../../../types/teacher';

const WEEKDAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function dayShort(d: DayOfWeek): string {
  return d.slice(0, 3);
}

function formatTime(t?: string): string {
  return t ? t.slice(0, 5) : '';
}

export default function TimetablePage() {
  const { active: activeYear } = useAcademicYear();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [slots, setSlots] = useState<TimeSlotResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);

  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [grid, setGrid] = useState<TimetableResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Initial: classes + slots + subjects + teachers.
  useEffect(() => {
    void Promise.allSettled([
      schoolClassService.list().then(setClasses),
      timeSlotService.list().then((s) => {
        s.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        setSlots(s);
      }),
      subjectService.list().then(setSubjects),
      teacherService.listAll().then(setTeachers),
    ]);
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
  }, [classId]);

  const loadGrid = useCallback(async () => {
    if (!sectionId) { setGrid(null); return; }
    setLoading(true);
    try {
      const data = await timetableService.bySection(sectionId);
      setGrid(data);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load timetable');
      setGrid(null);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { void loadGrid(); }, [loadGrid]);

  // Index entries by `${day}::${timeSlotId}` for O(1) cell lookup.
  const entryAt = useMemo(() => {
    const m = new Map<string, TimetablePeriodEntry>();
    grid?.days?.forEach((ds) => {
      ds.periods?.forEach((p) => m.set(`${ds.day}::${p.timeSlot.id}`, p));
    });
    return m;
  }, [grid]);

  // Edit dialog state
  const [open, setOpen] = useState(false);
  const [cell, setCell] = useState<{ day: DayOfWeek; slot: TimeSlotResponse } | null>(null);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftTeacher, setDraftTeacher] = useState('');
  const [saving, setSaving] = useState(false);

  const openCell = (day: DayOfWeek, slot: TimeSlotResponse) => {
    const existing = entryAt.get(`${day}::${slot.id}`);
    setCell({ day, slot });
    setDraftSubject(existing?.subject.id || '');
    setDraftTeacher(existing?.teacher.id || '');
    setOpen(true);
  };

  const save = async () => {
    if (!cell || !sectionId || !activeYear?.id) return;
    if (!draftSubject || !draftTeacher) { toast.error('Pick both subject and teacher'); return; }
    setSaving(true);
    try {
      const payload: TimetableEntryRequest = {
        academicYearId: activeYear.id,
        day: cell.day,
        timeSlotId: cell.slot.id,
        subjectId: draftSubject,
        teacherId: draftTeacher,
      };
      const next = await timetableService.upsertEntry(sectionId, payload);
      setGrid(next);
      setOpen(false);
      toast.success('Slot updated');
    } catch (err) {
      // Backend's conflict message is the most informative bit — surface it raw.
      toast.error((err as { message?: string }).message || 'Could not save (teacher conflict?)');
    } finally {
      setSaving(false);
    }
  };

  const clearCell = async () => {
    if (!cell || !sectionId || !activeYear?.id) return;
    setSaving(true);
    try {
      const next = await timetableService.deleteEntry(sectionId, {
        academicYearId: activeYear.id,
        day: cell.day,
        timeSlotId: cell.slot.id,
      });
      setGrid(next);
      setOpen(false);
      toast.success('Slot cleared');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Timetable</Typography>
          <Typography variant="body2" color="text.secondary">
            {activeYear ? `Academic year: ${activeYear.name}` : 'No active academic year — set one in Academic years first.'}
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <TextField select size="small" label="Class" value={classId}
            onChange={(e) => setClassId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select class</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Section" value={sectionId} disabled={!classId}
            onChange={(e) => setSectionId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select section</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {!sectionId ? (
        <EmptyState
          icon={Grid3X3}
          title="Pick a class + section"
          description="Choose the section above to view or edit its weekly timetable."
        />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={Grid3X3}
          title="No time slots configured"
          description="Define the school's bell schedule first in Time slots, then come back to assign subjects + teachers."
        />
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `140px repeat(${WEEKDAYS.length}, minmax(140px, 1fr))`,
            minWidth: 800,
          }}>
            {/* Header row */}
            <Box sx={{ p: 1.5, background: 'rgba(37,99,235,0.04)', fontWeight: 600, fontSize: 13 }}>Slot</Box>
            {WEEKDAYS.map((d) => (
              <Box key={d} sx={{ p: 1.5, background: 'rgba(37,99,235,0.04)', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>
                {dayShort(d)}
              </Box>
            ))}
            {/* Body */}
            {slots.map((s) => (
              <>
                <Box key={`row-${s.id}`} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {s.displayLabel || `${formatTime(s.startTime)}`}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  </Typography>
                </Box>
                {WEEKDAYS.map((d) => {
                  const cellEntry = entryAt.get(`${d}::${s.id}`);
                  return (
                    <Box key={`${d}-${s.id}`}
                      onClick={() => canEdit && openCell(d, s)}
                      sx={{
                        p: 1, borderTop: '1px solid', borderLeft: '1px solid',
                        borderColor: 'divider',
                        cursor: canEdit ? 'pointer' : 'default',
                        minHeight: 72,
                        background: cellEntry ? 'rgba(37,99,235,0.04)' : 'transparent',
                        '&:hover': canEdit ? { background: 'rgba(37,99,235,0.08)' } : {},
                      }}>
                      {cellEntry ? (
                        <Stack spacing={0.25}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {cellEntry.subject.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cellEntry.teacher.name}
                          </Typography>
                        </Stack>
                      ) : canEdit ? (
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          + Assign
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </Box>
                  );
                })}
              </>
            ))}
          </Box>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {cell && `${dayShort(cell.day)} · ${formatTime(cell.slot.startTime)} – ${formatTime(cell.slot.endTime)}`}
        </DialogTitle>
        <DialogContent>
          {!activeYear?.id ? (
            <Alert severity="warning">No active academic year — set one before editing timetables.</Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField select fullWidth required label="Subject" value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value)}>
                <MenuItem value="">Select subject</MenuItem>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth required label="Teacher" value={draftTeacher}
                onChange={(e) => setDraftTeacher(e.target.value)}
                helperText="Backend rejects double-booking — pick a teacher free at this slot">
                <MenuItem value="">Select teacher</MenuItem>
                {teachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.fullName || `${t.firstName} ${t.lastName}`}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            {cell && entryAt.has(`${cell.day}::${cell.slot.id}`) && (
              <Button color="error" startIcon={<Clear />} disabled={saving} onClick={clearCell}>
                Clear
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="contained" startIcon={<Save />} onClick={save}
              disabled={saving || !draftSubject || !draftTeacher || !activeYear?.id}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
