/**
 * Assignment detail + submissions — teacher view.
 *
 * Per mobile's `assignment_detail_page.dart` + `grade_submission_page.dart`.
 * Shows the assignment header (title, class, subject, due) and a table of
 * student submissions with status chips. Inline grade dialog records
 * marks + feedback for each submission.
 *
 * Route: /dashboard/assignments/:assignmentId
 */

import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { ArrowBack, Grading } from '@mui/icons-material';
import { ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';
import assignmentService from '../../../services/assignment.service';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { isServerError } from '../../../utils/apiErrors';
import type {
  AssignmentResponse, AssignmentStatistics, AssignmentSubmissionResponse, SubmissionStatus,
} from '../../../types/assignment';

const STATUS_COLOR: Record<SubmissionStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  SUBMITTED: 'primary',
  LATE:      'warning',
  MISSING:   'error',
  GRADED:    'success',
};

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionResponse[]>([]);
  const [stats, setStats] = useState<AssignmentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [gradeTarget, setGradeTarget] = useState<AssignmentSubmissionResponse | null>(null);
  const [marksDraft, setMarksDraft] = useState<number | ''>('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true); setError(null);
    try {
      const [a, subs, st] = await Promise.all([
        assignmentService.getById(assignmentId),
        assignmentService.submissions(assignmentId).catch(() => []),
        assignmentService.statistics(assignmentId).catch(() => null),
      ]);
      setAssignment(a);
      setSubmissions(subs);
      setStats(st);
    } catch (err) {
      if (isServerError(err)) {
        setAssignment(null);
        setSubmissions([]);
        setStats(null);
      } else {
        setError((err as { message?: string }).message || 'Failed to load assignment');
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);
  useEffect(() => { void load(); }, [load]);

  const openGrade = (s: AssignmentSubmissionResponse) => {
    setGradeTarget(s);
    setMarksDraft(s.marksObtained ?? '');
    setFeedbackDraft(s.feedback || '');
  };
  const submitGrade = async () => {
    if (!gradeTarget) return;
    const marks = typeof marksDraft === 'number' ? marksDraft : Number(marksDraft);
    if (Number.isNaN(marks)) { toast.error('Marks must be a number'); return; }
    const max = assignment?.maxMarks ?? Infinity;
    if (marks < 0 || marks > max) { toast.error(`Marks must be 0 – ${max}`); return; }
    setSaving(true);
    try {
      await assignmentService.grade(gradeTarget.id, marks, feedbackDraft.trim() || undefined);
      toast.success('Graded');
      setGradeTarget(null);
      void load();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Grade failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!assignment) return <EmptyState icon={ClipboardList} title="Assignment not found" />;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button component={RouterLink} to="/dashboard/assignments" startIcon={<ArrowBack />}>
          Assignments
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap">
          <Avatar sx={{ width: 56, height: 56, fontSize: 24, background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
            {(assignment.title || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{assignment.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {assignment.className} · {assignment.subjectName} · {assignment.teacherName}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {assignment.description || 'No description.'}
            </Typography>
          </Box>
          <Stack spacing={1} alignItems="flex-end">
            <Chip label={`Due ${new Date(assignment.dueDate).toLocaleDateString()}`} variant="outlined" />
            {assignment.maxMarks != null && <Chip label={`Max ${assignment.maxMarks} marks`} variant="outlined" />}
          </Stack>
        </Stack>
      </Paper>

      {stats && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
          <StatPaper label="Total students" value={stats.totalStudents} />
          <StatPaper label="Submitted" value={stats.submitted} accent="primary" />
          <StatPaper label="Pending" value={stats.pending} accent="warning" />
          <StatPaper label="Graded" value={stats.graded} accent="success" />
          {stats.averageMarks != null && (
            <StatPaper label="Average" value={`${stats.averageMarks.toFixed(1)} / ${assignment.maxMarks ?? '?'}`} accent="info" />
          )}
        </Stack>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Submissions</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(245,158,11,0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Marks</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Feedback</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ py: 0 }}>
                  <EmptyState icon={ClipboardList} title="No submissions yet"
                    description="Students haven't submitted anything. Once they do, you can grade their work here." />
                </TableCell></TableRow>
              ) : submissions.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.studentName || s.studentId}</TableCell>
                  <TableCell>
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={STATUS_COLOR[s.status]} variant="outlined" label={s.status} />
                  </TableCell>
                  <TableCell align="center">
                    {s.marksObtained != null ? (
                      <strong>{s.marksObtained}{assignment.maxMarks ? ` / ${assignment.maxMarks}` : ''}</strong>
                    ) : <Typography variant="caption" color="text.disabled">Not graded</Typography>}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{
                      display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', maxWidth: 220,
                    }}>{s.feedback || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Grade">
                      <Button startIcon={<Grading />} size="small" variant="outlined"
                        onClick={() => openGrade(s)}>
                        {s.status === 'GRADED' ? 'Update' : 'Grade'}
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={!!gradeTarget} onClose={() => setGradeTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Grade submission</DialogTitle>
        <DialogContent>
          {gradeTarget && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>{gradeTarget.studentName}</strong> · submitted{' '}
                {new Date(gradeTarget.submittedAt).toLocaleString()}
              </Typography>
              {gradeTarget.content && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                    {gradeTarget.content}
                  </Typography>
                </Alert>
              )}
              <Stack spacing={2}>
                <TextField required type="number" label={`Marks (out of ${assignment.maxMarks ?? '?'})`}
                  value={marksDraft}
                  inputProps={{ min: 0, max: assignment.maxMarks ?? undefined }}
                  onChange={(e) => setMarksDraft(e.target.value === '' ? '' : Number(e.target.value))} />
                <TextField label="Feedback" multiline rows={3}
                  value={feedbackDraft} onChange={(e) => setFeedbackDraft(e.target.value)} />
              </Stack>
              <Divider sx={{ my: 2 }} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeTarget(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={submitGrade} disabled={saving}>
            {saving ? 'Saving…' : 'Submit grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatPaper({
  label, value, accent,
}: {
  label: string;
  value: number | string;
  accent?: 'primary' | 'success' | 'warning' | 'info';
}) {
  const colors: Record<string, string> = {
    primary: '#2563eb', success: '#10b981', warning: '#f59e0b', info: '#06b6d4',
  };
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 140, flex: '1 1 140px' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: accent ? colors[accent] : 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  );
}
