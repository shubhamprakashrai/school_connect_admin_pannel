/**
 * Edit Student — wired to `PUT /students/{id}`.
 * Backend's UpdateStudentRequest is intentionally narrow (basic + medical + photo).
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, Grid, Paper, TextField, Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import studentService from '../../../services/student.service';
import PhotoUploader from '../../../components/ui/PhotoUploader';
import type { UpdateStudentRequest } from '../../../types/student';

export default function EditStudentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateStudentRequest>({});
  const [name, setName] = useState('');

  useEffect(() => {
    if (!id) return;
    studentService.getById(id).then((s) => {
      setName(s.fullName || `${s.firstName} ${s.lastName}`);
      setForm({
        firstName: s.firstName,
        middleName: s.middleName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        address: s.address,
        city: s.city,
        state: s.state,
        postalCode: s.postalCode,
        photoUrl: s.photoUrl,
      });
    }).catch((err) => toast.error(err.message || 'Failed to load student'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof UpdateStudentRequest>(k: K, v: UpdateStudentRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await studentService.update(id, form);
      toast.success('Saved');
      navigate(`/dashboard/students/${id}`);
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
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit {name}</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="First name" value={form.firstName || ''}
              onChange={(e) => set('firstName', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Middle name" value={form.middleName || ''}
              onChange={(e) => set('middleName', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
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
            <TextField fullWidth label="City" value={form.city || ''}
              onChange={(e) => set('city', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="State" value={form.state || ''}
              onChange={(e) => set('state', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Postal code" value={form.postalCode || ''}
              onChange={(e) => set('postalCode', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <PhotoUploader
              value={form.photoUrl || null}
              onChange={(v) => set('photoUrl', v ?? '')}
              label="Photo"
              shape="circle"
            />
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
