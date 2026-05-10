/**
 * Mark attendance — wired to `POST /student/attendance/bulk`.
 *
 * Pick class → section → date → roster loads → toggle each student → submit.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Avatar, Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import { CheckCircle, EventAvailable, Save, Today } from '@mui/icons-material';
import schoolClassService, { sectionService } from '../../../../services/schoolClass.service';
import studentService from '../../../../services/student.service';
import { studentAttendanceService } from '../../../../services/attendance.service';
import { useAcademicYear } from '../../../../contexts/AcademicYearContext';
import type { SchoolClassResponse, SectionResponse } from '../../../../types/schoolClass';
import type { StudentResponse } from '../../../../types/student';
import type {
  BulkAttendanceRecord, StudentAttendanceStatus,
} from '../../../../types/attendance';

const STATUS_OPTS: { value: StudentAttendanceStatus; label: string; color: string }[] = [
  { value: 'PRESENT', label: 'P', color: '#10b981' },
  { value: 'ABSENT', label: 'A', color: '#ef4444' },
  { value: 'LATE', label: 'L', color: '#f59e0b' },
  { value: 'HALF_DAY', label: 'H', color: '#06b6d4' },
  { value: 'LEAVE', label: 'Lv', color: '#a855f7' },
  { value: 'EXCUSED', label: 'E', color: '#6366f1' },
];

export default function MarkAttendancePage() {
  const navigate = useNavigate();
  const { active: activeYear } = useAcademicYear();

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [marks, setMarks] = useState<Record<string, StudentAttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
    setSectionId('');
  }, [classId]);

  useEffect(() => {
    if (!sectionId) { setStudents([]); setMarks({}); return; }
    setLoadingRoster(true);
    studentService.bySection(sectionId)
      .then((roster) => {
        setStudents(roster);
        // Default all to PRESENT — saves clicks for the common case.
        const defaults: Record<string, StudentAttendanceStatus> = {};
        roster.forEach((s) => { defaults[s.id] = 'PRESENT'; });
        setMarks(defaults);
      })
      .catch((err) => toast.error(err.message || 'Failed to load students'))
      .finally(() => setLoadingRoster(false));
  }, [sectionId]);

  const setMark = (studentId: string, status: StudentAttendanceStatus) =>
    setMarks((prev) => ({ ...prev, [studentId]: status }));

  const setAll = (status: StudentAttendanceStatus) => {
    const all: Record<string, StudentAttendanceStatus> = {};
    students.forEach((s) => { all[s.id] = status; });
    setMarks(all);
  };

  const counts = useMemo(() => {
    const c: Record<StudentAttendanceStatus, number> = {
      PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0, LEAVE: 0, EXCUSED: 0,
    };
    Object.values(marks).forEach((s) => { c[s] = (c[s] || 0) + 1; });
    return c;
  }, [marks]);

  const submit = async () => {
    if (!sectionId || !date) { toast.error('Pick a section and date'); return; }
    if (!activeYear) { toast.error('No active academic year — set one first'); return; }
    if (students.length === 0) { toast.error('No students in this section'); return; }
    setSubmitting(true);
    try {
      const records: BulkAttendanceRecord[] = students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] || 'PRESENT',
        remarks: remarks[s.id],
      }));
      await studentAttendanceService.markBulk({
        attendanceDate: date,
        sectionId,
        academicYearId: activeYear.id,
        attendanceRecords: records,
      });
      toast.success('Attendance saved');
      navigate('/dashboard/attendance');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(16,185,129,0.5)',
        }}>
          <EventAvailable />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Mark attendance</Typography>
          <Typography variant="body2" color="text.secondary">
            {activeYear ? `Academic year: ${activeYear.name}` : 'No active academic year set'}
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label="Class" value={classId}
              onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label="Section" value={sectionId}
              disabled={!classId} onChange={(e) => setSectionId(e.target.value)}>
              <MenuItem value="">Select section</MenuItem>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth type="date" label="Date" InputLabelProps={{ shrink: true }}
              value={date} onChange={(e) => setDate(e.target.value)}
              InputProps={{ startAdornment: <Today fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" disabled={students.length === 0}
              onClick={() => setAll('PRESENT')}>All present</Button>
            <Button fullWidth variant="outlined" color="warning" disabled={students.length === 0}
              onClick={() => setAll('ABSENT')}>All absent</Button>
          </Grid>
        </Grid>
      </Paper>

      {!sectionId ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">Pick a class and section to load the roster.</Typography>
        </Paper>
      ) : loadingRoster ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : students.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">No students in this section.</Typography>
        </Paper>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {STATUS_OPTS.map((s) => (
              <Chip key={s.value} size="small"
                label={`${s.label}: ${counts[s.value] || 0}`}
                sx={{ background: s.color, color: 'white', fontWeight: 600 }} />
            ))}
          </Stack>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ background: 'rgba(16,185,129,0.06)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s, i) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={s.photoUrl}
                            sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', width: 36, height: 36 }}>
                            {(s.firstName || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {s.fullName || `${s.firstName} ${s.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Roll: {s.rollNumber || '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <ToggleButtonGroup size="small" exclusive
                          value={marks[s.id] || 'PRESENT'}
                          onChange={(_, v) => v && setMark(s.id, v)}>
                          {STATUS_OPTS.map((opt) => (
                            <ToggleButton key={opt.value} value={opt.value}
                              sx={{
                                px: 1, py: 0.25, minWidth: 36, fontWeight: 700, fontSize: 12,
                                '&.Mui-selected': { background: opt.color, color: 'white' },
                                '&.Mui-selected:hover': { background: opt.color, opacity: 0.9 },
                              }}>
                              {opt.label}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <TextField size="small" placeholder="Optional remark"
                          value={remarks[s.id] || ''}
                          onChange={(e) => setRemarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          fullWidth />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => navigate('/dashboard/attendance')} disabled={submitting}>Cancel</Button>
            <Button startIcon={<Save />} variant="contained" disabled={submitting}
              onClick={submit}
              sx={{
                textTransform: 'none', minWidth: 180,
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                boxShadow: '0 8px 24px -8px rgba(16,185,129,0.4)',
              }}>
              {submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : (
                <><CheckCircle fontSize="small" sx={{ mr: 0.5 }} /> Save attendance</>
              )}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
