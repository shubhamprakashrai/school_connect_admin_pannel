/**
 * Tenant self-admin settings — for the tenant's own admin user.
 * Pulls /tenants/current and lets the admin edit identity + see usage.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Grid, LinearProgress, Paper,
  Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { Save, School } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { tenantService } from '../../../services/tenant.service';
import type {
  TenantResponse, TenantStatistics, UpdateTenantRequest,
} from '../../../types/tenant';

export default function TenantSettingsPage() {
  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [stats, setStats] = useState<TenantStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [draft, setDraft] = useState<UpdateTenantRequest>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        tenantService.current(),
        tenantService.statistics().catch(() => null),
      ]);
      setTenant(t);
      setStats(s);
      setDraft({
        name: t.name, email: t.email, phone: t.phone,
        address: t.address, city: t.city, state: t.state, country: t.country,
        postalCode: t.postalCode, website: t.website, logoUrl: t.logoUrl,
      });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!tenant) return;
    setSaving(true);
    try {
      const updated = await tenantService.update(tenant.id, draft);
      setTenant(updated);
      toast.success('Saved');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !tenant) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(37,99,235,0.5)',
        }}>
          <School />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{tenant.name}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip size="small" label={tenant.status}
              color={tenant.status === 'ACTIVE' ? 'success' : 'warning'} />
            <Chip size="small" label={tenant.subscriptionPlan} variant="outlined" />
            <Chip size="small" label={tenant.subdomain} variant="outlined" sx={{ fontFamily: 'monospace' }} />
          </Stack>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Identity" />
          <Tab label="Usage" />
        </Tabs>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="School name" value={draft.name || ''}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="email" label="Contact email" value={draft.email || ''}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone" value={draft.phone || ''}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Website" value={draft.website || ''}
                    onChange={(e) => setDraft({ ...draft, website: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Address" value={draft.address || ''}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="City" value={draft.city || ''}
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="State" value={draft.state || ''}
                    onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Country" value={draft.country || ''}
                    onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth label="Postal code" value={draft.postalCode || ''}
                    onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Logo URL" value={draft.logoUrl || ''}
                    onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })} placeholder="https://…" />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button variant="contained" startIcon={<Save />} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </Box>
            </>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              <UsageBar
                label="Students"
                current={tenant.limits?.currentStudents ?? 0}
                max={tenant.limits?.maxStudents ?? 0}
              />
              <UsageBar
                label="Teachers"
                current={tenant.limits?.currentTeachers ?? 0}
                max={tenant.limits?.maxTeachers ?? 0}
              />
              <UsageBar
                label="Storage (GB)"
                current={(tenant.limits?.currentStorageMb ?? 0) / 1024}
                max={tenant.limits?.maxStorageGb ?? 0}
                unit="GB"
              />

              {stats && (
                <>
                  <Grid item xs={12}><Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>School snapshot</Typography></Grid>
                  <StatTile label="Total students" value={stats.totalStudents} />
                  <StatTile label="Total teachers" value={stats.totalTeachers} />
                  <StatTile label="Total parents" value={stats.totalParents} />
                  <StatTile label="Active users" value={stats.activeUsers} />
                  <StatTile label="Total classes" value={stats.totalClasses} />
                  <StatTile label="Avg attendance"
                    value={`${stats.attendancePercentage?.toFixed(1) ?? '0'}%`} />
                </>
              )}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

function UsageBar({ label, current, max, unit }: { label: string; current: number; max: number; unit?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const tone = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#2563eb';
  return (
    <Grid item xs={12} md={4}>
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
          <Typography variant="caption" sx={{ color: tone, fontWeight: 600 }}>{pct}%</Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
          {Math.round(current)}{unit ? ` ${unit}` : ''}
          <Typography component="span" variant="caption" color="text.secondary"> / {max}{unit ? ` ${unit}` : ''}</Typography>
        </Typography>
        <LinearProgress variant="determinate" value={pct}
          sx={{
            height: 6, borderRadius: 3, mt: 1,
            '& .MuiLinearProgress-bar': { background: tone },
          }} />
      </Box>
    </Grid>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Grid item xs={6} md={4}>
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
    </Grid>
  );
}
