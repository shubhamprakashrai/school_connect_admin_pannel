/**
 * Fee receipt — printable view of a single payment.
 *
 * Per mobile's `fee_receipt_page.dart`. Pulls the payment by id and
 * renders a clean, print-ready receipt with school header, student
 * info, line items and total. The `.print-area` + `.print-hide` CSS
 * classes the rest of the app uses for printing apply here too.
 *
 * Route: /dashboard/fees/receipt/:paymentId
 */

import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box, Button, CircularProgress, Divider, Paper, Stack, Typography,
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';
import { Receipt } from 'lucide-react';
import feeRealService from '../../../services/feeReal.service';
import tenantService from '../../../services/tenant.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { isServerError } from '../../../utils/apiErrors';
import type { FeePaymentResponse } from '../../../types/feeReal';
import type { TenantResponse } from '../../../types/tenant';

export default function FeeReceiptPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<FeePaymentResponse | null>(null);
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!paymentId) return;
    setLoading(true); setError(null);
    try {
      const [p, t] = await Promise.all([
        feeRealService.receipt(paymentId),
        tenantService.current().catch(() => null),
      ]);
      setPayment(p);
      setTenant(t);
    } catch (err) {
      if (isServerError(err)) {
        setPayment(null);
        setTenant(null);
      } else {
        setError((err as { message?: string }).message || 'Failed to load receipt');
      }
    } finally {
      setLoading(false);
    }
  }, [paymentId]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!payment) return <EmptyState icon={Receipt} title="Receipt not found" />;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }} className="print-hide">
        <Button component={RouterLink} to="/dashboard/fees" startIcon={<ArrowBack />}>
          Fees
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<Print />} onClick={() => window.print()}
          sx={{ background: 'linear-gradient(135deg, #10b981, #2563eb)' }}>
          Print receipt
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, maxWidth: 720, mx: 'auto' }} className="print-area">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {tenant?.name || 'School Connect'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fee receipt
          </Typography>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" sx={{ my: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Receipt #</Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {payment.receiptNumber}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Payment date</Typography>
            <Typography variant="body1">
              {new Date(payment.paymentDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={1.5} sx={{ my: 3 }}>
          <Row label="Student" value={payment.studentName || payment.studentId} />
          <Row label="Payment mode" value={payment.paymentMode.replace(/_/g, ' ')} />
          {payment.referenceNumber && <Row label="Reference / cheque #" value={payment.referenceNumber} />}
          <Row label="Status" value={payment.status} />
          {payment.remarks && <Row label="Remarks" value={payment.remarks} />}
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center"
          sx={{ mt: 3, p: 2, background: 'rgba(16,185,129,0.06)', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Amount paid</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
            ₹{payment.amount.toLocaleString('en-IN')}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          This is a computer-generated receipt. No signature required.
        </Typography>
      </Paper>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Stack>
  );
}
