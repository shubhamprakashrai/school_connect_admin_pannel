/**
 * Reports — landing hub for the school's analytics views. Each card
 * links to the screen that already renders the data (attendance summary,
 * fee collection, leave summary, student stats, etc.).
 *
 * Mobile uses a similar hub via its `reports_page.dart`. Admin's hub
 * is richer because the same data is already split across our existing
 * pages — we just surface the entry points in one place.
 */

import { Link as RouterLink } from 'react-router-dom';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import {
  Banknote, BarChart3, Calendar, CalendarOff, ClipboardCheck,
  GraduationCap, TrendingUp, Users as UsersIcon, Wallet,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ReportCard {
  to: string;
  title: string;
  description: string;
  Icon: typeof Banknote;
  tint: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';
  badge?: string;
  visibleTo: 'admin' | 'staff';
}

const TINT_BG: Record<ReportCard['tint'], string> = {
  blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
};

const REPORTS: ReportCard[] = [
  {
    to: '/dashboard/students',
    title: 'Student roster',
    description: 'Filterable list of every active student with class / section / status breakdown.',
    Icon: GraduationCap, tint: 'blue', visibleTo: 'staff',
  },
  {
    to: '/dashboard/attendance',
    title: 'Attendance — by section / date',
    description: 'Daily attendance snapshot for any section. Drill into individual student summaries from the student profile.',
    Icon: ClipboardCheck, tint: 'emerald', visibleTo: 'staff',
  },
  {
    to: '/dashboard/teachers/attendance',
    title: 'Teacher attendance',
    description: 'Daily bulk attendance log for staff. Filter by date or teacher.',
    Icon: UsersIcon, tint: 'cyan', visibleTo: 'admin',
  },
  {
    to: '/dashboard/fees',
    title: 'Fee collection',
    description: 'Payments ledger, structures, and per-student dues. Live numbers feed the dashboard cards.',
    Icon: Wallet, tint: 'amber', badge: 'Backend pending', visibleTo: 'admin',
  },
  {
    to: '/dashboard/leave',
    title: 'Leave — pending + summary',
    description: 'Approval queue + per-user balance tracking by leave type.',
    Icon: CalendarOff, tint: 'violet', badge: 'Backend pending', visibleTo: 'admin',
  },
  {
    to: '/dashboard/exams',
    title: 'Exam results',
    description: 'Class-wide statistics, top performers, report-card publishing pipeline.',
    Icon: BarChart3, tint: 'rose', badge: 'Backend pending', visibleTo: 'staff',
  },
  {
    to: '/dashboard/tenant',
    title: 'Usage & plan',
    description: 'Student / teacher / storage usage against your subscription plan.',
    Icon: TrendingUp, tint: 'blue', visibleTo: 'admin',
  },
  {
    to: '/dashboard/calendar',
    title: 'Calendar utilisation',
    description: 'Upcoming events grouped by audience — admin, teachers, parents, students.',
    Icon: Calendar, tint: 'violet', visibleTo: 'staff',
  },
];

export default function ReportsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN', 'SUPER_ADMIN', 'SUPERADMIN');

  const visible = REPORTS.filter((r) => r.visibleTo === 'staff' || isAdmin);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Reports</Typography>
        <Typography variant="body2" color="text.secondary">
          Quick access to the school's analytics views. Each card opens the corresponding screen.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {visible.map((r) => (
          <Grid item xs={12} sm={6} md={4} key={r.to + r.title}>
            <Paper variant="outlined" sx={{ borderRadius: 2, height: '100%', overflow: 'hidden' }}>
              <RouterLink to={r.to} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                <Box className="p-5 group relative h-full hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                  <Box className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${TINT_BG[r.tint]}`}>
                      <r.Icon className="w-5 h-5" />
                    </div>
                    {r.badge && (
                      <Chip size="small" label={r.badge} variant="outlined"
                        sx={{ fontSize: 10, height: 22, color: 'text.secondary' }} />
                    )}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2 }}>
                    {r.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {r.description}
                  </Typography>
                </Box>
              </RouterLink>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
