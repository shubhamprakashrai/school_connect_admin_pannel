/** Add Class — `POST /classes/create`. Optional initial sections via `POST /sections`. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, IconButton, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { Add, Class as ClassIcon, Close, Save } from '@mui/icons-material';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';

export default function AddClass() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [sections, setSections] = useState<{ name: string; capacity?: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const addSection = () => {
    const n = sectionInput.trim().toUpperCase();
    if (!n) return;
    if (sections.some((s) => s.name === n)) { toast.warn('Section already added'); return; }
    setSections((prev) => [...prev, { name: n, capacity: 40 }]);
    setSectionInput('');
  };

  const removeSection = (n: string) =>
    setSections((prev) => prev.filter((s) => s.name !== n));

  const submit = async () => {
    if (!name.trim()) { toast.error('Class name is required'); return; }
    setSaving(true);
    try {
      const created = await schoolClassService.create({ name: name.trim(), description });
      // Best-effort: create sections one by one. Failures are reported but the class still exists.
      if (sections.length) {
        for (const s of sections) {
          try {
            await sectionService.create({ name: s.name, capacity: s.capacity, schoolClassId: created.id });
          } catch (err) {
            toast.warn(`Section ${s.name} failed: ${(err as { message?: string }).message}`);
          }
        }
      }
      toast.success(`${created.name} created`);
      navigate(`/dashboard/classes/${created.id}`);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not create class');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(37,99,235,0.5)',
        }}>
          <ClassIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>New class</Typography>
          <Typography variant="body2" color="text.secondary">Add a class with optional starter sections.</Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField label="Class name" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Class 10" />
          <TextField label="Description" multiline rows={2} value={description}
            onChange={(e) => setDescription(e.target.value)} />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Initial sections (optional)</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField size="small" placeholder="A, B, C…" value={sectionInput}
                onChange={(e) => setSectionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSection(); } }}
                sx={{ flex: 1 }} />
              <Button startIcon={<Add />} variant="outlined" onClick={addSection}>Add</Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {sections.map((s) => (
                <Chip key={s.name} label={`${s.name} · ${s.capacity ?? 40}`}
                  onDelete={() => removeSection(s.name)} deleteIcon={<Close />} />
              ))}
              {sections.length === 0 && (
                <Typography variant="caption" color="text.secondary">No sections added — you can add them later from class detail.</Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
          <Button startIcon={<Save />} variant="contained" onClick={submit} disabled={saving}
            sx={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}>
            {saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Create class'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
