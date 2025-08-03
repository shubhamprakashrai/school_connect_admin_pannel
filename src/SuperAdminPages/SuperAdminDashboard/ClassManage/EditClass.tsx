import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, TextField, Paper, Typography, Divider,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  IconButton, Chip, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { classAPI } from './classAPI';
import { ClassFormData, TeacherOption, ClassData } from './types';

// Validation Schema
const validationSchema = Yup.object({
  className: Yup.string().required('Class name is required'),
  status: Yup.string().required('Status is required'),
  sections: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      name: Yup.string().required('Section name is required'),
      classTeacherId: Yup.string(),
      maxStudents: Yup.number().min(1, 'Must be at least 1').nullable(),
    })
  ).min(1, 'At least one section is required'),
});

const EditClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [initialValues, setInitialValues] = useState<ClassFormData>({
    className: '',
    status: 'Active',
    sections: [{ name: '', classTeacherId: '', maxStudents: undefined }],
  });

  // Fetch class data and teachers
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [classData, teachersData] = await Promise.all([
          classAPI.getClassById(id),
          classAPI.getTeachers()
        ]);
        
        if (classData) {
          const formattedData: ClassFormData = {
            className: classData.className,
            status: classData.status,
            sections: classData.sections.map(section => ({
              id: section.id,
              name: section.name,
              classTeacherId: section.classTeacher?.id || '',
              maxStudents: section.maxStudents
            }))
          };
          setInitialValues(formattedData);
          formik.resetForm({ values: formattedData });
        }
        
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load class data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formik = useFormik<ClassFormData>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!id) return;
      
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

        const updatedValues = {
          ...values,
          sections: processedSections,
        };

        await classAPI.updateClass(id, updatedValues);
        
        setSnackbar({
          open: true,
          message: 'Class updated successfully!',
          severity: 'success',
        });
        
        // Redirect to view page after a short delay
        setTimeout(() => {
          navigate(`/dashboard/classes/${id}`);
        }, 1500);
      } catch (error) {
        console.error('Error updating class:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update class. Please try again.',
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
        <IconButton onClick={() => navigate(`/dashboard/classes/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Edit Class: {initialValues.className}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* Class Name */}
              <Box sx={{ flex: '1 1 300px' }}>
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
                />
              </Box>

              {/* Status */}
              <Box sx={{ flex: '1 1 300px' }}>
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
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: 'flex-start'
                  }}>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <TextField
                        fullWidth
                        label="Section Name"
                        value={section.name}
                        onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                        onBlur={formik.handleBlur}
                        helperText={
                          formik.touched.sections?.[index]?.name &&
                          typeof formik.errors.sections?.[index] === 'object' && 
                          formik.errors.sections?.[index]?.name
                        }
                      />
                    </Box>
                    
                    <Box sx={{ flex: '2 1 300px' }}>
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
                    </Box>
                    
                    <Box sx={{ flex: '1 1 200px' }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Students (Optional)"
                        value={section.maxStudents || ''}
                        onChange={(e) => handleSectionChange(index, 'maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                        onBlur={formik.handleBlur}
                        error={
                          !!(formik.touched.sections?.[index] as any)?.maxStudents &&
                          !!(formik.errors.sections?.[index] as any)?.maxStudents
                        }
                        helperText={
                          (formik.touched.sections?.[index] as any)?.maxStudents &&
                          (formik.errors.sections?.[index] as any)?.maxStudents
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      flex: '0 0 auto',
                      width: { xs: '100%', sm: 'auto' },
                      mt: { xs: 1, sm: 0 }
                    }}>
                      {formik.values.sections.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveSection(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
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
                  onClick={() => navigate(`/dashboard/classes/${id}`)}
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Box>
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

export default EditClass;
