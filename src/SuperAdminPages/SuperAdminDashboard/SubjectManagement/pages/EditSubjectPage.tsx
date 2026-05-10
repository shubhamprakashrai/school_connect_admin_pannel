/** Edit Subject — `PUT /subjects/{id}`. Backend's update DTO is narrow (code, name, description). */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, Grid, Paper, TextField, Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import subjectService from '../../../../services/subject.service';
import type { SubjectUpdateRequest } from '../../../../types/subject';

export default function EditSubjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SubjectUpdateRequest>({});

  useEffect(() => {
    if (!id) return;
    subjectService.getById(id)
      .then((s) => setForm({ name: s.name, code: s.code, description: s.description }))
      .catch((err) => toast.error(err.message || 'Failed to load subject'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof SubjectUpdateRequest>(k: K, v: SubjectUpdateRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await subjectService.update(id, form);
      toast.success('Saved');
      navigate('/dashboard/subjects');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit subject</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Name" value={form.name || ''}
              onChange={(e) => set('name', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Code" value={form.code || ''}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              inputProps={{ style: { fontFamily: 'monospace' } }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Description" value={form.description || ''}
              onChange={(e) => set('description', e.target.value)} />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
