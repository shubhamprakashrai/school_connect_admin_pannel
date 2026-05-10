/** Edit Teacher — wired to `PUT /teachers/{id}`. Backend's UpdateTeacherRequest is narrow. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, Grid, MenuItem, Paper, TextField, Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import teacherService from '../../../services/teacher.service';
import type { TeacherUpdateRequest } from '../../../types/teacher';

export default function EditTeacherForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TeacherUpdateRequest>({});
  const [name, setName] = useState('');

  useEffect(() => {
    if (!id) return;
    teacherService.getById(id).then((t) => {
      setName(t.fullName || `${t.firstName} ${t.lastName}`);
      setForm({
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        address: t.address,
        designation: t.designation,
        department: t.department,
        status: t.status,
      });
    }).catch((err) => toast.error(err.message || 'Failed to load teacher'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof TeacherUpdateRequest>(k: K, v: TeacherUpdateRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await teacherService.update(id, form);
      toast.success('Saved');
      navigate(`/dashboard/teachers/${id}`);
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
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit {name}</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="First name" value={form.firstName || ''}
              onChange={(e) => set('firstName', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Last name" value={form.lastName || ''}
              onChange={(e) => set('lastName', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" type="email" value={form.email || ''}
              onChange={(e) => set('email', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone" value={form.phone || ''}
              onChange={(e) => set('phone', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Address" value={form.address || ''}
              onChange={(e) => set('address', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Designation" value={form.designation || ''}
              onChange={(e) => set('designation', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Department" value={form.department || ''}
              onChange={(e) => set('department', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label="Status" value={form.status || 'ACTIVE'}
              onChange={(e) => set('status', e.target.value)}>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button startIcon={<Save />} variant="contained" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
