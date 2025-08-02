import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { studentAPI } from './studentAPI';

interface DeleteStudentModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
}

const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  open,
  onClose,
  studentName,
  studentId
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!studentId) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      await studentAPI.deleteStudent(studentId, deletionReason);
      
      setSuccess(true);
      
      // Redirect to students list after a short delay
      setTimeout(() => {
        navigate('/dashboard/students');
      }, 1500);
      
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (success) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={3}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Student Deleted Successfully
            </Typography>
            <Typography variant="body1">
              {studentName} has been removed from the system.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard/students')}
          >
            Back to Students List
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="delete-student-dialog"
    >
      <DialogTitle id="delete-student-dialog" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center">
          <DeleteIcon color="error" sx={{ mr: 1 }} />
          Delete Student
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={isDeleting}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" gutterBottom>
          You are about to delete <strong>{studentName}</strong> from the system. 
          This action cannot be undone.
        </Typography>
        
        <Box my={2}>
          <Divider />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Please provide a reason for deletion (optional but recommended):
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Enter reason for deletion..."
          value={deletionReason}
          onChange={(e) => setDeletionReason(e.target.value)}
          disabled={isDeleting}
          sx={{ mt: 1 }}
        />
        
        <Box mt={2} p={2} bgcolor="warning.light" borderRadius={1}>
          <Typography variant="body2" color="warning.contrastText">
            <strong>Warning:</strong> This will permanently delete all records associated with this student, 
            including attendance, grades, and other related data.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete Permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteStudentModal;
