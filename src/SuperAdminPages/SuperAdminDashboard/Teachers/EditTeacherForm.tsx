import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, TextField, Typography, Divider, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Chip,
  Avatar, IconButton, Grid, CircularProgress, Snackbar, Alert
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon, Delete as DeleteIcon, Save as SaveIcon,
  Cancel as CancelIcon, Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { teacherAPI, Teacher, TeacherFormData } from './types/teacher.types';

// Mock data for select options
const QUALIFICATIONS = ['B.Ed', 'M.Ed', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Ph.D', 'Other'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];
const CLASS_SECTIONS = Array.from({ length: 12 }, (_, i) => 
  ['A', 'B', 'C', 'D'].map(sec => `${i + 1}-${sec}`)
).flat();

const EditTeacherForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imagePreview, setImagePreview] = useState('');

  // Form validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be 10 digits').required('Required'),
    dateOfBirth: Yup.date().required('Required').max(new Date(), 'Invalid date'),
    gender: Yup.string().required('Required'),
    qualification: Yup.string().required('Required'),
    experience: Yup.number().min(0, 'Must be positive').required('Required'),
    specialization: Yup.array().min(1, 'Select at least one').required('Required'),
    joiningDate: Yup.date().required('Required'),
    address: Yup.string().required('Required'),
  });

  // Formik form
  const formik = useFormik<TeacherFormData>({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      qualification: '',
      experience: 0,
      specialization: [],
      assignedClasses: [],
      joiningDate: new Date().toISOString().split('T')[0],
      address: '',
      isClassTeacher: false,
      transportAssigned: false,
      hostelAssigned: false,
      status: 'Active',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSnackbar({
          open: true,
          message: 'Teacher updated successfully!',
          severity: 'success'
        });
        setTimeout(() => navigate(`/dashboard/teachers/${id}`), 1500);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Update failed. Please try again.',
          severity: 'error'
        });
      }
    },
  });

  // Load teacher data
  useEffect(() => {
    const loadTeacher = async () => {
      try {
        // Mock data
        const mockTeacher: Teacher = {
          id: id || '',
          teacherId: 'TCH001',
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          dateOfBirth: '1985-05-15',
          gender: 'Male',
          qualification: 'M.Sc, B.Ed',
          experience: 10,
          specialization: ['Mathematics', 'Physics'],
          assignedClasses: ['10-A', '12-B'],
          joiningDate: '2020-01-15',
          address: '123 Teacher St',
          isClassTeacher: true,
          transportAssigned: true,
          hostelAssigned: false,
          status: 'Active',
          profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
          createdAt: '2020-01-15T00:00:00Z',
          updatedAt: '2023-01-15T00:00:00Z',
        };
        
        const { id: _, teacherId, profilePhoto, ...formValues } = mockTeacher;
        formik.setValues({
          ...formValues,
          dateOfBirth: formValues.dateOfBirth,
          joiningDate: formValues.joiningDate,
        });
        setImagePreview(profilePhoto || '');
      } catch (error) {
        console.error('Error loading teacher:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        formik.setFieldValue('profilePhotoFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          Edit Teacher
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            {/* Profile Photo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={imagePreview || '/default-avatar.png'}
                  sx={{ width: 120, height: 120, mb: 2, margin: '0 auto' }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoIcon />}
                  size="small"
                >
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </Box>
            </Box>
            
            {/* Personal Information */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Personal Information</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  size="small"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" margin="normal">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formik.values.gender}
                    label="Gender"
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dateOfBirth || null}
                  onChange={(date) => {
                    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
                    formik.setFieldValue('dateOfBirth', formattedDate);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      margin: 'normal',
                      error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                      helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  size="small"
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            {/* Contact Information */}
            <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>Contact Information</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  size="small"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  size="small"
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            {/* Academic Information */}
            <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>Academic Information</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" margin="normal">
                  <InputLabel>Qualification</InputLabel>
                  <Select
                    name="qualification"
                    value={formik.values.qualification}
                    label="Qualification"
                    onChange={formik.handleChange}
                  >
                    {QUALIFICATIONS.map((qual) => (
                      <MenuItem key={qual} value={qual}>{qual}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  name="experience"
                  type="number"
                  value={formik.values.experience}
                  onChange={formik.handleChange}
                  error={formik.touched.experience && Boolean(formik.errors.experience)}
                  helperText={formik.touched.experience && formik.errors.experience}
                  size="small"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth size="small" margin="normal">
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    multiple
                    name="specialization"
                    value={formik.values.specialization}
                    onChange={formik.handleChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {SUBJECTS.map((subject) => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Form Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate(`/dashboard/teachers/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </form>
        </Paper>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default EditTeacherForm;
