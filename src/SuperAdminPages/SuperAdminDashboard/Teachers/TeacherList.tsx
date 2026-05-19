/** Teachers list — wired to `/teachers` (paginated). */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Checkbox, Chip, CircularProgress, IconButton, InputAdornment, Menu, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TextField, Typography,
} from '@mui/material';
import { Add, Block, Delete, Download, Edit, MoreVert, Search, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users as UsersIcon } from 'lucide-react';
import teacherService from '../../../services/teacher.service';
import { useAuth } from '../../../contexts/AuthContext';
import { exportToCsv } from '../../../utils/exporters';
import usePersistedState from '../../../utils/usePersistedState';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type { TeacherResponse } from '../../../types/teacher';
import type { Page } from '../../../types/tenant';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

const STATUS_OPTS = ['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

export default function TeacherList() {
  // Backend /teachers POST/PUT/DELETE is ADMIN/SUPER_ADMIN only. Teachers
  // can list/view fellow teachers but can't add/edit/delete — hide writes.
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManageTeachers = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [data, setData] = useState<Page<TeacherResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = usePersistedState<string>('teachers.department', '');
  const [status, setStatus] = usePersistedState<(typeof STATUS_OPTS)[number]>('teachers.status', 'ALL');
  const [classTeachersOnly, setClassTeachersOnly] = usePersistedState<boolean>('teachers.classTeachersOnly', false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounced(search);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<TeacherResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await teacherService.list({
        page, size: rowsPerPage,
        search: debouncedSearch || undefined,
        department: department || undefined,
        status: status === 'ALL' ? undefined : status,
        classTeachersOnly: classTeachersOnly || undefined,
      });
      setData(res);
    } catch (err) {
      if (isServerError(err)) {
        setData(null);
      } else {
        const m = (err as { message?: string }).message || 'Failed to load teachers';
        setError(m); toast.error(m);
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, department, status, classTeachersOnly]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [debouncedSearch, department, status, classTeachersOnly]);

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const handleDelete = async (row: TeacherResponse) => {
    setMenuAnchor(null);
    if (!window.confirm(`Delete ${row.fullName || `${row.firstName} ${row.lastName}`}?`)) return;
    try {
      await teacherService.remove(row.id);
      toast.success('Teacher deleted');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const subtitle = useMemo(
    () => (total === 0 ? 'No teachers yet' : `${total} teacher${total === 1 ? '' : 's'}`),
    [total],
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
  useEffect(() => { clearSelection(); }, [debouncedSearch, department, status, classTeachersOnly, page, rowsPerPage]);
  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = rows.some((r) => selectedIds.has(r.id));

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} teacher${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    let succeeded = 0; let failed = 0;
    await Promise.all(ids.map((id) =>
      teacherService.remove(id).then(() => { succeeded += 1; }).catch(() => { failed += 1; }),
    ));
    toast.success(`${succeeded} of ${ids.length} deleted${failed ? ` · ${failed} failed` : ''}`);
    clearSelection();
    void fetchData();
    setBulkBusy(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Teachers</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Download />}
            variant="outlined"
            disabled={rows.length === 0}
            onClick={() => exportToCsv(`teachers-page-${page + 1}.csv`, rows, [
              { header: 'Name',        value: (r) => r.fullName || `${r.firstName} ${r.lastName}` },
              { header: 'Employee ID', value: (r) => r.employeeId },
              { header: 'Email',       value: (r) => r.email },
              { header: 'Phone',       value: (r) => r.phone },
              { header: 'Department',  value: (r) => r.department },
              { header: 'Designation', value: (r) => r.designation },
              { header: 'Experience',  value: (r) => r.experienceYears },
              { header: 'Status',      value: (r) => r.status },
            ])}
          >
            Export
          </Button>
          {canManageTeachers && (
            <Button startIcon={<Add />} variant="contained" onClick={() => navigate('/dashboard/teachers/add')}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
              }}>
              Add teacher
            </Button>
          )}
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField placeholder="Search by name or employee ID…" size="small" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 260 }}
          />
          <TextField placeholder="Department" size="small" value={department}
            onChange={(e) => setDepartment(e.target.value)} sx={{ minWidth: 160 }} />
          <TextField select size="small" label="Status" value={status}
            onChange={(e) => setStatus(e.target.value as any)} sx={{ minWidth: 140 }}>
            {STATUS_OPTS.map((s) => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All' : s}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Type" value={classTeachersOnly ? 'CT' : 'ALL'}
            onChange={(e) => setClassTeachersOnly(e.target.value === 'CT')} sx={{ minWidth: 160 }}>
            <MenuItem value="ALL">All teachers</MenuItem>
            <MenuItem value="CT">Class teachers only</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {selectedIds.size > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 2, py: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.08))',
          border: '1px solid', borderColor: 'secondary.light',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedIds.size} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
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
            <TableHead sx={{ background: 'rgba(124,58,237,0.06)' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onChange={toggleAll}
                    inputProps={{ 'aria-label': 'Select all on this page' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subjects</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={7} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchData()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ py: 0 }}>
                  <EmptyState
                    icon={UsersIcon}
                    title="No teachers found"
                    description="Onboard your first teacher to start scheduling classes."
                    action={canManageTeachers
                      ? <Button startIcon={<Add />} variant="contained"
                          onClick={() => navigate('/dashboard/teachers/add')}
                          sx={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                          Add teacher
                        </Button>
                      : undefined}
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id} hover sx={{ cursor: 'pointer' }}
                    selected={selectedIds.has(t.id)}
                    onClick={() => navigate(`/dashboard/teachers/${t.id}`)}>
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(t.id)}
                        onChange={() => toggleRow(t.id)}
                        inputProps={{ 'aria-label': `Select ${t.fullName || t.firstName}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={t.photoUrl} sx={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                          {(t.firstName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{t.fullName || `${t.firstName} ${t.lastName}`}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{t.employeeId || '—'}</Typography></TableCell>
                    <TableCell>{t.department || '—'}</TableCell>
                    <TableCell>
                      {t.subjects && t.subjects.length > 0
                        ? <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                            {t.subjects.slice(0, 3).map((s) => <Chip key={s} size="small" label={s} variant="outlined" />)}
                            {t.subjects.length > 3 && <Chip size="small" label={`+${t.subjects.length - 3}`} />}
                          </Stack>
                        : '—'}
                    </TableCell>
                    <TableCell>{t.experienceYears != null ? `${t.experienceYears} yrs` : '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.status || 'ACTIVE'}
                        color={t.status === 'ACTIVE' ? 'success' : t.status === 'SUSPENDED' ? 'error' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setActiveRow(t); }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { if (activeRow) navigate(`/dashboard/teachers/${activeRow.id}`); setMenuAnchor(null); }}>
          <Visibility fontSize="small" sx={{ mr: 1 }} /> View
        </MenuItem>
        {canManageTeachers && (
          <MenuItem onClick={() => { if (activeRow) navigate(`/dashboard/teachers/${activeRow.id}/edit`); setMenuAnchor(null); }}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}
        {canManageTeachers && (
          <MenuItem sx={{ color: 'error.main' }} onClick={() => activeRow && handleDelete(activeRow)}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
