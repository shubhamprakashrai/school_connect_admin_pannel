import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Radio, 
  FormControlLabel, 
  RadioGroup, 
  Box, 
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { dummyStudents } from '../data/dummyStudents';
import { classSections } from '../data/dummyStudents';
import { AttendanceStatus, StudentAttendance } from '../types/attendance';
import { initializeStudentAttendance } from '../utils/attendanceHelpers';

const MarkAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [date, setDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Get unique classes
  const classes = Array.from(new Set(classSections.map(cs => cs.className)));
  
  // Get sections based on selected class
  const sections = classSections
    .filter(cs => cs.className === selectedClass)
    .map(cs => cs.section);

  // Filter students based on selected class and section
  useEffect(() => {
    if (selectedClass && selectedSection) {
      const filteredStudents = dummyStudents.filter(
        student => student.class === selectedClass && student.section === selectedSection
      );
      setStudents(initializeStudentAttendance(filteredStudents));
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedSection]);

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedClass(e.target.value);
    setSelectedSection('');
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSection(e.target.value);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.studentId === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedClass || !selectedSection) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    if (students.length === 0) {
      setSnackbar({
        open: true,
        message: 'No students found for the selected class and section',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Get existing records from localStorage
        const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
        
        // Create new attendance record
        const newRecord = {
          id: `att-${Date.now()}`,
          date,
          class: selectedClass,
          section: selectedSection,
          students,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add new record to existing ones
        const updatedRecords = [...existingRecords, newRecord];
        
        // Save to localStorage
        localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
        
        setSnackbar({
          open: true,
          message: 'Attendance marked successfully!',
          severity: 'success'
        });
        
        // Reset form
        setSelectedClass('');
        setSelectedSection('');
        setStudents([]);
        
        // Navigate back to list after a short delay
        setTimeout(() => {
          navigate('/attendance');
        }, 1500);
      } catch (error) {
        console.error('Error saving attendance:', error);
        setSnackbar({
          open: true,
          message: 'Failed to save attendance. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Mark Attendance
        </Typography>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mb={4}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              select
              label="Class"
              value={selectedClass}
              onChange={handleClassChange}
              required
              fullWidth
            >
              <MenuItem value="">Select Class</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Section"
              value={selectedSection}
              onChange={handleSectionChange}
              required
              fullWidth
              disabled={!selectedClass}
            >
              <MenuItem value="">Select Section</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          
          {students.length > 0 && (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="center">
                        <RadioGroup
                          row
                          value={student.status}
                          onChange={(e) =>
                            handleStatusChange(
                              student.studentId,
                              e.target.value as AttendanceStatus
                            )
                          }
                        >
                          <FormControlLabel
                            value="present"
                            control={<Radio size="small" color="success" />}
                            label="Present"
                          />
                          <FormControlLabel
                            value="absent"
                            control={<Radio size="small" color="error" />}
                            label="Absent"
                          />
                          <FormControlLabel
                            value="leave"
                            control={<Radio size="small" color="warning" />}
                            label="Leave"
                          />
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || students.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarkAttendancePage;
