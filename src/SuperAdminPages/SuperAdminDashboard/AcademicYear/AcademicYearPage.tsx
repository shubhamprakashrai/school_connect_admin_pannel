/**
 * Academic year admin page — list, create, activate, edit, delete.
 * Wired to `/academic-years/*`.
 */

import { useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, CheckCircle, Delete, Edit, Star, StarBorder } from '@mui/icons-material';
import { toast } from 'react-toastify';
import academicYearService from '../../../services/academicYear.service';
import { useAcademicYear } from '../../../contexts/AcademicYearContext';
import type { AcademicYearRequest, AcademicYearResponse } from '../../../types/academicYear';

const empty: AcademicYearRequest = { name: '', startDate: '', endDate: '', isActive: false };

export default function AcademicYearPage() {
  const { all, refresh, loading } = useAcademicYear();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicYearResponse | null>(null);
  const [draft, setDraft] = useState<AcademicYearRequest>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void refresh(); }, [refresh]);

  const openCreate = () => { setEditing(null); setDraft(empty); setOpen(true); };
  const openEdit = (y: AcademicYearResponse) => {
    setEditing(y);
    setDraft({ name: y.name, startDate: y.startDate, endDate: y.endDate, isActive: y.isActive });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name || !draft.startDate || !draft.endDate) {
      toast.error('Fill all fields');
      return;
    }
    setSaving(true);
    try {
      if (editing) await academicYearService.update(editing.id, draft);
      else await academicYearService.create(draft);
      toast.success(editing ? 'Updated' : 'Created');
      setOpen(false);
      await refresh();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const activate = async (y: AcademicYearResponse) => {
    try {
      await academicYearService.activate(y.id);
      toast.success(`${y.name} is now active`);
      await refresh();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Activation failed');
    }
  };

  const remove = async (y: AcademicYearResponse) => {
    if (!window.confirm(`Delete ${y.name}?`)) return;
    try {
      await academicYearService.remove(y.id);
      toast.success('Deleted');
      await refresh();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Academic Years</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>New academic year</Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : all.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No academic years yet.</TableCell></TableRow>
              ) : (
                all.map((y) => (
                  <TableRow key={y.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {y.isActive ? <Star color="warning" /> : <StarBorder color="disabled" />}
                        <Typography variant="subtitle2">{y.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{new Date(y.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(y.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {y.isActive
                        ? <Chip size="small" label="ACTIVE" color="success" />
                        : <Chip size="small" label="Inactive" variant="outlined" />}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Make active">
                        <span>
                          <IconButton size="small" disabled={y.isActive} onClick={() => activate(y)}>
                            <CheckCircle fontSize="small" color={y.isActive ? 'disabled' : 'success'} />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <IconButton size="small" onClick={() => openEdit(y)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => remove(y)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit academic year' : 'New academic year'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name (e.g., 2024-2025)" required value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="Start date" type="date" required InputLabelProps={{ shrink: true }}
              value={draft.startDate}
              onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            />
            <TextField
              label="End date" type="date" required InputLabelProps={{ shrink: true }}
              value={draft.endDate}
              onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
