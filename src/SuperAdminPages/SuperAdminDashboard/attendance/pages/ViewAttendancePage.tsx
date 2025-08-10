import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { getStatusBadgeClass } from '../utils/attendanceHelpers';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance';

const ViewAttendancePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getStatusChip = (status: AttendanceStatus) => {
    const statusMap = {
      present: { label: 'Present', color: 'success' as const },
      absent: { label: 'Absent', color: 'error' as const },
      leave: { label: 'On Leave', color: 'warning' as const }
    };
    
    const statusInfo = statusMap[status] || { label: 'Unknown', color: 'default' as const };
    
    return (
      <Chip 
        label={statusInfo.label} 
        color={statusInfo.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Attendance Details
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/attendance/edit/${attendance.id}`)}
          >
            Edit
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(-1)}
          >
            Back to List
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3} mb={4}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Date</Typography>
            <Typography variant="body1">
              {format(new Date(attendance.date), 'MMMM dd, yyyy')}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Class</Typography>
            <Typography variant="body1">{attendance.class}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Section</Typography>
            <Typography variant="body1">{attendance.section}</Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Total Students</Typography>
            <Typography variant="body1">{attendance.students.length}</Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" gutterBottom>Student Attendance</Typography>
        <TableContainer component={Paper} variant="outlined">
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
                    {getStatusChip(student.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Typography variant="caption" color="textSecondary">
            Last updated: {format(new Date(attendance.updatedAt), 'MMM dd, yyyy hh:mm a')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ViewAttendancePage;
