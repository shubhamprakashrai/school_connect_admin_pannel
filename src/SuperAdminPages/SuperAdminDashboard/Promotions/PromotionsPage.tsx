/**
 * Promotions — year-end bulk promotion flow.
 *
 * Admin picks: from-year + class/section → backend returns enrolled
 * students for that filter → admin selects (or "select all"), picks the
 * to-year + to-class + to-section → POST /enrollments/promote writes one
 * new StudentEnrollment per student pointing at the next class.
 *
 * Validation: source + destination academic-year must differ; at least one
 * student must be selected; destination class/section required. Backend
 * surfaces conflicts (already promoted) — we surface its `message` verbatim.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Divider, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import enrollmentService from '../../../services/enrollment.service';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import academicYearService from '../../../services/academicYear.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import type {
  StudentEnrollmentResponse,
} from '../../../types/enrollment';
import type { AcademicYearResponse } from '../../../types/academicYear';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';

export default function PromotionsPage() {
  const { hasRole } = useAuth();
  const canPromote = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const [years, setYears] = useState<AcademicYearResponse[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);

  // Source filters
  const [fromYearId, setFromYearId] = useState('');
  const [fromClassId, setFromClassId] = useState('');
  const [fromSectionId, setFromSectionId] = useState('');
  const [fromSections, setFromSections] = useState<SectionResponse[]>([]);

  // Destination
  const [toYearId, setToYearId] = useState('');
  const [toClassId, setToClassId] = useState('');
  const [toSectionId, setToSectionId] = useState('');
  const [toSections, setToSections] = useState<SectionResponse[]>([]);

  // Data
  const [enrolments, setEnrolments] = useState<StudentEnrollmentResponse[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingList, setLoadingList] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    academicYearService.list().then(setYears).catch(() => setYears([]));
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!fromClassId) { setFromSections([]); setFromSectionId(''); return; }
    sectionService.byClass(fromClassId).then(setFromSections).catch(() => setFromSections([]));
  }, [fromClassId]);

  useEffect(() => {
    if (!toClassId) { setToSections([]); setToSectionId(''); return; }
    sectionService.byClass(toClassId).then(setToSections).catch(() => setToSections([]));
  }, [toClassId]);

  const loadCandidates = useCallback(async () => {
    if (!fromYearId) { toast.info('Pick a source academic year'); return; }
    setLoadingList(true);
    setSelected(new Set());
    try {
      let list = await enrollmentService.bySession(fromYearId);
      if (fromClassId)   list = list.filter((e) => e.classId === fromClassId);
      if (fromSectionId) list = list.filter((e) => e.sectionId === fromSectionId);
      // Only ACTIVE rows are eligible — already promoted ones shouldn't be picked again.
      list = list.filter((e) => !e.status || e.status === 'ACTIVE');
      setEnrolments(list);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load enrolments');
    } finally {
      setLoadingList(false);
    }
  }, [fromYearId, fromClassId, fromSectionId]);

  const allChecked = enrolments.length > 0 && selected.size === enrolments.length;
  const toggleAll = () => {
    if (allChecked) { setSelected(new Set()); return; }
    setSelected(new Set(enrolments.map((e) => e.studentId)));
  };
  const toggleOne = (studentId: string) => {
    const next = new Set(selected);
    if (next.has(studentId)) next.delete(studentId); else next.add(studentId);
    setSelected(next);
  };

  const promote = async () => {
    if (!toYearId || !toClassId || !toSectionId) {
      toast.error('Destination academic-year, class and section are required');
      return;
    }
    if (toYearId === fromYearId) {
      toast.error('Destination year must be different from source');
      return;
    }
    if (selected.size === 0) {
      toast.error('Select at least one student to promote');
      return;
    }
    setPromoting(true);
    try {
      const res = await enrollmentService.promote({
        studentIds: Array.from(selected),
        fromAcademicYearId: fromYearId,
        toAcademicYearId: toYearId,
        toClassId,
        toSectionId,
      });
      toast.success(`Promoted ${res.length} student${res.length === 1 ? '' : 's'}`);
      setSelected(new Set());
      // Refresh source list — promoted rows will fall out (status changes server-side).
      void loadCandidates();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  const summary = useMemo(() => {
    if (enrolments.length === 0) return null;
    return `${enrolments.length} eligible · ${selected.size} selected`;
  }, [enrolments, selected]);

  if (!canPromote) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Admin only"
        description="Year-end promotion requires admin or super-admin permissions."
      />
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Year-end promotions</Typography>
        <Typography variant="body2" color="text.secondary">
          Move students from one academic year's class/section into the next year's class.
          Backend writes a fresh enrolment per student — old rows are marked PROMOTED.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>1. Source</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField select size="small" label="Academic year" value={fromYearId}
            onChange={(e) => setFromYearId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select year</MenuItem>
            {years.map((y) => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Class (optional)" value={fromClassId}
            onChange={(e) => setFromClassId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">All classes</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Section (optional)" value={fromSectionId}
            onChange={(e) => setFromSectionId(e.target.value)} disabled={!fromClassId} sx={{ minWidth: 200 }}>
            <MenuItem value="">All sections</MenuItem>
            {fromSections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
          <Button variant="outlined" disabled={!fromYearId || loadingList}
            onClick={() => void loadCandidates()}>
            {loadingList ? <CircularProgress size={18} /> : 'Load students'}
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>2. Destination</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField select required size="small" label="Academic year" value={toYearId}
            onChange={(e) => setToYearId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select year</MenuItem>
            {years.filter((y) => y.id !== fromYearId).map((y) => (
              <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>
            ))}
          </TextField>
          <TextField select required size="small" label="Class" value={toClassId}
            onChange={(e) => setToClassId(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select class</MenuItem>
            {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select required size="small" label="Section" value={toSectionId}
            onChange={(e) => setToSectionId(e.target.value)} disabled={!toClassId} sx={{ minWidth: 200 }}>
            <MenuItem value="">Select section</MenuItem>
            {toSections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: '1 1 auto' }}>
            3. Pick students {summary && <Chip size="small" label={summary} sx={{ ml: 1 }} />}
          </Typography>
          <Button variant="contained" endIcon={<ArrowForward />} disabled={promoting || selected.size === 0}
            onClick={promote}
            sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            {promoting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : `Promote ${selected.size || ''}`}
          </Button>
        </Box>
        <Divider />
        {loadingList ? (
          <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>
        ) : enrolments.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No eligible students"
            description="Pick a source year (and optionally class/section), then click 'Load students'."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox checked={allChecked}
                      indeterminate={!allChecked && selected.size > 0}
                      onChange={toggleAll} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Roll</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrolments.map((e) => (
                  <TableRow key={e.id} hover
                    selected={selected.has(e.studentId)}
                    onClick={() => toggleOne(e.studentId)}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.has(e.studentId)}
                        onChange={() => toggleOne(e.studentId)} />
                    </TableCell>
                    <TableCell>{e.studentName || e.studentId}</TableCell>
                    <TableCell>{e.rollNumber || '—'}</TableCell>
                    <TableCell>{e.className || '—'}</TableCell>
                    <TableCell>{e.sectionName || '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={e.status || 'ACTIVE'} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        Backend rejects double-promotion automatically (rows already PROMOTED for the source
        year will be filtered out). Each selected student gets a new <code>StudentEnrollment</code>
        row pointing at the destination class — the source row's status flips to PROMOTED.
      </Alert>
    </Box>
  );
}
