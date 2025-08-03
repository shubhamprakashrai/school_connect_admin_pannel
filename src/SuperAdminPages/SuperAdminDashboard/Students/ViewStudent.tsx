import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  TextField, // this was missing earlier too
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  DateRange as DateIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Student, StudentFormData } from './types';
import { studentAPI } from './studentAPI';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `student-tab-${index}`,
    'aria-controls': `student-tabpanel-${index}`,
  };
}

const ViewStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await studentAPI.getStudentById(id);
        setStudent(data);
      } catch (err) {
        setError('Failed to load student details');
        console.error('Error fetching student:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    if (student) {
      navigate(`/dashboard/students/${student.id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!student) return;
    
    try {
      await studentAPI.deleteStudent(student.id);
      // Show success message
      navigate('/dashboard/students');
    } catch (err) {
      console.error('Error deleting student:', err);
      // Show error message
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading student details...</Typography>
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error || 'Student not found'}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/dashboard/students')}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/students')}
          sx={{ mr: 2 }}
        >
          Back to Students
        </Button>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Student Profile Header */}
      <Paper sx={{ p: 3, mb: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={student.avatar || '/default-avatar.png'}
              alt={student.name}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Chip
              label={student.status}
              color={student.status === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="textSecondary">
              ID: {student.id}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, mt: { xs: 2, md: 0 } }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {student.name}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              width: '100%',
              flexWrap: 'wrap'
            }}>
              {/* First Column */}
              <Box sx={{ 
                flex: 1,
                minWidth: { sm: '250px' },
                maxWidth: { sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>
                    Class {student.class} - Section {student.section}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>Roll No: {student.rollNo}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>DOB: {formatDate(student.dateOfBirth)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>Gender: {student.gender}</Typography>
                </Box>
              </Box>
              
              {/* Second Column */}
              <Box sx={{ 
                flex: 1,
                minWidth: { sm: '250px' },
                maxWidth: { sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>{student.phone || 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>{student.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateIcon color="action" sx={{ mr: 1, minWidth: 24 }} />
                  <Typography>
                    Admission: {formatDate(student.admissionDate)}
                  </Typography>
                </Box>
              </Box>
              
              {/* Third Column */}
              <Box sx={{ 
                flex: 1,
                minWidth: { sm: '250px' },
                maxWidth: { sm: '100%', md: 'calc(33.33% - 16px)' }
              }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {student.transportOpted && (
                      <Chip 
                        label="Transport" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                    {student.hostelOpted && (
                      <Chip 
                        label="Hostel" 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    )}
                    {student.tags?.map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for detailed information */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="student details tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Contact Information" {...a11yProps(0)} />
          <Tab label="Parent/Guardian" {...a11yProps(1)} />
          <Tab label="Address" {...a11yProps(2)} />
          <Tab label="Documents" {...a11yProps(3)} />
          <Tab label="Activity Log" {...a11yProps(4)} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            width: '100%',
            mb: 3
          }}>
            <Box sx={{ 
              flex: 1,
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone Number" 
                        secondary={student.phone || 'Not provided'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email Address" 
                        secondary={student.email || 'Not provided'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={
                          student.address ? (
                            <Typography component="span" variant="body2" color="text.primary">
                              {student.address}
                            </Typography>
                          ) : 'Not provided'
                        } 
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ 
              flex: 1,
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Academic Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Class" 
                        secondary={`${student.class} - ${student.section}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Roll Number" 
                        secondary={student.rollNo} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Admission Date" 
                        secondary={formatDate(student.admissionDate)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Status" 
                        secondary={
                          <Chip 
                            label={student.status} 
                            size="small" 
                            color={student.status === 'Active' ? 'success' : 'default'}
                          />
                        } 
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            width: '100%',
            mb: 3
          }}>
            <Box sx={{ 
              flex: 1,
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parent/Guardian Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Name" 
                        secondary={student.parentName || 'Not provided'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Phone Number" 
                        secondary={student.parentPhone || 'Not provided'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Email Address" 
                        secondary={student.parentEmail || 'Not provided'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Relationship" 
                        secondary="Parent" // This could be a field in the Student type if needed
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            
            <Box sx={{ 
              flex: 1,
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Contacts
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No additional contacts have been added.
                  </Typography>
                  <Button variant="outlined" size="small">
                    Add Emergency Contact
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              {student.address ? (
                <Box>
                  <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {student.address}
                  </Typography>
                  {/* You could add a map here using a mapping service */}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No address information available.
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Documents</Typography>
                <Button variant="outlined" size="small">
                  Upload Document
                </Button>
              </Box>
              <Typography color="text.secondary">
                No documents have been uploaded for this student.
              </Typography>
              {/* Document list would go here */}
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Log
              </Typography>
              <Typography color="text.secondary">
                No recent activity to display.
              </Typography>
              {/* Activity log items would go here */}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Student
        </DialogTitle>
        <Box position="absolute" top={8} right={8}>
          <IconButton size="small" onClick={handleCloseDeleteDialog}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {student.name}? This action cannot be undone.
            <br />
            <strong>Student ID:</strong> {student.id}
            <br />
            <br />
            <strong>Note:</strong> This will permanently remove all records associated with this student.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="delete-reason"
            label="Reason for deletion (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewStudent;
