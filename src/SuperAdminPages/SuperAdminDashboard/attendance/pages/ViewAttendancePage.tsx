/** View single attendance record. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Typography,
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import { studentAttendanceService } from '../../../../services/attendance.service';
import type { StudentAttendanceResponse, StudentAttendanceStatus } from '../../../../types/attendance';

const STATUS_COLORS: Record<StudentAttendanceStatus, string> = {
  PRESENT: '#10b981', ABSENT: '#ef4444', LATE: '#f59e0b',
  HALF_DAY: '#06b6d4', LEAVE: '#a855f7', EXCUSED: '#6366f1',
};

export default function ViewAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    studentAttendanceService.getById(id)
      .then(setRecord)
      .catch((err) => toast.error(err.message || 'Failed to load record'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !record) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/attendance')}>Back</Button>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<Edit />} variant="outlined"
          onClick={() => navigate(`/dashboard/attendance/edit/${record.id}`)}>Edit</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2, color: 'white',
            background: STATUS_COLORS[record.status] || '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 20,
          }}>{record.status.charAt(0)}</Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{record.studentName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {record.className || '—'} · {record.sectionName || '—'} · Roll {record.rollNumber || '—'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip label={record.status}
            sx={{ background: STATUS_COLORS[record.status] || '#94a3b8', color: 'white', fontWeight: 700 }} />
        </Stack>

        <Grid container spacing={2}>
          <FieldGrid label="Date" value={new Date(record.attendanceDate).toLocaleDateString()} />
          <FieldGrid label="Academic year" value={record.academicYearName} />
          <FieldGrid label="Marked by" value={record.markedByName} />
          <FieldGrid label="Marked at"
            value={record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'} />
          <FieldGrid label="Half day" value={record.isHalfDay ? `Yes (${record.halfDayType || ''})` : 'No'} />
          <FieldGrid label="Remarks" value={record.remarks} fullWidth />
        </Grid>
      </Paper>
    </Box>
  );
}

function FieldGrid({ label, value, fullWidth }: { label: string; value?: string | null; fullWidth?: boolean }) {
  return (
    <Grid item xs={12} md={fullWidth ? 12 : 6}>
      <Typography variant="caption" color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Grid>
  );
}
