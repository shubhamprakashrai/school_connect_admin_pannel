/**
 * Pending fees — admin enters a student id (or picks from the
 * student-summary table when backend ships a tenant-wide overdue endpoint)
 * and sees the dues, with a "Collect now" button per row.
 *
 * Per mobile's `pending_fees_page.dart`.
 *
 * Route: /dashboard/fees/pending
 */

import { useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import feeRealService from '../../../services/feeReal.service';
import EmptyState from '../../../components/ui/EmptyState';
import type { FeePaymentResponse, StudentFeeSummary } from '../../../types/feeReal';

export default function PendingFeesPage() {
  const [studentId, setStudentId] = useState('');
  const [summary, setSummary] = useState<StudentFeeSummary | null>(null);
  const [pending, setPending] = useState<FeePaymentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!studentId.trim()) { toast.error('Enter a student id'); return; }
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        feeRealService.studentSummary(studentId.trim()),
        feeRealService.studentPending(studentId.trim()).catch(() => []),
      ]);
      setSummary(s);
      setPending(p);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load');
      setSummary(null);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Pending fees</Typography>
        <Typography variant="body2" color="text.secondary">
          Per-student outstanding dues. Pull up a student to see what's due.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField fullWidth size="small" label="Student ID"
            placeholder="UUID — find on the student detail page"
            value={studentId} onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()} />
          <Button variant="contained" startIcon={<Search />} disabled={loading} onClick={load}
            sx={{ background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
            {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Load'}
          </Button>
        </Stack>
      </Paper>

      {!summary ? (
        <EmptyState icon={Wallet} title="No student loaded"
          description="Enter a student id above to view their fee summary and dues." />
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {summary.studentName || summary.studentId}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Chip label={`Assigned ₹${summary.totalAssigned.toLocaleString('en-IN')}`} variant="outlined" />
              <Chip label={`Paid ₹${summary.totalPaid.toLocaleString('en-IN')}`} variant="outlined" color="success" />
              <Chip label={`Pending ₹${summary.totalPending.toLocaleString('en-IN')}`} variant="outlined"
                color={summary.totalPending > 0 ? 'warning' : 'success'} />
              {summary.overdueAmount > 0 && (
                <Chip label={`Overdue ₹${summary.overdueAmount.toLocaleString('en-IN')}`} variant="outlined" color="error" />
              )}
              {summary.nextDueDate && (
                <Chip label={`Next due ${new Date(summary.nextDueDate).toLocaleDateString()}`} variant="outlined" />
              )}
            </Stack>
            {summary.totalPending === 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>All dues cleared.</Alert>
            )}
          </Paper>

          {pending.length > 0 && (
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ background: 'rgba(16,185,129,0.06)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Due date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pending.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{p.receiptNumber || 'Pending charge'}</Typography>
                        </TableCell>
                        <TableCell>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Chip size="small" label={p.status}
                            color={p.status === 'OVERDUE' ? 'error' : 'warning'} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button variant="outlined" size="small">Collect</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
