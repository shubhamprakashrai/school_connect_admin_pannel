import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Badge,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Teacher, TeacherFilterOptions } from './types/teacher.types';
import { teacherAPI } from './api/teacherAPI';

const TeacherList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Partial<TeacherFilterOptions>>({
    status: 'Active',
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  // Fetch teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getTeachers({
        ...filters,
        searchTerm: searchTerm || undefined,
        page: page + 1,
        limit: rowsPerPage,
      });
      setTeachers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Handle error (e.g., show toast)
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, filters, searchTerm]);

  // Handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (key: keyof TeacherFilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, teacher: Teacher) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeacher(teacher);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeacher(null);
  };

  const handleView = (id: string) => {
    navigate(`/dashboard/teachers/${id}`);
    handleMenuClose();
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/teachers/${id}/edit`);
    handleMenuClose();
  };

  const handleDeleteClick = (id: string) => {
    setTeacherToDelete(id);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete) return;
    
    try {
      await teacherAPI.deleteTeacher(teacherToDelete);
      // Show success message
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      // Handle error
    } finally {
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      // Get filtered teachers data (not used directly but ensures filters are applied on the server)
      await teacherAPI.getTeachers({
        ...filters,
        searchTerm: searchTerm || undefined,
      });
      
      // Export with the specified format
      const blob = await teacherAPI.exportTeachers(format);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting teachers:', error);
      // Handle error
    }
  };

  // Mock data for demonstration
  const mockTeachers: Teacher[] = [
    {
      id: '1',
      teacherId: 'TCH001',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      alternatePhone: '+1987654321',
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
      profilePhoto: 'https://i.pravatar.cc/150?img=1',
      documents: [],
      createdAt: '2020-01-15T10:00:00Z',
      updatedAt: '2023-01-15T10:00:00Z'
    },
    // Add more mock data as needed
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">
          Teachers
          <Chip
            label={`${total} ${total === 1 ? 'Teacher' : 'Teachers'}`}
            color="primary"
            size="small"
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('csv')}
            disabled={loading}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('excel')}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/teachers/add')}
          >
            Add Teacher
          </Button>
        </Box>
      </Box>

      {/* Search & Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search by name, ID, or email..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Experience</InputLabel>
            <Select
              value={filters.experienceMin || ''}
              onChange={(e) => handleFilterChange('experienceMin', e.target.value || undefined)}
              label="Experience"
            >
              <MenuItem value="">Any Experience</MenuItem>
              <MenuItem value="1">1+ years</MenuItem>
              <MenuItem value="5">5+ years</MenuItem>
              <MenuItem value="10">10+ years</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => { /* Open advanced filters */ }}
          >
            More Filters
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTeachers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Teachers Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Teacher ID</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell>Classes</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <TableRow hover key={teacher.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          color={teacher.status === 'Active' ? 'success' : 'error'}
                        >
                          <Avatar 
                            src={teacher.profilePhoto} 
                            alt={teacher.fullName}
                            sx={{ width: 40, height: 40 }}
                          />
                        </Badge>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {teacher.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {teacher.qualification}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{teacher.teacherId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{teacher.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {teacher.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {teacher.specialization.slice(0, 2).map((subject) => (
                          <Chip
                            key={subject}
                            label={subject}
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                        {teacher.specialization.length > 2 && (
                          <Tooltip title={teacher.specialization.slice(2).join(', ')}>
                            <Chip
                              label={`+${teacher.specialization.length - 2}`}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {teacher.assignedClasses.map((cls) => (
                          <Chip
                            key={cls}
                            label={cls}
                            size="small"
                            color={teacher.isClassTeacher ? 'primary' : 'default'}
                            variant={teacher.isClassTeacher ? 'filled' : 'outlined'}
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {teacher.experience} {teacher.experience === 1 ? 'year' : 'years'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={teacher.status}
                        size="small"
                        color={teacher.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ 
                          minWidth: 80,
                          fontWeight: 'medium',
                          backgroundColor: teacher.status === 'Active' 
                            ? alpha(theme.palette.success.main, 0.1) 
                            : 'transparent'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Actions">
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, teacher)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No teachers found. Try adjusting your search or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-toolbar': {
              minHeight: 56,
            },
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: 160 } }}
      >
        <MenuItem onClick={() => selectedTeacher && handleView(selectedTeacher.id)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedTeacher && handleEdit(selectedTeacher.id)}>
          <EditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => selectedTeacher && handleDeleteClick(selectedTeacher.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Teacher</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this teacher? This action cannot be undone.
            {selectedTeacher?.isClassTeacher && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Warning: This teacher is assigned as a class teacher. Deleting will remove this assignment.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherList;
