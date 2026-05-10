/** Student detail — read-only profile + attendance summary widget. */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography,
} from '@mui/material';
import { ArrowBack, Edit, Phone, Mail, Cake, Print, School } from '@mui/icons-material';
import {
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import { toast } from 'react-toastify';
import studentService from '../../../services/student.service';
import { studentAttendanceService } from '../../../services/attendance.service';
import type { StudentResponse } from '../../../types/student';
import type { AttendanceSummaryResponse } from '../../../types/attendance';

type Period = 'week' | 'month' | 'quarter';
const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#06b6d4', '#a855f7'];

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function rangeFor(p: Period) {
  const today = new Date();
  const days = p === 'week' ? 7 : p === 'month' ? 30 : 90;
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate: ymd(start), endDate: ymd(today) };
}

export default function ViewStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    studentService.getById(id)
      .then(setStudent)
      .catch((err) => toast.error(err.message || 'Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setSummaryLoading(true);
    studentAttendanceService.studentSummary(id, rangeFor(period))
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [id, period]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Present', value: summary.presentDays },
      { name: 'Absent',  value: summary.absentDays },
      { name: 'Late',    value: summary.lateDays },
      { name: 'Half',    value: summary.halfDays },
      { name: 'Leave',   value: summary.leaveDays },
    ].filter((s) => s.value > 0);
  }, [summary]);

  if (loading || !student) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const fullName = student.fullName || `${student.firstName} ${student.lastName}`;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }} className="print-area">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }} className="print-hide">
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/students')}>Back</Button>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>
          Print
        </Button>
        <Button startIcon={<Edit />} variant="outlined"
          onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}>
          Edit
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar src={student.photoUrl}
            sx={{ width: 96, height: 96, fontSize: 32,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            {(student.firstName || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip size="small" label={student.status || 'ACTIVE'}
                color={student.status === 'ACTIVE' ? 'success' : 'default'} />
              <Chip size="small" icon={<School fontSize="small" />}
                label={`${student.schoolClass?.name || '—'} · ${student.section?.name || '—'}`} />
              {student.rollNumber && <Chip size="small" label={`Roll: ${student.rollNumber}`} variant="outlined" />}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: 'text.secondary', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Mail fontSize="small" /><Typography variant="body2">{student.email || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone fontSize="small" /><Typography variant="body2">{student.phone || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Cake fontSize="small" />
                <Typography variant="body2">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Address</Typography>
            <FieldRow label="Street" value={student.address} />
            <FieldRow label="City" value={student.city} />
            <FieldRow label="State / Country" value={[student.state, student.country].filter(Boolean).join(', ')} />
            <FieldRow label="Postal code" value={student.postalCode} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Family</Typography>
            <FieldRow label="Father" value={student.fatherInfo?.name} sub={student.fatherInfo?.occupation} />
            <Divider sx={{ my: 1 }} />
            <FieldRow label="Mother" value={student.motherInfo?.name} sub={student.motherInfo?.occupation} />
            <Divider sx={{ my: 1 }} />
            <FieldRow
              label="Guardian (portal login)"
              value={student.guardianInfo?.name}
              sub={[student.guardianInfo?.phone, student.guardianInfo?.email].filter(Boolean).join(' · ')}
            />
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
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Admission</Typography>
            <Typography variant="body2" color="text.secondary">
              Admitted on{' '}
              {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '—'}
            </Typography>
          </Paper>
        </Grid>

        {/* Attendance summary */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Attendance summary</Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary
                    ? `${summary.presentDays + summary.lateDays} of ${summary.totalWorkingDays} working days`
                    : 'No data for this period'}
                </Typography>
              </Box>
              <Box sx={{
                display: 'inline-flex', borderRadius: 999, p: 0.25,
                background: 'rgba(15,23,42,0.04)', border: '1px solid', borderColor: 'divider',
              }}>
                {(['week', 'month', 'quarter'] as Period[]).map((p) => (
                  <Box
                    key={p}
                    onClick={() => setPeriod(p)}
                    role="button"
                    sx={{
                      px: 1.5, py: 0.5, borderRadius: 999, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                      transition: 'all 150ms',
                      bgcolor: period === p ? 'background.paper' : 'transparent',
                      color: period === p ? 'primary.main' : 'text.secondary',
                      boxShadow: period === p ? 1 : 'none',
                    }}
                  >
                    {p}
                  </Box>
                ))}
              </Box>
            </Stack>

            {summaryLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : !summary ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No attendance recorded yet.
              </Typography>
            ) : (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 180 }}>
                    {pieData.length === 0 ? (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', fontSize: 13 }}>
                        No data
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name"
                            innerRadius={42} outerRadius={64} paddingAngle={3}>
                            {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <RTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {summary.attendancePercentage?.toFixed(1) ?? '0'}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Overall</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={1}>
                    <SummaryStat label="Present"  value={summary.presentDays}     accent="#10b981" />
                    <SummaryStat label="Absent"   value={summary.absentDays}      accent="#ef4444" />
                    <SummaryStat label="Late"     value={summary.lateDays}        accent="#f59e0b" />
                    <SummaryStat label="Half day" value={summary.halfDays}        accent="#06b6d4" />
                    <SummaryStat label="Leave"    value={summary.leaveDays}       accent="#a855f7" />
                    <SummaryStat label="Working"  value={summary.totalWorkingDays} accent="#6366f1" />
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Grid item xs={6} sm={4}>
      <Box sx={{
        p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
        borderLeft: `3px solid ${accent}`,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      </Box>
    </Grid>
  );
}

function FieldRow({ label, value, sub }: { label: string; value?: string | null; sub?: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      <Typography variant="body1">{value || '—'}</Typography>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </Box>
  );
}
