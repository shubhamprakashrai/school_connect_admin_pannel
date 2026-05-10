/**
 * School (tenant) detail — Overview / Subscription & Limits / Configuration / Analytics tabs.
 * Wired to `/superadmin/tenants/{tenantId}/*`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Refresh,
  Save,
} from '@mui/icons-material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import superAdminTenantService from '../../../services/superAdminTenant.service';
import type {
  SubscriptionPlan,
  TenantResponse,
  TenantStatistics,
  UpdateLimitsRequest,
  UpdateSubscriptionRequest,
  UpdateTenantRequest,
} from '../../../types/tenant';

const PLAN_OPTIONS: SubscriptionPlan[] = ['TRIAL', 'BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'];

const PIE_COLORS = ['#2563eb', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<TenantResponse | null>(null);
  const [stats, setStats] = useState<TenantStatistics | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  // Edit-mode local state for the Overview tab
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UpdateTenantRequest>({});
  const [savingOverview, setSavingOverview] = useState(false);

  // Subscription / limits drafts
  const [planDraft, setPlanDraft] = useState<SubscriptionPlan>('TRIAL');
  const [limitsDraft, setLimitsDraft] = useState<UpdateLimitsRequest>({});
  const [savingPlan, setSavingPlan] = useState(false);

  // Configuration draft
  const [configDraft, setConfigDraft] = useState<string>('{}');
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [t, s, c] = await Promise.all([
        superAdminTenantService.getById(id),
        superAdminTenantService.analytics(id).catch(() => null),
        superAdminTenantService.getConfiguration(id).catch(() => ({})),
      ]);
      setTenant(t);
      setStats(s);
      setConfig(c || {});
      setPlanDraft(t.subscriptionPlan);
      setLimitsDraft({
        maxStudents: t.limits?.maxStudents,
        maxTeachers: t.limits?.maxTeachers,
        maxStorageGb: t.limits?.maxStorageGb,
      });
      setConfigDraft(JSON.stringify(c || {}, null, 2));
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed to load school');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // ---- Actions ------------------------------------------------------------

  const startEdit = () => {
    if (!tenant) return;
    setDraft({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      city: tenant.city,
      state: tenant.state,
      country: tenant.country,
      postalCode: tenant.postalCode,
      website: tenant.website,
      logoUrl: tenant.logoUrl,
    });
    setEditing(true);
  };

  const saveOverview = async () => {
    if (!id) return;
    setSavingOverview(true);
    try {
      const updated = await superAdminTenantService.update(id, draft);
      setTenant(updated);
      setEditing(false);
      toast.success('School updated');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Update failed');
    } finally {
      setSavingOverview(false);
    }
  };

  const savePlanAndLimits = async () => {
    if (!id || !tenant) return;
    setSavingPlan(true);
    try {
      const updates: Promise<TenantResponse>[] = [];
      if (planDraft !== tenant.subscriptionPlan) {
        const sub: UpdateSubscriptionRequest = { subscriptionPlan: planDraft };
        updates.push(superAdminTenantService.updateSubscription(id, sub));
      }
      if (
        limitsDraft.maxStudents !== tenant.limits?.maxStudents ||
        limitsDraft.maxTeachers !== tenant.limits?.maxTeachers ||
        limitsDraft.maxStorageGb !== tenant.limits?.maxStorageGb
      ) {
        updates.push(superAdminTenantService.updateLimits(id, limitsDraft));
      }
      await Promise.all(updates);
      toast.success('Subscription updated');
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Update failed');
    } finally {
      setSavingPlan(false);
    }
  };

  const saveConfig = async () => {
    if (!id) return;
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(configDraft);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Must be a JSON object');
      }
    } catch (err) {
      toast.error(`Invalid JSON: ${(err as Error).message}`);
      return;
    }
    setSavingConfig(true);
    try {
      const updated = await superAdminTenantService.updateConfiguration(id, parsed);
      setConfig(updated);
      setConfigDraft(JSON.stringify(updated, null, 2));
      toast.success('Configuration saved');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Save failed');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleActivate = async () => {
    if (!id) return;
    try {
      await superAdminTenantService.activate(id);
      toast.success('Activated');
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Activation failed');
    }
  };

  const handleSuspend = async () => {
    if (!id || !tenant) return;
    if (!window.confirm(`Suspend ${tenant.name}?`)) return;
    try {
      await superAdminTenantService.suspend(id);
      toast.success('Suspended');
      void fetchAll();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Suspend failed');
    }
  };

  const handleDelete = async () => {
    if (!id || !tenant) return;
    if (!window.confirm(`Delete ${tenant.name}? Reversible (soft delete).`)) return;
    try {
      await superAdminTenantService.softDelete(id);
      toast.success('Deleted');
      navigate('/dashboard/schools');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    }
  };

  // ---- Derived data for charts -------------------------------------------

  const studentsByClassChartData = useMemo(() => {
    if (!stats?.studentsByClass) return [];
    return Object.entries(stats.studentsByClass).map(([name, count]) => ({ name, count }));
  }, [stats]);

  const usersByRoleChartData = useMemo(() => {
    if (!stats?.usersByRole) return [];
    return Object.entries(stats.usersByRole).map(([name, value]) => ({ name, value }));
  }, [stats]);

  // ---- Render -------------------------------------------------------------

  if (loading || !tenant) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/dashboard/schools')}>
          <ArrowBack />
        </IconButton>
        <Avatar
          src={tenant.logoUrl}
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            fontSize: 22,
          }}
        >
          {tenant.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {tenant.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip
              size="small"
              label={tenant.status}
              color={tenant.status === 'ACTIVE' ? 'success' : tenant.status === 'SUSPENDED' ? 'error' : 'warning'}
            />
            <Chip size="small" label={tenant.subscriptionPlan} variant="outlined" />
            <Chip size="small" label={tenant.subdomain} variant="outlined" sx={{ fontFamily: 'monospace' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Refresh />} onClick={() => void fetchAll()}>
            Refresh
          </Button>
          {tenant.status === 'SUSPENDED' || tenant.status === 'PENDING' ? (
            <Button startIcon={<CheckCircle />} color="success" variant="outlined" onClick={handleActivate}>
              Activate
            </Button>
          ) : (
            <Button startIcon={<Block />} color="warning" variant="outlined" onClick={handleSuspend}>
              Suspend
            </Button>
          )}
          <Button startIcon={<Delete />} color="error" variant="outlined" onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={0} variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Overview" />
          <Tab label="Subscription & Limits" />
          <Tab label="Configuration" />
          <Tab label="Analytics" />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* OVERVIEW */}
          {tab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                {editing ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={() => setEditing(false)} disabled={savingOverview}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={saveOverview}
                      disabled={savingOverview}
                    >
                      {savingOverview ? 'Saving…' : 'Save'}
                    </Button>
                  </Box>
                ) : (
                  <Button startIcon={<Edit />} onClick={startEdit}>
                    Edit
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {(
                  [
                    ['name', 'School name'],
                    ['email', 'Contact email'],
                    ['phone', 'Contact phone'],
                    ['website', 'Website'],
                    ['address', 'Address'],
                    ['city', 'City'],
                    ['state', 'State'],
                    ['country', 'Country'],
                    ['postalCode', 'Postal code'],
                    ['logoUrl', 'Logo URL'],
                  ] as const
                ).map(([key, label]) => (
                  <Grid key={key} item xs={12} md={6}>
                    {editing ? (
                      <TextField
                        fullWidth label={label}
                        value={(draft as any)[key] ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                      />
                    ) : (
                      <FieldRow label={label} value={(tenant as any)[key]} />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* SUBSCRIPTION & LIMITS */}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Subscription plan
                </Typography>
                <TextField
                  select fullWidth value={planDraft}
                  onChange={(e) => setPlanDraft(e.target.value as SubscriptionPlan)}
                >
                  {PLAN_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Activation status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created {tenant.createdAt ? new Date(tenant.createdAt).toLocaleString() : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activated {tenant.activatedAt ? new Date(tenant.activatedAt).toLocaleString() : '—'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Resource limits
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="Max students" type="number"
                  value={limitsDraft.maxStudents ?? ''}
                  onChange={(e) =>
                    setLimitsDraft((l) => ({ ...l, maxStudents: Number(e.target.value) || 0 }))
                  }
                />
                <UsageBar
                  current={tenant.limits?.currentStudents ?? 0}
                  max={tenant.limits?.maxStudents ?? 0}
                  label="Used"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="Max teachers" type="number"
                  value={limitsDraft.maxTeachers ?? ''}
                  onChange={(e) =>
                    setLimitsDraft((l) => ({ ...l, maxTeachers: Number(e.target.value) || 0 }))
                  }
                />
                <UsageBar
                  current={tenant.limits?.currentTeachers ?? 0}
                  max={tenant.limits?.maxTeachers ?? 0}
                  label="Used"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="Max storage (GB)" type="number"
                  value={limitsDraft.maxStorageGb ?? ''}
                  onChange={(e) =>
                    setLimitsDraft((l) => ({ ...l, maxStorageGb: Number(e.target.value) || 0 }))
                  }
                />
                <UsageBar
                  current={(tenant.limits?.currentStorageMb ?? 0) / 1024}
                  max={tenant.limits?.maxStorageGb ?? 0}
                  label="Used (GB)"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained" startIcon={<Save />} onClick={savePlanAndLimits}
                  disabled={savingPlan}
                >
                  {savingPlan ? 'Saving…' : 'Save changes'}
                </Button>
              </Grid>
            </Grid>
          )}

          {/* CONFIGURATION */}
          {tab === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Free-form key-value configuration. Edit as JSON.
              </Typography>
              <TextField
                fullWidth multiline minRows={12}
                value={configDraft}
                onChange={(e) => setConfigDraft(e.target.value)}
                inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 } }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained" startIcon={<Save />} onClick={saveConfig}
                  disabled={savingConfig}
                >
                  {savingConfig ? 'Saving…' : 'Save configuration'}
                </Button>
              </Box>
            </Box>
          )}

          {/* ANALYTICS */}
          {tab === 3 && (
            <Box>
              {!stats ? (
                <Typography color="text.secondary">No analytics data available.</Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Students" value={stats.totalStudents} accent="#2563eb" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Teachers" value={stats.totalTeachers} accent="#7c3aed" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Parents" value={stats.totalParents} accent="#ec4899" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard label="Active users" value={stats.activeUsers} accent="#10b981" />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: 320 }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Students by class
                      </Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={studentsByClassChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <RTooltip />
                          <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, borderRadius: 2, height: 320 }} variant="outlined">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Users by role
                      </Typography>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={usersByRoleChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                          >
                            {usersByRoleChartData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StatCard label="Total classes" value={stats.totalClasses} accent="#f59e0b" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StatCard
                      label="Attendance percentage"
                      value={`${stats.attendancePercentage?.toFixed(1) ?? '0'}%`}
                      accent="#06b6d4"
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// ---- Local presentational helpers ----------------------------------------

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );
}

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {current} / {max} ({pct}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6, borderRadius: 3, mt: 0.5,
          '& .MuiLinearProgress-bar': {
            background: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#2563eb',
          },
        }}
      />
    </Box>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <Paper
      sx={{
        p: 2, borderRadius: 2, position: 'relative', overflow: 'hidden',
        borderLeft: `4px solid ${accent}`,
      }}
      variant="outlined"
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color: accent }}>
        {value}
      </Typography>
    </Paper>
  );
}
