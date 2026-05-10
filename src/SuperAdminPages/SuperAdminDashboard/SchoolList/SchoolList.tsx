/**
 * Schools (= tenants) list — wired to `/superadmin/tenants/*`.
 *
 * Search / status / plan filters are debounced and pushed into the request.
 * Pagination is server-side via Spring Data Page<T>.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { School as SchoolLucide } from 'lucide-react';
import superAdminTenantService from '../../../services/superAdminTenant.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { dispatchNotification } from '../../../components/NotificationCenter';
import usePersistedState from '../../../utils/usePersistedState';
import type {
  Page,
  SubscriptionPlan,
  TenantResponse,
  TenantStatus,
} from '../../../types/tenant';

const STATUS_OPTIONS: Array<'ALL' | TenantStatus> = [
  'ALL',
  'ACTIVE',
  'PENDING',
  'SUSPENDED',
  'TRIAL_EXPIRED',
  'DELETED',
];

const PLAN_OPTIONS: Array<'ALL' | SubscriptionPlan> = [
  'ALL',
  'TRIAL',
  'BASIC',
  'STANDARD',
  'PREMIUM',
  'ENTERPRISE',
];

const STATUS_COLORS: Record<TenantStatus, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'error',
  TRIAL_EXPIRED: 'warning',
  DELETED: 'default',
};

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SchoolList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Page<TenantResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = usePersistedState<'ALL' | TenantStatus>('schools.status', 'ALL');
  const [planFilter, setPlanFilter] = usePersistedState<'ALL' | SubscriptionPlan>('schools.plan', 'ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useDebounced(search);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<TenantResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminTenantService.list({
        page,
        size: rowsPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        subscriptionPlan: planFilter === 'ALL' ? undefined : planFilter,
        sortField: 'createdAt',
        sortDirection: 'DESC',
      });
      setData(response);
    } catch (err) {
      const message = (err as { message?: string }).message || 'Failed to load schools';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, statusFilter, planFilter]);

  useEffect(() => {
    void fetchTenants();
  }, [fetchTenants]);

  // Filter changes reset page index — keeps results predictable.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, statusFilter, planFilter]);

  const rows = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;

  const openMenu = (event: React.MouseEvent<HTMLElement>, row: TenantResponse) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setActiveRow(row);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveRow(null);
  };

  const handleActivate = async (row: TenantResponse) => {
    closeMenu();
    try {
      await superAdminTenantService.activate(row.id);
      toast.success(`${row.name} activated`);
      void fetchTenants();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Activation failed');
    }
  };

  const handleSuspend = async (row: TenantResponse) => {
    closeMenu();
    if (!window.confirm(`Suspend ${row.name}? Users will lose access immediately.`)) return;
    try {
      await superAdminTenantService.suspend(row.id);
      toast.success(`${row.name} suspended`);
      void fetchTenants();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Suspension failed');
    }
  };

  const handleDelete = async (row: TenantResponse) => {
    closeMenu();
    if (!window.confirm(`Delete ${row.name}? This is reversible (soft delete).`)) return;
    try {
      await superAdminTenantService.softDelete(row.id);
      toast.success(`${row.name} deleted`);
      void fetchTenants();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const headerStats = useMemo(() => {
    if (!data) return null;
    return `${totalCount} school${totalCount === 1 ? '' : 's'}`;
  }, [data, totalCount]);

  // ---- Selection ---------------------------------------------------------

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const allOnPage = rows.map((r) => r.id);
      const everySelected = allOnPage.every((id) => prev.has(id));
      const next = new Set(prev);
      if (everySelected) {
        allOnPage.forEach((id) => next.delete(id));
      } else {
        allOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Whenever filters/page change, clear selection so the user doesn't act on
  // hidden rows by accident.
  useEffect(() => { clearSelection(); }, [debouncedSearch, statusFilter, planFilter, page, rowsPerPage]);

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someOnPageSelected = rows.some((r) => selectedIds.has(r.id));

  const bulkActivate = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Activate ${ids.length} selected school${ids.length === 1 ? '' : 's'}?`)) return;
    setBulkBusy(true);
    try {
      const res = await superAdminTenantService.bulkActivate({ tenantIds: ids });
      toast.success(`Activated ${res.succeeded} of ${ids.length}${res.failed ? ` (${res.failed} failed)` : ''}`);
      dispatchNotification({
        level: res.failed > 0 ? 'warning' : 'success',
        title: 'Bulk activate completed',
        body: `${res.succeeded} succeeded, ${res.failed} failed`,
      });
      clearSelection();
      void fetchTenants();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Bulk activate failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSuspend = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const reason = window.prompt(`Suspend ${ids.length} school${ids.length === 1 ? '' : 's'}? Optionally provide a reason:`);
    if (reason === null) return;
    setBulkBusy(true);
    try {
      const res = await superAdminTenantService.bulkSuspend({ tenantIds: ids, reason: reason || undefined });
      toast.success(`Suspended ${res.succeeded} of ${ids.length}${res.failed ? ` (${res.failed} failed)` : ''}`);
      dispatchNotification({
        level: res.failed > 0 ? 'warning' : 'success',
        title: 'Bulk suspend completed',
        body: `${res.succeeded} succeeded, ${res.failed} failed${reason ? ` · "${reason}"` : ''}`,
      });
      clearSelection();
      void fetchTenants();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Bulk suspend failed');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Schools
          </Typography>
          {headerStats && (
            <Typography variant="body2" color="text.secondary">
              {headerStats}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/schools/add')}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
            '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
          }}
        >
          Add School
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} elevation={0} variant="outlined">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search by name, subdomain or email…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 280 }}
          />
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TenantStatus)}
            sx={{ minWidth: 160 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s === 'ALL' ? 'All statuses' : s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Plan"
            size="small"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as 'ALL' | SubscriptionPlan)}
            sx={{ minWidth: 160 }}
          >
            {PLAN_OPTIONS.map((p) => (
              <MenuItem key={p} value={p}>
                {p === 'ALL' ? 'All plans' : p}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 2, py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))',
            border: '1px solid', borderColor: 'primary.light',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedIds.size} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            size="small" startIcon={<CheckCircleIcon />} variant="outlined" color="success"
            onClick={bulkActivate} disabled={bulkBusy}
          >
            Activate
          </Button>
          <Button
            size="small" startIcon={<BlockIcon />} variant="outlined" color="warning"
            onClick={bulkSuspend} disabled={bulkBusy}
          >
            Suspend
          </Button>
          <Button size="small" onClick={clearSelection} disabled={bulkBusy}>
            Clear
          </Button>
        </Box>
      )}

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={0} variant="outlined">
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
                <TableCell sx={{ fontWeight: 600 }}>School</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subdomain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Students</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ p: 0 }}>
                    <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={8} /></Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 0 }}>
                    <ErrorState message={error} onRetry={() => void fetchTenants()} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 0 }}>
                    <EmptyState
                      icon={SchoolLucide}
                      title="No schools found"
                      description="Try a different filter or onboard the first school."
                      action={
                        <Button variant="contained" startIcon={<AddIcon />}
                          onClick={() => navigate('/dashboard/schools/add')}
                          sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                          Add school
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selectedIds.has(row.id)}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/schools/${row.id}`)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        inputProps={{ 'aria-label': `Select ${row.name}` }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={row.logoUrl}
                          sx={{
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                          }}
                        >
                          {row.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.city}{row.state ? `, ${row.state}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {row.subdomain}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.subscriptionPlan} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLORS[row.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.limits?.currentStudents ?? 0}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}
                          / {row.limits?.maxStudents ?? '—'}
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={(e) => openMenu(e, row)}>
                        <MoreVertIcon fontSize="small" />
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {/* Row action menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (activeRow) navigate(`/dashboard/schools/${activeRow.id}`);
            closeMenu();
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) navigate(`/dashboard/schools/${activeRow.id}?edit=1`);
            closeMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {activeRow?.status === 'SUSPENDED' || activeRow?.status === 'PENDING' ? (
          <MenuItem onClick={() => activeRow && handleActivate(activeRow)}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Activate
          </MenuItem>
        ) : (
          <MenuItem onClick={() => activeRow && handleSuspend(activeRow)}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} /> Suspend
          </MenuItem>
        )}
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => activeRow && handleDelete(activeRow)}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
