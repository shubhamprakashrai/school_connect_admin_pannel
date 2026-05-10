/**
 * Students list — wired to `/students` (paginated) with class/section/status/gender filters.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Checkbox, Chip, CircularProgress, IconButton, InputAdornment,
  Menu, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import {
  Add, Block, CheckCircle, Delete, Download, Edit, MoreVert, PersonAdd, Search, Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GraduationCap } from 'lucide-react';
import studentService from '../../../services/student.service';
import { exportToCsv } from '../../../utils/exporters';
import usePersistedState from '../../../utils/usePersistedState';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { StudentResponse } from '../../../types/student';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { Page } from '../../../types/tenant';

function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}

const STATUS_OPTS = ['ALL', 'ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'] as const;
const GENDER_OPTS = ['ALL', 'MALE', 'FEMALE', 'OTHER'] as const;

export default function StudentList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Page<StudentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [classId, setClassId] = usePersistedState<string>('students.classId', 'ALL');
  const [sectionId, setSectionId] = usePersistedState<string>('students.sectionId', 'ALL');
  const [status, setStatus] = usePersistedState<(typeof STATUS_OPTS)[number]>('students.status', 'ALL');
  const [gender, setGender] = usePersistedState<(typeof GENDER_OPTS)[number]>('students.gender', 'ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounced(search);

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<StudentResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // Class list for filter
  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  // Sections for the chosen class
  useEffect(() => {
    if (classId === 'ALL') { setSections([]); setSectionId('ALL'); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
    setSectionId('ALL');
  }, [classId]);

  const fetchStudents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await studentService.list({
        page, size: rowsPerPage,
        search: debouncedSearch || undefined,
        classId: classId === 'ALL' ? undefined : classId,
        sectionId: sectionId === 'ALL' ? undefined : sectionId,
        status: status === 'ALL' ? undefined : status,
        gender: gender === 'ALL' ? undefined : gender,
      });
      setData(response);
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Failed to load students';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, classId, sectionId, status, gender]);

  useEffect(() => { void fetchStudents(); }, [fetchStudents]);
  useEffect(() => { setPage(0); }, [debouncedSearch, classId, sectionId, status, gender]);

  const rows = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;

  const handleSetStatus = async (row: StudentResponse, newStatus: string) => {
    setMenuAnchor(null);
    try {
      await studentService.setStatus(row.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      void fetchStudents();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Update failed');
    }
  };

  const handleDelete = async (row: StudentResponse) => {
    setMenuAnchor(null);
    if (!window.confirm(`Delete ${row.fullName || `${row.firstName} ${row.lastName}`}?`)) return;
    try {
      await studentService.remove(row.id);
      toast.success('Student deleted');
      void fetchStudents();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const headerSubtitle = useMemo(
    () => (totalCount === 0 ? 'No students yet' : `${totalCount} student${totalCount === 1 ? '' : 's'}`),
    [totalCount],
  );

  // ---- Bulk selection ----
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const ids = rows.map((r) => r.id);
      const all = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (all) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  useEffect(() => { clearSelection(); }, [debouncedSearch, classId, sectionId, status, gender, page, rowsPerPage]);
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = rows.some((r) => selectedIds.has(r.id));

  const bulkSetStatus = async (next: 'ACTIVE' | 'INACTIVE') => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Mark ${ids.length} student${ids.length === 1 ? '' : 's'} as ${next}?`)) return;
    setBulkBusy(true);
    let succeeded = 0; let failed = 0;
    await Promise.all(ids.map((id) =>
      studentService.setStatus(id, next).then(() => { succeeded += 1; }).catch(() => { failed += 1; }),
    ));
    toast.success(`${succeeded} of ${ids.length} updated${failed ? ` · ${failed} failed` : ''}`);
    clearSelection();
    void fetchStudents();
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} student${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    let succeeded = 0; let failed = 0;
    await Promise.all(ids.map((id) =>
      studentService.remove(id).then(() => { succeeded += 1; }).catch(() => { failed += 1; }),
    ));
    toast.success(`${succeeded} of ${ids.length} deleted${failed ? ` · ${failed} failed` : ''}`);
    clearSelection();
    void fetchStudents();
    setBulkBusy(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Students</Typography>
          <Typography variant="body2" color="text.secondary">{headerSubtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Download />}
            variant="outlined"
            disabled={rows.length === 0}
            onClick={() => exportToCsv(`students-page-${page + 1}.csv`, rows, [
              { header: 'Name',    value: (r) => r.fullName || `${r.firstName} ${r.lastName}` },
              { header: 'Roll',    value: (r) => r.rollNumber },
              { header: 'Email',   value: (r) => r.email },
              { header: 'Phone',   value: (r) => r.phone },
              { header: 'Class',   value: (r) => r.schoolClass?.name },
              { header: 'Section', value: (r) => r.section?.name },
              { header: 'Gender',  value: (r) => r.gender },
              { header: 'Status',  value: (r) => r.status },
              { header: 'DOB',     value: (r) => r.dateOfBirth },
            ])}
          >
            Export
          </Button>
          <Button
            startIcon={<PersonAdd />}
            variant="outlined"
            onClick={() => navigate('/dashboard/students/bulk-import')}
          >
            Bulk import
          </Button>
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => navigate('/dashboard/students/add')}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
            }}
          >
            Add student
          </Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search by name or roll no…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240 }}
          />
          <TextField select size="small" label="Class" value={classId}
            onChange={(e) => setClassId(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="ALL">All classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Section" value={sectionId} disabled={classId === 'ALL'}
            onChange={(e) => setSectionId(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="ALL">All sections</MenuItem>
            {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Status" value={status}
            onChange={(e) => setStatus(e.target.value as any)} sx={{ minWidth: 140 }}>
            {STATUS_OPTS.map((s) => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All' : s}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Gender" value={gender}
            onChange={(e) => setGender(e.target.value as any)} sx={{ minWidth: 140 }}>
            {GENDER_OPTS.map((g) => <MenuItem key={g} value={g}>{g === 'ALL' ? 'All' : g}</MenuItem>)}
          </TextField>
        </Box>
      </Paper>

      {selectedIds.size > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 2, py: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
          border: '1px solid', borderColor: 'primary.light',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedIds.size} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button size="small" startIcon={<CheckCircle />} variant="outlined" color="success"
            onClick={() => bulkSetStatus('ACTIVE')} disabled={bulkBusy}>
            Mark active
          </Button>
          <Button size="small" startIcon={<Block />} variant="outlined" color="warning"
            onClick={() => bulkSetStatus('INACTIVE')} disabled={bulkBusy}>
            Mark inactive
          </Button>
          <Button size="small" startIcon={<Delete />} variant="outlined" color="error"
            onClick={bulkDelete} disabled={bulkBusy}>
            Delete
          </Button>
          <Button size="small" onClick={clearSelection} disabled={bulkBusy}>
            Clear
          </Button>
        </Box>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onChange={toggleAll}
                    inputProps={{ 'aria-label': 'Select all on this page' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Roll #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class / Section</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={6} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchStudents()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <EmptyState
                    icon={GraduationCap}
                    title="No students match these filters"
                    description="Try widening the filters or enroll your first student to get started."
                    action={
                      <Button startIcon={<Add />} variant="contained"
                        onClick={() => navigate('/dashboard/students/add')}
                        sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                        Add student
                      </Button>
                    }
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }}
                    selected={selectedIds.has(s.id)}
                    onClick={() => navigate(`/dashboard/students/${s.id}`)}>
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleRow(s.id)}
                        inputProps={{ 'aria-label': `Select ${s.fullName || s.firstName}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={s.photoUrl}
                          sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                          {(s.firstName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {s.fullName || `${s.firstName} ${s.lastName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{s.rollNumber || '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {s.schoolClass?.name || '—'}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}/ {s.section?.name || '—'}
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>
                      <Chip size="small" label={s.status || 'ACTIVE'}
                        color={s.status === 'ACTIVE' ? 'success' : s.status === 'INACTIVE' ? 'default' : 'warning'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setActiveRow(s); }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { if (activeRow) navigate(`/dashboard/students/${activeRow.id}`); setMenuAnchor(null); }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => { if (activeRow) navigate(`/dashboard/students/${activeRow.id}/edit`); setMenuAnchor(null); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {activeRow?.status === 'ACTIVE' ? (
          <MenuItem onClick={() => activeRow && handleSetStatus(activeRow, 'INACTIVE')}>
            <Block fontSize="small" sx={{ mr: 1 }} /> Mark inactive
          </MenuItem>
        ) : (
          <MenuItem onClick={() => activeRow && handleSetStatus(activeRow, 'ACTIVE')}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Mark active
          </MenuItem>
        )}
        <MenuItem sx={{ color: 'error.main' }} onClick={() => activeRow && handleDelete(activeRow)}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
