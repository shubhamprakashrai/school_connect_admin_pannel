/**
 * Master Data — admin-defined lookup tables (designations, departments,
 * blood groups, leave types, etc.). Tenant-scoped; read by other modules
 * for dropdown options.
 *
 * Layout:
 *   - Left rail: list of categories (with the entry count per category).
 *     Has a "+ New category" affordance — adding the first entry creates the
 *     category implicitly.
 *   - Right pane: entries for the selected category — table with add/edit/
 *     soft-delete + drag-free display-order edit.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Grid, IconButton, InputAdornment, List, ListItemButton, ListItemText,
  Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { Database } from 'lucide-react';
import { toast } from 'react-toastify';
import { masterDataService } from '../../../services/masterData.service';
import { useT } from '../../../contexts/I18nContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type {
  CreateMasterDataRequest, MasterDataResponse, UpdateMasterDataRequest,
} from '../../../types/masterData';

/** Suggested categories — admin can pick or type a new one in the dialog. */
const COMMON_CATEGORIES = [
  'DESIGNATION', 'DEPARTMENT', 'BLOOD_GROUP', 'LEAVE_TYPE',
  'RELIGION', 'CASTE', 'NATIONALITY', 'OCCUPATION',
];

const emptyDraft: CreateMasterDataRequest = {
  category: '',
  value: '',
  label: '',
  description: '',
  displayOrder: 0,
  isActive: true,
};

export default function MasterDataPage() {
  const { t } = useT();
  const [allEntries, setAllEntries] = useState<MasterDataResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MasterDataResponse | null>(null);
  const [draft, setDraft] = useState<CreateMasterDataRequest>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const list = await masterDataService.all();
      setAllEntries(list || []);
    } catch (err) {
      if (isServerError(err)) {
        setAllEntries([]);
      } else {
        setError((err as { message?: string }).message || 'Failed to load master data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Group by category for the left rail.
  const grouped = useMemo(() => {
    const m = new Map<string, MasterDataResponse[]>();
    allEntries.forEach((e) => {
      const list = m.get(e.category) || [];
      list.push(e);
      m.set(e.category, list);
    });
    return m;
  }, [allEntries]);

  // Pre-select the first category once data lands.
  useEffect(() => {
    if (!selectedCategory && grouped.size > 0) {
      setSelectedCategory(Array.from(grouped.keys())[0]);
    }
  }, [grouped, selectedCategory]);

  const filteredEntries = useMemo(() => {
    if (!selectedCategory) return [];
    const list = (grouped.get(selectedCategory) || [])
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) =>
      e.value.toLowerCase().includes(q) ||
      e.label.toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q),
    );
  }, [grouped, selectedCategory, search]);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, category: selectedCategory || '' });
    setOpen(true);
  };

  const openCreateNewCategory = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, category: '' });
    setOpen(true);
  };

  const openEdit = (e: MasterDataResponse) => {
    setEditing(e);
    setDraft({
      category: e.category,
      value: e.value,
      label: e.label,
      description: e.description || '',
      displayOrder: e.displayOrder ?? 0,
      isActive: e.isActive ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.category.trim()) { toast.error('Category is required'); return; }
    if (!draft.value.trim())    { toast.error('Value is required'); return; }
    if (!draft.label.trim())    { toast.error('Label is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        // Backend doesn't allow editing category/value — only label/desc/order/status.
        const update: UpdateMasterDataRequest = {
          label: draft.label,
          description: draft.description,
          displayOrder: draft.displayOrder,
          isActive: draft.isActive,
        };
        await masterDataService.update(editing.id, update);
        toast.success('Updated');
      } else {
        await masterDataService.create({
          ...draft,
          category: draft.category.toUpperCase().replace(/\s+/g, '_'),
          value: draft.value.toUpperCase().replace(/\s+/g, '_'),
        });
        toast.success('Added');
        setSelectedCategory(draft.category.toUpperCase().replace(/\s+/g, '_'));
      }
      setOpen(false);
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e: MasterDataResponse) => {
    if (!window.confirm(t('masterData.confirmRemove', { label: e.label }))) return;
    try {
      await masterDataService.remove(e.id);
      toast.success('Removed');
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const toggleActive = async (e: MasterDataResponse) => {
    try {
      await masterDataService.update(e.id, { isActive: !(e.isActive ?? true) });
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Toggle failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('masterData.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('masterData.subtitle')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Add />} variant="outlined" onClick={openCreateNewCategory}>
            {t('masterData.newCategory')}
          </Button>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}
            disabled={!selectedCategory}
            sx={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
              textTransform: 'none',
            }}>
            {t('masterData.addEntry')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {/* Categories rail */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t('masterData.categories')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {grouped.size === 1 ? t('masterData.groupsOne') : t('masterData.groupsMany', { n: grouped.size })}
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ p: 2 }}><TableSkeleton rows={6} cols={1} /></Box>
            ) : grouped.size === 0 ? (
              <EmptyState
                icon={Database}
                title={t('masterData.emptyTitle')}
                description={t('masterData.emptyHint')}
                action={<Button startIcon={<Add />} variant="contained" onClick={openCreateNewCategory}>{t('masterData.newCategory')}</Button>}
              />
            ) : (
              <List dense disablePadding>
                {Array.from(grouped.entries())
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .map(([cat, list]) => (
                    <ListItemButton key={cat}
                      selected={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}>
                      <ListItemText
                        primary={cat}
                        secondary={list.length === 1 ? t('masterData.entriesOne') : t('masterData.entriesMany', { n: list.length })}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>
                  ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Entries pane */}
        <Grid item xs={12} md={9}>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: '1 1 auto' }}>
                {selectedCategory || t('masterData.pickCategory')}
              </Typography>
              <TextField size="small" placeholder={t('masterData.searchEntries')}
                value={search} onChange={(e) => setSearch(e.target.value)}
                disabled={!selectedCategory}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }} sx={{ minWidth: 220 }} />
            </Box>
            <Divider />
            {error ? (
              <ErrorState message={error} onRetry={() => void fetchAll()} />
            ) : !selectedCategory ? (
              <EmptyState icon={Database} title={t('masterData.noCategorySelected')}
                description={t('masterData.pickCategoryHint')} />
            ) : filteredEntries.length === 0 && !search ? (
              <EmptyState
                icon={Database}
                title={t('masterData.noEntriesInCat')}
                description={t('masterData.noEntriesHint')}
                action={<Button startIcon={<Add />} variant="contained" onClick={openCreate}>{t('masterData.addEntry')}</Button>}
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: 60 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('masterData.valueCode')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('masterData.labelDisplay')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t('masterData.description')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">{t('common.active')}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">{t('common.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                        {t('common.noResults')}
                      </TableCell></TableRow>
                    ) : filteredEntries.map((e) => (
                      <TableRow key={e.id} hover sx={{ opacity: e.isActive === false ? 0.5 : 1 }}>
                        <TableCell>{e.displayOrder ?? 0}</TableCell>
                        <TableCell><code style={{ fontSize: 12 }}>{e.value}</code></TableCell>
                        <TableCell>{e.label}</TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {e.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Switch size="small" checked={e.isActive ?? true}
                            onChange={() => void toggleActive(e)} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t('common.edit')}><IconButton size="small" onClick={() => openEdit(e)}>
                            <Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title={t('masterData.softDelete')}><IconButton size="small" color="error" onClick={() => remove(e)}>
                            <Delete fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `${t('common.edit')} ${editing.value}` : t('masterData.newEntry')}</DialogTitle>
        <DialogContent>
          {editing && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('masterData.categoryImmutable')}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label={t('masterData.category')} value={draft.category}
              disabled={!!editing}
              onChange={(e) => setDraft({ ...draft, category: e.target.value.toUpperCase() })}
              helperText={t('masterData.categoryHelp')}
              placeholder={`e.g. ${COMMON_CATEGORIES.join(', ')}`} />
            <TextField required label={t('masterData.valueCode')} value={draft.value}
              disabled={!!editing}
              onChange={(e) => setDraft({ ...draft, value: e.target.value.toUpperCase() })}
              helperText={t('masterData.valueHelp')} />
            <TextField required label={t('masterData.labelDisplay')} value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              helperText={t('masterData.labelHelp')} />
            <TextField label={t('masterData.description')} multiline rows={2}
              value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField label={t('masterData.displayOrder')} type="number"
                value={draft.displayOrder ?? 0}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
                helperText={t('masterData.displayOrderHelp')}
                sx={{ flex: 1 }} />
              <Stack alignItems="center" sx={{ minWidth: 80 }}>
                <Switch checked={draft.isActive ?? true}
                  onChange={(_, v) => setDraft({ ...draft, isActive: v })} />
                <Chip size="small" label={draft.isActive ? t('common.active') : t('common.inactive')}
                  color={draft.isActive ? 'success' : 'default'} variant="outlined" />
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
