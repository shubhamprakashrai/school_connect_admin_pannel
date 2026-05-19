/**
 * Mark entry — pick an exam from the list, then this screen lets the
 * teacher fill marks for every enrolled student. Per mobile's
 * `mark_entry_page.dart` flow.
 *
 * Route: /dashboard/exams/:examId/marks
 *
 * Submit batches the entire mark table into a single POST request so
 * a transient network blip doesn't leave half the students saved.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { Calculator } from 'lucide-react';
import { toast } from 'react-toastify';
import examService from '../../../../services/exam.service';
import EmptyState from '../../../../components/ui/EmptyState';
import ErrorState from '../../../../components/ui/ErrorState';
import { isServerError } from '../../../../utils/apiErrors';
import type { ExamResponse, StudentMarkEntry } from '../../../../types/exam';

export const ScheduleExamPage = () => {
  // Despite the legacy name, this is now the mark-entry screen.
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [entries, setEntries] = useState<StudentMarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!examId) return;
    setLoading(true); setError(null);
    try {
      const [e, res] = await Promise.all([
        examService.getById(examId),
        examService.results(examId).catch(() => ({ examId, maxMarks: 0, passingMarks: 0, entries: [] })),
      ]);
      setExam(e);
      setEntries(res.entries || []);
    } catch (err) {
      if (isServerError(err)) {
        setExam(null);
        setEntries([]);
      } else {
        setError((err as { message?: string }).message || 'Failed to load exam');
      }
    } finally {
      setLoading(false);
    }
  }, [examId]);
  useEffect(() => { void load(); }, [load]);

  const updateMarks = (studentId: string, marks: number | null) => {
    setEntries((es) => es.map((e) => e.studentId === studentId ? { ...e, marksObtained: marks } : e));
  };
  const updateRemarks = (studentId: string, remarks: string) => {
    setEntries((es) => es.map((e) => e.studentId === studentId ? { ...e, remarks } : e));
  };

  const submit = async () => {
    if (!examId || !exam) return;
    const invalid = entries.find((e) => e.marksObtained != null && (e.marksObtained < 0 || e.marksObtained > exam.maxMarks));
    if (invalid) {
      toast.error(`Marks out of range for ${invalid.studentName || invalid.studentId} (0 – ${exam.maxMarks})`);
      return;
    }
    setSaving(true);
    try {
      await examService.submitMarks(examId, entries);
      toast.success('Marks submitted');
      void load();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    if (!exam || entries.length === 0) return null;
    const filled = entries.filter((e) => e.marksObtained != null).length;
    const passed = entries.filter((e) => e.marksObtained != null && e.marksObtained >= exam.passingMarks).length;
    return { filled, total: entries.length, passed };
  }, [entries, exam]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!exam) return <EmptyState icon={Calculator} title="Exam not found" />;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button component={RouterLink} to="/dashboard/exams" startIcon={<ArrowBack />}>
          Exams
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<Save />} disabled={saving || entries.length === 0}
          onClick={submit} sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
          {saving ? 'Saving…' : 'Submit marks'}
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{exam.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {exam.examTypeName} · {exam.className} · {exam.subjectName} ·{' '}
              {new Date(exam.examDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={`Max ${exam.maxMarks}`} variant="outlined" />
            <Chip label={`Pass ${exam.passingMarks}`} variant="outlined" color="primary" />
            <Chip label={exam.status.replace(/_/g, ' ')} color="primary" />
          </Stack>
        </Stack>
        {summary && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {summary.filled}/{summary.total} entries filled · {summary.passed} passed so far
          </Alert>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 60 }}>Roll</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 140 }} align="center">Marks (/{exam.maxMarks})</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ py: 0 }}>
                  <EmptyState icon={Calculator} title="No students enrolled"
                    description="The roster for this class is empty. Once students are enrolled, they will appear here." />
                </TableCell></TableRow>
              ) : entries.map((e) => {
                const passed = e.marksObtained != null && e.marksObtained >= exam.passingMarks;
                return (
                  <TableRow key={e.studentId} hover>
                    <TableCell>{e.rollNumber || '—'}</TableCell>
                    <TableCell>{e.studentName || e.studentId}</TableCell>
                    <TableCell align="center">
                      <TextField size="small" type="number" sx={{ width: 100 }}
                        inputProps={{ min: 0, max: exam.maxMarks }}
                        value={e.marksObtained ?? ''}
                        onChange={(ev) => updateMarks(e.studentId, ev.target.value === '' ? null : Number(ev.target.value))} />
                    </TableCell>
                    <TableCell align="center">
                      {e.marksObtained == null ? (
                        <Chip size="small" variant="outlined" label="—" />
                      ) : (
                        <Chip size="small" color={passed ? 'success' : 'error'}
                          variant="outlined" label={passed ? 'Pass' : 'Fail'} />
                      )}
                    </TableCell>
                    <TableCell>
                      <TextField size="small" fullWidth
                        value={e.remarks || ''}
                        onChange={(ev) => updateRemarks(e.studentId, ev.target.value)} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ScheduleExamPage;
