/**
 * Subject bulk import — paste rows or upload CSV, then `POST /subjects/bulk`.
 * Format: name, code, description, type, maxMarks, passingMarks, creditHours
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Step, StepLabel,
  Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import {
  CloudUpload, ContentPaste, Download, Send,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import subjectService from '../../../../services/subject.service';
import type {
  SubjectCreationRequest, SubjectResponse, SubjectType,
} from '../../../../types/subject';

const HEADERS = ['name', 'code', 'description', 'type', 'maxMarks', 'passingMarks', 'creditHours'] as const;
const STEPS = ['Upload', 'Preview', 'Done'] as const;

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

function rowToRequest(row: Record<string, string>): SubjectCreationRequest {
  return {
    name: row.name || '',
    code: (row.code || '').toUpperCase(),
    description: row.description || undefined,
    type: (row.type as SubjectType) || 'CORE',
    maxMarks: row.maxMarks ? Number(row.maxMarks) : 100,
    passingMarks: row.passingMarks ? Number(row.passingMarks) : 35,
    creditHours: row.creditHours ? Number(row.creditHours) : 4,
    isActive: true,
  };
}

function validateRow(r: SubjectCreationRequest): string | null {
  if (!r.name) return 'Name is required';
  if (!r.code) return 'Code is required';
  if (!/^[A-Z0-9_]+$/.test(r.code)) return 'Code must be uppercase letters/digits/underscore only';
  return null;
}

export default function BulkSubjectsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<Record<string, string>[]>([]);
  const [created, setCreated] = useState<SubjectResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setCsvText(text);
      setParsed(parseCsv(text));
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = HEADERS.join(',') + '\nMathematics,MATH10,Class 10 Mathematics,CORE,100,35,4\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subjects-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const goPreview = () => {
    if (parsed.length === 0) { toast.error('No rows to preview'); return; }
    setStep(1);
  };

  const submit = async () => {
    const requests = parsed.map(rowToRequest);
    const valid = requests.filter((r) => !validateRow(r));
    if (valid.length === 0) { toast.error('No valid rows'); return; }
    setSubmitting(true);
    try {
      const res = await subjectService.bulkCreate(valid);
      setCreated(res || []);
      setStep(2);
      toast.success(`Created ${(res || []).length} of ${valid.length}`);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Bulk create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Bulk import subjects</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a CSV to add many subjects at once.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Button startIcon={<Download />} variant="outlined" onClick={downloadTemplate}>
                Download template
              </Button>
              <Button component="label" startIcon={<CloudUpload />} variant="outlined">
                Upload CSV
                <input hidden type="file" accept=".csv,text/csv" onChange={onFile} />
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">— or paste CSV below —</Typography>
            <TextField multiline minRows={8} value={csvText}
              placeholder={HEADERS.join(',') + '\nMathematics,MATH10,Class 10 Mathematics,CORE,100,35,4'}
              onChange={(e) => { setCsvText(e.target.value); setParsed(parseCsv(e.target.value)); }}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip label={`${parsed.length} row${parsed.length === 1 ? '' : 's'} parsed`} variant="outlined" />
              <Button variant="contained" disabled={parsed.length === 0}
                startIcon={<ContentPaste />} onClick={goPreview}>
                Preview
              </Button>
            </Box>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <Alert severity="info">
              Review the rows below. Invalid ones will be skipped.
            </Alert>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {HEADERS.map((h) => <TableCell key={h}>{h}</TableCell>)}
                    <TableCell>Validation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsed.map((r, i) => {
                    const req = rowToRequest(r);
                    const err = validateRow(req);
                    return (
                      <TableRow key={i}
                        sx={{ background: err ? 'rgba(244,63,94,0.04)' : 'transparent' }}>
                        <TableCell>{i + 1}</TableCell>
                        {HEADERS.map((h) => <TableCell key={h}>{r[h] || '—'}</TableCell>)}
                        <TableCell>
                          {err
                            ? <Chip size="small" color="error" label={err} />
                            : <Chip size="small" color="success" label="OK" />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button variant="contained" startIcon={<Send />} onClick={submit} disabled={submitting}>
                {submitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Import valid rows'}
              </Button>
            </Box>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2}>
            <Alert severity="success">
              Created {created.length} subject{created.length === 1 ? '' : 's'}.
            </Alert>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {created.slice(0, 30).map((s) => (
                <Chip key={s.id} label={`${s.code} · ${s.name}`} variant="outlined" />
              ))}
              {created.length > 30 && (
                <Chip size="small" label={`+${created.length - 30} more`} />
              )}
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => { setStep(0); setCsvText(''); setParsed([]); setCreated([]); }}>
                Start a new import
              </Button>
              <Button variant="contained" onClick={() => navigate('/dashboard/subjects')}>
                View subjects
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
