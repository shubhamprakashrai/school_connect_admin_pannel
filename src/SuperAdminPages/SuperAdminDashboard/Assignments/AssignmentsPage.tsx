/**
 * Assignments — homework / project work tracking.
 *
 * UI mirrors the mobile app's assignment list with a paginated table,
 * filter by class/subject, status chips and a create/edit dialog. Wired
 * to `assignmentService` which targets the `/assignments/*` family the
 * mobile Flutter app already uses. Backend controller is still pending —
 * fetch errors render as the standard inline ErrorState so the page
 * lights up as soon as the controller ships.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import assignmentService from '../../../services/assignment.service';
import schoolClassService from '../../../services/schoolClass.service';
import subjectService from '../../../services/subject.service';
import teacherService from '../../../services/teacher.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type {
  AssignmentRequest, AssignmentResponse, AssignmentStatus,
} from '../../../types/assignment';
import type { SchoolClassResponse } from '../../../types/schoolClass';
import type { SubjectResponse } from '../../../types/subject';
import type { TeacherResponse } from '../../../types/teacher';

const STATUS_COLOR: Record<AssignmentStatus, 'default' | 'primary' | 'success' | 'warning'> = {
  DRAFT:     'default',
  PUBLISHED: 'primary',
  CLOSED:    'warning',
  GRADED:    'success',
};

const empty: AssignmentRequest = {
  title: '', description: '', classId: '', subjectId: '', teacherId: '',
  dueDate: '', maxMarks: 100,
};

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AssignmentsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN', 'TEACHER');

  const [rows, setRows] = useState<AssignmentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssignmentResponse | null>(null);
  const [draft, setDraft] = useState<AssignmentRequest>(empty);
  const [saving, setSaving] = useState(false);

  // Reference data — silent on failure since teacher list / subjects are 500 today.
  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
    subjectService.list().then(setSubjects).catch(() => setSubjects([]));
    teacherService.list().then(setTeachers).catch(() => setTeachers([]));
  }, []);

  const fetchPage = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await assignmentService.list({ page, size: rowsPerPage });
      setRows(res.content || []);
      setTotal(res.totalElements ?? 0);
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { void fetchPage(); }, [fetchPage]);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...empty, dueDate: todayPlusDays(7) });
    setOpen(true);
  };
  const openEdit = (a: AssignmentResponse) => {
    setEditing(a);
    setDraft({
      title: a.title,
      description: a.description,
      classId: a.classId,
      sectionId: a.sectionId,
      subjectId: a.subjectId,
      teacherId: a.teacherId,
      dueDate: a.dueDate?.slice(0, 10) || '',
      maxMarks: a.maxMarks,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.title?.trim()) { toast.error('Title is required'); return; }
    if (!draft.classId || !draft.subjectId || !draft.teacherId) {
      toast.error('Class, subject and teacher are required'); return;
    }
    if (!draft.dueDate) { toast.error('Due date is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await assignmentService.update(editing.id, draft);
        toast.success('Assignment updated');
      } else {
        await assignmentService.create(draft);
        toast.success('Assignment created');
      }
      setOpen(false);
      void fetchPage();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: AssignmentResponse) => {
    if (!window.confirm(`Delete assignment "${a.title}"?`)) return;
    try {
      await assignmentService.remove(a.id);
      toast.success('Deleted');
      void fetchPage();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const dueChip = useMemo(() => (a: AssignmentResponse) => {
    const due = new Date(a.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return <Chip size="small" color="error" label={`Overdue ${-daysLeft}d`} />;
    if (daysLeft === 0) return <Chip size="small" color="warning" label="Today" />;
    if (daysLeft <= 2) return <Chip size="small" color="warning" label={`${daysLeft}d left`} />;
    return <Chip size="small" variant="outlined" label={`${daysLeft}d left`} />;
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Assignments</Typography>
          <Typography variant="body2" color="text.secondary">
            Homework, projects and class work. Teachers create, students submit, teachers grade.
          </Typography>
        </Box>
        {canManage && (
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
              boxShadow: '0 8px 24px -8px rgba(245,158,11,0.4)',
            }}>
            New assignment
          </Button>
        )}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(245,158,11,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submissions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={8} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchPage()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    description="Teachers can create homework or project tasks here. Students see them in their portal."
                    action={canManage
                      ? <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Create first</Button>
                      : undefined}
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', width: 36, height: 36 }}>
                          {(a.title || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{a.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', maxWidth: 220,
                          }}>
                            {a.description || '—'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{a.className || '—'}</TableCell>
                    <TableCell>{a.subjectName || '—'}</TableCell>
                    <TableCell>{a.teacherName || '—'}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption">{new Date(a.dueDate).toLocaleDateString()}</Typography>
                        {dueChip(a)}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={STATUS_COLOR[a.status]} label={a.status} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {a.submissionCount != null ? (
                        <Typography variant="caption">
                          {a.submissionCount} sub
                          {a.pendingCount != null && a.pendingCount > 0 && (
                            <span style={{ color: '#dc2626' }}> · {a.pendingCount} pending</span>
                          )}
                        </Typography>
                      ) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View submissions">
                        <IconButton size="small" component={RouterLink} to={`/dashboard/assignments/${a.id}`}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canManage && (
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)}>
                          <Edit fontSize="small" /></IconButton></Tooltip>
                      )}
                      {canManage && (
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(a)}>
                          <Delete fontSize="small" /></IconButton></Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]} />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit assignment' : 'New assignment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label="Title" value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <TextField label="Description" multiline rows={3}
              value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth required label="Class" value={draft.classId}
                onChange={(e) => setDraft({ ...draft, classId: e.target.value })}>
                <MenuItem value="">Select class</MenuItem>
                {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth required label="Subject" value={draft.subjectId}
                onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}>
                <MenuItem value="">Select subject</MenuItem>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField select required label="Teacher" value={draft.teacherId}
              onChange={(e) => setDraft({ ...draft, teacherId: e.target.value })}>
              <MenuItem value="">Select teacher</MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.fullName || `${t.firstName} ${t.lastName}`}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required type="date" label="Due date"
                InputLabelProps={{ shrink: true }} inputProps={{ min: todayPlusDays(0) }}
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} />
              <TextField fullWidth type="number" label="Max marks"
                value={draft.maxMarks ?? ''} inputProps={{ min: 1, max: 1000 }}
                onChange={(e) => setDraft({ ...draft, maxMarks: Number(e.target.value) })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
