import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Typography, Box, Divider, Chip,
  CircularProgress
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { ClassData } from './types';

interface DeleteClassModalProps {
  open: boolean;
  classData: ClassData | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

const DeleteClassModal: React.FC<DeleteClassModalProps> = ({
  open,
  classData,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const handleDelete = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  if (!classData) return null;

  const totalStudents = classData.sections.reduce(
    (sum, section) => sum + (section.studentCount || 0), 0
  );

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="delete-class-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="delete-class-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="error" />
          <span>Delete Class</span>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" paragraph>
          Are you sure you want to delete the following class? This action cannot be undone.
        </Typography>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {classData.className}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip 
              label={`${classData.sections.length} ${classData.sections.length === 1 ? 'Section' : 'Sections'}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${totalStudents} ${totalStudents === 1 ? 'Student' : 'Students'}`} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
            <Chip 
              label={classData.status} 
              size="small" 
              color={classData.status === 'Active' ? 'success' : 'default'}
              variant="outlined"
            />
          </Box>
          
          {classData.sections.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Sections: {classData.sections.map(s => s.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'error.light', 
          borderRadius: 1,
          color: 'error.contrastText'
        }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Warning
          </Typography>
          <Typography variant="body2">
            Deleting this class will permanently remove all associated sections and student records.
            This action cannot be undone.
          </Typography>
          
          {totalStudents > 0 && (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
              Note: This will affect {totalStudents} enrolled student(s).
            </Typography>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <Box sx={{ width: 20, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} color="inherit" /></Box> : null}
        >
          {loading ? 'Deleting...' : 'Delete Class'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteClassModal;
