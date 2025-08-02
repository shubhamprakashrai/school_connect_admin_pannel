import React, { useState, useEffect } from 'react';


import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography, 
  Grid as MuiGrid,
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Chip, 
  Avatar, 
  IconButton,
  Divider,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  GridTypeMap
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

// Create a properly typed Grid component
type GridProps = {
  item?: boolean;
  container?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  children: React.ReactNode;
  [key: string]: any; // Allow other props
};

const Grid: OverridableComponent<GridTypeMap<{}, 'div'>> & {
  (props: GridProps): JSX.Element;
} = MuiGrid as any;


import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { studentAPI } from './studentAPI';
import { StudentFormData } from './types';

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

const AddStudentForm: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await studentAPI.getClasses();
        setClasses(data);
      } catch (error) {
        console.error('Failed to load classes', error);
      }
    };
    loadClasses();
  }, []);

  // Load sections when class changes
  const loadSections = async (classValue: string) => {
    try {
      const data = await studentAPI.getSections(classValue);
      setSections(data);
    } catch (error) {
      console.error('Failed to load sections', error);
    }
  };

  const formik = useFormik<StudentFormData>({
    initialValues: {
      name: '',
      rollNo: 0,
      class: '',
      section: '',
      gender: 'Male', // Set a default value that matches the type
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
      try {
        setIsSubmitting(true);
        const formData = new FormData();
        
        // Append all form fields to FormData
        Object.entries(values).forEach(([key, value]) => {
          if (key === 'profilePicture' && value) {
            // Handle file upload separately
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            // Convert non-file fields to string
            formData.append(key, String(value));
          }
        });
        
        // Add tags as JSON string
        if (values.tags && values.tags.length > 0) {
          formData.append('tags', JSON.stringify(values.tags));
        }
        
        await studentAPI.createStudent(formData);
        // Show success message
        // navigate('/dashboard/students');
        console.log('Student created successfully');
      } catch (error) {
        console.error('Error creating student:', error);
        // Show error message
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('profilePicture', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
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
    // Clear section when class changes
    formik.setFieldValue('section', '');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 500, color: 'primary.main' }}>
        Add New Student
      </Typography>
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          {/* Student Photo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={imagePreview || '/default-avatar.png'}
                  alt="Student"
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    border: '2px solid',
                    borderColor: 'divider',
                    mb: 2,
                    backgroundColor: 'background.paper'
                  }}
                />
                {imagePreview && (
                  <IconButton
                    color="error"
                    onClick={removeImage}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      boxShadow: 1
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoIcon />}
                size="small"
                sx={{ mb: 1 }}
              >
                Upload Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <FormHelperText sx={{ fontSize: '0.75rem', mt: 0, color: 'text.secondary' }}>Max size: 2MB</FormHelperText>
            </Box>
          </Box>
          
          {/* Form Sections */}
          <Box sx={{ '& > * + *': { mt: 4 } }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
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
                    size="small"
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
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.class && Boolean(formik.errors.class)} size="small">
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
                        <MenuItem key={cls} value={cls}>
                          {cls}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.class && formik.errors.class && (
                      <FormHelperText>{formik.errors.class}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Section Field */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.section && Boolean(formik.errors.section)} size="small">
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
                        <MenuItem key={sec} value={sec}>
                          {sec}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.section && formik.errors.section && (
                      <FormHelperText>{formik.errors.section}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Gender Field */}
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)} size="small">
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
                    </Select>
                    {formik.touched.gender && formik.errors.gender && (
                      <FormHelperText>{formik.errors.gender}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                {/* Date of Birth */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                    helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                    size="small"
                  />
                </Grid>
                
                {/* Status Field */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)} size="small">
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
                    </Select>
                    {formik.touched.status && formik.errors.status && (
                      <FormHelperText>{formik.errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            
            {/* Contact Information Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
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
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
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
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="parentPhone"
                    name="parentPhone"
                    label="Parent/Guardian Phone"
                    type="tel"
                    value={formik.values.parentPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parentPhone && Boolean(formik.errors.parentPhone)}
                    helperText={formik.touched.parentPhone && formik.errors.parentPhone}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="parentEmail"
                    name="parentEmail"
                    label="Parent/Guardian Email (Optional)"
                    type="email"
                    value={formik.values.parentEmail || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.parentEmail && Boolean(formik.errors.parentEmail)}
                    helperText={formik.touched.parentEmail && formik.errors.parentEmail}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="admissionDate"
                    name="admissionDate"
                    label="Admission Date"
                    type="date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={formik.values.admissionDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.admissionDate && Boolean(formik.errors.admissionDate)}
                    helperText={formik.touched.admissionDate && formik.errors.admissionDate}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
            
            {/* Address Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Address
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Full Address"
                    multiline
                    rows={3}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
            
            {/* Additional Information Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.transportOpted}
                        onChange={formik.handleChange}
                        name="transportOpted"
                        color="primary"
                      />
                    }
                    label="Transportation Required"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.hostelOpted}
                        onChange={formik.handleChange}
                        name="hostelOpted"
                        color="primary"
                      />
                    }
                    label="Hostel Facility Required"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Add Tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button 
                          onClick={handleAddTag}
                          variant="outlined"
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          Add
                        </Button>
                      ),
                    }}
                    placeholder="Press Enter or click Add to add tags"
                    size="small"
                  />
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formik.values.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {/* Form Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/dashboard/students')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Student'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddStudentForm;
