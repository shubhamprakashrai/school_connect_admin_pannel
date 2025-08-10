import React from 'react';
import { Drawer, Typography, Divider, Box, Button, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Subject, SubjectStatus } from '../types/subject.d';

interface SubjectDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  subject: Subject | null;
}

const SubjectDetailsDrawer: React.FC<SubjectDetailsDrawerProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  subject,
}) => {
  if (!subject) return null;

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '400px' }, p: 3 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Subject Details
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          color="inherit"
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">Name</Typography>
        <Typography variant="body1">{subject.name}</Typography>
      </Box>
      
      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">Code</Typography>
        <Typography variant="body1">{subject.code}</Typography>
      </Box>
      
      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">Type</Typography>
        <Typography variant="body1">{subject.type}</Typography>
      </Box>
      
      <Box mb={2}>
        <Typography variant="subtitle1" color="textSecondary">Status</Typography>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: subject.status === 'Active' as SubjectStatus ? 'success.main' : 'error.main',
              mr: 1,
            }}
          />
          <Typography variant="body1">{subject.status}</Typography>
        </Box>
      </Box>
      
      {subject.description && (
        <Box mb={2}>
          <Typography variant="subtitle1" color="textSecondary">Description</Typography>
          <Typography variant="body2">{subject.description}</Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => subject && onEdit(subject)}
          fullWidth
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => subject && onDelete(subject)}
          fullWidth
        >
          Delete
        </Button>
      </Stack>
    </Drawer>
  );
};

export default SubjectDetailsDrawer;
