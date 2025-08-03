import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Paper, Typography, Grid, MenuItem, 
  FormControlLabel, Checkbox, Chip, Avatar, IconButton, Divider,
  FormHelperText, FormControl, InputLabel, Select, SelectChangeEvent,
  CircularProgress, Alert, Snackbar
} from '@mui/material';
import { 
  Save as SaveIcon, Cancel as CancelIcon, AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon, Close as CloseIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { StudentFormData, studentAPI } from './studentAPI';

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string().required('Full Name is required'),
  rollNo: Yup.number().required('Roll Number is required').positive('Must be a positive number'),
  class: Yup.string().required('Class is required'),
  section: Yup.string().required('Section is required'),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().required('Date of Birth is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(/^[0-9]{10,15}$/, 'Phone number is not valid'),
  parentName: Yup.string().required("Parent's Name is required"),
  parentPhone: Yup.string().required("Parent's Phone is required").matches(/^[0-9]{10,15}$/, 'Phone number is not valid'),
  parentEmail: Yup.string().email('Invalid email address'),
  admissionDate: Yup.date().required('Admission Date is required'),
  address: Yup.string().required('Address is required'),
  status: Yup.string().required('Status is required'),
  transportOpted: Yup.boolean(),
  hostelOpted: Yup.boolean(),
  tags: Yup.array().of(Yup.string())
});

const EditStudentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Load student data and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const classesData = await studentAPI.getClasses();
        const studentData = await studentAPI.getStudentById(id);
        
        formik.setValues({
          name: studentData.name,
          rollNo: studentData.rollNo,
          class: studentData.class,
          section: studentData.section,
          gender: studentData.gender,
          dateOfBirth: studentData.dateOfBirth.split('T')[0],
          email: studentData.email,
          phone: studentData.phone || '',
          parentName: studentData.parentName,
          parentPhone: studentData.parentPhone,
          parentEmail: studentData.parentEmail || '',
          admissionDate: studentData.admissionDate.split('T')[0],
          address: studentData.address,
          status: studentData.status,
          transportOpted: studentData.transportOpted,
          hostelOpted: studentData.hostelOpted,
          tags: studentData.tags || [],
          profilePicture: null
        });
        
        if (studentData.avatar) setImagePreview(studentData.avatar);
        const sectionsData = await studentAPI.getSections(studentData.class);
        
        setClasses(classesData);
        setSections(sectionsData);
        
      } catch (err) {
        setError('Failed to load student data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const loadSections = async (classValue: string) => {
    try {
      const data = await studentAPI.getSections(classValue);
      setSections(data);
    } catch (err) {
      console.error('Failed to load sections', err);
    }
  };

  const formik = useFormik<StudentFormData>({
    initialValues: {
      name: '',
      rollNo: 0,
      class: '',
      section: '',
      gender: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      admissionDate: new Date().toISOString().split('T')[0],
      address: '',
      status: 'Active',
      transportOpted: false,
      hostelOpted: false,
      tags: []
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!id) return;
      
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (key === 'profilePicture' && value) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        if (values.tags?.length) {
          formData.append('tags', JSON.stringify(values.tags));
        }
        
        await studentAPI.updateStudent(id, formData);
        
        setSnackbar({
          open: true,
          message: 'Student updated successfully',
          severity: 'success'
        });
        
        setTimeout(() => navigate(`/dashboard/students/${id}`), 1500);
        
      } catch (err) {
        console.error('Error updating student:', err);
        setSnackbar({
          open: true,
          message: 'Failed to update student',
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setFieldValue('profilePicture', null);
    setImagePreview(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formik.values.tags?.includes(tagInput.trim())) {
      const newTags = [...(formik.values.tags || []), tagInput.trim()];
      formik.setFieldValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = formik.values.tags?.filter(tag => tag !== tagToRemove) || [];
    formik.setFieldValue('tags', newTags);
  };

  const handleClassChange = (e: SelectChangeEvent<string>) => {
    formik.handleChange(e);
    loadSections(e.target.value);
    formik.setFieldValue('section', '');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard/students')}>
          Back to Students
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Edit Student
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Student Photo */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Avatar
                    src={imagePreview || '/default-avatar.png'}
                    alt="Student"
                    sx={{ width: 150, height: 150, mb: 2 }}
                  />
                  {imagePreview && (
                    <IconButton
                      color="error"
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.default' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Button variant="outlined" component="label" startIcon={<AddPhotoIcon />}>
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                <FormHelperText>Max size: 2MB</FormHelperText>
              </Box>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Last Updated: {new Date().toLocaleDateString()}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  onClick={() => navigate(`/dashboard/students/${id}/delete`)}
                >
                  Delete Student
                </Button>
              </Box>
            </Grid>
            
            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="rollNo"
                    name="rollNo"
                    label="Roll Number"
                    type="number"
                    value={formik.values.rollNo || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.rollNo && Boolean(formik.errors.rollNo)}
                    helperText={formik.touched.rollNo && formik.errors.rollNo}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.class && Boolean(formik.errors.class)}>
                    <InputLabel id="class-label">Class</InputLabel>
                    <Select
                      labelId="class-label"
                      id="class"
                      name="class"
                      value={formik.values.class}
                      onChange={handleClassChange}
                      onBlur={formik.handleBlur}
                      label="Class"
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.class && formik.errors.class && (
                      <FormHelperText>{formik.errors.class}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.section && Boolean(formik.errors.section)}>
                    <InputLabel id="section-label">Section</InputLabel>
                    <Select
                      labelId="section-label"
                      id="section"
                      name="section"
                      value={formik.values.section}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Section"
                      disabled={!formik.values.class}
                    >
                      {sections.map((sec) => (
                        <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                      ))}
                    </Select>
                    {formik.touched.section && formik.errors.section && (
                      <FormHelperText>{formik.errors.section}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender"
                      name="gender"
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <FormHelperText>{formik.errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    id="admissionDate"
                    name="admissionDate"
                    label="Admission Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.admissionDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.admissionDate && Boolean(formik.errors.admissionDate)}
                    helperText={formik.touched.admissionDate && formik.errors.admissionDate}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                      <MenuItem value="Graduated">Graduated</MenuItem>
                      <MenuItem value="Transferred">Transferred</MenuItem>
                    </Select>
                    {formik.touched.status && formik.errors.status && (
                      <FormHelperText>{formik.errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Contact Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={(formik.touched.phone && formik.errors.phone) || 'Optional'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Address"
                    multiline
                    rows={3}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Grid>
                
                {/* Parent/Guardian Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Parent/Guardian Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    id="parentName"
                    name="parentName"
                    label="Parent/Guardian Name"
                    value={formik.values.parentName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parentName && Boolean(formik.errors.parentName)}
                    helperText={formik.touched.parentName && formik.errors.parentName}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    id="parentPhone"
                    name="parentPhone"
                    label="Parent/Guardian Phone"
                    value={formik.values.parentPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
                    helperText={formik.touched.parentPhone && formik.errors.parentPhone}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    id="parentEmail"
                    name="parentEmail"
                    label="Parent/Guardian Email"
                    type="email"
                    value={formik.values.parentEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parentEmail && Boolean(formik.errors.parentEmail)}
                    helperText={(formik.touched.parentEmail && formik.errors.parentEmail) || 'Optional'}
                  />
                </Grid>
                
                {/* Additional Options */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Additional Options
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.transportOpted}
                        onChange={formik.handleChange}
                        name="transportOpted"
                        color="primary"
                      />
                    }
                    label="Opted for Transport"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.hostelOpted}
                        onChange={formik.handleChange}
                        name="hostelOpted"
                        color="primary"
                      />
                    }
                    label="Opted for Hostel"
                  />
                </Grid>
                
                {/* Tags */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {formik.values.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag and press Enter"
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>
                
                {/* Form Actions */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate(-1)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditStudentForm;
