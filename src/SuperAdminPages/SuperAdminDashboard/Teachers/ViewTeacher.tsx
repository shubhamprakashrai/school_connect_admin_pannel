import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Grid, Avatar, Divider, Chip, Tabs, Tab,
  Card, CardContent, IconButton, useTheme, List, ListItem, ListItemIcon,
  ListItemText, CircularProgress
} from '@mui/material';
import {
  Edit, ArrowBack, Email, Phone, Cake, Transgender, Work, School, Class,
  Home, CalendarToday, Person, Description, Download, Delete, Add
} from '@mui/icons-material';
import { teacherAPI, Teacher } from './types/teacher.types';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} id={`teacher-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ViewTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  // Mock data for demonstration
  useEffect(() => {
    if (!id) return;
    
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch the teacher data from the API
        // const data = await teacherAPI.getTeacherById(id);
        // setTeacher(data);
        
        // Mock data
        setTimeout(() => {
          setTeacher({
            id: id,
            teacherId: 'TCH001',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            dateOfBirth: '1985-05-15',
            gender: 'Male',
            qualification: 'M.Sc, B.Ed',
            experience: 10,
            specialization: ['Mathematics', 'Physics'],
            assignedClasses: ['10-A', '12-B'],
            joiningDate: '2020-01-15',
            address: '123 Teacher St, Education City',
            isClassTeacher: true,
            transportAssigned: true,
            hostelAssigned: false,
            status: 'Active',
            profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
            documents: [
              { id: 'doc1', name: 'Resume.pdf', type: 'resume', url: '#' },
              { id: 'doc2', name: 'Degree.pdf', type: 'certificate', url: '#' },
            ],
            createdAt: '2020-01-15T00:00:00Z',
            updatedAt: '2023-01-15T00:00:00Z',
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching teacher:', error);
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!teacher) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6">Teacher not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard/teachers')}
          sx={{ mt: 2 }}
        >
          Back to Teachers
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/dashboard/teachers')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1">
            {teacher.fullName}
          </Typography>
          <Chip
            label={teacher.status}
            color={teacher.status === 'Active' ? 'success' : 'default'}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={teacher.profilePhoto}
                alt={teacher.fullName}
                sx={{ width: 150, height: 150, mb: 2, border: `3px solid ${theme.palette.primary.main}` }}
              />
              <Typography variant="h6">{teacher.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {teacher.qualification}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                {teacher.teacherId}
              </Typography>
            </Box>
            
            <Divider />
            
            <List>
              <ListItem>
                <ListItemIcon><Email color="action" /></ListItemIcon>
                <ListItemText primary="Email" secondary={teacher.email} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Phone color="action" /></ListItemIcon>
                <ListItemText primary="Phone" secondary={teacher.phone} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Cake color="action" /></ListItemIcon>
                <ListItemText 
                  primary="Date of Birth" 
                  secondary={format(new Date(teacher.dateOfBirth), 'MMMM d, yyyy')} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Transgender color="action" /></ListItemIcon>
                <ListItemText primary="Gender" secondary={teacher.gender} />
              </ListItem>
              <ListItem>
                <ListItemIcon><Work color="action" /></ListItemIcon>
                <ListItemText 
                  primary="Experience" 
                  secondary={`${teacher.experience} ${teacher.experience === 1 ? 'year' : 'years'}`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                <ListItemText 
                  primary="Joining Date" 
                  secondary={format(new Date(teacher.joiningDate), 'MMMM d, yyyy')} 
                />
              </ListItem>
            </List>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Documents" />
            <Tab label="Classes" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Address</Typography>
                <Typography variant="body1">{teacher.address}</Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Specialization</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {teacher.specialization.map((subject, index) => (
                    <Chip key={index} label={subject} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Documents</Typography>
                  <Button variant="outlined" size="small" startIcon={<Add />}>
                    Add Document
                  </Button>
                </Box>
                
                {teacher.documents && teacher.documents.length > 0 ? (
                  <List>
                    {teacher.documents.map((doc) => (
                      <ListItem 
                        key={doc.id} 
                        divider
                        secondaryAction={
                          <Box>
                            <IconButton size="small" sx={{ mr: 1 }}>
                              <Download fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon><Description color="action" /></ListItemIcon>
                        <ListItemText 
                          primary={doc.name}
                          secondary={`Type: ${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No documents uploaded yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Assigned Classes</Typography>
                {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                  <List>
                    {teacher.assignedClasses.map((cls, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon><Class color="action" /></ListItemIcon>
                        <ListItemText 
                          primary={`Class ${cls}`}
                          secondary={
                            teacher.isClassTeacher && teacher.assignedClasses[0] === cls 
                              ? 'Class Teacher' 
                              : 'Subject Teacher'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    No classes assigned yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewTeacher;
