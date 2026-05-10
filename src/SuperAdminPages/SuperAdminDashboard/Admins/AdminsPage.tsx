/**
 * Admins — list / create / edit / delete.
 * Wired to `/admins/*`. SuperAdmin-only in practice.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/admin.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { AdminRequest, AdminResponse, AdminUpdateRequest } from '../../../types/admin';

const empty: AdminRequest = {
  firstName: '', lastName: '', email: '', phone: '', designation: '', department: '',
};

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

export default function AdminsPage() {
  const [data, setData] = useState<{ content: AdminResponse[]; totalElements: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminResponse | null>(null);
  const [draft, setDraft] = useState<AdminRequest>(empty);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.listPaginated({
        page, size: rowsPerPage,
        search: debouncedSearch || undefined,
      });
      setData(res);
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const filtered = rows; // server-side filtering now

  const openCreate = () => { setEditing(null); setDraft(empty); setOpen(true); };
  const openEdit = (a: AdminResponse) => {
    setEditing(a);
    setDraft({
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email || '',
      phone: a.phone,
      designation: a.designation,
      department: a.department,
      employeeId: a.employeeId,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.email.trim()) {
      toast.error('First name, last name and email are required'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        const update: AdminUpdateRequest = {
          firstName: draft.firstName,
          lastName: draft.lastName,
          phone: draft.phone,
          designation: draft.designation,
          department: draft.department,
        };
        await adminService.update(editing.id, update);
        toast.success('Admin updated');
      } else {
        await adminService.create(draft);
        toast.success('Admin created');
      }
      setOpen(false);
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: AdminResponse) => {
    if (!window.confirm(`Delete ${a.firstName} ${a.lastName}?`)) return;
    try {
      await adminService.remove(a.id);
      toast.success('Deleted');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Admins</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} admin{total === 1 ? '' : 's'} across the platform
          </Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
            boxShadow: '0 8px 24px -8px rgba(99,102,241,0.4)',
          }}>
          Add admin
        </Button>
      </Box>

      <TextField fullWidth size="small" placeholder="Search by name, email or employee ID…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 480 }} />

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(99,102,241,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={6} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchData()} />
                </TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <EmptyState
                    icon={Shield}
                    title="No admins found"
                    description="Add an admin to delegate management of a tenant."
                    action={<Button startIcon={<Add />} variant="contained" onClick={openCreate}>Add admin</Button>}
                  />
                </TableCell></TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={a.profileImageUrl}
                          sx={{ background: 'linear-gradient(135deg, #6366f1, #2563eb)' }}>
                          {(a.firstName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{a.fullName || `${a.firstName} ${a.lastName}`}</Typography>
                          <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell><Typography sx={{ fontFamily: 'monospace' }}>{a.employeeId || '—'}</Typography></TableCell>
                    <TableCell>{a.designation || '—'}</TableCell>
                    <TableCell>{a.department || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={a.status || 'ACTIVE'}
                        color={a.status === 'ACTIVE' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(a)}>
                        <Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(a)}>
                        <Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit admin' : 'Add admin'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="First name"
                value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="Last name"
                value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required type="email" label="Email" disabled={!!editing}
                value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                helperText={editing ? 'Cannot be changed after creation' : undefined} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone"
                value={draft.phone || ''}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/\D/g, '') })}
                inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Employee ID" disabled={!!editing}
                value={draft.employeeId || ''}
                onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Designation"
                value={draft.designation || ''}
                onChange={(e) => setDraft({ ...draft, designation: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Department"
                value={draft.department || ''}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
