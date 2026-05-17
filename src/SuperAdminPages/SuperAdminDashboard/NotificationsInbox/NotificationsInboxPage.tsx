/**
 * Notifications inbox — admin sees their own messages + a broadcast
 * composer. Inbox messages can be marked read individually or in bulk.
 *
 * Wired to `notificationInboxService` (in-app inbox, separate from the
 * FCM push registry). Backend controller is pending — fetches return
 * 500 today; UI degrades to ErrorState until it ships.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, IconButton, MenuItem, Paper, Stack, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { Check, CheckCircle, Send } from '@mui/icons-material';
import { Inbox } from 'lucide-react';
import { toast } from 'react-toastify';
import notificationInboxService from '../../../services/notificationInbox.service';
import { useAuth } from '../../../contexts/AuthContext';
import EmptyState from '../../../components/ui/EmptyState';
import ErrorState from '../../../components/ui/ErrorState';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import type {
  AppNotification, NotificationType, SendNotificationRequest,
} from '../../../types/notificationInbox';

const TYPE_COLOR: Record<NotificationType, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  ANNOUNCEMENT: 'primary',
  ATTENDANCE:   'info',
  FEE_REMINDER: 'warning',
  EXAM_RESULT:  'success',
  HOMEWORK:     'info',
  EVENT:        'primary',
  GENERAL:      'default',
};

export default function NotificationsInboxPage() {
  const { hasRole } = useAuth();
  const canSend = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');
  const [tab, setTab] = useState<'inbox' | 'send'>('inbox');

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          In-app messages — separate from push (which is wired via FCM tokens).
        </Typography>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Inbox" value="inbox" />
        {canSend && <Tab label="Send broadcast" value="send" />}
      </Tabs>

      {tab === 'inbox' && <InboxPanel />}
      {tab === 'send'  && canSend && <SendPanel />}
    </Box>
  );
}

// ============================================================================
// Tab 1: Inbox
// ============================================================================
function InboxPanel() {
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await notificationInboxService.inbox({ page, size: rowsPerPage });
      setRows(res.content || []); setTotal(res.totalElements ?? 0);
    } catch (err) {
      setError((err as { message?: string }).message || 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);
  useEffect(() => { void fetch(); }, [fetch]);

  // Unread count separately so failure of one doesn't block the other.
  useEffect(() => {
    notificationInboxService.unreadCount()
      .then((c) => setUnreadCount(c.count))
      .catch(() => setUnreadCount(0));
  }, [rows]);

  const markOne = async (n: AppNotification) => {
    try {
      await notificationInboxService.markRead(n.id);
      setRows((r) => r.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Mark-read failed');
    }
  };
  const markAll = async () => {
    try {
      await notificationInboxService.markAllRead();
      toast.success('All marked read');
      void fetch();
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Failed');
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {unreadCount > 0 && <Chip color="primary" label={`${unreadCount} unread`} />}
        <Box sx={{ flex: 1 }} />
        {unreadCount > 0 && (
          <Button startIcon={<CheckCircle />} onClick={markAll}>Mark all read</Button>
        )}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ background: 'rgba(37,99,235,0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sent</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} sx={{ p: 0 }}>
                  <Box sx={{ p: 2 }}><TableSkeleton rows={5} cols={4} /></Box>
                </TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <ErrorState message={error} onRetry={() => void fetch()} />
                </TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={4} sx={{ py: 0 }}>
                  <EmptyState icon={Inbox} title="Inbox empty"
                    description="Notifications from your school will appear here." />
                </TableCell></TableRow>
              ) : (
                rows.map((n) => (
                  <TableRow key={n.id} hover sx={{ background: n.isRead ? 'transparent' : 'rgba(37,99,235,0.04)' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{
                          width: 32, height: 32, fontSize: 14,
                          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        }}>{(n.title || '?').charAt(0).toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 400 : 700 }}>
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', maxWidth: 360,
                          }}>{n.body}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={TYPE_COLOR[n.type]} variant="outlined"
                        label={n.type.replace(/_/g, ' ')} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {n.isRead ? (
                        <Chip size="small" variant="outlined" label="Read" />
                      ) : (
                        <Tooltip title="Mark read">
                          <IconButton size="small" onClick={() => void markOne(n)}>
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page}
          onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]} />
      </Paper>
    </>
  );
}

// ============================================================================
// Tab 2: Send broadcast
// ============================================================================
function SendPanel() {
  const [draft, setDraft] = useState<SendNotificationRequest>({
    audience: 'ALL', title: '', body: '', type: 'ANNOUNCEMENT',
  });
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!draft.title.trim() || !draft.body.trim()) { toast.error('Title and body required'); return; }
    setSending(true);
    try {
      const res = await notificationInboxService.send(draft);
      toast.success(`Sent to ${res.recipientCount} recipient${res.recipientCount === 1 ? '' : 's'}`);
      setDraft({ ...draft, title: '', body: '' });
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, maxWidth: 640 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Broadcast a notification</Typography>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <TextField select fullWidth label="Audience" value={draft.audience}
            onChange={(e) => setDraft({ ...draft, audience: e.target.value as SendNotificationRequest['audience'] })}>
            <MenuItem value="ALL">Everyone</MenuItem>
            <MenuItem value="ADMINS">Admins</MenuItem>
            <MenuItem value="TEACHERS">Teachers</MenuItem>
            <MenuItem value="PARENTS">Parents</MenuItem>
            <MenuItem value="STUDENTS">Students</MenuItem>
            <MenuItem value="CLASS">A specific class</MenuItem>
            <MenuItem value="SECTION">A specific section</MenuItem>
          </TextField>
          <TextField select fullWidth label="Type" value={draft.type || 'ANNOUNCEMENT'}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as NotificationType })}>
            <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
            <MenuItem value="ATTENDANCE">Attendance</MenuItem>
            <MenuItem value="FEE_REMINDER">Fee reminder</MenuItem>
            <MenuItem value="EXAM_RESULT">Exam result</MenuItem>
            <MenuItem value="HOMEWORK">Homework</MenuItem>
            <MenuItem value="EVENT">Event</MenuItem>
            <MenuItem value="GENERAL">General</MenuItem>
          </TextField>
        </Stack>
        {(draft.audience === 'CLASS' || draft.audience === 'SECTION') && (
          <TextField required label={draft.audience === 'CLASS' ? 'Class ID' : 'Section ID'}
            value={(draft.audience === 'CLASS' ? draft.classId : draft.sectionId) || ''}
            onChange={(e) => setDraft({
              ...draft,
              [draft.audience === 'CLASS' ? 'classId' : 'sectionId']: e.target.value,
            })} />
        )}
        <TextField required label="Title" value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <TextField required multiline rows={4} label="Message"
          value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        <TextField label="Deep link (optional)" placeholder="schoolconnect://attendance/today"
          value={draft.link || ''} onChange={(e) => setDraft({ ...draft, link: e.target.value })} />
        <Alert severity="info">
          Recipients will see this in their in-app inbox <strong>and</strong> as a push
          notification on mobile if their device has registered an FCM token.
        </Alert>
        <Box sx={{ textAlign: 'right' }}>
          <Button variant="contained" startIcon={<Send />} disabled={sending} onClick={send}
            sx={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            {sending ? 'Sending…' : 'Send broadcast'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
