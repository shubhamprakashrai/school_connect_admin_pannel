/**
 * Parents — list / create / edit / delete with server-side search + pagination.
 *
 * Backend (May 2026) shipped POST /parents/search with rich filters. We use
 * that for the list view: it returns a slim `ParentSearchResult` shape with
 * just identity + contact fields. For editing we fetch the full record via
 * GET /parents/{id} so the dialog can show all flags (parentType, portal access).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, GroupOutlined, Search } from '@mui/icons-material';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentService } from '../../../services/parent.service';
import { useT } from '../../../contexts/I18nContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { ParentRequest, ParentSearchResult } from '../../../types/parent';
import type { StudentResponse } from '../../../types/student';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

const empty: ParentRequest = {
  firstname: '', midlename: '', lastname: '', email: '', phone: '', parentType: 'FATHER',
};

export default function ParentsPage() {
  const { t } = useT();
  const [rows, setRows] = useState<ParentSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ParentRequest>(empty);
  const [saving, setSaving] = useState(false);

  // "View children" sheet — uses GET /parents/user/{uuid}/students.
  const [childrenOpen, setChildrenOpen] = useState(false);
  const [childrenFor, setChildrenFor] = useState<ParentSearchResult | null>(null);
  const [childrenList, setChildrenList] = useState<StudentResponse[] | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const openChildren = async (p: ParentSearchResult) => {
    if (!p.parentUserId) {
      toast.info('This parent has no linked user account yet — link is created when a student is enrolled with their details.');
      return;
    }
    setChildrenFor(p);
    setChildrenOpen(true);
    setChildrenList(null);
    setChildrenLoading(true);
    try {
      const list = await parentService.studentsByParentUser(p.parentUserId);
      setChildrenList(list || []);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not load children');
      setChildrenList([]);
    } finally {
      setChildrenLoading(false);
    }
  };

  const fetchPage = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await parentService.search({
        search: debouncedSearch.trim() || undefined,
        page,
        size: rowsPerPage,
        sortBy: 'firstName',
        sortDirection: 'ASC',
      });
      setRows(res.content || []);
      setTotal(res.totalElements ?? 0);
    } catch (searchErr) {
      // POST /parents/search is new (May 2026). If production hasn't shipped
      // it yet, or the backend's native query errors, transparently degrade
      // to the legacy `GET /parents` (flat array) + client-side filter/page.
      // eslint-disable-next-line no-console
      console.warn('[Parents] /parents/search failed, falling back to GET /parents', searchErr);
      try {
        const all = await parentService.list();
        const q = debouncedSearch.trim().toLowerCase();
        const filtered = q
          ? all.filter((p) =>
              `${p.firstname} ${p.middlename ?? ''} ${p.lastname}`.toLowerCase().includes(q) ||
              (p.email || '').toLowerCase().includes(q) ||
              (p.phone || '').includes(q),
            )
          : all;
        const start = page * rowsPerPage;
        const slim: ParentSearchResult[] = filtered
          .slice(start, start + rowsPerPage)
          .map((p) => ({
            parentId: p.parentId,
            parentUserId: p.userId,
            firstName: p.firstname,
            lastName: p.lastname,
            fullName: [p.firstname, p.middlename, p.lastname].filter(Boolean).join(' ').trim(),
            email: p.email,
            phone: p.phone,
          }));
        setRows(slim);
        setTotal(filtered.length);
      } catch (listErr) {
        setError((listErr as { message?: string }).message
          || (searchErr as { message?: string }).message
          || 'Failed to load parents');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, rowsPerPage]);

  useEffect(() => { void fetchPage(); }, [fetchPage]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const openCreate = () => { setEditingId(null); setDraft(empty); setOpen(true); };
  const openEdit = async (p: ParentSearchResult) => {
    // Slim search shape lacks parentType/middlename — fetch full record.
    try {
      const full = await parentService.getById(p.parentId);
      setEditingId(full.parentId);
      setDraft({
        firstname: full.firstname,
        midlename: full.middlename,
        lastname: full.lastname,
      email: full.email,
      phone: full.phone,
      parentType: full.parentType,
    });
    setOpen(true);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not load parent');
    }
  };

  const save = async () => {
    if (!draft.firstname?.trim() || !draft.lastname?.trim()) {
      toast.error('First and last name are required'); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await parentService.update(editingId, draft);
        toast.success('Parent updated');
      } else {
        await parentService.create(draft);
        toast.success('Parent added');
      }
      setOpen(false);
      void fetchPage();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ParentSearchResult) => {
    const display = p.fullName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'this parent';
    if (!window.confirm(`Delete ${display}?`)) return;
    try {
      await parentService.remove(p.parentId);
      toast.success('Deleted');
      void fetchPage();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('parents.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {total === 0
              ? t('parents.noParentsYet')
              : (total === 1 ? t('parents.countOne') : t('parents.countMany', { n: total }))}
          </Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
            boxShadow: '0 8px 24px -8px rgba(236,72,153,0.4)',
          }}>
          {t('parents.addParent')}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('parents.hint')}
      </Alert>

      <TextField fullWidth size="small" placeholder={t('common.search')}
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 480 }} />

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{t('parents.title')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('common.email')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('common.phone')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={5} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchPage()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState
                    icon={UsersIcon}
                    title={debouncedSearch ? t('parents.noMatches') : t('parents.noParentsYet')}
                    description={
                      debouncedSearch
                        ? t('common.noResults')
                        : t('parents.hint')
                    }
                    action={!debouncedSearch
                      ? <Button startIcon={<Add />} variant="contained" onClick={openCreate}>{t('parents.addParent')}</Button>
                      : undefined}
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((p) => {
                  const display = p.fullName
                    || [p.firstName, p.lastName].filter(Boolean).join(' ').trim()
                    || '—';
                  const initial = (p.firstName || p.fullName || '?').charAt(0).toUpperCase();
                  return (
                    <TableRow key={p.parentId} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
                            {initial}
                          </Avatar>
                          <Typography variant="subtitle2">{display}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{p.email || '—'}</TableCell>
                      <TableCell>{p.phone || '—'}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {p.address || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View children">
                          <span><IconButton size="small" disabled={!p.parentUserId} onClick={() => void openChildren(p)}>
                            <GroupOutlined fontSize="small" /></IconButton></span>
                        </Tooltip>
                        <Tooltip title={t('common.edit')}><IconButton size="small" onClick={() => void openEdit(p)}>
                          <Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title={t('common.delete')}><IconButton size="small" color="error" onClick={() => remove(p)}>
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
        <DialogTitle>{editingId ? t('parents.editParent') : t('parents.addParent')}</DialogTitle>
        <DialogContent>
          {!editingId && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('parents.standaloneWarning')}
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
          <Button onClick={() => setOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? t('common.saving') : t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={childrenOpen} onClose={() => setChildrenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Children of {childrenFor?.fullName || [childrenFor?.firstName, childrenFor?.lastName].filter(Boolean).join(' ') || '—'}
        </DialogTitle>
        <DialogContent>
          {childrenLoading ? (
            <Box sx={{ p: 2 }}><TableSkeleton rows={3} cols={1} /></Box>
          ) : !childrenList || childrenList.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No students linked to this parent yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {childrenList.map((s) => (
                <Paper key={s.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                    {(s.firstName || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {s.fullName || [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[s.schoolClass?.name, s.section?.name].filter(Boolean).join(' · ') || 'No class'}
                      {s.rollNumber ? ` · Roll ${s.rollNumber}` : ''}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChildrenOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
