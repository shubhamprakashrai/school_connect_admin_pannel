/**
 * Parent detail — full read page.
 *
 * Per mobile's `parent_detail_page.dart`. Shows the parent's info card,
 * linked students, portal access status, and edit / status-toggle /
 * delete actions. Route: /dashboard/parents/:parentId
 */

import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Divider, Grid,
  IconButton, Paper, Stack, Tooltip, Typography,
} from '@mui/material';
import {
  ArrowBack, Block, CheckCircle, Delete, Edit, Mail, Phone,
} from '@mui/icons-material';
import { Heart, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentService } from '../../../services/parent.service';
import { useAuth } from '../../../contexts/AuthContext';
import AdminResetPasswordButton from '../../../components/ui/AdminResetPasswordButton';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import type { ParentResponse } from '../../../types/parent';
import type { StudentResponse } from '../../../types/student';

export default function ParentDetailPage() {
  const { parentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const [parent, setParent] = useState<ParentResponse | null>(null);
  const [children, setChildren] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!parentId) return;
    setLoading(true); setError(null);
    try {
      const p = await parentService.getById(parentId);
      setParent(p);
      // Children — only if backend exposes them and the parent has a userId.
      if (p.userId) {
        parentService.studentsByParentUser(p.userId)
          .then(setChildren)
          .catch(() => setChildren([]));
      }
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load parent');
    } finally {
      setLoading(false);
    }
  }, [parentId]);
  useEffect(() => { void load(); }, [load]);

  const toggleStatus = async () => {
    if (!parent) return;
    const next = parent.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setBusy(true);
    try {
      await parentService.setStatus(parent.parentId, next);
      toast.success(`Marked ${next.toLowerCase()}`);
      void load();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!parent) return;
    const name = [parent.firstname, parent.lastname].filter(Boolean).join(' ').trim();
    if (!window.confirm(`Delete parent "${name}"? This will also drop their portal access.`)) return;
    setBusy(true);
    try {
      await parentService.remove(parent.parentId);
      toast.success('Deleted');
      navigate('/dashboard/parents');
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!parent) return <EmptyState icon={Heart} title="Parent not found" />;

  const fullName = [parent.firstname, parent.middlename, parent.lastname].filter(Boolean).join(' ').trim() || '—';
  const isActive = parent.status !== 'INACTIVE' && parent.status !== 'SUSPENDED';

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button component={RouterLink} to="/dashboard/parents" startIcon={<ArrowBack />}>
          Parents
        </Button>
        <Box sx={{ flex: 1 }} />
        <AdminResetPasswordButton userId={parent.userId} subjectName={fullName} />
        {canManage && (
          <Tooltip title={isActive ? 'Mark inactive' : 'Mark active'}>
            <IconButton onClick={toggleStatus} disabled={busy}>
              {isActive ? <Block /> : <CheckCircle />}
            </IconButton>
          </Tooltip>
        )}
        {canManage && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={remove} disabled={busy}>
              <Delete />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
          <Avatar sx={{
            width: 72, height: 72, fontSize: 28, fontWeight: 700,
            background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
          }}>
            {(parent.firstname || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{fullName}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              {parent.parentType && (
                <Chip size="small" icon={<Heart className="w-3.5 h-3.5" />}
                  label={parent.parentType} variant="outlined" />
              )}
              <Chip size="small" color={isActive ? 'success' : 'default'}
                label={parent.status || 'ACTIVE'} variant={isActive ? 'filled' : 'outlined'} />
              <Chip size="small"
                color={parent.portalAccessEnabled ? 'success' : 'default'}
                variant="outlined"
                label={parent.portalAccessEnabled ? 'Portal enabled' : 'Portal disabled'} />
              {children.length > 0 && (
                <Chip size="small" color="primary"
                  label={`${children.length} child${children.length === 1 ? '' : 'ren'} linked`} />
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Contact</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Mail fontSize="small" color="action" />
                <Typography variant="body2">{parent.email || '—'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Phone fontSize="small" color="action" />
                <Typography variant="body2">{parent.phone || '—'}</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Preferences</Typography>
            <Stack spacing={0.5}>
              <PrefRow label="SMS" enabled={parent.receiveSms} />
              <PrefRow label="Email" enabled={parent.receiveEmail} />
              <PrefRow label="In-app" enabled={parent.receiveAppNotifications} />
              <PrefRow label="Primary contact" enabled={parent.isPrimaryContact} />
              <PrefRow label="Emergency contact" enabled={parent.isEmergencyContact} />
              <PrefRow label="Can pickup child" enabled={parent.canPickupChild} />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Linked children ({children.length})
              </Typography>
            </Stack>
            {!parent.userId ? (
              <Alert severity="info">
                No user account linked yet — link this parent to a student during enrolment
                to establish portal access.
              </Alert>
            ) : children.length === 0 ? (
              <EmptyState icon={UsersIcon}
                title="No children linked"
                description="Enrol a student with this parent's details to attach them." />
            ) : (
              <Stack spacing={1}>
                {children.map((c) => (
                  <RouterLink key={c.id} to={`/dashboard/students/${c.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      '&:hover': { background: 'rgba(0,0,0,0.02)' },
                    }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14,
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      }}>
                        {(c.firstName || '?').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">
                          {c.fullName || [c.firstName, c.middleName, c.lastName].filter(Boolean).join(' ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[c.schoolClass?.name, c.section?.name].filter(Boolean).join(' · ') || 'No class assigned'}
                          {c.rollNumber ? ` · Roll ${c.rollNumber}` : ''}
                        </Typography>
                      </Box>
                    </Paper>
                  </RouterLink>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {canManage && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button startIcon={<Edit />} variant="outlined"
            onClick={() => navigate('/dashboard/parents', { state: { editId: parent.parentId } })}>
            Edit parent
          </Button>
        </Box>
      )}
    </Box>
  );
}

function PrefRow({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 13 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Chip size="small" variant="outlined"
        color={enabled ? 'success' : 'default'}
        label={enabled ? 'On' : 'Off'} sx={{ minWidth: 50 }} />
    </Stack>
  );
}
