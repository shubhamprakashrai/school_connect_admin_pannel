/** Add Subject — `POST /subjects`. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, Grid, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { AutoStories, Save } from '@mui/icons-material';
import subjectService from '../../../../services/subject.service';
import type { SubjectCreationRequest, SubjectType } from '../../../../types/subject';

const TYPE_OPTS: SubjectType[] = ['CORE', 'ELECTIVE', 'EXTRA_CURRICULAR'];

const empty: SubjectCreationRequest = {
  name: '', code: '', description: '', type: 'CORE',
  maxMarks: 100, passingMarks: 35, creditHours: 4, isActive: true,
};

export default function AddSubjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<SubjectCreationRequest>(empty);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SubjectCreationRequest>(k: K, v: SubjectCreationRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.code.trim()) { toast.error('Name and code required'); return; }
    if (!/^[A-Z0-9_]+$/.test(form.code)) {
      toast.error('Code must be uppercase letters/numbers/underscore only');
      return;
    }
    setSaving(true);
    try {
      const created = await subjectService.create(form);
      toast.success(`${created.name} created`);
      navigate('/dashboard/subjects');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not create subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(245,158,11,0.5)',
        }}>
          <AutoStories />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>New subject</Typography>
          <Typography variant="body2" color="text.secondary">
            Create a subject and optionally assign it to classes/teachers later.
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth required label="Name" value={form.name}
              onChange={(e) => set('name', e.target.value)} placeholder="e.g., Mathematics" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth required label="Code" value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              helperText="UPPERCASE letters / digits / underscore"
              inputProps={{ maxLength: 20, style: { fontFamily: 'monospace' } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Description" value={form.description || ''}
              onChange={(e) => set('description', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label="Type" value={form.type || 'CORE'}
              onChange={(e) => set('type', e.target.value as SubjectType)}>
              {TYPE_OPTS.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Credit hours" value={form.creditHours ?? 0}
              onChange={(e) => set('creditHours', Number(e.target.value) || 0)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth type="number" label="Max marks" value={form.maxMarks ?? 0}
              onChange={(e) => set('maxMarks', Number(e.target.value) || 0)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth type="number" label="Passing marks" value={form.passingMarks ?? 0}
              onChange={(e) => set('passingMarks', Number(e.target.value) || 0)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Department" value={form.department || ''}
              onChange={(e) => set('department', e.target.value)} placeholder="e.g., Science" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Academic year" value={form.academicYear || ''}
              onChange={(e) => set('academicYear', e.target.value)} placeholder="e.g., 2024-2025" />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button startIcon={<Save />} variant="contained" onClick={submit} disabled={saving}
            sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' }}>
            {saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Create subject'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
