/**
 * Exam results / student report card — input a student id, render
 * the full report card with per-subject marks + percentage + grade.
 *
 * Per mobile's `report_card_page.dart` flow.
 */

import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Divider, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { Print, Search } from '@mui/icons-material';
import { BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';
import examService from '../../../../services/exam.service';
import EmptyState from '../../../../components/ui/EmptyState';
import type { ReportCard } from '../../../../types/exam';

function gradeFromPercent(p: number): string {
  if (p >= 90) return 'A+';
  if (p >= 80) return 'A';
  if (p >= 70) return 'B+';
  if (p >= 60) return 'B';
  if (p >= 50) return 'C';
  if (p >= 33) return 'D';
  return 'F';
}

export const ExamResultsPage = () => {
  const [studentId, setStudentId] = useState('');
  const [card, setCard] = useState<ReportCard | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!studentId.trim()) { toast.error('Enter a student id'); return; }
    setLoading(true); setCard(null);
    try {
      const r = await examService.studentReportCard(studentId.trim());
      setCard(r);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Report card</Typography>
        <Typography variant="body2" color="text.secondary">
          Pull up any student's consolidated report card across all exams in the active academic year.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField fullWidth size="small" label="Student ID"
            value={studentId} onChange={(e) => setStudentId(e.target.value)}
            placeholder="UUID — find on the student detail page"
            onKeyDown={(e) => e.key === 'Enter' && void fetch()} />
          <Button variant="contained" startIcon={<Search />} disabled={loading} onClick={fetch}
            sx={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}>
            {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Load'}
          </Button>
          {card && (
            <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>
              Print
            </Button>
          )}
        </Stack>
      </Paper>

      {!card ? (
        <EmptyState icon={BarChart3} title="No report loaded"
          description="Enter a student id above to pull up the consolidated report card." />
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }} className="print-area">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{
              width: 64, height: 64, fontSize: 24,
              background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
            }}>
              {(card.studentName || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {card.studentName || card.studentId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.className} · {card.sectionName} · {card.academicYearName}
              </Typography>
            </Box>
            <Stack alignItems="center" sx={{ p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, minWidth: 120 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {card.percentage.toFixed(1)}%
              </Typography>
              <Chip size="small" label={`Grade ${card.overallGrade || gradeFromPercent(card.percentage)}`}
                color={card.percentage >= 33 ? 'success' : 'error'} sx={{ mt: 0.5 }} />
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ background: 'rgba(236,72,153,0.06)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Subject · Exam</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Marks</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Grade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {card.entries.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No exams recorded for this student yet.
                  </TableCell></TableRow>
                ) : card.entries.map((e) => {
                  const pct = e.maxMarks ? (e.marksObtained / e.maxMarks) * 100 : 0;
                  return (
                    <TableRow key={e.examId} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{e.subjectName || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{e.examTitle}</Typography>
                      </TableCell>
                      <TableCell>{e.examTypeName || '—'}</TableCell>
                      <TableCell>{e.examDate ? new Date(e.examDate).toLocaleDateString() : '—'}</TableCell>
                      <TableCell align="center">
                        <strong>{e.marksObtained}</strong> / {e.maxMarks}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {pct.toFixed(0)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={e.grade || gradeFromPercent(pct)} variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={e.passed ? 'Pass' : 'Fail'}
                          color={e.passed ? 'success' : 'error'} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, p: 2, background: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Aggregate</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {card.totalObtained} / {card.totalMax}
              </Typography>
            </Stack>
          </Box>

          <Alert severity="info" sx={{ mt: 2, '&.print-hide': { display: 'none' } }} className="print-hide">
            Use the Print button (top-right) to export this report card as a PDF.
            Print styles are already wired via the <code>.print-area</code> class.
          </Alert>
        </Paper>
      )}
    </Box>
  );
};

export default ExamResultsPage;
