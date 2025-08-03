import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, TextField, Paper, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Grid, IconButton, Chip, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { classAPI } from './classAPI';
import { ClassFormData, TeacherOption } from './types';

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
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Fetch teachers for dropdown
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await classAPI.getTeachers();
        setTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load teachers',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const formik = useFormik<ClassFormData>({
    initialValues: {
      className: '',
      status: 'Active',
      sections: [
        { name: '', classTeacherId: '', maxStudents: undefined }
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // Filter out empty section names
        const processedSections = values.sections
          .filter(section => section.name.trim() !== '')
          .map(section => ({
            ...section,
            name: section.name.trim(),
            maxStudents: section.maxStudents || undefined,
          }));

        if (processedSections.length === 0) {
          formik.setFieldError('sections', 'At least one section is required');
          return;
        }

        const newValues = {
          ...values,
          sections: processedSections,
        };

        await classAPI.createClass(newValues);
        
        setSnackbar({
          open: true,
          message: 'Class created successfully!',
          severity: 'success',
        });
        
        // Redirect to class list after a short delay
        setTimeout(() => {
          navigate('/dashboard/classes');
        }, 1500);
      } catch (error) {
        console.error('Error creating class:', error);
        setSnackbar({
          open: true,
          message: 'Failed to create class. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddSection = () => {
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      { name: '', classTeacherId: '', maxStudents: undefined },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (formik.values.sections.length <= 1) return;
    
    const newSections = [...formik.values.sections];
    newSections.splice(index, 1);
    formik.setFieldValue('sections', newSections);
  };

  const handleSectionChange = (index: number, field: string, value: any) => {
    const newSections = [...formik.values.sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value === '' ? undefined : value,
    };
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

  return (
    <Box sx={{ p: 3 }}>
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
          <Grid container spacing={3}>
            {/* Class Name */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
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
            </Grid>

            {/* Sections */}
            <Grid item xs={12}>
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
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Section Name"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.sections?.[index]?.name &&
                          formik.errors.sections?.[index]?.name
                        )}
                        helperText={
                          formik.touched.sections?.[index]?.name &&
                          formik.errors.sections?.[index]?.name
                        }
                        placeholder="e.g., A, B, C"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id={`teacher-${index}-label`}>Class Teacher (Optional)</InputLabel>
                        <Select
                          labelId={`teacher-${index}-label`}
                          value={section.classTeacherId || ''}
                          onChange={(e) => handleSectionChange(index, 'classTeacherId', e.target.value)}
                          label="Class Teacher (Optional)"
                        >
                          <MenuItem value="">
                            <em>Select Teacher</em>
                          </MenuItem>
                          {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Students (Optional)"
                        value={section.maxStudents || ''}
                        onChange={(e) => handleSectionChange(index, 'maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.sections?.[index]?.maxStudents &&
                          formik.errors.sections?.[index]?.maxStudents
                        )}
                        helperText={
                          formik.touched.sections?.[index]?.maxStudents &&
                          formik.errors.sections?.[index]?.maxStudents
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      {formik.values.sections.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveSection(index)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSection}
                sx={{ mt: 1 }}
              >
                Add Another Section
              </Button>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/classes')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </Button>
              </Box>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddClass;
