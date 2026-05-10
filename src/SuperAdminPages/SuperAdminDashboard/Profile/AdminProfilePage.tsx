/**
 * Admin / staff profile page.
 * Pulls the logged-in user from AuthContext + (best-effort) refreshes from
 * /auth/validate-token. Shows identity, role, tenant and links to
 * change-password.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar, Box, Button, Chip, CircularProgress, Divider, Grid, Paper,
  Stack, Typography,
} from '@mui/material';
import {
  Badge as BadgeIcon, Key as KeyRound, Mail, Print, Shield, AutoAwesome,
  Verified, ArrowForward, Business as Building2,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useTenant } from '../../../contexts/TenantContext';
import authService from '../../../services/auth.service';
import type { UserInfo } from '../../../types/auth';

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(false);
  const [serverUser, setServerUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    setLoading(true);
    authService.validateToken()
      .then((res) => { if (res.user) setServerUser(res.user); })
      .catch(() => { /* tolerate; UI uses local copy */ })
      .finally(() => setLoading(false));
  }, []);

  const u = serverUser || user;
  if (!u) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() ||
    (u.username?.[0] || 'U').toUpperCase();
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username;

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }} className="print-area">
      {/* Hero */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative', mb: 3 }}>
        <Box sx={{
          height: 96,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
        }} />
        <Box sx={{ px: 4, pb: 3, mt: -8, position: 'relative' }}>
          <Stack direction="row" spacing={2.5} alignItems="flex-end" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Avatar sx={{
              width: 96, height: 96, fontSize: 32, fontWeight: 700,
              border: '4px solid', borderColor: 'background.paper',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
            }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                <Chip size="small" icon={<Shield sx={{ fontSize: 14 }} />} label={u.role}
                  color="primary" variant="outlined" />
                {u.emailVerified
                  ? <Chip size="small" icon={<Verified sx={{ fontSize: 14 }} />} label="Email verified" color="success" />
                  : <Chip size="small" label="Email not verified" color="warning" variant="outlined" />}
                {u.mfaEnabled && <Chip size="small" icon={<AutoAwesome sx={{ fontSize: 14 }} />} label="MFA on" color="success" variant="outlined" />}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }} className="print-hide">
              <Button startIcon={<Print />} variant="outlined" onClick={() => window.print()}>
                Print
              </Button>
              <Button
                component={Link} to="/dashboard/change-password"
                variant="outlined" startIcon={<KeyRound />}>
                Change password
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Identity */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Identity</Typography>
            <Field label="Username" value={u.username} mono icon={<BadgeIcon fontSize="small" />} />
            <Divider sx={{ my: 1.5 }} />
            <Field label="Email" value={u.email} icon={<Mail fontSize="small" />} />
            <Divider sx={{ my: 1.5 }} />
            <Field label="Tenant" value={u.tenantId} mono icon={<Building2 fontSize="small" />} />
            <Divider sx={{ my: 1.5 }} />
            <Field label="User ID" value={u.id} mono />
          </Paper>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Security</Typography>

            <Stack spacing={1.5}>
              <SecurityItem
                title="Password"
                description="Recommended every 90 days."
                cta="Change"
                to="/dashboard/change-password"
              />
              <SecurityItem
                title="Email verification"
                description={u.emailVerified ? 'Verified' : 'Not verified'}
                tone={u.emailVerified ? 'success' : 'warning'}
              />
              <SecurityItem
                title="Two-factor"
                description={u.mfaEnabled ? 'Enabled' : 'Disabled'}
                tone={u.mfaEnabled ? 'success' : 'default'}
              />
              <SecurityItem
                title="Active session"
                description={`Tenant scope: ${tenantId}`}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {loading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Refreshing from server…
        </Typography>
      )}
    </Box>
  );
}

function Field({ label, value, mono, icon }: {
  label: string; value?: string | null; mono?: boolean; icon?: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {icon && <Box sx={{ color: 'text.secondary' }}>{icon}</Box>}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: mono ? 'monospace' : undefined }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

function SecurityItem({ title, description, tone, cta, to }: {
  title: string; description?: string;
  tone?: 'success' | 'warning' | 'default';
  cta?: string; to?: string;
}) {
  const color = tone === 'success' ? 'success.main'
    : tone === 'warning' ? 'warning.main' : 'text.secondary';
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}
      sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{title}</Typography>
        {description && (
          <Typography variant="caption" sx={{ color }}>{description}</Typography>
        )}
      </Box>
      {cta && to && (
        <Button component={Link} to={to} size="small" endIcon={<ArrowForward sx={{ fontSize: 14 }} />}>
          {cta}
        </Button>
      )}
    </Stack>
  );
}
