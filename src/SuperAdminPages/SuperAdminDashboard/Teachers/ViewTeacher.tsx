/** Teacher detail — read-only profile + assignments tab. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import { ArrowBack, Edit, Mail, Phone, AttachMoney, School } from '@mui/icons-material';
import { toast } from 'react-toastify';
import teacherService, { teacherAssignmentService } from '../../../services/teacher.service';
import AdminResetPasswordButton from '../../../components/ui/AdminResetPasswordButton';
import type { TeacherAssignmentResponse, TeacherResponse } from '../../../types/teacher';

export default function ViewTeacher() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [teacher, setTeacher] = useState<TeacherResponse | null>(null);
  const [assignments, setAssignments] = useState<TeacherAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      teacherService.getById(id),
      teacherAssignmentService.byTeacher(id).catch(() => []),
    ])
      .then(([t, a]) => { setTeacher(t); setAssignments(a); })
      .catch((err) => toast.error(err.message || 'Failed to load teacher'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !teacher) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const fullName = teacher.fullName || `${teacher.firstName} ${teacher.lastName}`;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/teachers')}>Back</Button>
        <Box sx={{ flex: 1 }} />
        <AdminResetPasswordButton userId={teacher.userId}
          subjectName={teacher.fullName || [teacher.firstName, teacher.lastName].filter(Boolean).join(' ')} />
        <Button startIcon={<Edit />} variant="outlined"
          onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}>Edit</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar src={teacher.photoUrl}
            sx={{ width: 96, height: 96, fontSize: 32,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            {(teacher.firstName || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
              <Chip size="small" label={teacher.status || 'ACTIVE'}
                color={teacher.status === 'ACTIVE' ? 'success' : 'default'} />
              {teacher.designation && <Chip size="small" variant="outlined" label={teacher.designation} />}
              {teacher.department && <Chip size="small" variant="outlined" label={teacher.department} />}
              {teacher.isClassTeacher && <Chip size="small" color="info" label="Class teacher" />}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 1.5, color: 'text.secondary', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Mail fontSize="small" /><Typography variant="body2">{teacher.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Phone fontSize="small" /><Typography variant="body2">{teacher.phone || '—'}</Typography>
              </Box>
              {teacher.experienceYears != null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <School fontSize="small" /><Typography variant="body2">{teacher.experienceYears} yrs experience</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Profile" />
          <Tab label={`Assignments (${assignments.length})`} />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <FieldGrid label="Employee ID" value={teacher.employeeId} mono />
              <FieldGrid label="Joining date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '—'} />
              <FieldGrid label="Date of birth" value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : '—'} />
              <FieldGrid label="Gender" value={teacher.gender} />
              <FieldGrid label="Highest qualification" value={teacher.highestQualification} />
              <FieldGrid label="Address" value={[teacher.address, teacher.city, teacher.state, teacher.postalCode].filter(Boolean).join(', ')} fullWidth />
              <FieldGrid label="Bank" value={teacher.bankName} sub={teacher.bankAccountNumber} />
              <FieldGrid label="IFSC" value={teacher.ifscCode} mono />
              <FieldGrid label="Basic salary"
                value={teacher.basicSalary != null ? `₹ ${teacher.basicSalary.toLocaleString()}` : '—'}
                icon={<AttachMoney fontSize="small" />} />
            </Grid>
          )}

          {tab === 1 && (
            assignments.length === 0 ? (
              <Typography color="text.secondary">No subject/section assignments yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {assignments.map((a) => (
                  <Paper key={a.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                    <Typography variant="subtitle2">
                      {a.subjectName || a.subjectId}
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        — {a.className || ''} {a.sectionName ? `· ${a.sectionName}` : ''}
                      </Typography>
                    </Typography>
                    {a.academicYear && <Chip size="small" label={a.academicYear} variant="outlined" sx={{ mt: 0.5 }} />}
                  </Paper>
                ))}
              </Stack>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
}

function FieldGrid({
  label, value, sub, mono, fullWidth, icon,
}: { label: string; value?: string | null; sub?: string | null; mono?: boolean; fullWidth?: boolean; icon?: React.ReactNode }) {
  return (
    <Grid item xs={12} md={fullWidth ? 12 : 6}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body1" sx={{ fontFamily: mono ? 'monospace' : undefined }}>
          {value || '—'}
        </Typography>
      </Stack>
      {sub && <Typography variant="body2" color="text.secondary">{sub}</Typography>}
    </Grid>
  );
}
