/** Add Teacher — wired to `POST /teachers`. Mirrors `TeacherCreationRequest`. */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Button, Chip, CircularProgress, Grid, MenuItem, Paper, Step, StepLabel, Stepper,
  TextField, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, PersonAddAlt1 } from '@mui/icons-material';
import teacherService from '../../../services/teacher.service';
import type { TeacherCreationRequest } from '../../../types/teacher';

const STEPS = ['Personal', 'Job & salary', 'Bank details'] as const;

const empty: TeacherCreationRequest = {
  userRequest: { firstName: '', middleName: '', lastName: '', email: '', phone: '' },
  joiningDate: new Date().toISOString().slice(0, 10),
  dateOfBirth: '',
  gender: 'MALE',
  address: '',
  designation: '',
  basicSalary: 0,
  experienceYears: 0,
  highestQualification: '',
  bankDetails: { bankName: '', bankAccountNumber: '', bankBranch: '', ifscCode: '' },
};

type FormErrors = Record<string, string>;

function validate(step: number, f: TeacherCreationRequest): FormErrors {
  const e: FormErrors = {};
  if (step === 0) {
    if (!f.userRequest.firstName.trim()) e.firstName = 'Required';
    if (!f.userRequest.lastName.trim()) e.lastName = 'Required';
    if (!f.userRequest.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(f.userRequest.email)) e.email = 'Invalid email';
    if (!f.userRequest.phone.trim()) e.phone = 'Required';
    else if (!/^[0-9]{10}$/.test(f.userRequest.phone)) e.phone = '10 digits';
    if (!f.dateOfBirth) e.dateOfBirth = 'Required';
    if (!f.gender) e.gender = 'Required';
    if (!f.address.trim()) e.address = 'Required';
  }
  if (step === 1) {
    if (!f.joiningDate) e.joiningDate = 'Required';
    if (f.basicSalary == null || f.basicSalary < 0) e.salary = 'Must be ≥ 0';
    if (f.experienceYears == null || f.experienceYears < 0) e.experience = 'Must be ≥ 0';
  }
  return e;
}

export default function AddTeacherForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TeacherCreationRequest>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setUser = (k: keyof TeacherCreationRequest['userRequest'], v: string) =>
    setForm((p) => ({ ...p, userRequest: { ...p.userRequest, [k]: v } }));
  const setBank = (k: keyof NonNullable<TeacherCreationRequest['bankDetails']>, v: string) =>
    setForm((p) => ({ ...p, bankDetails: { ...(p.bankDetails || {}), [k]: v } }));
  const setF = <K extends keyof TeacherCreationRequest>(k: K, v: TeacherCreationRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const isLast = step === STEPS.length - 1;

  const next = () => {
    const e = validate(step, form); setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (isLast) void submit(); else setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const created = await teacherService.create(form);
      toast.success(`${created.fullName || created.firstName} added`);
      navigate(`/dashboard/teachers/${created.id}`);
    } catch (err) {
      toast.error((err as { message?: string }).message || 'Could not create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(124,58,237,0.5)',
        }}>
          <PersonAddAlt1 />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Onboard a new teacher</Typography>
          <Typography variant="body2" color="text.secondary">Three steps — personal, job, bank.</Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="First name" value={form.userRequest.firstName}
                onChange={(e) => setUser('firstName', e.target.value)}
                error={!!errors.firstName} helperText={errors.firstName} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Middle name" value={form.userRequest.middleName || ''}
                onChange={(e) => setUser('middleName', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required label="Last name" value={form.userRequest.lastName}
                onChange={(e) => setUser('lastName', e.target.value)}
                error={!!errors.lastName} helperText={errors.lastName} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required type="email" label="Email" value={form.userRequest.email}
                onChange={(e) => setUser('email', e.target.value)}
                error={!!errors.email} helperText={errors.email} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required label="Phone" value={form.userRequest.phone}
                onChange={(e) => setUser('phone', e.target.value.replace(/\D/g, ''))}
                error={!!errors.phone} helperText={errors.phone || '10-digit number'}
                inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth required type="date" label="Date of birth"
                InputLabelProps={{ shrink: true }} value={form.dateOfBirth}
                onChange={(e) => setF('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth} helperText={errors.dateOfBirth} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth required label="Gender" value={form.gender}
                onChange={(e) => setF('gender', e.target.value as any)}
                error={!!errors.gender} helperText={errors.gender}>
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Highest qualification" value={form.highestQualification || ''}
                onChange={(e) => setF('highestQualification', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required multiline rows={2} label="Address" value={form.address}
                onChange={(e) => setF('address', e.target.value)}
                error={!!errors.address} helperText={errors.address} />
            </Grid>
          </Grid>
        )}

        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required type="date" label="Joining date"
                InputLabelProps={{ shrink: true }} value={form.joiningDate}
                onChange={(e) => setF('joiningDate', e.target.value)}
                error={!!errors.joiningDate} helperText={errors.joiningDate} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Designation" value={form.designation || ''}
                onChange={(e) => setF('designation', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required type="number" label="Basic salary (monthly)"
                value={form.basicSalary}
                onChange={(e) => setF('basicSalary', Number(e.target.value) || 0)}
                error={!!errors.salary} helperText={errors.salary} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth required type="number" label="Experience (years)"
                value={form.experienceYears}
                onChange={(e) => setF('experienceYears', Number(e.target.value) || 0)}
                error={!!errors.experience} helperText={errors.experience} />
            </Grid>
          </Grid>
        )}

        {step === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Bank name" value={form.bankDetails?.bankName || ''}
                onChange={(e) => setBank('bankName', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Account number" value={form.bankDetails?.bankAccountNumber || ''}
                onChange={(e) => setBank('bankAccountNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Branch" value={form.bankDetails?.bankBranch || ''}
                onChange={(e) => setBank('bankBranch', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="IFSC" value={form.bankDetails?.ifscCode || ''}
                onChange={(e) => setBank('ifscCode', e.target.value.toUpperCase())} />
            </Grid>
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={back} disabled={step === 0 || submitting}>Back</Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`Step ${step + 1} of ${STEPS.length}`} size="small" variant="outlined" />
            <Button variant="contained" endIcon={isLast ? undefined : <ArrowForward />}
              onClick={next} disabled={submitting}
              sx={{
                minWidth: 140, textTransform: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                boxShadow: '0 8px 24px -8px rgba(124,58,237,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #6d28d9 0%, #db2777 100%)' },
              }}>
              {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : isLast ? 'Onboard teacher' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
