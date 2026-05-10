/** Edit a single attendance record. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { studentAttendanceService } from '../../../../services/attendance.service';
import type {
  StudentAttendanceResponse, StudentAttendanceStatus,
} from '../../../../types/attendance';

const STATUSES: StudentAttendanceStatus[] = [
  'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'EXCUSED',
];

export default function EditAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<StudentAttendanceResponse | null>(null);
  const [status, setStatus] = useState<StudentAttendanceStatus>('PRESENT');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    studentAttendanceService.getById(id)
      .then((r) => { setRecord(r); setStatus(r.status); setRemarks(r.remarks || ''); })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await studentAttendanceService.update(id, { status, remarks });
      toast.success('Saved');
      navigate(`/dashboard/attendance/view/${id}`);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !record) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit attendance</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Student</Typography>
            <Typography variant="body1">{record.studentName} · {new Date(record.attendanceDate).toLocaleDateString()}</Typography>
          </Box>
          <TextField select label="Status" value={status}
            onChange={(e) => setStatus(e.target.value as StudentAttendanceStatus)}>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Remarks" multiline rows={2} value={remarks}
            onChange={(e) => setRemarks(e.target.value)} />
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button startIcon={<Save />} variant="contained" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
