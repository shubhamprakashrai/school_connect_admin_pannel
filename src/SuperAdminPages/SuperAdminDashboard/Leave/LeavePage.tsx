/**
 * Leave — admin console with approval workflow + leave-type catalog.
 *
 * Two tabs:
 *   1. Pending approvals — list of requests awaiting decision; admin
 *      approves with optional remark or rejects with a reason.
 *   2. Leave types — catalog of allowable leave categories with
 *      max-days-per-year caps.
 *
 * Wired to `leaveRealService`. The dashboard's pending-count stub already
 * works; full request lifecycle is pending backend ship.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Stack, Switch, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Check, Close, Delete, Edit } from '@mui/icons-material';
import { CalendarOff } from 'lucide-react';
import { toast } from 'react-toastify';
import leaveRealService from '../../../services/leaveReal.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type { LeaveRequestResponse, LeaveType } from '../../../types/leaveReal';

export default function LeavePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [tab, setTab] = useState<'pending' | 'types'>('pending');

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Leave</Typography>
        <Typography variant="body2" color="text.secondary">
          Review leave requests and manage leave-type catalog.
        </Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Pending approvals" value="pending" />
        <Tab label="Leave types" value="types" />
      </Tabs>

      {tab === 'pending' && <PendingPanel canManage={canManage} />}
      {tab === 'types'   && <TypesPanel canManage={canManage} />}
    </Box>
  );
}

function statusChip(s: LeaveRequestResponse['status']) {
  const cfg = {
    PENDING:   { color: 'warning' as const, label: 'Pending' },
    APPROVED:  { color: 'success' as const, label: 'Approved' },
    REJECTED:  { color: 'error' as const,   label: 'Rejected' },
    CANCELLED: { color: 'default' as const, label: 'Cancelled' },
  }[s] || { color: 'default' as const, label: s };
  return <Chip size="small" color={cfg.color} label={cfg.label} variant="outlined" />;
}

// ============================================================================
// Tab 1: Pending approvals
// ============================================================================
function PendingPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<LeaveRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionTarget, setActionTarget] = useState<LeaveRequestResponse | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await leaveRealService.pendingRequests()); }
    catch (err) { setError((err as { message?: string }).message || 'Failed to load requests'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  const openApprove = (r: LeaveRequestResponse) => { setActionTarget(r); setAction('approve'); setRemark(''); };
  const openReject  = (r: LeaveRequestResponse) => { setActionTarget(r); setAction('reject');  setRemark(''); };

  const submit = async () => {
    if (!actionTarget || !action) return;
    if (action === 'reject' && !remark.trim()) {
      toast.error('Rejection reason is required'); return;
    }
    setBusy(true);
    try {
      if (action === 'approve') await leaveRealService.approve(actionTarget.id, remark || undefined);
      else await leaveRealService.reject(actionTarget.id, remark);
      toast.success(action === 'approve' ? 'Approved' : 'Rejected');
      setActionTarget(null); setAction(null);
      void fetch();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(168,85,247,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                {canManage && <TableCell align="right" sx={{ fontWeight: 600 }}>Decision</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={3} cols={canManage ? 7 : 6} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <EmptyState icon={CalendarOff} title="No pending requests"
                    description="Approved or rejected requests are not shown here." />
                </TableCell></TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                          {(r.applicantName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2">{r.applicantName || r.applicantId}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{r.leaveTypeName || '—'}</TableCell>
                    <TableCell>
                      {new Date(r.startDate).toLocaleDateString()}
                      {' → '}
                      {new Date(r.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{r.totalDays}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" sx={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', maxWidth: 240,
                      }}>{r.reason}</Typography>
                    </TableCell>
                    <TableCell>{statusChip(r.status)}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => openApprove(r)}>
                          <Check fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => openReject(r)}>
                          <Close fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!actionTarget} onClose={() => setActionTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Approve leave request' : 'Reject leave request'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{actionTarget?.applicantName}</strong> · {actionTarget?.leaveTypeName} ·
            {' '}{actionTarget && new Date(actionTarget.startDate).toLocaleDateString()} →
            {' '}{actionTarget && new Date(actionTarget.endDate).toLocaleDateString()}
          </Typography>
          <TextField fullWidth multiline rows={2}
            required={action === 'reject'}
            label={action === 'approve' ? 'Remark (optional)' : 'Rejection reason'}
            value={remark} onChange={(e) => setRemark(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionTarget(null)} disabled={busy}>Cancel</Button>
          <Button variant="contained" color={action === 'approve' ? 'success' : 'error'}
            onClick={submit} disabled={busy}>
            {busy ? 'Saving…' : action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// Tab 2: Leave types
// ============================================================================
function TypesPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);
  const [draft, setDraft] = useState<Omit<LeaveType, 'id'>>({
    name: '', code: '', description: '', maxDaysPerYear: 12, isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await leaveRealService.types()); }
    catch (err) { setError((err as { message?: string }).message || 'Failed to load types'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setDraft({ name: '', code: '', description: '', maxDaysPerYear: 12, isActive: true }); setOpen(true); };
  const openEdit = (t: LeaveType) => { setEditing(t); setDraft({ name: t.name, code: t.code, description: t.description, maxDaysPerYear: t.maxDaysPerYear, isActive: t.isActive ?? true }); setOpen(true); };

  const save = async () => {
    if (!draft.name?.trim() || !draft.code?.trim()) { toast.error('Name and code required'); return; }
    setSaving(true);
    try {
      if (editing) await leaveRealService.updateType(editing.id, draft);
      else await leaveRealService.createType(draft);
      toast.success('Saved'); setOpen(false); void fetch();
    } catch (err) { toast.error((err as { message?: string }).message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (t: LeaveType) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try { await leaveRealService.removeType(t.id); toast.success('Deleted'); void fetch(); }
    catch (err) { toast.error((err as { message?: string }).message || 'Delete failed'); }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Add leave type</Button>
        </Box>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(168,85,247,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Max days / year</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                {canManage && <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={3} cols={canManage ? 5 : 4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState icon={CalendarOff} title="No leave types"
                    description="Define categories like Sick, Casual, Earned with their yearly caps." />
                </TableCell></TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell><Typography variant="subtitle2">{t.name}</Typography></TableCell>
                    <TableCell><code>{t.code}</code></TableCell>
                    <TableCell>{t.maxDaysPerYear ?? '∞'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.isActive ? 'Active' : 'Inactive'}
                        color={t.isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(t)}><Edit fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => remove(t)}><Delete fontSize="small" /></IconButton></Tooltip>
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
        <DialogTitle>{editing ? 'Edit leave type' : 'New leave type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <TextField required label="Code" value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              helperText="Short code, e.g. SL (Sick), CL (Casual), EL (Earned)" />
            <TextField label="Description" multiline rows={2}
              value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <TextField type="number" label="Max days per year"
              value={draft.maxDaysPerYear ?? ''} inputProps={{ min: 1, max: 365 }}
              onChange={(e) => setDraft({ ...draft, maxDaysPerYear: Number(e.target.value) })} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch checked={draft.isActive ?? true} onChange={(_, v) => setDraft({ ...draft, isActive: v })} />
              <Typography variant="body2">Active</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
