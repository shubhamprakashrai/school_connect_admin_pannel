import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Divider, Button, Grid, Card, CardContent,
  Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, CircularProgress
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon, People as PeopleIcon } from '@mui/icons-material';
import { classAPI } from './classAPI';
import { ClassData } from './types';

const ViewClass: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await classAPI.getClassById(id);
        if (data) {
          setClassData(data);
        } else {
          setError('Class not found');
        }
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError('Failed to load class data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !classData) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error" gutterBottom>{error || 'Class not found'}</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard/classes')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/dashboard/classes')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {classData.className} - Class Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/dashboard/classes/edit/${classData.id}`)}
        >
          Edit Class
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Class Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Class Overview</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Class Name"
                    secondary={classData.className}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={classData.status}
                        color={classData.status === 'Active' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Sections"
                    secondary={classData.sections.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Students"
                    secondary={classData.sections.reduce((sum, section) => sum + (section.studentCount || 0), 0)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Created On"
                    secondary={new Date(classData.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(classData.updatedAt).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sections */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Sections</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {classData.sections.map((section, index) => (
                  <Grid item xs={12} sm={6} key={section.id}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          Section {section.name}
                        </Typography>
                        <Chip
                          label={`${section.studentCount || 0} students`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <PeopleIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Class Teacher"
                            secondary={section.classTeacher?.name || 'Not assigned'}
                            secondaryTypographyProps={{
                              color: section.classTeacher ? 'text.primary' : 'text.secondary',
                              fontWeight: section.classTeacher ? 500 : 'normal'
                            }}
                          />
                        </ListItem>
                        
                        <ListItem>
                          <ListItemText
                            primary="Max Students"
                            secondary={section.maxStudents ? section.maxStudents : 'No limit'}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ pt: 2, pb: 0 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            onClick={() => navigate(`/dashboard/classes/${classData.id}/section/${section.id}/students`)}
                          >
                            View Students
                          </Button>
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
          
          {/* Future Features Placeholder */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Subjects (Coming Soon)</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color="textSecondary" variant="body2">
                Subject management for this class will be available in a future update.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard/classes')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Classes
        </Button>
      </Box>
    </Box>
  );
};

export default ViewClass;
