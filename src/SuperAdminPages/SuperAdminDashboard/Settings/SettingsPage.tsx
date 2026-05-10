/**
 * Settings page — currently scoped to MobileConfig (`/config/*`).
 * Other settings (school/email/general) can grow into tabs here.
 */

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, FormControlLabel, Grid, Paper, Stack, Switch,
  TextField, Typography,
} from '@mui/material';
import { Save, RestartAlt, Settings as SettingsIcon } from '@mui/icons-material';
import mobileConfigService, { MobileConfig } from '../../../services/mobileConfig.service';

export default function SettingsPage() {
  const [config, setConfig] = useState<MobileConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    mobileConfigService.get()
      .then((c) => setConfig(c || {}))
      .catch((err) => toast.error(err.message || 'Failed to load config'))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof MobileConfig>(k: K, v: MobileConfig[K]) =>
    setConfig((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const next = await mobileConfigService.update(config);
      setConfig(next);
      toast.success('Configuration saved');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Reset mobile configuration to server defaults?')) return;
    setResetting(true);
    try {
      await mobileConfigService.reset();
      const next = await mobileConfigService.get();
      setConfig(next || {});
      toast.success('Reset to defaults');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(99,102,241,0.5)',
        }}>
          <SettingsIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Settings</Typography>
          <Typography variant="body2" color="text.secondary">Mobile app configuration & feature flags.</Typography>
        </Box>
        <Chip size="small" label="Mobile config" color="primary" variant="outlined" />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>App version control</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Min supported version"
              value={config.minSupportedVersion || ''}
              onChange={(e) => set('minSupportedVersion', e.target.value)}
              placeholder="e.g., 1.0.0" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Latest version"
              value={config.latestVersion || ''}
              onChange={(e) => set('latestVersion', e.target.value)}
              placeholder="e.g., 1.5.2" />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel control={
              <Switch checked={!!config.forceUpdate}
                onChange={(_, v) => set('forceUpdate', v)} />
            } label="Force update" />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>Maintenance</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel control={
              <Switch checked={!!config.maintenanceMode}
                onChange={(_, v) => set('maintenanceMode', v)} />
            } label="Maintenance mode" />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Maintenance message"
              value={config.maintenanceMessage || ''}
              disabled={!config.maintenanceMode}
              onChange={(e) => set('maintenanceMessage', e.target.value)}
              placeholder="We'll be back soon." />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>Feature flags</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Toggle features per-tenant. Add a flag by typing a key and pressing Enter.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          {Object.entries(config.features || {}).map(([key, on]) => (
            <Chip key={key} label={`${key}: ${on ? 'on' : 'off'}`}
              color={on ? 'success' : 'default'}
              onClick={() => set('features', { ...(config.features || {}), [key]: !on })}
              onDelete={() => {
                const f = { ...(config.features || {}) };
                delete f[key];
                set('features', f);
              }}
            />
          ))}
        </Stack>
        <FlagAdder onAdd={(k) => set('features', { ...(config.features || {}), [k]: true })} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 4 }}>
          <Button startIcon={<RestartAlt />} color="warning" onClick={reset}
            disabled={saving || resetting}>
            {resetting ? 'Resetting…' : 'Reset to defaults'}
          </Button>
          <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save configuration'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

function FlagAdder({ onAdd }: { onAdd: (key: string) => void }) {
  const [v, setV] = useState('');
  return (
    <Stack direction="row" spacing={1}>
      <TextField size="small" placeholder="new_flag_key" value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && v.trim()) {
            e.preventDefault();
            onAdd(v.trim());
            setV('');
          }
        }} />
      <Button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(''); } }}>Add flag</Button>
    </Stack>
  );
}
