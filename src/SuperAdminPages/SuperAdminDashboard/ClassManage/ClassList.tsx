import React, { useState, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
  Chip, TablePagination, Typography, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ViewIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import classAPI, { Teacher } from './classAPI';
import { ClassData, ClassSection } from './types';

const ClassList: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState<{
    status: string;
    classTeacherId: string;
    searchQuery: string;
  }>({
    status: '',
    classTeacherId: '',
    searchQuery: ''
  });
  const [teachers, setTeachers] = useState<{id: string; name: string}[]>([]);

  // Sample static data for classes with all required fields
  const sampleClasses: ClassData[] = [
    {
      id: '1',
      className: 'Class 1',
      status: 'Active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      sections: [
        {
          id: 'sec1',
          name: 'A',
          classTeacher: { id: 't1', name: 'John Doe' },
          studentCount: 25,
          maxStudents: 30
        },
        {
          id: 'sec2',
          name: 'B',
          classTeacher: { id: 't2', name: 'Jane Smith' },
          studentCount: 22,
          maxStudents: 30
        }
      ]
    },
    {
      id: '2',
      className: 'Class 2',
      status: 'Active',
      createdAt: '2023-01-15T00:00:00.000Z',
      updatedAt: '2023-01-15T00:00:00.000Z',
      sections: [
        {
          id: 'sec3',
          name: 'A',
          classTeacher: { id: 't3', name: 'Robert Johnson' },
          studentCount: 28,
          maxStudents: 35
        }
      ]
    },
    {
      id: '3',
      className: 'Class 3',
      status: 'Inactive',
      createdAt: '2023-02-01T00:00:00.000Z',
      updatedAt: '2023-02-15T00:00:00.000Z',
      sections: [
        {
          id: 'sec4',
          name: 'A',
          classTeacher: { id: 't4', name: 'Emily Davis' },
          studentCount: 20,
          maxStudents: 25
        },
        {
          id: 'sec5',
          name: 'B',
          classTeacher: { id: 't5', name: 'Michael Brown' },
          studentCount: 18,
          maxStudents: 25
        }
      ]
    }
  ];

  // Extract unique teachers from the sample data
  const sampleTeachers = Array.from(
    new Map(
      sampleClasses
        .flatMap(cls => 
          cls.sections
            .filter((section): section is ClassSection & { classTeacher: Teacher } => 
              Boolean(section.classTeacher)
            )
            .map(section => [section.classTeacher.id, section.classTeacher] as const)
        )
    ).values()
  );

  // Set initial data
  useEffect(() => {
    setClasses(sampleClasses);
    setTeachers(sampleTeachers);
  }, []);

  // Apply filters
  useEffect(() => {
    let filteredClasses = [...sampleClasses];
    
    if (filters.status) {
      filteredClasses = filteredClasses.filter(cls => cls.status === filters.status);
    }
    
    if (filters.classTeacherId) {
      filteredClasses = filteredClasses.filter(cls => 
        cls.sections.some(section => section.classTeacher?.id === filters.classTeacherId)
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredClasses = filteredClasses.filter(cls => 
        cls.className.toLowerCase().includes(query) ||
        cls.sections.some(section => section.name.toLowerCase().includes(query))
      );
    }
    
    setClasses(filteredClasses);
  }, [filters]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await classAPI.deleteClass(id);
        setClasses(prev => prev.filter(cls => cls.id !== id));
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };
  const handleSectionDelete = (classId: string, sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
  
    setClasses(prev =>
      prev.map(cls =>
        cls.id === classId
          ? {
              ...cls,
              sections: cls.sections.filter(section => section.id !== sectionId)
            }
          : cls
      )
    );
  };
  
  

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - classes.length) : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">Class Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/classes/add')}
        >
          Add New Class
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Classes"
            variant="outlined"
            size="small"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Class Teacher</InputLabel>
            <Select
              name="classTeacherId"
              value={filters.classTeacherId}
              onChange={handleFilterChange}
              label="Class Teacher"
            >
              <MenuItem value="">All Teachers</MenuItem>
              {teachers.map(teacher => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Class Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="class table">
            <TableHead>
              <TableRow>
                <TableCell>Class Name</TableCell>
                <TableCell>Sections</TableCell>
                <TableCell>Class Teachers</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                classes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cls) => (
                    <TableRow hover key={cls.id}>
                      <TableCell>{cls.className}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {cls.sections.map(section => (
                            <Chip
                              key={section.id}
                              label={section.name}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {cls.sections.map(section => (
                            <Box key={section.id}>
                              {section.classTeacher ? (
                                <Chip
                                  label={section.classTeacher.name}
                                  size="small"
                                  sx={{ mb: 0.5 }}
                                />
                              ) : (
                                <Chip
                                  label="Not Assigned"
                                  size="small"
                                  variant="outlined"
                                  color="default"
                                  sx={{ mb: 0.5 }}
                                />
                              )}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={cls.status}
                          color={cls.status === 'Active' ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/dashboard/classes/${cls.id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/dashboard/classes/edit/${cls.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(cls.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={classes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ClassList;
