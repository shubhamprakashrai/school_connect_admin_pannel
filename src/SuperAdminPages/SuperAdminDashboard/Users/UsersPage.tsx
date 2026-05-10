/**
 * Users management — list, role+status filter, status toggle, unlock,
 * force-verify-email, role add/remove. Wired to `/users/*`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, Menu, MenuItem, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography,
} from '@mui/material';
import {
  Block, CheckCircle, Delete, LockOpen, MailOutline, MoreVert, Search,
  ShieldOutlined, Tune,
} from '@mui/icons-material';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../../../services/admin.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { UserSummary } from '../../../types/admin';
import type { Page } from '../../../types/tenant';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

const ROLES = ['ALL', 'SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] as const;
const STATUSES = ['ALL', 'ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED'] as const;

const STATUS_COLORS: Record<string, 'success' | 'default' | 'warning' | 'error'> = {
  ACTIVE: 'success', INACTIVE: 'default', LOCKED: 'error', SUSPENDED: 'warning',
};

export default function UsersPage() {
  const [data, setData] = useState<Page<UserSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('ALL');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const debouncedSearch = useDebounced(search);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<UserSummary | null>(null);

  const [rolesDialog, setRolesDialog] = useState(false);
  const [newRole, setNewRole] = useState('TEACHER');

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // /users supports basic params; if backend ignores filters that's fine.
      const list = role === 'ALL'
        ? await userService.list({ page, size: rowsPerPage, search: debouncedSearch || undefined, status: status === 'ALL' ? undefined : status })
        : { content: await userService.byRole(role), totalElements: 0, totalPages: 1, size: rowsPerPage, number: 0, first: true, last: true, numberOfElements: 0, empty: false } as Page<UserSummary>;
      // /users/role/{role} returns array; massage into Page shape for the table
      if (Array.isArray((list as any))) {
        const arr = list as unknown as UserSummary[];
        setData({
          content: arr.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
          totalElements: arr.length,
          totalPages: Math.max(1, Math.ceil(arr.length / rowsPerPage)),
          size: rowsPerPage, number: page, first: page === 0,
          last: (page + 1) * rowsPerPage >= arr.length,
          numberOfElements: Math.min(rowsPerPage, arr.length - page * rowsPerPage),
          empty: arr.length === 0,
        });
      } else {
        setData(list as Page<UserSummary>);
      }
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, role, status]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => { setPage(0); }, [debouncedSearch, role, status]);

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const setUserStatus = async (u: UserSummary, next: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED') => {
    setMenuAnchor(null);
    try {
      await userService.setStatus(u.id, next);
      toast.success(`Status set to ${next}`);
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Update failed');
    }
  };

  const unlock = async (u: UserSummary) => {
    setMenuAnchor(null);
    try {
      await userService.unlock(u.id);
      toast.success('Account unlocked');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Unlock failed');
    }
  };

  const forceVerify = async (u: UserSummary) => {
    setMenuAnchor(null);
    try {
      await userService.forceVerifyEmail(u.id);
      toast.success('Email marked verified');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    }
  };

  const remove = async (u: UserSummary) => {
    setMenuAnchor(null);
    if (!window.confirm(`Delete user ${u.username || u.email}?`)) return;
    try {
      await userService.remove(u.id);
      toast.success('User deleted');
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const addRole = async () => {
    if (!activeRow) return;
    try {
      await userService.addRole(activeRow.id, newRole);
      toast.success(`Role ${newRole} added`);
      setRolesDialog(false);
      void fetchData();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    }
  };

  const subtitle = useMemo(
    () => (total === 0 ? 'No users yet' : `${total} user${total === 1 ? '' : 's'}`),
    [total],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Users</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField placeholder="Search username or email…" size="small" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 240 }} />
          <TextField select size="small" label="Role" value={role}
            onChange={(e) => setRole(e.target.value as any)} sx={{ minWidth: 160 }}>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r === 'ALL' ? 'All roles' : r}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Status" value={status}
            onChange={(e) => setStatus(e.target.value as any)} sx={{ minWidth: 160 }}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</MenuItem>)}
          </TextField>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email verified</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last login</TableCell>
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
                    title="No users match these filters"
                    description="Adjust the role or status filter to see more results."
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                          {(u.firstName?.[0] || u.username?.[0] || 'U').toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={u.primaryRole || u.role || '—'} />
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={u.status} color={STATUS_COLORS[u.status] || 'default'} />
                    </TableCell>
                    <TableCell>
                      {u.emailVerified
                        ? <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />
                        : <Block fontSize="small" sx={{ color: 'text.disabled' }} />}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setActiveRow(u); }}>
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
        {activeRow?.status === 'ACTIVE' ? (
          <MenuItem onClick={() => activeRow && setUserStatus(activeRow, 'INACTIVE')}>
            <Block fontSize="small" sx={{ mr: 1 }} /> Deactivate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => activeRow && setUserStatus(activeRow, 'ACTIVE')}>
            <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Activate
          </MenuItem>
        )}
        {activeRow?.status === 'LOCKED' && (
          <MenuItem onClick={() => activeRow && unlock(activeRow)}>
            <LockOpen fontSize="small" sx={{ mr: 1 }} /> Unlock account
          </MenuItem>
        )}
        {!activeRow?.emailVerified && (
          <MenuItem onClick={() => activeRow && forceVerify(activeRow)}>
            <MailOutline fontSize="small" sx={{ mr: 1 }} /> Mark email verified
          </MenuItem>
        )}
        <MenuItem onClick={() => { setMenuAnchor(null); setRolesDialog(true); setNewRole('TEACHER'); }}>
          <ShieldOutlined fontSize="small" sx={{ mr: 1 }} /> Add role
        </MenuItem>
        <MenuItem sx={{ color: 'error.main' }} onClick={() => activeRow && remove(activeRow)}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={rolesDialog} onClose={() => setRolesDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tune fontSize="small" /> Add role to {activeRow?.username}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Role" value={newRole} sx={{ mt: 1 }}
            onChange={(e) => setNewRole(e.target.value)}>
            {['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolesDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addRole}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
