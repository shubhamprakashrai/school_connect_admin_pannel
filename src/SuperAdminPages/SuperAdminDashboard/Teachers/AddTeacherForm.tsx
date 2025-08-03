import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  FormHelperText,
  CircularProgress,
  Avatar,
  IconButton
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TeacherFormData } from './types/teacher.types';
import { teacherAPI } from './api/teacherAPI';

// Mock data for select options
const QUALIFICATIONS = [
  'B.Ed',
  'M.Ed',
  'B.Sc',
  'M.Sc',
  'B.A',
  'M.A',
  'Ph.D',
  'Other',
];

// Mock subjects data
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Sanskrit',
  'History',
  'Geography',
  'Political Science',
  'Economics',
  'Business Studies',
  'Accountancy',
  'Computer Science',
  'Physical Education',
];

// Classes and sections constants are currently not in use
// const CLASSES = [
//   'Nursery',
//   'LKG',
//   'UKG',
//   '1',
//   '2',
//   '3',
//   '4',
//   '5',
//   '6',
//   '7',
//   '8',
//   '9',
//   '10',
//   '11',
//   '12',
// ];

// const SECTIONS = ['A', 'B', 'C', 'D'];

// Class sections generation commented out as it's not currently used
// const generateClassSections = () => {
//   const sections: string[] = [];
//   CLASSES.forEach(cls => {
//     SECTIONS.forEach(section => {
//       sections.push(`${cls}-${section}`);
//     });
//   });
//   return sections;
// };
// const CLASS_SECTIONS = generateClassSections();

const AddTeacherForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentPreviews, setDocumentPreviews] = useState<Array<{ file: File; preview: string }>>([]);

  // Form validation schema
  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    alternatePhone: Yup.string().matches(
      /^[0-9]{10}$/,
      'Alternate phone must be 10 digits'
    ),
    dateOfBirth: Yup.date()
      .required('Date of birth is required')
      .max(new Date(), 'Date of birth cannot be in the future'),
    gender: Yup.string().required('Gender is required'),
    qualification: Yup.string().required('Qualification is required'),
    experience: Yup.number()
      .typeError('Experience must be a number')
      .min(0, 'Experience cannot be negative')
      .required('Experience is required'),
    specialization: Yup.array()
      .min(1, 'Select at least one subject')
      .required('Specialization is required'),
    assignedClasses: Yup.array(),
    joiningDate: Yup.date()
      .required('Joining date is required')
      .max(new Date(), 'Joining date cannot be in the future'),
    address: Yup.string().required('Address is required'),
    isClassTeacher: Yup.boolean(),
    transportAssigned: Yup.boolean(),
    hostelAssigned: Yup.boolean(),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  // Formik form
  const formik = useFormik<TeacherFormData>({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      alternatePhone: '',
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
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        const formData = new FormData();
        
        // Append all form fields to formData
        Object.entries(values).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
          } else if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        
        // Append profile photo if exists
        if (values.profilePhotoFile) {
          formData.append('profilePhoto', values.profilePhotoFile);
        }
        
        // Append document files if any
        if (values.documentFiles) {
          Array.from(values.documentFiles).forEach((file, index) => {
            formData.append(`documents[${index}]`, file);
          });
        }
        
        // Call API to create teacher
        await teacherAPI.createTeacher(formData);
        
        // Show success message
        // navigate('/dashboard/teachers');
        console.log('Teacher created successfully');
      } catch (error) {
        console.error('Error creating teacher:', error);
        // Handle error (show error message)
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Handle profile photo change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        formik.setFieldValue('profilePhotoFile', file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document uploads
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setDocumentPreviews(prev => [...prev, ...newFiles]);
      formik.setFieldValue(
        'documentFiles',
        documentPreviews.map(doc => doc.file).concat(Array.from(files))
      );
    }
  };

  // Remove a document
  const handleRemoveDocument = (index: number) => {
    const newPreviews = [...documentPreviews];
    newPreviews.splice(index, 1);
    setDocumentPreviews(newPreviews);
    formik.setFieldValue(
      'documentFiles',
      newPreviews.map(doc => doc.file)
    );
  };

  // Remove profile photo
  const removeImage = () => {
    setImagePreview(null);
    formik.setFieldValue('profilePhotoFile', null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
          Add New Teacher
        </Typography>
        
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            {/* Profile Photo Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={imagePreview || '/default-avatar.png'}
                    alt="Teacher"
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
                <FormHelperText sx={{ fontSize: '0.75rem', mt: 0, color: 'text.secondary' }}>
                  Max size: 2MB (JPG, PNG)
                </FormHelperText>
              </Box>
            </Box>
            
            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <TextField
                      fullWidth
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                      helperText={formik.touched.fullName && formik.errors.fullName}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControl 
                      fullWidth 
                      size="small"
                      error={formik.touched.gender && Boolean(formik.errors.gender)}
                    >
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
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <DatePicker
                      label="Date of Birth"
                      value={formik.values.dateOfBirth ? new Date(formik.values.dateOfBirth) : null}
                      onChange={(date) => {
                        formik.setFieldValue('dateOfBirth', date ? date.toISOString().split('T')[0] : '');
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth),
                          helperText: formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }} />
                </Box>
                
                <Box>
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
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Contact Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
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
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
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
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <TextField
                      fullWidth
                      id="alternatePhone"
                      name="alternatePhone"
                      label="Alternate Phone (Optional)"
                      type="tel"
                      value={formik.values.alternatePhone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.alternatePhone && Boolean(formik.errors.alternatePhone)}
                      helperText={formik.touched.alternatePhone && formik.errors.alternatePhone}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }} />
                </Box>
              </Box>
            </Box>
            
            {/* Academic Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Academic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth size="small" error={formik.touched.qualification && Boolean(formik.errors.qualification)}>
                      <InputLabel id="qualification-label">Highest Qualification</InputLabel>
                      <Select
                        labelId="qualification-label"
                        id="qualification"
                        name="qualification"
                        value={formik.values.qualification}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Highest Qualification"
                      >
                        {QUALIFICATIONS.map((qual) => (
                          <MenuItem key={qual} value={qual}>
                            {qual}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.qualification && formik.errors.qualification && (
                        <FormHelperText>{formik.errors.qualification}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <TextField
                      fullWidth
                      id="experience"
                      name="experience"
                      label="Experience (Years)"
                      type="number"
                      value={formik.values.experience}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.experience && Boolean(formik.errors.experience)}
                      helperText={formik.touched.experience && formik.errors.experience}
                      size="small"
                      InputProps={{
                        inputProps: { min: 0, max: 50 },
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControl fullWidth size="small" error={formik.touched.specialization && Boolean(formik.errors.specialization)}>
                      <InputLabel id="specialization-label">Subjects / Specialization</InputLabel>
                      <Select
                        labelId="specialization-label"
                        id="specialization"
                        name="specialization"
                        multiple
                        value={formik.values.specialization}
                        onChange={(e) => {
                          const value = e.target.value;
                          formik.setFieldValue(
                            'specialization',
                            typeof value === 'string' ? value.split(',') : value
                          );
                        }}
                        onBlur={formik.handleBlur}
                        label="Subjects / Specialization"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {SUBJECTS.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subject}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.specialization && formik.errors.specialization && (
                        <FormHelperText>{formik.errors.specialization}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.isClassTeacher}
                          onChange={formik.handleChange}
                          name="isClassTeacher"
                          color="primary"
                        />
                      }
                      label="Is Class Teacher?"
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.transportAssigned}
                          onChange={formik.handleChange}
                          name="transportAssigned"
                          color="primary"
                        />
                      }
                      label="Transport Assigned"
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.hostelAssigned}
                          onChange={formik.handleChange}
                          name="hostelAssigned"
                          color="primary"
                        />
                      }
                      label="Hostel Assigned"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Documents Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Upload Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleDocumentUpload}
                    accept=".pdf,.doc,.docx,image/*"
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Upload resume, certificates, or other documents (PDF, DOC, JPG, PNG)
                </Typography>
              </Box>
              
              {documentPreviews.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Selected Documents:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {documentPreviews.map((doc, index) => (
                      <Chip
                        key={index}
                        label={doc.file.name}
                        onDelete={() => handleRemoveDocument(index)}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Account Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
                Account Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ flex: 1, minWidth: { md: 'calc(50% - 8px)' } }}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Form Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/dashboard/teachers')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Teacher'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AddTeacherForm;
