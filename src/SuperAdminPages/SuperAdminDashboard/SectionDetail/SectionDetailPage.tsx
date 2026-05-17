/**
 * Section detail — shows a single section's full configuration in one place:
 * class-teacher, capacity, timetable bell-count, assigned time slots, subjects
 * and teachers. Admin can re-configure the bell schedule + subject/teacher
 * picks; backend persists via POST/PUT /sections/{id}/timetable-config.
 *
 * Reads from GET /sections/{id}/detail which already returns the joined view.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, Grid, MenuItem,
  Paper, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { ArrowBack, Edit, Save } from '@mui/icons-material';
import { Layers, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import sectionDetailService from '../../../services/sectionDetail.service';
import timeSlotService from '../../../services/timeSlot.service';
import subjectService from '../../../services/subject.service';
import teacherService from '../../../services/teacher.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import type {
  SectionConfigRequest, SectionDetailResponse,
} from '../../../types/sectionDetail';
import type { TimeSlotResponse } from '../../../types/timeSlot';
import type { SubjectResponse } from '../../../types/subject';
import type { TeacherResponse } from '../../../types/teacher';

function formatTime(t?: string): string {
  return t ? t.slice(0, 5) : '';
}

export default function SectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const [detail, setDetail] = useState<SectionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Picker data for the config dialog.
  const [allSlots, setAllSlots] = useState<TimeSlotResponse[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectResponse[]>([]);
  const [allTeachers, setAllTeachers] = useState<TeacherResponse[]>([]);

  // Config dialog state.
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SectionConfigRequest>({
    bellCount: 6, timeSlotIds: [], subjectIds: [], teacherIds: [],
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!sectionId) return;
    setLoading(true); setError(null);
    try {
      const d = await sectionDetailService.detail(sectionId);
      setDetail(d);
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => { void load(); }, [load]);

  // Picker reference data; load once on mount.
  useEffect(() => {
    timeSlotService.list().then((s) => {
      s.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      setAllSlots(s);
    }).catch(() => setAllSlots([]));
    subjectService.list().then(setAllSubjects).catch(() => setAllSubjects([]));
    teacherService.list().then(setAllTeachers).catch(() => setAllTeachers([]));
  }, []);

  const openConfig = () => {
    if (!detail) return;
    setDraft({
      bellCount: detail.timetableConfig?.bellCount ?? 6,
      timeSlotIds: detail.timetableConfig?.timeSlots?.map((s) => s.id) ?? [],
      subjectIds:  detail.timetableConfig?.subjects?.map((s) => s.id) ?? [],
      teacherIds:  detail.timetableConfig?.teachers?.map((t) => t.id) ?? [],
    });
    setOpen(true);
  };

  const saveConfig = async () => {
    if (!sectionId) return;
    if (!draft.bellCount || draft.bellCount < 1) {
      toast.error('Bell count must be at least 1'); return;
    }
    if (!draft.timeSlotIds || draft.timeSlotIds.length === 0) {
      toast.error('Pick at least one time slot'); return;
    }
    setSaving(true);
    try {
      const fn = detail?.isTimetableConfigured
        ? sectionDetailService.updateConfig
        : sectionDetailService.createConfig;
      const next = await fn(sectionId, draft);
      setDetail(next);
      setOpen(false);
      toast.success('Section configured');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleId = (
    arr: string[],
    id: string,
    setter: (next: string[]) => void,
  ) => {
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    setter(next);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }
  if (!detail) {
    return <EmptyState icon={Layers} title="Section not found" />;
  }

  const cfg = detail.timetableConfig;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <Button component={RouterLink} to="/dashboard/classes" startIcon={<ArrowBack />}>
          Classes
        </Button>
        <Box sx={{ flex: 1 }} />
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={openConfig}
            sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            {detail.isTimetableConfigured ? 'Edit config' : 'Configure timetable'}
          </Button>
        )}
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Avatar sx={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
            color: 'white', fontWeight: 700,
          }}>
            {(detail.sectionName || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {detail.className} · Section {detail.sectionName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {detail.capacity != null && (
                <Chip size="small" variant="outlined" label={`Capacity ${detail.capacity}`} />
              )}
              <Chip size="small"
                color={detail.isTimetableConfigured ? 'success' : 'warning'}
                variant={detail.isTimetableConfigured ? 'filled' : 'outlined'}
                label={detail.isTimetableConfigured ? 'Timetable configured' : 'Not configured'} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Class teacher</Typography>
            {detail.classTeacher ? (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar>{(detail.classTeacher.name || '?').charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="subtitle2">{detail.classTeacher.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detail.classTeacher.employeeId ? `Emp #${detail.classTeacher.employeeId}` : ''}
                    {detail.classTeacher.designation ? ` · ${detail.classTeacher.designation}` : ''}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Not assigned yet — use the Class teachers page to attach a homeroom teacher.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Bell schedule</Typography>
            {cfg && cfg.timeSlots && cfg.timeSlots.length > 0 ? (
              <>
                <Typography variant="caption" color="text.secondary">
                  {cfg.bellCount} bells · {cfg.timeSlots.length} active slots
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {cfg.timeSlots.slice().sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{s.displayLabel || 'Period'}</span>
                      <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </span>
                    </Box>
                  ))}
                </Stack>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No bell schedule configured yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Subjects ({cfg?.subjects?.length ?? 0})
            </Typography>
            {cfg?.subjects && cfg.subjects.length > 0 ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {cfg.subjects.map((s) => (
                  <Chip key={s.id} size="small"
                    label={`${s.name}${s.code ? ` · ${s.code}` : ''}`}
                    variant="outlined" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No subjects pinned yet.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Teachers ({cfg?.teachers?.length ?? 0})
            </Typography>
            {cfg?.teachers && cfg.teachers.length > 0 ? (
              <Stack spacing={1}>
                {cfg.teachers.map((t) => (
                  <Stack key={t.id} direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                      {(t.name || '?').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.employeeId || '—'} {t.designation ? `· ${t.designation}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No teachers pinned yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        Subject / teacher chips here are the "pinned" list for quick access on the timetable
        editor. They don't restrict who can be assigned to a period — that's open to any
        teacher in the school.
      </Alert>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {detail.isTimetableConfigured ? 'Edit section config' : 'Configure section'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField required type="number" label="Bell count (periods per day)"
              value={draft.bellCount}
              onChange={(e) => setDraft({ ...draft, bellCount: Number(e.target.value) })}
              inputProps={{ min: 1, max: 12 }}
              helperText="Total number of teaching periods on a typical school day" />

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Active time slots ({draft.timeSlotIds.length}/{allSlots.length})
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {allSlots.map((s) => {
                  const checked = draft.timeSlotIds.includes(s.id);
                  return (
                    <FormControlLabel key={s.id}
                      control={<Switch size="small" checked={checked}
                        onChange={() => toggleId(draft.timeSlotIds, s.id,
                          (n) => setDraft({ ...draft, timeSlotIds: n }))} />}
                      label={
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {s.displayLabel || 'Period'}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatTime(s.startTime)} – {formatTime(s.endTime)}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0.5, p: 0.5, border: '1px solid', borderColor: checked ? 'primary.main' : 'divider', borderRadius: 1 }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Subjects ({draft.subjectIds?.length ?? 0})
              </Typography>
              <TextField select multiline fullWidth size="small" SelectProps={{
                multiple: true,
                renderValue: (v) => `${(v as string[]).length} selected`,
              }} value={draft.subjectIds || []}
                onChange={(e) => setDraft({ ...draft, subjectIds: e.target.value as unknown as string[] })}>
                {allSubjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Teachers ({draft.teacherIds?.length ?? 0})
              </Typography>
              <TextField select multiline fullWidth size="small" SelectProps={{
                multiple: true,
                renderValue: (v) => `${(v as string[]).length} selected`,
              }} value={draft.teacherIds || []}
                onChange={(e) => setDraft({ ...draft, teacherIds: e.target.value as unknown as string[] })}>
                {allTeachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.fullName || `${t.firstName} ${t.lastName}`}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveConfig} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Avoid unused-import lint warning for UsersIcon — it could decorate
          future empty-state placeholders without re-importing. */}
      <span style={{ display: 'none' }}><UsersIcon /></span>
    </Box>
  );
}
