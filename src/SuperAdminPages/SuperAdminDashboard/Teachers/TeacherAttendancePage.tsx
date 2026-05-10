/**
 * Teacher bulk attendance — pick a date, mark every teacher's status,
 * optionally validate first, then submit.
 *
 * Wired to /teachers/bulk-attendance/* (validate, mark, list).
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, CircularProgress, IconButton, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import {
  CheckCircle, CloudDownload, FactCheck, Save, Today,
} from '@mui/icons-material';
import { Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import teacherService from '../../../services/teacher.service';
import { teacherBulkAttendanceService } from '../../../services/attendance.service';
import EmptyState from '../../../components/ui/EmptyState';
import type { TeacherResponse } from '../../../types/teacher';
import type {
  BulkTeacherAttendanceRequest, BulkTeacherAttendanceResponse,
  TeacherAttendanceRecord,
} from '../../../types/attendance';

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';

const STATUS_OPTS: { value: Status; label: string; color: string }[] = [
  { value: 'PRESENT',  label: 'P',  color: '#10b981' },
  { value: 'ABSENT',   label: 'A',  color: '#ef4444' },
  { value: 'LATE',     label: 'L',  color: '#f59e0b' },
  { value: 'HALF_DAY', label: 'H',  color: '#06b6d4' },
  { value: 'LEAVE',    label: 'Lv', color: '#a855f7' },
];

export default function TeacherAttendancePage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherResponse[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [checkIn, setCheckIn] = useState<Record<string, string>>({});
  const [checkOut, setCheckOut] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [validateResult, setValidateResult] = useState<BulkTeacherAttendanceResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    teacherService.list({ page: 0, size: 500 })
      .then((res) => {
        const list = res.content || [];
        setTeachers(list);
        // Default everyone to PRESENT — saves clicks.
        const defaults: Record<string, Status> = {};
        list.forEach((t) => { defaults[t.id] = 'PRESENT'; });
        setMarks(defaults);
      })
      .catch((err) => toast.error(err.message || 'Failed to load teachers'))
      .finally(() => setLoading(false));
  }, []);

  const setAll = (s: Status) => {
    const next: Record<string, Status> = {};
    teachers.forEach((t) => { next[t.id] = s; });
    setMarks(next);
  };

  const counts = useMemo(() => {
    const c: Record<Status, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0, LEAVE: 0 };
    Object.values(marks).forEach((s) => { c[s] = (c[s] || 0) + 1; });
    return c;
  }, [marks]);

  const buildRequest = (): BulkTeacherAttendanceRequest => ({
    attendanceDate: date,
    continueOnError: true,
    attendanceRecords: teachers.map<TeacherAttendanceRecord>((t) => ({
      teacherId: t.id,
      status: marks[t.id] || 'PRESENT',
      remarks: remarks[t.id],
      checkInTime: checkIn[t.id] || undefined,
      checkOutTime: checkOut[t.id] || undefined,
    })),
  });

  const downloadTemplate = async () => {
    try { await teacherBulkAttendanceService.downloadTemplate(); }
    catch (err) { toast.error('Template download failed'); }
  };

  const validate = async () => {
    setValidating(true); setValidateResult(null);
    try {
      const res = await teacherBulkAttendanceService.validate(buildRequest());
      setValidateResult(res);
      if (res.failed === 0) toast.success(`All ${res.totalRequested} entries are valid`);
      else toast.warn(`${res.failed} of ${res.totalRequested} entries have issues`);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const submit = async () => {
    if (!date) { toast.error('Pick a date'); return; }
    if (teachers.length === 0) { toast.error('No teachers loaded'); return; }
    setSubmitting(true);
    try {
      const res = await teacherBulkAttendanceService.markBulk(buildRequest());
      toast.success(`Marked ${res.successful} of ${res.totalRequested}`);
      navigate('/dashboard/teachers');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(124,58,237,0.5)',
        }}>
          <UsersIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Teacher attendance</Typography>
          <Typography variant="body2" color="text.secondary">Mark today's attendance for all teachers in one go.</Typography>
        </Box>
        <Tooltip title="Download CSV template">
          <IconButton onClick={downloadTemplate}><CloudDownload /></IconButton>
        </Tooltip>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField type="date" size="small" label="Date" InputLabelProps={{ shrink: true }}
            value={date} onChange={(e) => setDate(e.target.value)}
            InputProps={{ startAdornment: <Today fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ minWidth: 200 }} />
          <Button variant="outlined" disabled={teachers.length === 0} onClick={() => setAll('PRESENT')}>
            All present
          </Button>
          <Button variant="outlined" color="warning" disabled={teachers.length === 0} onClick={() => setAll('ABSENT')}>
            All absent
          </Button>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {STATUS_OPTS.map((s) => (
              <Chip key={s.value} size="small"
                label={`${s.label}: ${counts[s.value] || 0}`}
                sx={{ background: s.color, color: 'white', fontWeight: 600 }} />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {teachers.length === 0 ? (
        <EmptyState title="No teachers" description="Add teachers first to mark attendance." />
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: 'rgba(124,58,237,0.06)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-out</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={t.photoUrl} sx={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', width: 36, height: 36 }}>
                          {(t.firstName || '?').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t.fullName || `${t.firstName} ${t.lastName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.employeeId || '—'}{t.department ? ` · ${t.department}` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <ToggleButtonGroup size="small" exclusive
                        value={marks[t.id] || 'PRESENT'}
                        onChange={(_, v) => v && setMarks({ ...marks, [t.id]: v })}>
                        {STATUS_OPTS.map((opt) => (
                          <ToggleButton key={opt.value} value={opt.value}
                            sx={{
                              px: 1, py: 0.25, minWidth: 32, fontWeight: 700, fontSize: 12,
                              '&.Mui-selected': { background: opt.color, color: 'white' },
                              '&.Mui-selected:hover': { background: opt.color, opacity: 0.9 },
                            }}>
                            {opt.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField type="time" size="small" value={checkIn[t.id] || ''}
                        onChange={(e) => setCheckIn({ ...checkIn, [t.id]: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField type="time" size="small" value={checkOut[t.id] || ''}
                        onChange={(e) => setCheckOut({ ...checkOut, [t.id]: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <TextField size="small" placeholder="Optional"
                        value={remarks[t.id] || ''}
                        onChange={(e) => setRemarks({ ...remarks, [t.id]: e.target.value })}
                        fullWidth />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {validateResult && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2,
          background: validateResult.failed === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
          borderColor: validateResult.failed === 0 ? 'success.light' : 'warning.light',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {validateResult.successful} valid · {validateResult.failed} with errors of {validateResult.totalRequested}
          </Typography>
          {validateResult.errors.length > 0 && (
            <Stack spacing={0.5} sx={{ mt: 1, maxHeight: 180, overflow: 'auto' }}>
              {validateResult.errors.slice(0, 30).map((e) => (
                <Typography key={e.rowIndex} variant="caption" color="error">
                  Row {e.rowIndex + 1}: {e.errorMessage}
                </Typography>
              ))}
              {validateResult.errors.length > 30 && (
                <Typography variant="caption" color="text.secondary">
                  +{validateResult.errors.length - 30} more
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
        <Button startIcon={<FactCheck />} onClick={validate} disabled={validating || teachers.length === 0}>
          {validating ? 'Validating…' : 'Validate'}
        </Button>
        <Button variant="contained" startIcon={<Save />} onClick={submit}
          disabled={submitting || teachers.length === 0}
          sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
          {submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : (
            <>{teachers.length} record{teachers.length === 1 ? '' : 's'} <CheckCircle fontSize="small" sx={{ ml: 0.5 }} /></>
          )}
        </Button>
      </Box>
    </Box>
  );
}
