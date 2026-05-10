/** Edit Class — `PUT /classes/{id}`. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, CircularProgress, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import schoolClassService from '../../../services/schoolClass.service';

export default function EditClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    schoolClassService.getById(id)
      .then((c) => { setName(c.name); setDescription(c.description || ''); })
      .catch((err) => toast.error(err.message || 'Failed to load class'))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!id) return;
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await schoolClassService.update(id, { name: name.trim(), description });
      toast.success('Saved');
      navigate(`/dashboard/classes/${id}`);
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit class</Typography>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Description" multiline rows={2} value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </Stack>
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
