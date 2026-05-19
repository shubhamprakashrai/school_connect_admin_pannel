/**
 * Time slots — manage the school's bell schedule (periods + breaks).
 *
 * Each slot is one row in the timetable grid (e.g. "Period 1 · 09:00 – 09:45",
 * "Lunch · 12:30 – 13:00"). Slots are tenant-scoped and used across every
 * section's timetable; deleting / disabling a slot removes it from future
 * grid edits but does not erase historical entries.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import timeSlotService from '../../../services/timeSlot.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type { TimeSlotRequest, TimeSlotResponse } from '../../../types/timeSlot';

const empty: TimeSlotRequest = { startTime: '09:00', endTime: '09:45', label: '' };

function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function formatTime(t?: string): string {
  if (!t) return '—';
  // Backend may return "09:00:00" or "09:00" — trim seconds.
  return t.slice(0, 5);
}

export default function TimeSlotsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const [rows, setRows] = useState<TimeSlotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TimeSlotResponse | null>(null);
  const [draft, setDraft] = useState<TimeSlotRequest>(empty);
  const [saving, setSaving] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const fn = canManage ? timeSlotService.listAll : timeSlotService.list;
      const list = await fn();
      // Sort by start time so the table mirrors the school-day flow.
      list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      setRows(list);
    } catch (err) {
      if (isServerError(err)) {
        setRows([]);
      } else {
        setError((err as { message?: string }).message || 'Failed to load time slots');
      }
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => { void fetchRows(); }, [fetchRows]);

  const openCreate = () => { setEditing(null); setDraft(empty); setOpen(true); };
  const openEdit = (s: TimeSlotResponse) => {
    setEditing(s);
    setDraft({
      startTime: formatTime(s.startTime),
      endTime: formatTime(s.endTime),
      label: s.displayLabel || '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.startTime || !draft.endTime) { toast.error('Start and end time required'); return; }
    if (draft.endTime <= draft.startTime) { toast.error('End time must be after start'); return; }
    setSaving(true);
    try {
      if (editing) {
        await timeSlotService.update(editing.id, draft);
        toast.success('Slot updated');
      } else {
        await timeSlotService.create(draft);
        toast.success('Slot added');
      }
      setOpen(false);
      void fetchRows();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: TimeSlotResponse) => {
    try {
      await timeSlotService.toggleActive(s.id);
      void fetchRows();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Toggle failed');
    }
  };

  const remove = async (s: TimeSlotResponse) => {
    const label = s.displayLabel || `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`;
    if (!window.confirm(`Delete time slot "${label}"?`)) return;
    try {
      await timeSlotService.remove(s.id);
      toast.success('Deleted');
      void fetchRows();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Time slots</Typography>
          <Typography variant="body2" color="text.secondary">
            Define the periods + breaks for the school day. Used across every section's timetable.
          </Typography>
        </Box>
        {canManage && (
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              boxShadow: '0 8px 24px -8px rgba(6,182,212,0.4)',
            }}>
            Add slot
          </Button>
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Slots are tenant-wide — once defined, every section's timetable uses
        the same bell schedule. Mark a slot inactive to hide it from new
        timetable entries without losing historical data.
      </Alert>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(6,182,212,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                {canManage && <TableCell sx={{ fontWeight: 600 }} align="center">Active</TableCell>}
                {canManage && <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={canManage ? 6 : 4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetchRows()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <EmptyState
                    icon={Clock}
                    title="No time slots yet"
                    description="Define your school's first period — say 09:00 – 09:45 — to start building timetables."
                    action={canManage
                      ? <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Add slot</Button>
                      : undefined}
                  />
                </TableCell></TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id} hover sx={{ opacity: s.isActive === false ? 0.5 : 1 }}>
                    <TableCell>
                      <Typography variant="subtitle2">{s.displayLabel || 'Period'}</Typography>
                    </TableCell>
                    <TableCell><code>{formatTime(s.startTime)}</code></TableCell>
                    <TableCell><code>{formatTime(s.endTime)}</code></TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined"
                        label={`${s.durationMinutes ?? durationMinutes(formatTime(s.startTime), formatTime(s.endTime))} min`} />
                    </TableCell>
                    {canManage && (
                      <TableCell align="center">
                        <Switch size="small" checked={s.isActive ?? true} onChange={() => void toggle(s)} />
                      </TableCell>
                    )}
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(s)}>
                          <Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(s)}>
                          <Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit slot' : 'New time slot'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Label" placeholder="Period 1 · Lunch · Recess"
              value={draft.label || ''}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              helperText="Optional — backend infers period number if blank" />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required type="time" label="Start" InputLabelProps={{ shrink: true }}
                value={draft.startTime}
                onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
              <TextField fullWidth required type="time" label="End" InputLabelProps={{ shrink: true }}
                value={draft.endTime}
                onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Duration: <strong>{durationMinutes(draft.startTime, draft.endTime)} min</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
