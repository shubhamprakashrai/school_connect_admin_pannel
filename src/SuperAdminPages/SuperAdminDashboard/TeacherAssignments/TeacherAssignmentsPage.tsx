/**
 * Teacher assignments — list grouped by teacher, with add / batch / delete.
 * Wired to /teacher-assignments/*.
 *
 * Picking a teacher narrows the view; the "By section" tab switches to
 * showing all assignments for a chosen section.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography,
} from '@mui/material';
import {
  Add, Assignment, Cached, Delete, PlaylistAdd, Refresh,
} from '@mui/icons-material';
import { GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import teacherService, { teacherAssignmentService } from '../../../services/teacher.service';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import subjectService from '../../../services/subject.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type { TeacherAssignmentResponse, TeacherResponse } from '../../../types/teacher';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { SubjectResponse } from '../../../types/subject';

type Mode = 'teacher' | 'section';

interface BatchRow {
  subjectId: string;
  sectionId: string;
}

export default function TeacherAssignmentsPage() {
  const [mode, setMode] = useState<Mode>('teacher');
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);

  const [teacherId, setTeacherId] = useState('');
  const [classId, setClassId] = useState('');
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [sectionId, setSectionId] = useState('');

  const [assignments, setAssignments] = useState<TeacherAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-single dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addSubject, setAddSubject] = useState('');
  const [addClass, setAddClass] = useState('');
  const [addSections, setAddSections] = useState<SectionResponse[]>([]);
  const [addSection, setAddSection] = useState('');
  const [busy, setBusy] = useState(false);

  // Batch dialog
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchRows, setBatchRows] = useState<BatchRow[]>([{ subjectId: '', sectionId: '' }]);

  // Bootstrap reference data
  useEffect(() => {
    Promise.all([
      teacherService.list({ page: 0, size: 500 }),
      schoolClassService.list(),
      subjectService.list(),
    ]).then(([t, c, s]) => {
      setTeachers(t.content || []);
      setClasses(c || []);
      setSubjects(s || []);
    }).catch((err) => toast.error(err.message || 'Failed to load reference data'));
  }, []);

  // Sections for chosen class (filter view)
  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
    setSectionId('');
  }, [classId]);

  // Sections for chosen class in add-dialog
  useEffect(() => {
    if (!addClass) { setAddSections([]); setAddSection(''); return; }
    sectionService.byClass(addClass).then(setAddSections).catch(() => setAddSections([]));
  }, [addClass]);

  const fetchAssignments = useCallback(async () => {
    if (mode === 'teacher' && !teacherId) { setAssignments([]); return; }
    if (mode === 'section' && !sectionId) { setAssignments([]); return; }
    setLoading(true); setError(null);
    try {
      const list = mode === 'teacher'
        ? await teacherAssignmentService.byTeacher(teacherId)
        : await teacherAssignmentService.bySection(sectionId);
      setAssignments(list || []);
    } catch (err) {
      if (isServerError(err)) {
        setAssignments([]);
      } else {
        setError((err as { message?: string }).message || 'Failed to load assignments');
      }
    } finally {
      setLoading(false);
    }
  }, [mode, teacherId, sectionId]);

  useEffect(() => { void fetchAssignments(); }, [fetchAssignments]);

  const removeOne = async (a: TeacherAssignmentResponse) => {
    if (!window.confirm(`Remove ${a.subjectName || 'this assignment'}?`)) return;
    try {
      await teacherAssignmentService.remove(a.id);
      toast.success('Removed');
      void fetchAssignments();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Remove failed');
    }
  };

  // ---- Add single ----
  const submitAdd = async () => {
    if (!teacherId || !addSubject || !addSection) {
      toast.error('Pick a teacher, subject and section'); return;
    }
    setBusy(true);
    try {
      await teacherAssignmentService.create({
        teacherId, subjectId: addSubject, sectionId: addSection,
      });
      toast.success('Assignment added');
      setAddOpen(false);
      setAddSubject(''); setAddClass(''); setAddSection('');
      void fetchAssignments();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Add failed');
    } finally {
      setBusy(false);
    }
  };

  // ---- Batch ----
  const submitBatch = async () => {
    if (!teacherId) { toast.error('Pick a teacher first'); return; }
    const rows = batchRows.filter((r) => r.subjectId && r.sectionId);
    if (rows.length === 0) { toast.error('Add at least one row'); return; }
    setBusy(true);
    try {
      await teacherAssignmentService.batch({
        assignments: rows.map((r) => ({ teacherId, subjectId: r.subjectId, sectionId: r.sectionId })),
      });
      toast.success(`Created ${rows.length} assignment${rows.length === 1 ? '' : 's'}`);
      setBatchOpen(false);
      setBatchRows([{ subjectId: '', sectionId: '' }]);
      void fetchAssignments();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Batch failed');
    } finally {
      setBusy(false);
    }
  };

  const subjectMap = useMemo(() => {
    const m = new Map<string, SubjectResponse>();
    subjects.forEach((s) => m.set(s.id, s));
    return m;
  }, [subjects]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Teacher assignments</Typography>
          <Typography variant="body2" color="text.secondary">
            Map teachers to subject + section pairs.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh"><IconButton onClick={() => void fetchAssignments()}><Cached /></IconButton></Tooltip>
          <Button variant="outlined" startIcon={<PlaylistAdd />} onClick={() => setBatchOpen(true)} disabled={!teacherId}>
            Batch add
          </Button>
          <Button variant="contained" startIcon={<Add />}
            onClick={() => { setAddSubject(''); setAddClass(''); setAddSection(''); setAddOpen(true); }}
            disabled={!teacherId}
            sx={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            Assign
          </Button>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="By teacher" value="teacher" />
          <Tab label="By section" value="section" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {mode === 'teacher' ? (
            <TextField select fullWidth size="small" label="Teacher" value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)} sx={{ maxWidth: 480 }}>
              <MenuItem value="">Select teacher</MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.fullName || `${t.firstName} ${t.lastName}`} {t.department ? `· ${t.department}` : ''}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ maxWidth: 720 }}>
              <TextField select fullWidth size="small" label="Class" value={classId}
                onChange={(e) => setClassId(e.target.value)}>
                <MenuItem value="">Select class</MenuItem>
                {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth size="small" label="Section" value={sectionId} disabled={!classId}
                onChange={(e) => setSectionId(e.target.value)}>
                <MenuItem value="">Select section</MenuItem>
                {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Stack>
          )}
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(124,58,237,0.06)' }}>
              <TableRow>
                {mode === 'section' && <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                {mode === 'teacher' && <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>}
                <TableCell sx={{ fontWeight: 600 }}>Academic year</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(mode === 'teacher' && !teacherId) || (mode === 'section' && !sectionId) ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState
                    icon={Assignment as any}
                    title={mode === 'teacher' ? 'Pick a teacher' : 'Pick a section'}
                    description="The list will populate once a target is chosen."
                  />
                </TableCell></TableRow>
              ) : loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchAssignments()} />
                </TableCell></TableRow>
              ) : assignments.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState title="No assignments" description="Add the first assignment with the button above." />
                </TableCell></TableRow>
              ) : (
                assignments.map((a) => {
                  const subj = subjectMap.get(a.subjectId);
                  return (
                    <TableRow key={a.id} hover>
                      {mode === 'section' && (
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                              {(a.teacherName || '?').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2">{a.teacherName}</Typography>
                          </Stack>
                        </TableCell>
                      )}
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2">{a.subjectName || subj?.name || '—'}</Typography>
                          {subj?.code && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {subj.code}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      {mode === 'teacher' && (
                        <TableCell>
                          <Stack>
                            <Typography variant="body2">{a.sectionName || '—'}</Typography>
                            {a.className && (
                              <Typography variant="caption" color="text.secondary">{a.className}</Typography>
                            )}
                          </Stack>
                        </TableCell>
                      )}
                      <TableCell>
                        {a.academicYear ? <Chip size="small" label={a.academicYear} variant="outlined" /> : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove">
                          <IconButton size="small" color="error" onClick={() => removeOne(a)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Single add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign subject + section</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth label="Subject" value={addSubject}
              onChange={(e) => setAddSubject(e.target.value)}>
              <MenuItem value="">Select subject</MenuItem>
              {subjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name} <span style={{ marginLeft: 6, opacity: 0.6 }}>{s.code}</span></MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Class" value={addClass}
              onChange={(e) => setAddClass(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Section" value={addSection} disabled={!addClass}
              onChange={(e) => setAddSection(e.target.value)}>
              <MenuItem value="">Select section</MenuItem>
              {addSections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={submitAdd} disabled={busy}>
            {busy ? 'Saving…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch dialog */}
      <Dialog open={batchOpen} onClose={() => setBatchOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Batch assign — {teachers.find((t) => t.id === teacherId)?.fullName || ''}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {batchRows.map((row, i) => {
              const rowSections = sections.filter(() => true); // Sections list reflects active class filter; OK as guidance.
              return (
                <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                  <TextField select fullWidth size="small" label="Subject" value={row.subjectId}
                    onChange={(e) => {
                      const next = [...batchRows]; next[i] = { ...row, subjectId: e.target.value };
                      setBatchRows(next);
                    }}>
                    <MenuItem value="">Select</MenuItem>
                    {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth size="small" label="Section" value={row.sectionId}
                    onChange={(e) => {
                      const next = [...batchRows]; next[i] = { ...row, sectionId: e.target.value };
                      setBatchRows(next);
                    }}>
                    <MenuItem value="">Select</MenuItem>
                    {classes.flatMap((c) => (c.sections || []).map((s) => (
                      <MenuItem key={s.id} value={s.id}>{c.name} · {s.name}</MenuItem>
                    )))}
                  </TextField>
                  <IconButton size="small" color="error"
                    onClick={() => setBatchRows(batchRows.length > 1 ? batchRows.filter((_, j) => j !== i) : [{ subjectId: '', sectionId: '' }])}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              );
            })}
            <Button startIcon={<Add />} onClick={() => setBatchRows([...batchRows, { subjectId: '', sectionId: '' }])}>
              Add row
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={submitBatch} disabled={busy}>
            {busy ? 'Saving…' : `Create ${batchRows.filter((r) => r.subjectId && r.sectionId).length}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
