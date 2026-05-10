/**
 * In-app change password — for logged-in users.
 * Mounted under both /dashboard/change-password and /parent/change-password.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';

const PASSWORD_RULE = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

function checkRules(pw: string) {
  return [
    { ok: pw.length >= 8,         label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(pw),       label: 'One uppercase letter' },
    { ok: /[a-z]/.test(pw),       label: 'One lowercase letter' },
    { ok: /[0-9]/.test(pw),       label: 'One digit' },
    { ok: /[@#$%^&+=!]/.test(pw), label: 'One special character (@#$%^&+=!)' },
  ];
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rules = useMemo(() => checkRules(pw), [pw]);
  const valid = current.length > 0 && rules.every((r) => r.ok) && pw === confirm && pw !== current;

  const submit = async () => {
    if (!PASSWORD_RULE.test(pw)) { toast.error('New password does not meet requirements'); return; }
    if (pw !== confirm) { toast.error('Passwords do not match'); return; }
    if (pw === current) { toast.error('New password must differ from current'); return; }
    setSubmitting(true);
    try {
      await authService.changePassword({ currentPassword: current, newPassword: pw });
      toast.success('Password updated');
      navigate(-1);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(37,99,235,0.5)',
        }}>
          <KeyRound size={22} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Change password</Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a strong, unique password you don't reuse elsewhere.
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Current password" required type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={current} onChange={(e) => setCurrent(e.target.value)}
            InputProps={{
              endAdornment: (
                <button type="button" onClick={() => setShow((v) => !v)}
                  className="p-1 text-ink-300 hover:text-ink-900" aria-label={show ? 'Hide' : 'Show'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              ),
            }}
          />
          <TextField
            label="New password" required type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={pw} onChange={(e) => setPw(e.target.value)}
          />
          <TextField
            label="Confirm new password" required type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
          />

          <Box>
            <Stack spacing={0.5}>
              {rules.map((r) => (
                <Stack key={r.label} direction="row" spacing={1} alignItems="center">
                  <Box sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: r.ok ? '#10b981' : 'transparent',
                    border: r.ok ? 'none' : '1px solid #cbd5e1',
                    color: 'white',
                  }}>
                    {r.ok && <Check size={9} />}
                  </Box>
                  <Typography variant="caption"
                    sx={{ color: r.ok ? 'success.main' : 'text.secondary' }}>
                    {r.label}
                  </Typography>
                </Stack>
              ))}
              {confirm && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: pw === confirm ? '#10b981' : 'transparent',
                    border: pw === confirm ? 'none' : '1px solid #fb7185',
                    color: 'white',
                  }}>
                    {pw === confirm && <Check size={9} />}
                  </Box>
                  <Typography variant="caption"
                    sx={{ color: pw === confirm ? 'success.main' : 'error.main' }}>
                    Passwords match
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
          <Button onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={submitting || !valid}
            sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            {submitting ? 'Saving…' : 'Update password'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
