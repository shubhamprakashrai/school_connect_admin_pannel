/**
 * Add Student — wired to `POST /students`.
 *
 * 3-step wizard:
 *   1. Personal info        (name + DOB + gender)
 *   2. Contact & school     (email/phone + class/section + admission + address)
 *   3. Family & emergency   (father/mother optional, emergency contact required)
 *
 * Empty parent objects are stripped before submit so the backend's @NotBlank
 * validation on parent name + phone doesn't reject half-filled groups.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, Divider, Grid, MenuItem, Paper,
  Step, StepLabel, Stepper, TextField, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, PersonAdd } from '@mui/icons-material';
import studentService from '../../../services/student.service';
import schoolClassService, { sectionService } from '../../../services/schoolClass.service';
import { parentService } from '../../../services/parent.service';
import type { CreateStudentRequest } from '../../../types/student';
import type { SchoolClassResponse, SectionResponse } from '../../../types/schoolClass';
import type { ParentResponse } from '../../../types/parent';

const STEPS = [
  { label: 'Personal info',     hint: 'Name, date of birth, gender' },
  { label: 'Contact & school',  hint: 'Email, phone, class & section' },
  { label: 'Family & emergency',hint: 'Optional parents · required emergency contact' },
] as const;

/**
 * Backend (May 2026) restructured `parentInfo` into a single mandatory
 * wrapper. Inside the wrapper, each role is individually optional, but if
 * a role is provided its fields are nested-validated:
 *
 *   fatherInfo:   { name + occupation }              — both @NotBlank
 *   motherInfo:   { name + occupation }              — both @NotBlank
 *   guardianInfo: { name + occupation + email + phone } — all four @NotBlank
 *
 * GuardianInfo also drives parent-portal login (email + phone validate it),
 * which is why those fields live there and not on father/mother.
 */
const empty: CreateStudentRequest = {
  rollNumber: '',
  userRequest: { firstName: '', middleName: '', lastName: '', email: '', phone: '' },
  dateOfBirth: '',
  gender: 'MALE',
  address: '',
  city: '',
  state: '',
  country: 'India',
  postalCode: '',
  schoolClass: { id: '' },
  section: { id: '' },
  admissionDate: new Date().toISOString().slice(0, 10),
  previousSchool: '',
  parentInfo: {
    fatherInfo:   { name: '', occupation: '' },
    motherInfo:   { name: '', occupation: '' },
    guardianInfo: { name: '', occupation: '', email: '', phone: '' },
  },
  emergencyContact: { name: '', relation: '', phone: '' },
  createUserAccount: false,
};

type FormErrors = Record<string, string>;

const PHONE_RX = /^[0-9]{10}$/;
const EMAIL_RX = /^\S+@\S+\.\S+$/;

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })();

function validate(step: number, f: CreateStudentRequest): FormErrors {
  const e: FormErrors = {};
  if (step === 0) {
    if (!f.userRequest.firstName.trim()) e.firstName = 'First name is required';
    if (!f.userRequest.lastName.trim())  e.lastName  = 'Last name is required';
    if (!f.dateOfBirth) {
      e.dateOfBirth = 'Date of birth is required';
    } else if (f.dateOfBirth >= TODAY) {
      e.dateOfBirth = 'Must be in the past';
    }
    if (!f.gender) e.gender = 'Pick a gender';
  }
  if (step === 1) {
    if (!f.userRequest.email.trim())          e.email = 'Email is required';
    else if (!EMAIL_RX.test(f.userRequest.email)) e.email = 'Invalid email';
    if (!f.userRequest.phone.trim())          e.phone = 'Phone is required';
    else if (!PHONE_RX.test(f.userRequest.phone)) e.phone = 'Must be exactly 10 digits';
    if (!f.schoolClass.id) e.classId = 'Pick a class';
    if (!f.section.id)     e.sectionId = 'Pick a section';
    if (!f.admissionDate)  e.admissionDate = 'Required';
  }
  if (step === 2) {
    // Father/mother: skip silently if name is blank; otherwise both name + occupation are required.
    const checkSimple = (
      role: 'father' | 'mother',
      info: { name?: string; occupation?: string } | undefined,
    ) => {
      const name = info?.name?.trim();
      const occ  = info?.occupation?.trim();
      if (!name && !occ) return; // section skipped
      if (!name) e[`${role}Name`] = 'Name required';
      if (!occ)  e[`${role}Occupation`] = 'Occupation required';
    };
    checkSimple('father', f.parentInfo.fatherInfo);
    checkSimple('mother', f.parentInfo.motherInfo);

    // Guardian: optional, but ALL four fields required together (portal access).
    const g = f.parentInfo.guardianInfo;
    const gName = g?.name?.trim();
    const gOcc  = g?.occupation?.trim();
    const gMail = g?.email?.trim();
    const gPh   = g?.phone?.trim();
    const gAny  = gName || gOcc || gMail || gPh;
    if (gAny) {
      if (!gName) e.guardianName = 'Name required';
      if (!gOcc)  e.guardianOccupation = 'Occupation required';
      if (!gMail) e.guardianEmail = 'Email required for portal access';
      else if (!EMAIL_RX.test(gMail)) e.guardianEmail = 'Invalid email';
      if (!gPh)   e.guardianPhone = 'Phone required for portal access';
      else if (!PHONE_RX.test(gPh)) e.guardianPhone = 'Must be exactly 10 digits';
    }

    // Emergency contact required.
    if (!f.emergencyContact.name.trim())     e.emName = 'Required';
    if (!f.emergencyContact.relation.trim()) e.emRel  = 'Required';
    if (!f.emergencyContact.phone.trim())    e.emPhone = 'Required';
    else if (!PHONE_RX.test(f.emergencyContact.phone)) e.emPhone = 'Must be exactly 10 digits';
  }
  return e;
}

export default function AddStudentForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateStudentRequest>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [classes, setClasses] = useState<SchoolClassResponse[]>([]);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [parents, setParents] = useState<ParentResponse[]>([]);

  useEffect(() => {
    schoolClassService.list().then(setClasses).catch(() => setClasses([]));
    parentService.list().then(setParents).catch(() => setParents([]));
  }, []);

  useEffect(() => {
    if (!form.schoolClass.id) { setSections([]); return; }
    sectionService.byClass(form.schoolClass.id).then(setSections).catch(() => setSections([]));
  }, [form.schoolClass.id]);

  const setUser = (k: keyof CreateStudentRequest['userRequest'], v: string) =>
    setForm((p) => ({ ...p, userRequest: { ...p.userRequest, [k]: v } }));

  const setField = <K extends keyof CreateStudentRequest>(k: K, v: CreateStudentRequest[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const setParent = (
    which: 'fatherInfo' | 'motherInfo' | 'guardianInfo',
    k: string,
    v: string,
  ) =>
    setForm((p) => ({
      ...p,
      parentInfo: {
        ...p.parentInfo,
        [which]: { ...(p.parentInfo[which] ?? {}), [k]: v },
      },
    } as CreateStudentRequest));

  const fillParentFromExisting = (
    which: 'fatherInfo' | 'motherInfo' | 'guardianInfo',
    src: ParentResponse | null,
  ) => {
    if (!src) return;
    const fullName = [src.firstname, src.middlename, src.lastname].filter(Boolean).join(' ').trim();
    setForm((p) => {
      // father/mother only need name + occupation; guardian needs all four
      const next = which === 'guardianInfo'
        ? { name: fullName, occupation: '', email: src.email || '', phone: src.phone || '' }
        : { name: fullName, occupation: '' };
      return {
        ...p,
        parentInfo: { ...p.parentInfo, [which]: next },
      } as CreateStudentRequest;
    });
  };

  const isLast = step === STEPS.length - 1;

  const next = () => {
    const e = validate(step, form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    if (isLast) void submit();
    else setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    try {
      // Drop a parent role entirely if its name is blank — backend's nested
      // @NotBlank validators reject half-filled records, and the wrapper
      // itself remains @NotNull so we always send `parentInfo: { … }`.
      const cleanFather = form.parentInfo.fatherInfo?.name?.trim()
        ? form.parentInfo.fatherInfo : undefined;
      const cleanMother = form.parentInfo.motherInfo?.name?.trim()
        ? form.parentInfo.motherInfo : undefined;
      let cleanGuardian = form.parentInfo.guardianInfo?.name?.trim()
        ? form.parentInfo.guardianInfo : undefined;

      // Backend Parent entity has @NotNull on email + phone even though the
      // DB columns are nullable (V18 migration drift). When the user only
      // fills father/mother and skips guardianInfo, the Parent record
      // persists with null email/phone and bean-validation fails. Synthesize
      // a guardianInfo from the student's own userRequest contact so the
      // Parent entity always gets non-null values.
      if (!cleanGuardian && (cleanFather || cleanMother)) {
        const fallbackName = cleanFather?.name?.trim()
          || cleanMother?.name?.trim()
          || `${form.userRequest.firstName} ${form.userRequest.lastName}`.trim();
        cleanGuardian = {
          name: fallbackName,
          occupation: cleanFather?.occupation || cleanMother?.occupation || 'Parent',
          email: form.userRequest.email.trim(),
          phone: form.userRequest.phone.trim(),
        };
      }

      // Mobile-parity: skip parent linking entirely. Backend's prod DB is
      // missing `student_parents.tenant_id` — the linking INSERT crashes
      // every time. Mobile sends a mismatched flat shape that Jackson drops,
      // so mobile never triggers this path either. We send an empty parentInfo
      // wrapper (satisfies @NotNull) and skip parent persistence; admin can
      // add parents later from the Parents page.
      void cleanFather; void cleanMother; void cleanGuardian;
      const payload: CreateStudentRequest = {
        ...form,
        rollNumber:    form.rollNumber?.trim()    || undefined,
        address:       form.address?.trim()       || undefined,
        city:          form.city?.trim()          || undefined,
        state:         form.state?.trim()         || undefined,
        country:       form.country?.trim()       || undefined,
        postalCode:    form.postalCode?.trim()    || undefined,
        previousSchool: form.previousSchool?.trim() || undefined,
        parentInfo: {},
        userRequest: {
          ...form.userRequest,
          middleName: form.userRequest.middleName?.trim() || undefined,
        },
      };
      // eslint-disable-next-line no-console
      console.debug('[AddStudent] submitting', payload);
      const created = await studentService.create(payload);
      toast.success(`${created.fullName || created.firstName} added`);
      navigate(`/dashboard/students/${created.id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AddStudent] failed', err);
      const e = err as { message?: string; errors?: Record<string, string[]> };
      const fieldErrors = e.errors
        ? Object.entries(e.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' · ')
        : '';
      toast.error(fieldErrors || e.message || 'Could not create student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2, color: 'white', mr: 2,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px -12px rgba(37,99,235,0.5)',
        }}>
          <PersonAdd />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Enroll a new student</Typography>
          <Typography variant="body2" color="text.secondary">
            {STEPS[step].hint}
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((s) => <Step key={s.label}><StepLabel>{s.label}</StepLabel></Step>)}
        </Stepper>

        {/* STEP 1 — Personal info */}
        {step === 0 && (
          <>
            <SectionHead title="Student name & basics" subtitle="Required to identify the student in the system." />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="First name"
                  value={form.userRequest.firstName}
                  onChange={(e) => setUser('firstName', e.target.value)}
                  error={!!errors.firstName} helperText={errors.firstName} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Middle name"
                  value={form.userRequest.middleName || ''}
                  onChange={(e) => setUser('middleName', e.target.value)}
                  helperText="Optional" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required label="Last name"
                  value={form.userRequest.lastName}
                  onChange={(e) => setUser('lastName', e.target.value)}
                  error={!!errors.lastName} helperText={errors.lastName} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="date" label="Date of birth"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: YESTERDAY }}
                  value={form.dateOfBirth}
                  onChange={(e) => setField('dateOfBirth', e.target.value)}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth || 'Must be a past date'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required label="Gender" value={form.gender}
                  onChange={(e) => setField('gender', e.target.value as CreateStudentRequest['gender'])}
                  error={!!errors.gender} helperText={errors.gender}>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Roll number" value={form.rollNumber || ''}
                  onChange={(e) => setField('rollNumber', e.target.value)}
                  helperText="Optional · auto-generated if blank" />
              </Grid>
            </Grid>
          </>
        )}

        {/* STEP 2 — Contact, class & address */}
        {step === 1 && (
          <>
            <SectionHead title="Account & contact" subtitle="The email is used for parent / student login if enabled." />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required type="email" label="Email"
                  value={form.userRequest.email}
                  onChange={(e) => setUser('email', e.target.value.toLowerCase().trim())}
                  error={!!errors.email}
                  helperText={errors.email || 'Used for login · must be unique'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Phone"
                  value={form.userRequest.phone}
                  onChange={(e) => setUser('phone', e.target.value.replace(/\D/g, ''))}
                  error={!!errors.phone} helperText={errors.phone || 'Exactly 10 digits, no spaces'}
                  inputProps={{ maxLength: 10 }} />
              </Grid>
            </Grid>

            <SectionHead title="Class & enrolment" subtitle="Where the student will study." sx={{ mt: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required label="Class" value={form.schoolClass.id}
                  onChange={(e) => setField('schoolClass', { id: e.target.value })}
                  error={!!errors.classId} helperText={errors.classId}>
                  <MenuItem value="">Select class</MenuItem>
                  {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth required label="Section"
                  value={form.section.id} disabled={!form.schoolClass.id}
                  onChange={(e) => setField('section', { id: e.target.value })}
                  error={!!errors.sectionId}
                  helperText={errors.sectionId || (!form.schoolClass.id ? 'Pick a class first' : '')}>
                  <MenuItem value="">Select section</MenuItem>
                  {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth required type="date" label="Admission date"
                  InputLabelProps={{ shrink: true }} value={form.admissionDate}
                  onChange={(e) => setField('admissionDate', e.target.value)}
                  error={!!errors.admissionDate} helperText={errors.admissionDate} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Previous school" value={form.previousSchool || ''}
                  onChange={(e) => setField('previousSchool', e.target.value)}
                  helperText="Optional" />
              </Grid>
            </Grid>

            <SectionHead title="Address" subtitle="All address fields are optional." sx={{ mt: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" multiline rows={2}
                  value={form.address || ''}
                  onChange={(e) => setField('address', e.target.value)} />
              </Grid>
              <Grid item xs={6} md={3}><TextField fullWidth label="City" value={form.city || ''}
                onChange={(e) => setField('city', e.target.value)} /></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth label="State" value={form.state || ''}
                onChange={(e) => setField('state', e.target.value)} /></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth label="Country" value={form.country || ''}
                onChange={(e) => setField('country', e.target.value)} /></Grid>
              <Grid item xs={6} md={3}><TextField fullWidth label="Postal code" value={form.postalCode || ''}
                onChange={(e) => setField('postalCode', e.target.value.toUpperCase())} /></Grid>
            </Grid>
          </>
        )}

        {/* STEP 3 — Family & emergency */}
        {step === 2 && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Father and Mother are <strong>optional</strong> (each needs name + occupation if filled).
              Guardian is also optional but unlocks <strong>parent-portal login</strong> — fill all four fields if you want
              the family to log in. Emergency contact is <strong>required</strong>.
            </Alert>

            {/* Father */}
            <SectionHead title="Father (optional)"
              subtitle="Skip if not applicable. Both name and occupation are required if you fill this section." />
            {parents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <ParentPicker
                  parents={parents.filter((p) => !p.parentType || p.parentType === 'FATHER')}
                  label="Or pick an existing father from your records"
                  onPick={(p) => fillParentFromExisting('fatherInfo', p)}
                />
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name"
                  value={form.parentInfo.fatherInfo?.name || ''}
                  onChange={(e) => setParent('fatherInfo', 'name', e.target.value)}
                  error={!!errors.fatherName} helperText={errors.fatherName} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Occupation"
                  value={form.parentInfo.fatherInfo?.occupation || ''}
                  onChange={(e) => setParent('fatherInfo', 'occupation', e.target.value)}
                  error={!!errors.fatherOccupation} helperText={errors.fatherOccupation} />
              </Grid>
            </Grid>

            {/* Mother */}
            <SectionHead title="Mother (optional)"
              subtitle="Skip if not applicable. Both fields are required if filled."
              sx={{ mt: 3 }} />
            {parents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <ParentPicker
                  parents={parents.filter((p) => !p.parentType || p.parentType === 'MOTHER')}
                  label="Or pick an existing mother from your records"
                  onPick={(p) => fillParentFromExisting('motherInfo', p)}
                />
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name"
                  value={form.parentInfo.motherInfo?.name || ''}
                  onChange={(e) => setParent('motherInfo', 'name', e.target.value)}
                  error={!!errors.motherName} helperText={errors.motherName} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Occupation"
                  value={form.parentInfo.motherInfo?.occupation || ''}
                  onChange={(e) => setParent('motherInfo', 'occupation', e.target.value)}
                  error={!!errors.motherOccupation} helperText={errors.motherOccupation} />
              </Grid>
            </Grid>

            {/* Guardian — portal access */}
            <SectionHead title="Guardian (recommended — enables parent-portal login)"
              subtitle="Fill all four fields if the family should be able to log in to the parent portal. Leave blank to skip."
              sx={{ mt: 3 }} />
            {parents.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <ParentPicker
                  parents={parents.filter((p) => !p.parentType || p.parentType === 'GUARDIAN')}
                  label="Or pick an existing guardian from your records"
                  onPick={(p) => fillParentFromExisting('guardianInfo', p)}
                />
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Name"
                  value={form.parentInfo.guardianInfo?.name || ''}
                  onChange={(e) => setParent('guardianInfo', 'name', e.target.value)}
                  error={!!errors.guardianName} helperText={errors.guardianName} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Occupation"
                  value={form.parentInfo.guardianInfo?.occupation || ''}
                  onChange={(e) => setParent('guardianInfo', 'occupation', e.target.value)}
                  error={!!errors.guardianOccupation} helperText={errors.guardianOccupation} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="email" label="Email"
                  value={form.parentInfo.guardianInfo?.email || ''}
                  onChange={(e) => setParent('guardianInfo', 'email', e.target.value.toLowerCase().trim())}
                  error={!!errors.guardianEmail}
                  helperText={errors.guardianEmail || 'Login username for the parent portal'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone"
                  value={form.parentInfo.guardianInfo?.phone || ''}
                  onChange={(e) => setParent('guardianInfo', 'phone', e.target.value.replace(/\D/g, ''))}
                  error={!!errors.guardianPhone}
                  helperText={errors.guardianPhone || '10 digits'}
                  inputProps={{ maxLength: 10 }} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <SectionHead
              title="Emergency contact"
              subtitle="Required. School staff will call this number in an emergency."
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth required label="Name"
                value={form.emergencyContact.name}
                onChange={(e) => setField('emergencyContact', { ...form.emergencyContact, name: e.target.value })}
                error={!!errors.emName} helperText={errors.emName} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth required label="Relation"
                value={form.emergencyContact.relation}
                placeholder="Father · Uncle · Guardian"
                onChange={(e) => setField('emergencyContact', { ...form.emergencyContact, relation: e.target.value })}
                error={!!errors.emRel} helperText={errors.emRel} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth required label="Phone"
                value={form.emergencyContact.phone}
                onChange={(e) => setField('emergencyContact', { ...form.emergencyContact, phone: e.target.value.replace(/\D/g, '') })}
                error={!!errors.emPhone} helperText={errors.emPhone || '10 digits'}
                inputProps={{ maxLength: 10 }} /></Grid>
            </Grid>
          </>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button startIcon={<ArrowBack />} onClick={back} disabled={step === 0 || submitting}>Back</Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label={`Step ${step + 1} of ${STEPS.length}`} size="small" variant="outlined" />
            <Button variant="contained" endIcon={isLast ? undefined : <ArrowForward />}
              onClick={next} disabled={submitting}
              sx={{
                minWidth: 160, textTransform: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 8px 24px -8px rgba(37,99,235,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' },
              }}>
              {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : isLast ? 'Enroll student' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function ParentPicker({ parents, label, onPick }: {
  parents: ParentResponse[];
  label: string;
  onPick: (p: ParentResponse | null) => void;
}) {
  return (
    <Autocomplete
      size="small"
      options={parents}
      getOptionLabel={(p) =>
        `${[p.firstname, p.middlename, p.lastname].filter(Boolean).join(' ')}${p.phone ? ` · ${p.phone}` : ''}`
      }
      isOptionEqualToValue={(o, v) => o.parentId === v.parentId}
      onChange={(_, v) => onPick(v)}
      renderInput={(params) => (
        <TextField {...params} label={label}
          helperText="Selecting copies their name, phone & email into the fields below — you can still edit them" />
      )}
    />
  );
}

function SectionHead({ title, subtitle, required, sx }: {
  title: string; subtitle?: string; required?: boolean; sx?: object;
}) {
  return (
    <Box sx={{ mb: 1.5, ...sx }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
        {required && <span style={{ color: '#ef4444' }}> *</span>}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  );
}
