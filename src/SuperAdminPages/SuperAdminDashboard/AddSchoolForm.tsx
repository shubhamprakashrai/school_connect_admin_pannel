/**
 * Add School (Tenant) — wired to `POST /superadmin/tenants`.
 *
 * 3-step wizard mirroring the backend's `TenantRegistrationRequest` shape:
 *   1. School info (name, subdomain, contact)
 *   2. Address
 *   3. Plan + initial admin user
 *
 * Validation runs per-step so users only fix what's relevant.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, Check, School as SchoolIcon } from '@mui/icons-material';
import superAdminTenantService from '../../services/superAdminTenant.service';
import type {
  SubscriptionPlan,
  TenantRegistrationRequest,
} from '../../types/tenant';

const STEPS = ['School info', 'Address', 'Plan & admin'] as const;

const PLANS: Array<{ value: SubscriptionPlan; label: string; tagline: string }> = [
  { value: 'TRIAL', label: 'Trial', tagline: 'Free for 30 days' },
  { value: 'BASIC', label: 'Basic', tagline: 'Small schools' },
  { value: 'STANDARD', label: 'Standard', tagline: 'Most popular' },
  { value: 'PREMIUM', label: 'Premium', tagline: 'Full feature set' },
  { value: 'ENTERPRISE', label: 'Enterprise', tagline: 'Custom limits' },
];

interface FormErrors {
  [key: string]: string | undefined;
}

const emptyForm: TenantRegistrationRequest = {
  name: '',
  subdomain: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  subscriptionPlan: 'TRIAL',
  website: '',
  userRequest: { firstName: '', middleName: '', lastName: '', email: '', phone: '' },
  configuration: {},
  createDefaultClasses: true,
  studentLoginRequired: false,
};

function validateStep(step: number, form: TenantRegistrationRequest): FormErrors {
  const e: FormErrors = {};
  if (step === 0) {
    if (!form.name.trim()) e.name = 'School name is required';
    else if (form.name.trim().length < 3) e.name = 'At least 3 characters';
    if (!form.subdomain.trim()) e.subdomain = 'Subdomain is required';
    else if (!/^[a-z0-9-]+$/.test(form.subdomain)) e.subdomain = 'lowercase letters, numbers, hyphens only';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^[0-9]{10}$/.test(form.phone)) e.phone = 'Must be 10 digits';
  }
  if (step === 1) {
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.country.trim()) e.country = 'Country is required';
    if (form.postalCode && !/^[A-Z0-9]{3,10}$/i.test(form.postalCode))
      e.postalCode = 'Invalid postal code';
  }
  if (step === 2) {
    if (!form.subscriptionPlan) e.subscriptionPlan = 'Pick a plan';
    const u = form.userRequest;
    if (!u.firstName.trim()) e.firstName = 'First name is required';
    if (!u.lastName.trim()) e.lastName = 'Last name is required';
    if (!u.email.trim()) e.userEmail = 'Admin email is required';
    else if (!/^\S+@\S+\.\S+$/.test(u.email)) e.userEmail = 'Invalid email';
    if (!u.phone.trim()) e.userPhone = 'Admin phone is required';
    else if (!/^[0-9]{10}$/.test(u.phone)) e.userPhone = 'Must be 10 digits';
  }
  return e;
}

export default function AddSchoolForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TenantRegistrationRequest>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isLast = step === STEPS.length - 1;

  const updateField = <K extends keyof TenantRegistrationRequest>(
    key: K,
    value: TenantRegistrationRequest[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateUser = <K extends keyof TenantRegistrationRequest['userRequest']>(
    key: K,
    value: TenantRegistrationRequest['userRequest'][K],
  ) => {
    setForm((prev) => ({ ...prev, userRequest: { ...prev.userRequest, [key]: value } }));
  };

  const handleNext = () => {
    const e = validateStep(step, form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (isLast) {
      void submit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      const response = await superAdminTenantService.create(form);
      toast.success(response.message || `${form.name} created`);
      navigate(`/dashboard/schools/${response.tenant.id}`);
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Failed to create school';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            boxShadow: '0 12px 32px -12px rgba(37,99,235,0.5)',
          }}
        >
          <SchoolIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Onboard a new school
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Three quick steps and you're done.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }} elevation={0} variant="outlined">
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="School name" required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={!!errors.name} helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Subdomain" required
                value={form.subdomain}
                onChange={(e) => updateField('subdomain', e.target.value.toLowerCase())}
                error={!!errors.subdomain}
                helperText={errors.subdomain || 'will become subdomain.schoolconnect.com'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Contact email" required type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={!!errors.email} helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Contact phone" required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                error={!!errors.phone} helperText={errors.phone || '10-digit number'}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Website (optional)"
                value={form.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        )}

        {step === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Address" required multiline rows={2}
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                error={!!errors.address} helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="City" required
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                error={!!errors.city} helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="State" required
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                error={!!errors.state} helperText={errors.state}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Country" required
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                error={!!errors.country} helperText={errors.country}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Postal code"
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value.toUpperCase())}
                error={!!errors.postalCode} helperText={errors.postalCode}
              />
            </Grid>
          </Grid>
        )}

        {step === 2 && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Subscription plan
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              {PLANS.map((p) => {
                const selected = form.subscriptionPlan === p.value;
                return (
                  <Box
                    key={p.value}
                    onClick={() => updateField('subscriptionPlan', p.value)}
                    sx={{
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selected ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 1.5,
                      minWidth: 140,
                      flex: '0 0 auto',
                      transition: 'all 150ms',
                      background: selected ? 'rgba(37,99,235,0.06)' : 'transparent',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {p.label}
                      </Typography>
                      {selected && <Check fontSize="small" color="primary" />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {p.tagline}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Initial admin user
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              The login credentials will be sent to this admin's email after creation.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="First name" required
                  value={form.userRequest.firstName}
                  onChange={(e) => updateUser('firstName', e.target.value)}
                  error={!!errors.firstName} helperText={errors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="Middle name"
                  value={form.userRequest.middleName || ''}
                  onChange={(e) => updateUser('middleName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth label="Last name" required
                  value={form.userRequest.lastName}
                  onChange={(e) => updateUser('lastName', e.target.value)}
                  error={!!errors.lastName} helperText={errors.lastName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Admin email" required type="email"
                  value={form.userRequest.email}
                  onChange={(e) => updateUser('email', e.target.value)}
                  error={!!errors.userEmail} helperText={errors.userEmail}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Admin phone" required
                  value={form.userRequest.phone}
                  onChange={(e) => updateUser('phone', e.target.value.replace(/\D/g, ''))}
                  error={!!errors.userPhone} helperText={errors.userPhone || '10-digit number'}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select fullWidth label="Create default classes (1-12)?"
                  value={form.createDefaultClasses ? 'yes' : 'no'}
                  onChange={(e) => updateField('createDefaultClasses', e.target.value === 'yes')}
                  helperText="Pre-creates classes 1 through 12 with one default section each."
                >
                  <MenuItem value="yes">Yes — create classes 1-12</MenuItem>
                  <MenuItem value="no">No — I'll add them later</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={handleBack} disabled={step === 0 || submitting}>
            Back
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`Step ${step + 1} of ${STEPS.length}`} size="small" variant="outlined" />
            <Button
              variant="contained"
              endIcon={isLast ? undefined : <ArrowForward />}
              onClick={handleNext}
              disabled={submitting}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
                minWidth: 140,
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : isLast ? (
                'Create School'
              ) : (
                'Continue'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
