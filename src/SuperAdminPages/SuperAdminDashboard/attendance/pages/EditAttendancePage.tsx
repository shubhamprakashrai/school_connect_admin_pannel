import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { AttendanceRecord, AttendanceStatus, StudentAttendance } from '../types/attendance';
import { getStatusBadgeClass } from '../utils/attendanceHelpers';

const EditAttendancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Load attendance record
  useEffect(() => {
    const fetchAttendance = () => {
      try {
        // Get records from localStorage
        const storedRecords = localStorage.getItem('attendanceRecords');
        const records = storedRecords ? JSON.parse(storedRecords) : [];
        
        // Find the attendance record by ID
        const record = records.find((r: AttendanceRecord) => r.id === id);
        
        if (record) {
          setAttendance(record);
        } else {
          setError('Attendance record not found');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance record');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!attendance) return;
    
    setAttendance({
      ...attendance,
      students: attendance.students.map(student =>
        student.studentId === studentId ? { ...student, status } : student
      ),
      updatedAt: new Date().toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendance) return;
    
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Get existing records from localStorage
        const storedRecords = localStorage.getItem('attendanceRecords');
        const records = storedRecords ? JSON.parse(storedRecords) : [];
        
        // Update the record
        const updatedRecords = records.map((record: AttendanceRecord) =>
          record.id === attendance.id ? attendance : record
        );
        
        // Save back to localStorage
        localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
        
        setSnackbar({
          open: true,
          message: 'Attendance updated successfully!',
          severity: 'success'
        });
        
        // Navigate back to view after a short delay
        setTimeout(() => {
          navigate(`/attendance/view/${attendance.id}`);
        }, 1500);
      } catch (err) {
        console.error('Error updating attendance:', err);
        setSnackbar({
          open: true,
          message: 'Failed to update attendance. Please try again.',
          severity: 'error'
        });
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !attendance) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" color="error">
            {error || 'Attendance record not found'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
          >
            Back to List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Edit Attendance
        </Typography>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mb={4}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(attendance.date), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Class
              </Typography>
              <Typography variant="body1">{attendance.class}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Section
              </Typography>
              <Typography variant="body1">{attendance.section}</Typography>
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom>Student Attendance</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.students.map((student) => (
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
          
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? 'Saving...' : 'Save Changes'}
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

export default EditAttendancePage;
