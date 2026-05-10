/**
 * Bulk import students — wired to `/students/bulk/*`.
 *
 * Flow:
 *   1. Download template (or paste CSV)
 *   2. Pick a target class + section (applies to every row)
 *   3. Upload / paste CSV → parse client-side → call /validate → preview
 *   4. Confirm → call /students/bulk → show success/failure summary
 */

import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, Step, StepLabel,
  Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography,
} from '@mui/material';
import { CloudDownload, CloudUpload, ContentPaste, Send } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { bulkStudentService } from '../../../services/student.service';
import { dispatchNotification } from '../../../components/NotificationCenter';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import type {
  BulkStudentRequest,
  BulkStudentResponse,
  CreateStudentRequest,
} from '../../../types/student';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';

const STEPS = ['Choose target', 'Upload data', 'Validate', 'Import'] as const;

const TEMPLATE_HEADERS = [
  'firstName', 'lastName', 'email', 'phone', 'dateOfBirth',
  'gender', 'admissionDate', 'rollNumber', 'address',
  'fatherName', 'motherName', 'emergencyName', 'emergencyRelation', 'emergencyPhone',
] as const;

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

function toRequest(row: Record<string, string>, classId: string, sectionId: string): CreateStudentRequest {
  return {
    rollNumber: row.rollNumber || undefined,
    userRequest: {
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      phone: row.phone || '',
    },
    dateOfBirth: row.dateOfBirth || '',
    gender: ((row.gender || 'OTHER').toUpperCase() as CreateStudentRequest['gender']) || 'OTHER',
    address: row.address || undefined,
    schoolClass: { id: classId },
    section: { id: sectionId },
    admissionDate: row.admissionDate || new Date().toISOString().slice(0, 10),
    fatherInfo: row.fatherName ? { name: row.fatherName } : undefined,
    motherInfo: row.motherName ? { name: row.motherName } : undefined,
    emergencyContact: {
      name: row.emergencyName || row.fatherName || row.motherName || 'Guardian',
      relation: row.emergencyRelation || 'Parent',
      phone: row.emergencyPhone || row.phone || '',
    },
  };
}

export default function BulkImportStudents() {
  const [step, setStep] = useState(0);

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');

  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<Record<string, string>[]>([]);

  const [validateResult, setValidateResult] = useState<BulkStudentResponse | null>(null);
  const [importResult, setImportResult] = useState<BulkStudentResponse | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    sectionService.byClass(classId).then(setSections).catch(() => setSections([]));
  }, [classId]);

  const downloadServerTemplate = async () => {
    try {
      await bulkStudentService.downloadTemplate();
    } catch (err) {
      toast.error('Server template unavailable — using local template instead');
      const csv = TEMPLATE_HEADERS.join(',') + '\n';
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'students-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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

  const goValidate = async () => {
    if (!classId || !sectionId) { toast.error('Pick a class and section first'); return; }
    if (parsed.length === 0) { toast.error('No rows to validate'); return; }
    setLoading(true);
    try {
      const payload: BulkStudentRequest = {
        students: parsed.map((r) => toRequest(r, classId, sectionId)),
        continueOnError: true,
      };
      const res = await bulkStudentService.validate(payload);
      setValidateResult(res);
      setStep(2);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const goImport = async () => {
    setLoading(true);
    try {
      const payload: BulkStudentRequest = {
        students: parsed.map((r) => toRequest(r, classId, sectionId)),
        continueOnError: true,
      };
      const res = await bulkStudentService.createMany(payload);
      setImportResult(res);
      setStep(3);
      toast.success(`Imported ${res.successful} of ${res.totalRequested}`);
      dispatchNotification({
        level: res.failed > 0 ? 'warning' : 'success',
        title: 'Bulk student import completed',
        body: `${res.successful} created, ${res.failed} failed${res.batchReference ? ` · ${res.batchReference}` : ''}`,
      });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Bulk import students</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a CSV to enroll many students into the same class/section in one go.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Stack spacing={2}>
            <TextField select required label="Class" value={classId}
              onChange={(e) => setClassId(e.target.value)}>
              <MenuItem value="">Select class</MenuItem>
              {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select required label="Section" value={sectionId} disabled={!classId}
              onChange={(e) => setSectionId(e.target.value)}>
              <MenuItem value="">Select section</MenuItem>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button startIcon={<CloudDownload />} variant="outlined" onClick={downloadServerTemplate}>
                Download CSV template
              </Button>
              <Button variant="contained" disabled={!classId || !sectionId} onClick={() => setStep(1)}>
                Continue
              </Button>
            </Box>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2}>
            <Button component="label" startIcon={<CloudUpload />} variant="outlined">
              Upload CSV file
              <input hidden type="file" accept=".csv,text/csv" onChange={onFile} />
            </Button>
            <Typography variant="caption" color="text.secondary">— or paste CSV content below —</Typography>
            <TextField multiline minRows={8} value={csvText}
              placeholder={TEMPLATE_HEADERS.join(',') + '\nJohn,Doe,john@example.com,9876543210,2010-01-01,MALE,2024-04-01,001,..,..,..,..,..,9876543210'}
              onChange={(e) => { setCsvText(e.target.value); setParsed(parseCsv(e.target.value)); }}
              inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={`${parsed.length} row${parsed.length === 1 ? '' : 's'} parsed`} variant="outlined" />
                <Button variant="contained" startIcon={<ContentPaste />}
                  disabled={parsed.length === 0 || loading} onClick={goValidate}>
                  {loading ? 'Validating…' : 'Validate'}
                </Button>
              </Box>
            </Box>
          </Stack>
        )}

        {step === 2 && validateResult && (
          <Stack spacing={2}>
            <Alert severity={validateResult.failed === 0 ? 'success' : 'warning'}>
              {validateResult.successful} valid, {validateResult.failed} with errors out of {validateResult.totalRequested}.
            </Alert>
            {validateResult.errors.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Student</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validateResult.errors.map((e) => (
                      <TableRow key={e.rowIndex}>
                        <TableCell>{e.rowIndex + 1}</TableCell>
                        <TableCell>{e.studentIdentifier || '—'}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{e.errorMessage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button variant="contained" startIcon={<Send />} disabled={loading} onClick={goImport}>
                {loading ? 'Importing…' : `Import ${validateResult.successful} valid student${validateResult.successful === 1 ? '' : 's'}`}
              </Button>
            </Box>
          </Stack>
        )}

        {step === 3 && importResult && (
          <Stack spacing={2}>
            <Alert severity={importResult.failed === 0 ? 'success' : 'info'}>
              Imported {importResult.successful} of {importResult.totalRequested} students.
              {importResult.failed > 0 && ` ${importResult.failed} failed — see errors below.`}
            </Alert>
            {importResult.batchReference && (
              <Typography variant="caption" color="text.secondary">
                Batch reference: <strong>{importResult.batchReference}</strong>
              </Typography>
            )}
            {importResult.errors.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 280 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow><TableCell>Row</TableCell><TableCell>Error</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {importResult.errors.map((e) => (
                      <TableRow key={e.rowIndex}>
                        <TableCell>{e.rowIndex + 1}</TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{e.errorMessage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" onClick={() => { setStep(0); setCsvText(''); setParsed([]); setValidateResult(null); setImportResult(null); }}>
              Start a new import
            </Button>
          </Stack>
        )}

        {loading && step !== 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
