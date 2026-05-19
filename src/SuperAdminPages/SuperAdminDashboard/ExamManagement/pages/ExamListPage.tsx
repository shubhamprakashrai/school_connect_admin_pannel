/**
 * Exams — list of scheduled / completed exams with quick links to mark
 * entry and results. Real implementation per mobile's exam_list_page.
 */

import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, BarChart, Assignment as AssignmentIcon, Switch as SwitchIcon } from '@mui/icons-material';
import { Switch } from '@mui/material';
import { BookOpenCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import examService from '../../../../services/exam.service';
import schoolClassService from '../../../../services/schoolClass.service';
import subjectService from '../../../../services/subject.service';
import { useAuth } from '../../../../contexts/AuthContext';
import EmptyState from '../../../../components/ui/EmptyState';
import ErrorState from '../../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../../utils/apiErrors';
import type { ExamRequest, ExamResponse, ExamStatus, ExamType } from '../../../../types/exam';
import type { SchoolClassResponse } from '../../../../types/schoolClass';
import type { SubjectResponse } from '../../../../types/subject';

const STATUS_COLOR: Record<ExamStatus, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  SCHEDULED:    'primary',
  IN_PROGRESS:  'warning',
  COMPLETED:    'success',
  PUBLISHED:    'success',
  CANCELLED:    'error',
};

const empty: ExamRequest = {
  examTypeId: '', classId: '', subjectId: '', title: '',
  description: '', examDate: new Date().toISOString().slice(0, 10),
  maxMarks: 100, passingMarks: 35, status: 'SCHEDULED',
};

export const ExamListPage = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [tab, setTab] = useState<'exams' | 'types'>('exams');

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Exams</Typography>
        <Typography variant="body2" color="text.secondary">
          Schedule exams, record marks, publish results, generate report cards.
        </Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Exams" value="exams" />
        <Tab label="Exam types" value="types" />
      </Tabs>

      {tab === 'exams' && <ExamsPanel canManage={canManage} />}
      {tab === 'types' && <TypesPanel canManage={canManage} />}
    </Box>
  );
};

export default ExamListPage;

// ============================================================================
// Tab 1: Exams
// ============================================================================
function ExamsPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<ExamResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [types, setTypes] = useState<ExamType[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamResponse | null>(null);
  const [draft, setDraft] = useState<ExamRequest>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
    subjectService.list().then(setSubjects).catch(() => setSubjects([]));
    examService.activeTypes().then(setTypes).catch(() => setTypes([]));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await examService.list({ page, size: rowsPerPage });
      setRows(res.content || []); setTotal(res.totalElements ?? 0);
    } catch (err) {
      // Mobile-parity: backend ExamController not deployed → swallow 5xx
      // and render empty state instead of an error banner. Real errors
      // (4xx) still bubble up to the user.
      if (isServerError(err)) { setRows([]); setTotal(0); }
      else setError((err as { message?: string }).message || 'Failed to load exams');
    } finally { setLoading(false); }
  }, [page, rowsPerPage]);
  useEffect(() => { void fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setDraft({ ...empty }); setOpen(true); };
  const openEdit = (e: ExamResponse) => {
    setEditing(e);
    setDraft({
      examTypeId: e.examTypeId, classId: e.classId, subjectId: e.subjectId,
      title: e.title, description: e.description,
      examDate: e.examDate?.slice(0, 10) || '',
      startTime: e.startTime, endTime: e.endTime,
      maxMarks: e.maxMarks, passingMarks: e.passingMarks, status: e.status,
    });
    setOpen(true);
  };
  const save = async () => {
    if (!draft.title.trim() || !draft.classId || !draft.subjectId || !draft.examTypeId) {
      toast.error('Title, type, class and subject are required'); return;
    }
    if (draft.passingMarks > draft.maxMarks) {
      toast.error('Passing marks cannot exceed max marks'); return;
    }
    setSaving(true);
    try {
      if (editing) await examService.update(editing.id, draft);
      else await examService.create(draft);
      toast.success('Saved'); setOpen(false); void fetch();
    } catch (err) { toast.error((err as { message?: string }).message || 'Failed'); }
    finally { setSaving(false); }
  };
  const remove = async (e: ExamResponse) => {
    if (!window.confirm(`Cancel exam "${e.title}"?`)) return;
    try { await examService.remove(e.id); toast.success('Cancelled'); void fetch(); }
    catch (err) { toast.error((err as { message?: string }).message || 'Failed'); }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}
            sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
            Schedule exam
          </Button>
        </Box>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Exam</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class · Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Max / Pass</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marks</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={4} cols={8} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <EmptyState icon={BookOpenCheck} title="No exams scheduled"
                    description="Schedule your first exam to start recording marks." />
                </TableCell></TableRow>
              ) : (
                rows.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)', width: 32, height: 32, fontSize: 14 }}>
                          {(e.title || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{e.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {e.description ? e.description.slice(0, 50) : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{e.examTypeName || '—'}</TableCell>
                    <TableCell>{e.className || '—'} · {e.subjectName || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="caption">{new Date(e.examDate).toLocaleDateString()}</Typography>
                      {(e.startTime || e.endTime) && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {e.startTime?.slice(0, 5)} – {e.endTime?.slice(0, 5)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{e.maxMarks} / {e.passingMarks}</TableCell>
                    <TableCell>
                      <Chip size="small" color={STATUS_COLOR[e.status]} variant="outlined"
                        label={e.status.replace(/_/g, ' ')} />
                    </TableCell>
                    <TableCell>
                      {e.studentCount != null ? (
                        <Typography variant="caption">
                          {e.marksSubmittedCount ?? 0}/{e.studentCount}
                        </Typography>
                      ) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Mark entry">
                        <IconButton size="small" component={RouterLink} to={`/dashboard/exams/${e.id}/marks`}>
                          <AssignmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Results">
                        <IconButton size="small" component={RouterLink} to={`/dashboard/exams/results`}>
                          <BarChart fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canManage && (
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(e)}>
                          <Edit fontSize="small" /></IconButton></Tooltip>
                      )}
                      {canManage && (
                        <Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => remove(e)}>
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
        <DialogTitle>{editing ? 'Edit exam' : 'Schedule exam'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label="Title" value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <TextField label="Description" multiline rows={2} value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth required label="Type" value={draft.examTypeId}
                onChange={(e) => setDraft({ ...draft, examTypeId: e.target.value })}>
                <MenuItem value="">Select</MenuItem>
                {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth required label="Class" value={draft.classId}
                onChange={(e) => setDraft({ ...draft, classId: e.target.value })}>
                <MenuItem value="">Select</MenuItem>
                {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth required label="Subject" value={draft.subjectId}
                onChange={(e) => setDraft({ ...draft, subjectId: e.target.value })}>
                <MenuItem value="">Select</MenuItem>
                {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required type="date" label="Date" InputLabelProps={{ shrink: true }}
                value={draft.examDate} onChange={(e) => setDraft({ ...draft, examDate: e.target.value })} />
              <TextField fullWidth type="time" label="Start" InputLabelProps={{ shrink: true }}
                value={draft.startTime || ''} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
              <TextField fullWidth type="time" label="End" InputLabelProps={{ shrink: true }}
                value={draft.endTime || ''} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required type="number" label="Max marks"
                value={draft.maxMarks} inputProps={{ min: 1, max: 1000 }}
                onChange={(e) => setDraft({ ...draft, maxMarks: Number(e.target.value) })} />
              <TextField fullWidth required type="number" label="Passing marks"
                value={draft.passingMarks} inputProps={{ min: 1, max: 1000 }}
                onChange={(e) => setDraft({ ...draft, passingMarks: Number(e.target.value) })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// Tab 2: Exam types
// ============================================================================
function TypesPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamType | null>(null);
  const [draft, setDraft] = useState<Omit<ExamType, 'id'>>({
    name: '', code: '', description: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await examService.types()); }
    catch (err) {
      if (isServerError(err)) setRows([]);
      else setError((err as { message?: string }).message || 'Failed to load types');
    }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  const save = async () => {
    if (!draft.name.trim() || !draft.code.trim()) { toast.error('Name and code required'); return; }
    setSaving(true);
    try {
      if (editing) await examService.updateType(editing.id, draft);
      else await examService.createType(draft);
      toast.success('Saved'); setOpen(false); void fetch();
    } catch (err) { toast.error((err as { message?: string }).message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Add />} variant="contained"
            onClick={() => { setEditing(null); setDraft({ name: '', code: '', description: '', isActive: true }); setOpen(true); }}>
            Add type
          </Button>
        </Box>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                {canManage && <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={3} cols={canManage ? 5 : 4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState icon={BookOpenCheck} title="No exam types"
                    description="Define types like Unit-test, Mid-term, Final." />
                </TableCell></TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell><Typography variant="subtitle2">{t.name}</Typography></TableCell>
                    <TableCell><code>{t.code}</code></TableCell>
                    <TableCell>{t.description || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.isActive ? 'Active' : 'Inactive'}
                        color={t.isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => {
                            setEditing(t);
                            setDraft({ name: t.name, code: t.code, description: t.description, isActive: t.isActive ?? true });
                            setOpen(true);
                          }}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit exam type' : 'New exam type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <TextField required label="Code" value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              helperText="e.g. UT1, MID, FINAL" />
            <TextField label="Description" multiline rows={2} value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch checked={draft.isActive ?? true} onChange={(_, v) => setDraft({ ...draft, isActive: v })} />
              <Typography variant="body2">Active</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
