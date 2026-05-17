/**
 * Safety — active alerts banner + alert history + incident report form.
 *
 * Wired to `safetyService`. Backend's SafetyController is pending; reads
 * 500 today but UI degrades gracefully.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import safetyService from '../../../services/safety.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type {
  AlertSeverity, IncidentType, SafetyAlert, SafetyIncidentRequest,
} from '../../../types/safety';

const SEVERITY_COLOR: Record<AlertSeverity, 'default' | 'info' | 'warning' | 'error'> = {
  INFO:      'info',
  WARNING:   'warning',
  CRITICAL:  'error',
  EMERGENCY: 'error',
};

const INCIDENT_TYPES: IncidentType[] = ['BULLYING', 'INJURY', 'BEHAVIORAL', 'MEDICAL', 'OTHER'];

export default function SafetyPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [tab, setTab] = useState<'alerts' | 'incidents' | 'counseling'>('alerts');

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Safety</Typography>
        <Typography variant="body2" color="text.secondary">
          Broadcast campus alerts, log incidents, and book counseling sessions.
        </Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Alerts" value="alerts" />
        <Tab label="Report incident" value="incidents" />
        <Tab label="Counseling" value="counseling" />
      </Tabs>

      {tab === 'alerts'     && <AlertsPanel canManage={canManage} />}
      {tab === 'incidents'  && <IncidentsPanel />}
      {tab === 'counseling' && <CounselingPanel />}
    </Box>
  );
}

// ============================================================================
// Tab 3: Counseling referral
// ============================================================================
function CounselingPanel() {
  const [draft, setDraft] = useState({
    studentId: '',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    topic: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!draft.studentId.trim() || !draft.topic.trim()) {
      toast.error('Student id and topic required'); return;
    }
    setSaving(true);
    try {
      await safetyService.bookCounseling(draft);
      toast.success('Counseling session booked');
      setDraft({
        studentId: '',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        topic: '', notes: '',
      });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 720 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <ShieldAlert className="w-5 h-5" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Book counseling session</Typography>
      </Stack>
      <Alert severity="info" sx={{ mb: 2 }}>
        Counselor will be notified and the student's parents will see the session in their portal.
      </Alert>
      <Stack spacing={2}>
        <TextField required label="Student ID" value={draft.studentId}
          onChange={(e) => setDraft({ ...draft, studentId: e.target.value })}
          placeholder="UUID — find on the student detail page" />
        <Stack direction="row" spacing={2}>
          <TextField fullWidth type="datetime-local" required label="Scheduled at"
            InputLabelProps={{ shrink: true }} value={draft.scheduledAt}
            onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value })} />
          <TextField fullWidth required label="Topic" value={draft.topic}
            onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
            placeholder="Academic stress · Family · Behavioural" />
        </Stack>
        <TextField multiline rows={3} label="Notes (private)"
          value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" disabled={saving} onClick={submit}
            sx={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}>
            {saving ? 'Booking…' : 'Book session'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================================
// Tab 1: Alerts
// ============================================================================
function AlertsPanel({ canManage }: { canManage: boolean }) {
  const [active, setActive] = useState<SafetyAlert[]>([]);
  const [history, setHistory] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<SafetyAlert, 'id'>>({
    title: '', message: '', severity: 'INFO',
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [act, all] = await Promise.all([
        safetyService.activeAlerts().catch(() => []),
        safetyService.alerts(),
      ]);
      setActive(act);
      setHistory(all.filter((a) => !act.find((x) => x.id === a.id)));
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void fetch(); }, [fetch]);

  const create = async () => {
    if (!draft.title.trim() || !draft.message.trim()) { toast.error('Title and message required'); return; }
    setSaving(true);
    try {
      await safetyService.createAlert(draft);
      toast.success('Alert broadcast');
      setOpen(false);
      setDraft({
        title: '', message: '', severity: 'INFO',
        startsAt: new Date().toISOString().slice(0, 16),
        endsAt: '', isActive: true,
      });
      void fetch();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {canManage && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button startIcon={<Add />} variant="contained" onClick={() => setOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
            New alert
          </Button>
        </Box>
      )}

      {active.length > 0 && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {active.map((a) => (
            <Alert key={a.id} severity={a.severity === 'EMERGENCY' || a.severity === 'CRITICAL' ? 'error' : a.severity === 'WARNING' ? 'warning' : 'info'}
              variant="filled" sx={{ borderRadius: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.title}</Typography>
              <Typography variant="caption">{a.message}</Typography>
            </Alert>
          ))}
        </Stack>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Alert history</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(239,68,68,0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Window</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={3} cols={4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <EmptyState icon={ShieldAlert} title="No historical alerts"
                    description="When you broadcast a campus alert, it appears here once it expires." />
                </TableCell></TableRow>
              ) : (
                history.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.message}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={SEVERITY_COLOR[a.severity]} variant="outlined" label={a.severity} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(a.startsAt).toLocaleString()}
                        {a.endsAt && (<> → {new Date(a.endsAt).toLocaleString()}</>)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={a.isActive ? 'Active' : 'Expired'}
                        color={a.isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Broadcast safety alert</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            All staff + parents will receive a push notification. Use sparingly.
          </Alert>
          <Stack spacing={2}>
            <TextField required label="Title" value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <TextField required multiline rows={3} label="Message"
              value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth required label="Severity" value={draft.severity}
                onChange={(e) => setDraft({ ...draft, severity: e.target.value as AlertSeverity })}>
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
              </TextField>
              <TextField fullWidth type="datetime-local" required label="Starts" InputLabelProps={{ shrink: true }}
                value={draft.startsAt}
                onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
              <TextField fullWidth type="datetime-local" label="Ends (optional)" InputLabelProps={{ shrink: true }}
                value={draft.endsAt || ''}
                onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" color="error" onClick={create} disabled={saving}>
            {saving ? 'Sending…' : 'Broadcast'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ============================================================================
// Tab 2: Report incident
// ============================================================================
function IncidentsPanel() {
  const [draft, setDraft] = useState<SafetyIncidentRequest>({
    type: 'BEHAVIORAL',
    occurredAt: new Date().toISOString().slice(0, 16),
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!draft.description.trim()) { toast.error('Description required'); return; }
    setSaving(true);
    try {
      await safetyService.reportIncident(draft);
      toast.success('Incident logged');
      setDraft({
        type: 'BEHAVIORAL',
        occurredAt: new Date().toISOString().slice(0, 16),
        description: '',
      });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 720 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <AlertTriangle className="w-5 h-5" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Report an incident</Typography>
      </Stack>
      <Alert severity="info" sx={{ mb: 2 }}>
        Reports are confidential — only admins and the counselor can view them.
      </Alert>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField select fullWidth required label="Type" value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as IncidentType })}>
            {INCIDENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField fullWidth type="datetime-local" required label="Occurred at"
            InputLabelProps={{ shrink: true }} value={draft.occurredAt}
            onChange={(e) => setDraft({ ...draft, occurredAt: e.target.value })} />
        </Stack>
        <TextField label="Student ID (optional)" value={draft.studentId || ''}
          onChange={(e) => setDraft({ ...draft, studentId: e.target.value })}
          helperText="Leave blank if the report is not about a specific student" />
        <TextField label="Location" value={draft.location || ''}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          placeholder="Playground · Classroom 3B · School bus" />
        <TextField required multiline rows={4} label="What happened?"
          value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" color="error" disabled={saving} onClick={submit}>
            {saving ? 'Submitting…' : 'Submit report'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
