/** View Class — read-only detail with sections + add/remove section inline. */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, Paper, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import {
  Add, ArrowBack, Class as ClassIcon, Delete, Edit, Group, Person,
} from '@mui/icons-material';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';

export default function ViewClass() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<SchoolClassResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Add-section dialog
  const [openSection, setOpenSection] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [sectionCapacity, setSectionCapacity] = useState<number>(40);
  const [savingSection, setSavingSection] = useState(false);

  const reload = () => {
    if (!id) return;
    setLoading(true);
    schoolClassService.getById(id)
      .then(setCls)
      .catch((err) => toast.error(err.message || 'Failed to load class'))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [id]);

  const addSection = async () => {
    if (!id || !sectionName.trim()) { toast.error('Section name is required'); return; }
    setSavingSection(true);
    try {
      await sectionService.create({
        name: sectionName.trim().toUpperCase(),
        capacity: sectionCapacity,
        schoolClassId: id,
      });
      toast.success('Section added');
      setOpenSection(false);
      setSectionName('');
      setSectionCapacity(40);
      reload();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Add failed');
    } finally {
      setSavingSection(false);
    }
  };

  const removeSection = async (s: SectionResponse) => {
    if (!window.confirm(`Delete section ${s.name}? Students in this section may be affected.`)) return;
    try {
      await sectionService.remove(s.id);
      toast.success('Section deleted');
      reload();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  if (loading || !cls) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/classes')}>Back</Button>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<Edit />} variant="outlined"
          onClick={() => navigate(`/dashboard/classes/${cls.id}/edit`)}>Edit</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{
            width: 56, height: 56, borderRadius: 2, color: 'white',
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClassIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{cls.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {cls.code}
            </Typography>
            {cls.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {cls.description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Sections</Typography>
        <Button size="small" startIcon={<Add />} variant="contained"
          onClick={() => setOpenSection(true)}>Add section</Button>
      </Box>

      {(cls.sections?.length || 0) === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Group sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography color="text.secondary" sx={{ mt: 1 }}>No sections yet — add one to enroll students.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {cls.sections.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={s.name} sx={{ fontWeight: 700, fontSize: 16 }} />
                    {s.capacity != null && (
                      <Typography variant="caption" color="text.secondary">capacity {s.capacity}</Typography>
                    )}
                  </Stack>
                  <Tooltip title="Delete section">
                    <IconButton size="small" color="error" onClick={() => removeSection(s)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                {s.classTeacherName ? (
                  <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                    <Person fontSize="small" />
                    <Typography variant="body2">Class teacher: {s.classTeacherName}</Typography>
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">No class teacher assigned</Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openSection} onClose={() => setOpenSection(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New section</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Section name" required value={sectionName}
              onChange={(e) => setSectionName(e.target.value)} placeholder="e.g., A" />
            <TextField label="Capacity" type="number" value={sectionCapacity}
              onChange={(e) => setSectionCapacity(Number(e.target.value) || 0)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSection(false)} disabled={savingSection}>Cancel</Button>
          <Button variant="contained" onClick={addSection} disabled={savingSection}>
            {savingSection ? 'Adding…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
