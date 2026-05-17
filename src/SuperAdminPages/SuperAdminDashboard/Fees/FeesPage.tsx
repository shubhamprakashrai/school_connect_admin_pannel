/**
 * Fees — three-tab admin console mirroring the mobile fee view.
 *
 *   1. Types        — catalog of charges (Tuition, Bus, Lab, …)
 *   2. Structure    — per-class fee plans assembled from types
 *   3. Payments     — recorded payments with receipt download
 *
 * Wired to `feeRealService` (the new module — the older `feeService` is
 * kept around for the existing dashboard stub). Backend's full fee
 * domain is still in flight; reads will currently fall through to
 * `ErrorState` until the controllers ship.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Stack, Switch, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Download, Edit, Receipt } from '@mui/icons-material';
import { Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import feeRealService from '../../../services/feeReal.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type {
  FeePaymentRequest, FeePaymentResponse, FeeStructure, FeeType, PaymentMode,
} from '../../../types/feeReal';

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'CHEQUE', 'ONLINE', 'UPI', 'CARD', 'BANK_TRANSFER'];

export default function FeesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [tab, setTab] = useState<'types' | 'structure' | 'payments'>('types');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Fees</Typography>
          <Typography variant="body2" color="text.secondary">
            Define fee types, build per-class structures, record payments and generate receipts.
          </Typography>
        </Box>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Fee types" value="types" />
        <Tab label="Structure" value="structure" />
        <Tab label="Payments" value="payments" />
      </Tabs>

      {tab === 'types'     && <FeeTypesPanel canManage={canManage} />}
      {tab === 'structure' && <FeeStructurePanel canManage={canManage} />}
      {tab === 'payments'  && <PaymentsPanel canManage={canManage} />}
    </Box>
  );
}

// ============================================================================
// Tab 1: Fee types
// ============================================================================
function FeeTypesPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [draft, setDraft] = useState<Omit<FeeType, 'id'>>({
    name: '', code: '', description: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await feeRealService.types()); }
    catch (err) { setError((err as { message?: string }).message || 'Failed to load fee types'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  const openCreate = () => { setEditing(null); setDraft({ name: '', code: '', description: '', isActive: true }); setOpen(true); };
  const openEdit = (t: FeeType) => { setEditing(t); setDraft({ name: t.name, code: t.code, description: t.description, isActive: t.isActive ?? true }); setOpen(true); };
  const save = async () => {
    if (!draft.name?.trim() || !draft.code?.trim()) { toast.error('Name and code required'); return; }
    setSaving(true);
    try {
      if (editing) await feeRealService.updateType(editing.id, draft);
      else await feeRealService.createType(draft);
      toast.success('Saved'); setOpen(false); void fetch();
    } catch (err) { toast.error((err as { message?: string }).message || 'Save failed'); }
    finally { setSaving(false); }
  };
  const remove = async (t: FeeType) => {
    if (!window.confirm(`Delete fee type "${t.name}"?`)) return;
    try { await feeRealService.removeType(t.id); toast.success('Deleted'); void fetch(); }
    catch (err) { toast.error((err as { message?: string }).message || 'Delete failed'); }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Add fee type</Button>
        </Box>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(16,185,129,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
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
                  <EmptyState icon={Wallet} title="No fee types"
                    description="Define charges like Tuition, Bus, Lab — used in fee structures." />
                </TableCell></TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell><Typography variant="subtitle2">{t.name}</Typography></TableCell>
                    <TableCell><code>{t.code}</code></TableCell>
                    <TableCell>{t.description || '—'}</TableCell>
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
        <DialogTitle>{editing ? 'Edit fee type' : 'New fee type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <TextField required label="Code" value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              helperText="Short uppercase code, e.g. TUITION, BUS" />
            <TextField label="Description" multiline rows={2}
              value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
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

// ============================================================================
// Tab 2: Fee structure
// ============================================================================
function FeeStructurePanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows(await feeRealService.structures()); }
    catch (err) { setError((err as { message?: string }).message || 'Failed to load structures'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2 }}>
      {loading ? (
        <Box sx={{ p: 3 }}><TableSkeleton rows={3} cols={3} /></Box>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetch()} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Wallet} title="No structures defined"
          description="A structure bundles fee-types into a per-class plan (e.g. Class 5 — Tuition ₹3000, Bus ₹500)." />
      ) : (
        <Stack spacing={1.5} sx={{ p: 2 }}>
          {rows.map((s) => (
            <Paper key={s.id} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{s.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.className || '—'} · {s.academicYearName || '—'}
                  </Typography>
                </Box>
                <Chip size="small" label={`₹${(s.totalAmount ?? 0).toLocaleString('en-IN')}`} color="primary" />
                {canManage && <IconButton size="small"><Edit fontSize="small" /></IconButton>}
              </Stack>
              {s.items?.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }} useFlexGap>
                  {s.items.map((it, i) => (
                    <Chip key={i} size="small" variant="outlined"
                      label={`${it.feeTypeName || 'Item'} · ₹${it.amount.toLocaleString('en-IN')}${it.frequency ? ` / ${it.frequency.toLowerCase()}` : ''}`} />
                  ))}
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

// ============================================================================
// Tab 3: Payments
// ============================================================================
function PaymentsPanel({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<FeePaymentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recordOpen, setRecordOpen] = useState(false);
  const [draft, setDraft] = useState<FeePaymentRequest>({
    studentId: '', amount: 0, paymentMode: 'CASH', paymentDate: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await feeRealService.payments({ page, size: rowsPerPage });
      setRows(res.content || []); setTotal(res.totalElements ?? 0);
    } catch (err) { setError((err as { message?: string }).message || 'Failed to load payments'); }
    finally { setLoading(false); }
  }, [page, rowsPerPage]);
  useEffect(() => { void fetch(); }, [fetch]);

  const record = async () => {
    if (!draft.studentId?.trim()) { toast.error('Student id required'); return; }
    if (!draft.amount || draft.amount <= 0) { toast.error('Amount must be > 0'); return; }
    setSaving(true);
    try {
      await feeRealService.recordPayment(draft);
      toast.success('Payment recorded');
      setRecordOpen(false);
      setDraft({ studentId: '', amount: 0, paymentMode: 'CASH', paymentDate: new Date().toISOString().slice(0, 10) });
      void fetch();
    } catch (err) { toast.error((err as { message?: string }).message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Receipt />} variant="contained" onClick={() => setRecordOpen(true)}>
            Record payment
          </Button>
        </Box>
      )}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(16,185,129,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Receipt #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={4} cols={7} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ py: 0 }}>
                  <EmptyState icon={Receipt as never} title="No payments recorded yet"
                    description="Record a fee payment to generate the first receipt." />
                </TableCell></TableRow>
              ) : (
                rows.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell><code>{p.receiptNumber}</code></TableCell>
                    <TableCell>{p.studentName || p.studentId}</TableCell>
                    <TableCell>₹{p.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell><Chip size="small" label={p.paymentMode} variant="outlined" /></TableCell>
                    <TableCell>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.status}
                        color={p.status === 'PAID' ? 'success' : p.status === 'PENDING' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download receipt">
                        <IconButton size="small"><Download fontSize="small" /></IconButton>
                      </Tooltip>
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

      <Dialog open={recordOpen} onClose={() => setRecordOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record payment</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Backend persists the receipt — search will pick it up after refresh.
          </Alert>
          <Stack spacing={2}>
            <TextField required label="Student ID" value={draft.studentId}
              onChange={(e) => setDraft({ ...draft, studentId: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField fullWidth required type="number" label="Amount (₹)"
                value={draft.amount || ''} inputProps={{ min: 1 }}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
              <TextField select fullWidth required label="Mode" value={draft.paymentMode}
                onChange={(e) => setDraft({ ...draft, paymentMode: e.target.value as PaymentMode })}>
                {PAYMENT_MODES.map((m) => <MenuItem key={m} value={m}>{m.replace(/_/g, ' ')}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField required type="date" label="Date" InputLabelProps={{ shrink: true }}
              value={draft.paymentDate} onChange={(e) => setDraft({ ...draft, paymentDate: e.target.value })} />
            <TextField label="Reference / cheque number" value={draft.referenceNumber || ''}
              onChange={(e) => setDraft({ ...draft, referenceNumber: e.target.value })} />
            <TextField label="Remarks" multiline rows={2} value={draft.remarks || ''}
              onChange={(e) => setDraft({ ...draft, remarks: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecordOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={record} disabled={saving}>{saving ? 'Saving…' : 'Record'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
