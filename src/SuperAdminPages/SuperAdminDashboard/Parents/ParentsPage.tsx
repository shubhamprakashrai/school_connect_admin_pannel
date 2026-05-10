/**
 * Parents — list / create / edit / delete.
 *
 * Backend `/parents` returns a flat array (not paginated). We do client-side
 * search + paging on the in-memory list. Linking a parent to a student is
 * managed at student-creation time via fatherInfo / motherInfo / guardianInfo
 * — the backend has no separate parent↔student attach endpoint.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentService } from '../../../services/parent.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { ParentRequest, ParentResponse } from '../../../types/parent';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

const empty: ParentRequest = {
  firstname: '', midlename: '', lastname: '', email: '', phone: '', parentType: 'FATHER',
};

export default function ParentsPage() {
  const [allRows, setAllRows] = useState<ParentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ParentResponse | null>(null);
  const [draft, setDraft] = useState<ParentRequest>(empty);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await parentService.list();
      setAllRows(res || []);
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  // Client-side filter + paging — backend returns the full list.
  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return allRows;
    const q = debouncedSearch.toLowerCase();
    return allRows.filter((p) =>
      `${p.firstname} ${p.middlename ?? ''} ${p.lastname}`.toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q),
    );
  }, [allRows, debouncedSearch]);

  const total = filtered.length;
  const rows = useMemo(
    () => filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const openCreate = () => { setEditing(null); setDraft(empty); setOpen(true); };
  const openEdit = (p: ParentResponse) => {
    setEditing(p);
    setDraft({
      firstname: p.firstname,
      midlename: p.middlename,
      lastname: p.lastname,
      email: p.email,
      phone: p.phone,
      parentType: p.parentType,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.firstname?.trim() || !draft.lastname?.trim()) {
      toast.error('First and last name are required'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await parentService.update(editing.parentId, draft);
        toast.success('Parent updated');
      } else {
        await parentService.create(draft);
        toast.success('Parent added');
      }
      setOpen(false);
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ParentResponse) => {
    if (!window.confirm(`Delete ${p.firstname} ${p.lastname}?`)) return;
    try {
      await parentService.remove(p.parentId);
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Parents</Typography>
          <Typography variant="body2" color="text.secondary">
            {allRows.length === 0 ? 'No parents yet' : `${allRows.length} parent${allRows.length === 1 ? '' : 's'}`}
          </Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            boxShadow: '0 8px 24px -8px rgba(236,72,153,0.4)',
          }}>
          Add parent
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tip:</strong> Parents are normally created automatically when you enrol a student
        with father / mother / guardian details on the <em>Add Student</em> form. Adding a parent
        here creates a standalone record that isn't linked to any student. To link a parent to a
        student, fill the parent's name + phone in the student's <em>Family</em> step during enrolment.
      </Alert>

      <TextField fullWidth size="small" placeholder="Search by name, email or phone…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 480 }} />

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Parent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Children</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Portal</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={6} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchData()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <EmptyState
                    icon={UsersIcon}
                    title={debouncedSearch ? 'No matches' : 'No parents yet'}
                    description={
                      debouncedSearch
                        ? `No parents match "${debouncedSearch}"`
                        : 'Add a student with father / mother details to auto-create their parent record.'
                    }
                    action={!debouncedSearch
                      ? <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Add parent</Button>
                      : undefined}
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((p) => {
                  const childCount = (p.studentIds && p.studentIds.length) || 0;
                  return (
                    <TableRow key={p.parentId} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
                            {(p.firstname || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {[p.firstname, p.middlename, p.lastname].filter(Boolean).join(' ')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{p.email || '—'}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {p.parentType ? <Chip size="small" label={p.parentType} variant="outlined" /> : '—'}
                      </TableCell>
                      <TableCell>{p.phone || '—'}</TableCell>
                      <TableCell>
                        {childCount > 0 ? (
                          <Chip size="small" label={`${childCount} linked`} color="success" />
                        ) : (
                          <Chip size="small" label="Unlinked" variant="outlined" color="warning" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={p.portalAccessEnabled ? 'Enabled' : 'Disabled'}
                          color={p.portalAccessEnabled ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}>
                          <Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(p)}>
                          <Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
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
        <DialogTitle>{editing ? 'Edit parent' : 'Add parent'}</DialogTitle>
        <DialogContent>
          {!editing && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This creates a standalone parent record. To link them to a student,
              enrol the student with this parent's name + phone in the <em>Family</em> step.
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="First name"
                value={draft.firstname}
                onChange={(e) => setDraft({ ...draft, firstname: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Middle name"
                value={draft.midlename || ''}
                onChange={(e) => setDraft({ ...draft, midlename: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Last name"
                value={draft.lastname}
                onChange={(e) => setDraft({ ...draft, lastname: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="email" label="Email"
                value={draft.email || ''}
                onChange={(e) => setDraft({ ...draft, email: e.target.value.toLowerCase().trim() })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone"
                value={draft.phone || ''}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/\D/g, '') })}
                inputProps={{ maxLength: 10 }} helperText="10-digit number" />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Parent type" value={draft.parentType || 'FATHER'}
                onChange={(e) => setDraft({ ...draft, parentType: e.target.value as ParentRequest['parentType'] })}>
                <MenuItem value="FATHER">Father</MenuItem>
                <MenuItem value="MOTHER">Mother</MenuItem>
                <MenuItem value="GUARDIAN">Guardian</MenuItem>
              </TextField>
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
