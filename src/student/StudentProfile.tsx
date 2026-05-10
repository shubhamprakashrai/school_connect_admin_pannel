/**
 * Student profile — read-only.
 * Pulls /students/{me} (the user.id is the student id for STUDENT role).
 */

import { useEffect, useState } from 'react';
import {
  Box, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography,
} from '@mui/material';
import { Cake, Mail, Phone, Printer, GraduationCap as GcapIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import studentService from '../services/student.service';
import type { StudentResponse } from '../types/student';

export default function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    studentService.getById(user.id)
      .then(setStudent)
      .catch((err) => toast.error(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!student) {
    return <Typography color="text.secondary" align="center" sx={{ py: 6 }}>Profile unavailable.</Typography>;
  }

  const fullName = student.fullName || `${student.firstName} ${student.lastName}`;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }} className="print-area">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }} className="print-hide">
        <Box
          component="button"
          onClick={() => window.print()}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75,
            borderRadius: 1, border: '1px solid', borderColor: 'divider',
            background: 'transparent', cursor: 'pointer', fontSize: 13,
            color: 'text.primary',
            '&:hover': { background: 'action.hover' },
          }}
        >
          <Printer size={14} /> Print
        </Box>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: 2.5, color: 'white', fontSize: 32, fontWeight: 700,
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #f59e0b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px -12px rgba(16,185,129,0.5)',
          }}>
            {fullName.charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size="small" label={student.status || 'ACTIVE'}
                color={student.status === 'ACTIVE' ? 'success' : 'default'} />
              <Chip size="small" label={`${student.schoolClass?.name || '—'} · ${student.section?.name || '—'}`} variant="outlined" />
              {student.rollNumber && <Chip size="small" label={`Roll ${student.rollNumber}`} variant="outlined" />}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: 'text.secondary', flexWrap: 'wrap' }}>
              {student.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Mail size={14} /><Typography variant="body2">{student.email}</Typography>
                </Box>
              )}
              {student.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone size={14} /><Typography variant="body2">{student.phone}</Typography>
                </Box>
              )}
              {student.dateOfBirth && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Cake size={14} />
                  <Typography variant="body2">{new Date(student.dateOfBirth).toLocaleDateString()}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Address</Typography>
            <Field label="Street" value={student.address} />
            <Divider sx={{ my: 1 }} />
            <Field label="City" value={student.city} />
            <Divider sx={{ my: 1 }} />
            <Field label="State / Country"
              value={[student.state, student.country].filter(Boolean).join(', ') || '—'} />
            <Divider sx={{ my: 1 }} />
            <Field label="Postal code" value={student.postalCode} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Family</Typography>
            <Field label="Father" value={student.fatherInfo?.name} sub={student.fatherInfo?.phone} />
            <Divider sx={{ my: 1 }} />
            <Field label="Mother" value={student.motherInfo?.name} sub={student.motherInfo?.phone} />
            <Divider sx={{ my: 1 }} />
            <Field label="Guardian" value={student.guardianInfo?.name} sub={student.guardianInfo?.phone} />
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">EMERGENCY CONTACT</Typography>
            <Typography variant="body1">
              {student.emergencyContact?.name || '—'}
              {student.emergencyContact?.relation ? ` (${student.emergencyContact.relation})` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">{student.emergencyContact?.phone}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <GcapIcon size={18} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admission</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Admitted on {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '—'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function Field({ label, value, sub }: { label: string; value?: string | null; sub?: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      <Typography variant="body1">{value || '—'}</Typography>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </Box>
  );
}
