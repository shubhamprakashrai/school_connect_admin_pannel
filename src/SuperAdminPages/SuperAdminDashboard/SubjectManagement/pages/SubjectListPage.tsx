/** Subjects list — wired to `/subjects/paginated`. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  Add, AutoStories, Delete, Edit, FileUpload, Link as LinkIcon, Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import subjectService from '../../../../services/subject.service';
import schoolClassService from '../../../../services/schoolClass.service';
import teacherService from '../../../../services/teacher.service';
import ErrorState from '../../../../components/ui/ErrorState';
import { useAuth } from '../../../../contexts/AuthContext';
import type { SubjectResponse } from '../../../../types/subject';
import type { Page } from '../../../../types/tenant';
import type { SchoolClassResponse } from '../../../../types/schoolClass';
import type { TeacherResponse } from '../../../../types/teacher';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

export default function SubjectListPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  // Subject create/edit/delete/assignment is ADMIN/SUPER_ADMIN; teachers & students can read.
  const canManageSubjects = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [data, setData] = useState<Page<SubjectResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(0);
  // NOTE: backend's /subjects/paginated currently 500s for size≥6 (one row
  // in the tenant fails to serialize). Default to 5 here so the page loads;
  // user can still bump up via the page-size selector — fetch falls back to
  // 5 below if the larger request fails.
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Assign dialog state
  const [assignSubject, setAssignSubject] = useState<SubjectResponse | null>(null);
  const [assignTab, setAssignTab] = useState<'class' | 'teacher'>('class');
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [assignTargetId, setAssignTargetId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const openAssign = (s: SubjectResponse) => {
    setAssignSubject(s);
    setAssignTargetId('');
    setAssignTab('class');
    if (classes.length === 0) {
      schoolClassService.list().then(setClasses).catch(() => setClasses([]));
    }
    if (teachers.length === 0) {
      teacherService.list({ page: 0, size: 500 })
        .then((r) => setTeachers(r.content || []))
        .catch(() => setTeachers([]));
    }
  };

  const submitAssign = async () => {
    if (!assignSubject || !assignTargetId) {
      toast.error('Pick a target'); return;
    }
    setAssigning(true);
    try {
      if (assignTab === 'class') {
        await subjectService.assignToClass(assignSubject.id, assignTargetId);
        toast.success('Assigned to class');
      } else {
        await subjectService.assignToTeacher(assignSubject.id, assignTargetId);
        toast.success('Assigned to teacher');
      }
      setAssignSubject(null);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subjectService.paginated({ page, size: rowsPerPage, search: debouncedSearch || undefined });
      setData(res);
    } catch (err) {
      // Backend currently 500s for size≥6 — auto-retry with size=5 so the
      // page still renders. The smaller page may miss some rows; that's
      // visible to the user via the pagination footer + a toast nudge.
      if (rowsPerPage > 5) {
        try {
          const res = await subjectService.paginated({ page, size: 5, search: debouncedSearch || undefined });
          setData(res);
          toast.info('Showing 5 per page — backend cannot return more right now');
          return;
        } catch { /* fall through to error state */ }
      }
      const msg = (err as { message?: string }).message || 'Failed to load subjects';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const handleDelete = async (s: SubjectResponse) => {
    if (!window.confirm(`Delete subject "${s.name}"?`)) return;
    try {
      await subjectService.remove(s.id);
      toast.success('Subject deleted');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const subtitle = useMemo(
    () => (total === 0 ? 'No subjects yet' : `${total} subject${total === 1 ? '' : 's'}`),
    [total],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Subjects</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        {canManageSubjects && (
          <Stack direction="row" spacing={1}>
            <Button startIcon={<FileUpload />} variant="outlined"
              onClick={() => navigate('/dashboard/subjects/bulk-import')}>
              Bulk import
            </Button>
            <Button startIcon={<Add />} variant="contained" onClick={() => navigate('/dashboard/subjects/add')}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
                boxShadow: '0 8px 24px -8px rgba(245,158,11,0.4)',
              }}>
              Add subject
            </Button>
          </Stack>
        )}
      </Box>

      <TextField fullWidth size="small" placeholder="Search subjects…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 480 }} />

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(245,158,11,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchData()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <AutoStories sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>No subjects.</Typography>
                </TableCell></TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{s.name}</Typography>
                      {s.description && (
                        <Typography variant="caption" color="text.secondary"
                          sx={{ display: 'block', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><Typography sx={{ fontFamily: 'monospace' }}>{s.code}</Typography></TableCell>
                    <TableCell>{s.type ? <Chip size="small" label={s.type} variant="outlined" /> : '—'}</TableCell>
                    <TableCell>
                      {s.maxMarks != null ? `${s.passingMarks ?? '—'} / ${s.maxMarks}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={s.isActive === false ? 'Inactive' : 'Active'}
                        color={s.isActive === false ? 'default' : 'success'} />
                    </TableCell>
                    <TableCell align="right">
                      {canManageSubjects && (
                        <Tooltip title="Assign to class / teacher">
                          <IconButton size="small" onClick={() => openAssign(s)}>
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManageSubjects && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/dashboard/subjects/edit/${s.id}`)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManageSubjects && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(s)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
          rowsPerPageOptions={[5, 10, 25, 50]} />
      </Paper>

      {/* Assign dialog */}
      <Dialog open={Boolean(assignSubject)} onClose={() => setAssignSubject(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign <span style={{ color: '#f59e0b' }}>{assignSubject?.name}</span>
        </DialogTitle>
        <DialogContent>
          <Tabs value={assignTab} onChange={(_, v) => { setAssignTab(v); setAssignTargetId(''); }} sx={{ mb: 2 }}>
            <Tab label="To class" value="class" />
            <Tab label="To teacher" value="teacher" />
          </Tabs>
          {assignTab === 'class' ? (
            <TextField select fullWidth label="Class" value={assignTargetId}
              onChange={(e) => setAssignTargetId(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          ) : (
            <TextField select fullWidth label="Teacher" value={assignTargetId}
              onChange={(e) => setAssignTargetId(e.target.value)}>
              <MenuItem value="">Select teacher</MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.fullName || `${t.firstName} ${t.lastName}`}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignSubject(null)} disabled={assigning}>Cancel</Button>
          <Button variant="contained" onClick={submitAssign} disabled={assigning}>
            {assigning ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
