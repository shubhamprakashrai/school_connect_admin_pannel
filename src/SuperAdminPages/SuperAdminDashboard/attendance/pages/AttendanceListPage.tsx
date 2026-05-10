/**
 * Attendance list — pick section + date, view that day's roster.
 * Wired to `GET /student/attendance/section/{sectionId}/date/{date}`.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, Grid, IconButton, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Edit, EventNote, Refresh, Visibility } from '@mui/icons-material';
import schoolClassService, { sectionService } from '../../../../services/schoolClass.service';
import { studentAttendanceService } from '../../../../services/attendance.service';
import type { SchoolClassResponse, SectionResponse } from '../../../../types/schoolClass';
import type {
  StudentAttendanceResponse, StudentAttendanceStatus,
} from '../../../../types/attendance';

const STATUS_COLORS: Record<StudentAttendanceStatus, string> = {
  PRESENT: '#10b981', ABSENT: '#ef4444', LATE: '#f59e0b',
  HALF_DAY: '#06b6d4', LEAVE: '#a855f7', EXCUSED: '#6366f1',
};

export default function AttendanceListPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [rows, setRows] = useState<StudentAttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
    setSectionId('');
  }, [classId]);

  const fetch = () => {
    if (!sectionId || !date) { setRows([]); return; }
    setLoading(true);
    studentAttendanceService.bySectionAndDate(sectionId, date)
      .then((data) => setRows(data || []))
      .catch((err) => toast.error(err.message || 'Failed to load attendance'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sectionId, date]);

  const handleDelete = async (r: StudentAttendanceResponse) => {
    if (!window.confirm(`Delete ${r.studentName}'s attendance for ${r.attendanceDate}?`)) return;
    try {
      await studentAttendanceService.remove(r.id);
      toast.success('Deleted');
      fetch();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [rows]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Attendance</Typography>
          <Typography variant="body2" color="text.secondary">View and manage daily attendance.</Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained"
          onClick={() => navigate('/dashboard/attendance/mark')}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            boxShadow: '0 8px 24px -8px rgba(16,185,129,0.4)',
          }}>
          Mark attendance
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth select label="Class" value={classId}
              onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth select label="Section" value={sectionId} disabled={!classId}
              onChange={(e) => setSectionId(e.target.value)}>
              <MenuItem value="">Select section</MenuItem>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }}
              value={date} onChange={(e) => setDate(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Refresh"><IconButton onClick={fetch}><Refresh /></IconButton></Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {sectionId && rows.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(counts).map(([status, count]) => (
            <Chip key={status} size="small" label={`${status}: ${count}`}
              sx={{
                background: STATUS_COLORS[status as StudentAttendanceStatus] || '#94a3b8',
                color: 'white', fontWeight: 600,
              }} />
          ))}
        </Stack>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        {!sectionId ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <EventNote sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography color="text.secondary" sx={{ mt: 1 }}>Pick a class, section and date to view attendance.</Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>No attendance recorded for this date yet.</Typography>
            <Button variant="contained" startIcon={<Add />}
              onClick={() => navigate('/dashboard/attendance/mark')}>Mark now</Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ background: 'rgba(16,185,129,0.06)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roll</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Marked by</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.studentName}</TableCell>
                    <TableCell>{r.rollNumber || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={r.status}
                        sx={{ background: STATUS_COLORS[r.status] || '#94a3b8', color: 'white', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>{r.remarks || '—'}</TableCell>
                    <TableCell>{r.markedByName || '—'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View"><IconButton size="small"
                        onClick={() => navigate(`/dashboard/attendance/view/${r.id}`)}>
                        <Visibility fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small"
                        onClick={() => navigate(`/dashboard/attendance/edit/${r.id}`)}>
                        <Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error"
                        onClick={() => handleDelete(r)}>
                        <Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
