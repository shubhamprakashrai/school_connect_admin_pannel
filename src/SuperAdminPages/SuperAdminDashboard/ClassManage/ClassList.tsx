/**
 * Classes list — server-paginated card grid with debounced search.
 * Uses /classes (Spring Page<T>).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, IconButton,
  InputAdornment, Stack, TablePagination, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Class as ClassIcon, Delete, Edit, Search, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import schoolClassService from '../../../services/schoolClass.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { CardGridSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type { SchoolClassResponse } from '../../../types/schoolClass';
import type { Page } from '../../../types/tenant';

function useDebounced<T>(v: T, d = 350): T {
  const [s, setS] = useState(v);
  useEffect(() => { const t = window.setTimeout(() => setS(v), d); return () => window.clearTimeout(t); }, [v, d]);
  return s;
}

export default function ClassList() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  // Backend /classes write paths are ADMIN/SUPER_ADMIN only — teachers may
  // browse but not create/edit/delete.
  const canManageClasses = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [data, setData] = useState<Page<SchoolClassResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const fetchClasses = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await schoolClassService.listPaginated({
        page, size: rowsPerPage,
        search: debouncedSearch || undefined,
        sort: 'name,asc',
      });
      setData(res);
    } catch (err) {
      if (isServerError(err)) {
        setData(null);
      } else {
        setError((err as { message?: string }).message || 'Failed to load classes');
      }
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => { void fetchClasses(); }, [fetchClasses]);
  useEffect(() => { setPage(0); }, [debouncedSearch]);

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const handleDelete = async (c: SchoolClassResponse) => {
    if (!window.confirm(`Delete ${c.name}? Sections + students may also be affected.`)) return;
    try {
      await schoolClassService.remove(c.id);
      toast.success('Class deleted');
      void fetchClasses();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const subtitle = useMemo(
    () => (total === 0 ? 'No classes yet' : `${total} class${total === 1 ? '' : 'es'}`),
    [total],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Classes</Typography>
          <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        </Box>
        {canManageClasses && (
          <Button startIcon={<Add />} variant="contained" onClick={() => navigate('/dashboard/classes/add')}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
            }}>
            Add class
          </Button>
        )}
      </Box>

      <TextField fullWidth size="small" placeholder="Search by name or code…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3, maxWidth: 480 }} />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchClasses()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClassIcon as any}
          title="No classes found"
          description={search ? `No classes match "${search}"` : 'Create your first class to start enrolling students.'}
          action={!search && canManageClasses ? (
            <Button startIcon={<Add />} variant="contained"
              onClick={() => navigate('/dashboard/classes/add')}>Create first class</Button>
          ) : undefined}
        />
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {rows.map((c) => (
              <Card key={c.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar sx={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                      <ClassIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{c.code}</Typography>
                    </Box>
                    <Stack direction="row" spacing={0}>
                      <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/dashboard/classes/${c.id}`)}><Visibility fontSize="small" /></IconButton></Tooltip>
                      {canManageClasses && (
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/dashboard/classes/${c.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>
                      )}
                      {canManageClasses && (
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(c)}><Delete fontSize="small" /></IconButton></Tooltip>
                      )}
                    </Stack>
                  </Stack>
                  {c.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }} noWrap>{c.description}</Typography>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {c.sections?.length || 0} section{c.sections?.length === 1 ? '' : 's'}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                      {(c.sections || []).slice(0, 6).map((s) => (
                        <Chip key={s.id} size="small" label={s.name} variant="outlined" />
                      ))}
                      {(c.sections?.length || 0) > 6 && (
                        <Chip size="small" label={`+${(c.sections?.length || 0) - 6}`} />
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[6, 12, 24, 48]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
