/**
 * Class teachers — assign / unassign / transfer homeroom teachers per section.
 * Wired to /class-teachers/*.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import {
  Add, Cached, Delete, Edit, Person, SwapHoriz,
} from '@mui/icons-material';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import teacherService, { classTeacherService } from '../../../services/teacher.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { ClassTeacherResponse, TeacherResponse } from '../../../types/teacher';

export default function ClassTeachersPage() {
  const [assignments, setAssignments] = useState<ClassTeacherResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<ClassTeacherResponse | null>(null);

  // Assign-form state
  const [classId, setClassId] = useState('');
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [busy, setBusy] = useState(false);

  // Transfer state
  const [transferToTeacher, setTransferToTeacher] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [pageRes, cls, teachersPage] = await Promise.all([
        classTeacherService.listPaginated({ page, size: rowsPerPage, sort: 'sectionName,asc' }),
        schoolClassService.list(),
        teacherService.list({ page: 0, size: 500 }),
      ]);
      setAssignments(pageRes?.content || []);
      setTotal(pageRes?.totalElements || 0);
      setClasses(cls || []);
      setTeachers(teachersPage?.content || []);
    } catch (err) {
      if (isServerError(err)) {
        setAssignments([]);
        setTotal(0);
      } else {
        setError((err as { message?: string }).message || 'Failed to load assignments');
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Sections for the selected class in the assign dialog
  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
  }, [classId]);

  const openAssign = () => {
    setClassId(''); setSectionId(''); setTeacherId('');
    setAssignOpen(true);
  };

  const submitAssign = async () => {
    if (!sectionId || !teacherId) {
      toast.error('Pick a section and teacher'); return;
    }
    setBusy(true);
    try {
      await classTeacherService.assign({ teacherId, sectionId });
      toast.success('Class teacher assigned');
      setAssignOpen(false);
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Assign failed');
    } finally {
      setBusy(false);
    }
  };

  const removeFromSection = async (a: ClassTeacherResponse) => {
    if (!window.confirm(`Remove class teacher from ${a.sectionName}?`)) return;
    try {
      await classTeacherService.removeFromSection(a.sectionId);
      toast.success('Removed');
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Remove failed');
    }
  };

  const openTransfer = (a: ClassTeacherResponse) => {
    setActiveRow(a);
    setTransferToTeacher('');
    setTransferOpen(true);
  };

  const submitTransfer = async () => {
    if (!activeRow || !transferToTeacher) {
      toast.error('Pick a target teacher'); return;
    }
    if (transferToTeacher === activeRow.teacherId) {
      toast.error('Same teacher selected'); return;
    }
    setBusy(true);
    try {
      await classTeacherService.transfer({
        fromTeacherId: activeRow.teacherId,
        toTeacherId: transferToTeacher,
        sectionId: activeRow.sectionId,
      });
      toast.success('Transferred');
      setTransferOpen(false);
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Transfer failed');
    } finally {
      setBusy(false);
    }
  };

  const teacherById = useMemo(() => {
    const m = new Map<string, TeacherResponse>();
    teachers.forEach((t) => m.set(t.id, t));
    return m;
  }, [teachers]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Class teachers</Typography>
          <Typography variant="body2" color="text.secondary">
            Assign a homeroom teacher to each section.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => void fetchAll()}><Cached /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={openAssign}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              boxShadow: '0 8px 24px -8px rgba(6,182,212,0.4)',
            }}>
            Assign
          </Button>
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(6,182,212,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class teacher</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Academic year</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchAll()} />
                </TableCell></TableRow>
              ) : assignments.length === 0 ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <EmptyState
                    icon={UsersIcon}
                    title="No class-teacher assignments yet"
                    description="Assign a homeroom teacher to a section to start tracking attendance and updates."
                    action={<Button variant="contained" startIcon={<Add />} onClick={openAssign}>Assign</Button>}
                  />
                </TableCell></TableRow>
              ) : (
                assignments.map((a) => {
                  const t = teacherById.get(a.teacherId);
                  return (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2">{a.sectionName}</Typography>
                          {a.className && (
                            <Typography variant="caption" color="text.secondary">{a.className}</Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={t?.photoUrl} sx={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', width: 32, height: 32 }}>
                            {(a.teacherName || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{a.teacherName}</Typography>
                            {t?.email && (
                              <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{a.academicYear ? <Chip size="small" label={a.academicYear} variant="outlined" /> : '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Transfer to another teacher">
                          <IconButton size="small" onClick={() => openTransfer(a)}>
                            <SwapHoriz fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton size="small" color="error" onClick={() => removeFromSection(a)}>
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
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Person fontSize="small" /> Assign class teacher
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select fullWidth label="Class" value={classId}
              onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Section" value={sectionId} disabled={!classId}
              onChange={(e) => setSectionId(e.target.value)}>
              <MenuItem value="">Select section</MenuItem>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Teacher" value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}>
              <MenuItem value="">Select teacher</MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.fullName || `${t.firstName} ${t.lastName}`} {t.employeeId ? `· ${t.employeeId}` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={submitAssign} disabled={busy}>
            {busy ? 'Assigning…' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer dialog */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <SwapHoriz fontSize="small" /> Transfer class teacher
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {activeRow && (
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary">From</Typography>
                <Typography variant="subtitle2">
                  {activeRow.teacherName} · {activeRow.sectionName}
                </Typography>
              </Box>
            )}
            <TextField select fullWidth label="To teacher" value={transferToTeacher}
              onChange={(e) => setTransferToTeacher(e.target.value)}>
              <MenuItem value="">Select teacher</MenuItem>
              {teachers
                .filter((t) => t.id !== activeRow?.teacherId)
                .map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.fullName || `${t.firstName} ${t.lastName}`}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={submitTransfer} disabled={busy}>
            {busy ? 'Transferring…' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
