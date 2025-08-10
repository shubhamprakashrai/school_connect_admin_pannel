import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import { format } from 'date-fns';
import AttendanceList from '../components/AttendanceList';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { dummyAttendanceRecords } from '../data/dummyAttendanceData';
import { classSections } from '../data/dummyStudents';
import { AttendanceRecord } from '../types/attendance';

const AttendanceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [filters, setFilters] = useState({
    classFilter: '',
    sectionFilter: '',
    dateFilter: ''
  });

  // Load attendance records from localStorage or use dummy data
  useEffect(() => {
    const storedRecords = localStorage.getItem('attendanceRecords');
    if (storedRecords) {
      setAttendanceRecords(JSON.parse(storedRecords));
    } else {
      setAttendanceRecords(dummyAttendanceRecords);
      localStorage.setItem('attendanceRecords', JSON.stringify(dummyAttendanceRecords));
    }
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    
    const updatedRecords = attendanceRecords.filter(record => record.id !== deleteId);
    setAttendanceRecords(updatedRecords);
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
    
    setSnackbar({
      open: true,
      message: 'Attendance record deleted successfully',
      severity: 'success'
    });
    
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFilterChange = (newFilters: {
    classFilter: string;
    sectionFilter: string;
    dateFilter: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <h1>Attendance Management</h1>
      </Box>
      
      <AttendanceList
        attendanceRecords={attendanceRecords}
        onDelete={handleDeleteClick}
        classSections={classSections}
        onFilterChange={handleFilterChange}
        filters={filters}
      />
      
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        confirmText="Delete Record"
      />
      
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

export default AttendanceListPage;
