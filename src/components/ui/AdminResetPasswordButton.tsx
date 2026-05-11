/**
 * Admin-trigger password reset for a single user.
 *
 * Wraps `POST /auth/admin-reset-password`. Used from the Teacher / Student
 * detail pages where the admin needs to issue a new temporary password
 * without going through email recovery.
 *
 * The endpoint expects the *User* UUID — NOT the Teacher/Student entity
 * id — which is why both response DTOs now expose `userId`.
 */

import { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  InputAdornment, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import { ContentCopy, Key, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import authService from '../../services/auth.service';

interface Props {
  /** Required — the User UUID, not the Teacher/Student entity id. */
  userId?: string;
  /** Display name for the confirm dialog. */
  subjectName?: string;
  size?: 'small' | 'medium';
}

const PASSWORD_RULE = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

function suggestPassword(): string {
  // Random 12-char password matching the backend rule.
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digit = '23456789';
  const special = '@#$%^&+=!';
  const all = upper + lower + digit + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const chars = [pick(upper), pick(lower), pick(digit), pick(special)];
  for (let i = 0; i < 8; i++) chars.push(pick(all));
  // Fisher-Yates shuffle so the required char positions aren't predictable.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export default function AdminResetPasswordButton({ userId, subjectName, size = 'small' }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const disabled = !userId;

  const openDialog = () => {
    if (!userId) {
      toast.info('No linked user account — this person can\'t log in to the portal yet.');
      return;
    }
    setPassword(suggestPassword());
    setShow(false);
    setOpen(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    } catch {
      toast.info(`Password: ${password}`);
    }
  };

  const submit = async () => {
    if (!userId) return;
    if (!PASSWORD_RULE.test(password)) {
      toast.error('Password must be ≥8 chars and include upper, lower, digit and special');
      return;
    }
    setSubmitting(true);
    try {
      await authService.adminResetPassword({ userId, newPassword: password });
      toast.success('Password reset — share the new password securely');
      setOpen(false);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Reset failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title={disabled ? 'No user account linked yet' : 'Reset password (admin)'}>
        <span>
          <IconButton size={size} onClick={openDialog} disabled={disabled}>
            <Key fontSize={size === 'small' ? 'small' : 'medium'} />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a new password for <strong>{subjectName || 'this user'}</strong>. They will be asked
            to change it on next login.
          </Typography>
          <Stack spacing={2}>
            <TextField fullWidth label="New password" type={show ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              helperText="≥8 chars · 1 upper · 1 lower · 1 digit · 1 special (@#$%^&+=!)"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShow((s) => !s)}>
                      {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={copy}><ContentCopy fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button size="small" onClick={() => setPassword(suggestPassword())}>
              Generate new
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={submitting || !PASSWORD_RULE.test(password)}>
            {submitting ? 'Resetting…' : 'Reset password'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
