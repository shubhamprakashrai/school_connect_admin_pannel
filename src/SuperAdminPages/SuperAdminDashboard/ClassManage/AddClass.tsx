import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { debounce } from 'lodash';


interface Teacher {
  id: string;
  name: string;
  email: string;
}

import {
  Box, Button, TextField, Paper, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  IconButton, Chip, CircularProgress, Snackbar, Alert,
  Autocomplete, useMediaQuery, useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Section {
  name: string;
  classTeacherId?: string;
  maxStudents?: number;
}

interface ClassData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  sections: Section[];
}

type FormValues = {
  className: string;
  status: 'active' | 'inactive';
  sections: Section[];
};

type FormikSectionError = string | undefined | { [key: string]: FormikSectionError };

// Validation Schema
const validationSchema = Yup.object({
  className: Yup.string().required('Class name is required'),
  status: Yup.string().required('Status is required'),
  sections: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Section name is required'),
      classTeacherId: Yup.string(),
      maxStudents: Yup.number().min(1, 'Must be at least 1').nullable(),
    })
  ).min(1, 'At least one section is required'),
});

const AddClass: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setIsSubmitting] = useState(false);
  // Track existing classes for duplicate checking (commented out as not currently used)
  // const [existingClasses] = useState<Set<string>>(new Set());
  const [teacherSearch, setTeacherSearch] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning',
    action: null as React.ReactNode | null,
  });

  // Fetch initial data
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       const [teachersData, classesData] = await Promise.all([
  //         classAPI.getTeachers({}),
  //         classAPI.getClasses()
  //       ]);
        
  //       setTeachers(teachersData || []);
        
  //       // Create a set of existing class names for duplicate checking
  //       // const classNames = new Set<string>();
  //       // if (classesData && Array.isArray(classesData)) {
  //       //   classesData.forEach((cls: { name?: string }) => {
  //       //     if (cls?.name) {
  //       //       classNames.add(cls.name.toLowerCase());
  //       //     }
  //       //   });
  //       // }
  //       // setExistingClasses(classNames);
        
  //     } catch (error) {
  //       console.error('Error fetching initial data:', error);
  //       showSnackbar('Failed to load initial data', 'error');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchInitialData();
  // }, []);
  
  // Debounced teacher search
  const searchTeachers = useMemo(
    () =>
      debounce(async (search: string) => {
        try {
          // const data = await getTeachers({ search });
          // setTeachers(data || []);
        } catch (error) {
          console.error('Error searching teachers:', error);
          setTeachers([]);
        }
      }, 300),
    []
  );
  
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      searchTeachers.cancel();
    };
  }, [searchTeachers]);
  
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning', action?: React.ReactNode) => {
    setSnackbar({
      open: true,
      message,
      severity,
      action: action || null,
    });
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      className: '',
      status: 'active',
      sections: [
        { name: '', classTeacherId: '', maxStudents: undefined }
      ],
    },
    validationSchema,
    validate: (values) => {
      const errors: { sections?: FormikSectionError[] } = {};
      const sectionNames = new Set<string>();
      
      // Check for duplicate section names
      values.sections.forEach((section, index) => {
        if (section.name) {
          if (sectionNames.has(section.name.toLowerCase())) {
            if (!errors.sections) errors.sections = [];
            if (!Array.isArray(errors.sections)) errors.sections = [];
            if (!errors.sections[index]) errors.sections[index] = {};
            (errors.sections[index] as any).name = 'Section name must be unique';
          } else {
            sectionNames.add(section.name.toLowerCase());
          }
        }
      });
      
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setIsSubmitting(true);
        // Filter out empty section names
        const processedSections = values.sections
          .filter(section => section.name.trim() !== '')
          .map(section => ({
            ...section,
            name: section.name.trim().toUpperCase(),
            maxStudents: section.maxStudents || undefined,
          }));

        if (processedSections.length === 0) {
          formik.setFieldError('sections', 'At least one section is required');
          return;
        }

        const newValues = {
          ...values,
          className: values.className.trim(),
          sections: processedSections,
        };

        // const createdClass = await classAPI.createClass(newValues);
        
        // Show success message with created class details
        const successMessage = `Class "${newValues.className}" with ${newValues.sections.length} section(s) created successfully!`;
        
        showSnackbar(
          successMessage,
          'success',
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => {
              // Add another class
              formik.resetForm();
              setSnackbar(prev => ({ ...prev, open: false }));
            }}
          >
            Add Another
          </Button>
        );
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          if (snackbar.open) {
            navigate('/dashboard/classes');
          }
        }, 5000);
        
      } catch (error: any) {
        console.error('Error creating class:', error);
        const errorMessage = error.response?.data?.message || 'Failed to create class. Please try again.';
        showSnackbar(errorMessage, 'error');
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  const handleAddSection = () => {
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      { name: '', classTeacherId: '', maxStudents: undefined },
    ], false);
    
    // Scroll to the newly added section
    setTimeout(() => {
      const sections = document.querySelectorAll('.section-item');
      if (sections.length > 0) {
        sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleRemoveSection = (index: number) => {
    if (formik.values.sections.length <= 1) return;
    
    const newSections = [...formik.values.sections];
    newSections.splice(index, 1);
    formik.setFieldValue('sections', newSections);
  };

  const handleSectionChange = (index: number, field: keyof Section, value: string | number | undefined) => {
    const newSections = [...formik.values.sections];
    const newSection = { ...newSections[index] };
    
    if (field === 'maxStudents' && typeof value === 'string') {
      newSection[field] = value ? parseInt(value, 10) : undefined;
    } else {
      // newSection[field] = value || '';
    }
    
    newSections[index] = newSection;
    formik.setFieldValue('sections', newSections);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && teachers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Get teacher name by ID
  const getTeacherName = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? teacher.name : '';
  };
  
  // Check if a section has errors
  const hasSectionErrors = (index: number) => {
    return Boolean(
      (formik.touched.sections?.[index]?.name && formik.errors.sections?.[index]) ||
      (formik.touched.sections?.[index]?.maxStudents && formik.errors.sections?.[index])
    );
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard/classes')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Add New Class
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 3,
              width: '100%'
            }}>
              {/* Class Name */}
              <Box sx={{
                flex: 1,
                minWidth: isMobile ? '100%' : '50%'
              }}>
                <TextField
                  fullWidth
                  id="className"
                  name="className"
                  label="Class Name"
                  value={formik.values.className}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.className && Boolean(formik.errors.className)}
                  helperText={formik.touched.className && formik.errors.className}
                  placeholder="e.g., Class 1, Grade 2, KG"
                />
              </Box>

              {/* Status */}
              <Box sx={{
                flex: 1,
                minWidth: isMobile ? '100%' : '50%',
                '& .MuiFormControl-root': {
                  width: '100%'
                }
              }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText error>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Sections */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Sections
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {formik.errors.sections && typeof formik.errors.sections === 'string' && (
                <FormHelperText error sx={{ mb: 2 }}>
                  {formik.errors.sections}
                </FormHelperText>
              )}

              {formik.values.sections.map((section, index) => (
                <Box 
                  key={index} 
                  className="section-item"
                  sx={{ 
                    mb: 3, 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: hasSectionErrors(index) ? 'error.main' : 'divider',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 1,
                    },
                    bgcolor: hasSectionErrors(index) ? 'error.light' : 'background.paper',
                  }}
                >
                  <Box sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2,
                    width: '100%',
                    '& > *': {
                      flex: 1,
                      minWidth: isMobile ? '100%' : '30%',
                      '&:last-child': {
                        flex: isMobile ? '1' : '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'flex-end' : 'center',
                      }
                    }
                  }}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Section Name"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.sections?.[index] && 
                          typeof formik.touched.sections[index] === 'object' &&
                          formik.touched.sections[index] !== null &&
                          'name' in formik.touched.sections[index]! &&
                          Boolean(
                            formik.errors.sections?.[index] &&
                            typeof formik.errors.sections[index] === 'object' &&
                            formik.errors.sections[index] !== null &&
                            'name' in formik.errors.sections[index]!
                          )
                        }
                        helperText={
                          formik.touched.sections?.[index] && 
                          typeof formik.touched.sections[index] === 'object' &&
                          formik.touched.sections[index] !== null &&
                          'name' in formik.touched.sections[index]! &&
                          formik.errors.sections?.[index] &&
                          typeof formik.errors.sections[index] === 'object' &&
                          formik.errors.sections[index] !== null &&
                          'name' in formik.errors.sections[index]! &&
                          (formik.errors.sections[index] as any).name
                        }
                        required
                      />
                    </Box>
                    
                    <Box>
                      <FormControl fullWidth>
                        <Autocomplete
                          options={teachers}
                          getOptionLabel={(option) => option.name}
                          value={teachers.find(t => t.id === section.classTeacherId) || null}
                          onChange={(_, newValue) => {
                            handleSectionChange(index, 'classTeacherId', newValue?.id || '');
                          }}
                          inputValue={teacherSearch}
                          onInputChange={(_, newInputValue) => {
                            setTeacherSearch(newInputValue);
                            searchTeachers(newInputValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Class Teacher (Optional)"
                              variant="outlined"
                              placeholder="Search teacher..."
                            />
                          )}
                          renderOption={(props, option) => (
                            <li {...props}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ ml: 1 }}>
                                  <Typography variant="body1">{option.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </li>
                          )}
                          noOptionsText="No teachers found"
                          loading={loading}
                          loadingText="Loading teachers..."
                        />
                      </FormControl>
                    </Box>
                    
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Students (Optional)"
                        value={section.maxStudents || ''}
                        onChange={(e) => handleSectionChange(index, 'maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                        onBlur={formik.handleBlur}
                        error={
                          formik.touched.sections?.[index] && 
                          typeof formik.touched.sections[index] === 'object' &&
                          formik.touched.sections[index] !== null &&
                          'maxStudents' in formik.touched.sections[index]! &&
                          Boolean(
                            formik.errors.sections?.[index] &&
                            typeof formik.errors.sections[index] === 'object' &&
                            formik.errors.sections[index] !== null &&
                            'maxStudents' in formik.errors.sections[index]!
                          )
                        }
                        helperText={
                          formik.touched.sections?.[index] && 
                          typeof formik.touched.sections[index] === 'object' &&
                          formik.touched.sections[index] !== null &&
                          'maxStudents' in formik.touched.sections[index]! &&
                          formik.errors.sections?.[index] &&
                          typeof formik.errors.sections[index] === 'object' &&
                          formik.errors.sections[index] !== null &&
                          'maxStudents' in formik.errors.sections[index]! &&
                          (formik.errors.sections[index] as any).maxStudents
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Box>
                    
                    <Box>
                      {formik.values.sections.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveSection(index)}
                          sx={{ 
                            mt: 1,
                            alignSelf: isMobile ? 'flex-end' : 'center'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 2 }}>
                {formik.values.sections.map((section, idx) => (
                  section.name && (
                    <Chip
                      key={idx}
                      label={`${section.name}${section.classTeacherId ? ` (${getTeacherName(section.classTeacherId)})` : ''}`}
                      onDelete={() => handleRemoveSection(idx)}
                      color={hasSectionErrors(idx) ? 'error' : 'default'}
                      deleteIcon={<CloseIcon />}
                      sx={{ 
                        mb: 1,
                        '& .MuiChip-deleteIcon': {
                          color: hasSectionErrors(idx) ? 'error.main' : 'inherit',
                        },
                      }}
                    />
                  )
                ))}
              </Box>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSection}
                sx={{ mt: 1 }}
                fullWidth={isMobile}
              >
                {formik.values.sections.some(s => !s.name) ? 'Add Section' : 'Add Another Section'}
              </Button>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2, 
                mt: 4,
                flexDirection: isMobile ? 'column' : 'row',
                '& > *': {
                  flex: isMobile ? '1 1 100%' : '0 0 auto',
                  width: isMobile ? '100%' : 'auto'
                }
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/classes')}
                  disabled={loading}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  fullWidth={isMobile}
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'success' ? 5000 : 6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 6 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            boxShadow: 3,
            '& .MuiAlert-message': { 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <WarningIcon fontSize="inherit" />,
            warning: <WarningIcon fontSize="inherit" />,
          }}
          action={snackbar.action}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddClass;
