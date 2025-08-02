import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, TextField, InputAdornment, Button, IconButton, Chip, Menu, MenuItem,
  Typography, CircularProgress, Tooltip, Fab, Badge, Avatar, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Types
export interface School {
  id: string;
  name: string;
  schoolCode: string;
  board: string;
  city: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  admin: {
    name: string;
    email: string;
  };
}

// Mock data - replace with actual API call
const mockSchools: School[] = [
  {
    id: '1',
    name: 'Delhi Public School',
    schoolCode: 'DPS101',
    board: 'CBSE',
    city: 'New Delhi',
    status: 'Active',
    createdDate: '2023-05-15',
    admin: {
      name: 'Rahul Sharma',
      email: 'admin@dps.com'
    }
  },
  // Add more mock data as needed
];

const SchoolList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [boardFilter, setBoardFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof School; direction: 'asc' | 'desc' }>({
    key: 'createdDate',
    direction: 'desc'
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Fetch schools data (replace with actual API call)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSchools(mockSchools);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort schools
  const filteredSchools = React.useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.schoolCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || school.status === statusFilter;
      const matchesBoard = boardFilter === 'All' || school.board === boardFilter;
      
      return matchesSearch && matchesStatus && matchesBoard;
    }).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [schools, searchTerm, statusFilter, boardFilter, sortConfig]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key: keyof School) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, school: School) => {
    setAnchorEl(event.currentTarget);
    setSelectedSchool(school);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSchool(null);
  };

  const handleViewSchool = (school: School) => {
    // Navigate to school details
    console.log('View school:', school);
  };

  const handleEditSchool = (school: School) => {
    // Navigate to edit school
    console.log('Edit school:', school);
  };

  const handleDeleteSchool = (school: School) => {
    // Handle delete school
    console.log('Delete school:', school);
    handleMenuClose();
  };

  const handleToggleStatus = (school: School) => {
    // Toggle school status
    console.log('Toggle status for school:', school);
    handleMenuClose();
  };

  const handleLoginAsAdmin = (school: School) => {
    // Handle login as admin
    console.log('Login as admin for school:', school);
    handleMenuClose();
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredSchools.length - page * rowsPerPage);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Schools
          <Chip 
            label={`${filteredSchools.length} ${filteredSchools.length === 1 ? 'School' : 'Schools'}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/super-admin/schools/add')}
        >
          Add New School
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name, code or city..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
          
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {['All', 'Active', 'Inactive'].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            select
            label="Board"
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            {['All', 'CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'].map((board) => (
              <MenuItem key={board} value={board}>
                {board}
              </MenuItem>
            ))}
          </TextField>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => {
              // Handle advanced filters
              console.log('Advanced filters');
            }}
          >
            More Filters
          </Button>
        </Box>
      </Paper>

      {/* Schools Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="schools table">
            <TableHead>
              <TableRow>
                <TableCell>School Name</TableCell>
                <TableCell>School Code</TableCell>
                <TableCell>Board</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading schools...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <SchoolIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                      No schools found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                      {searchTerm || statusFilter !== 'All' || boardFilter !== 'All' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Get started by adding a new school'}
                    </Typography>
                    {!searchTerm && statusFilter === 'All' && boardFilter === 'All' && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/super-admin/schools/add')}
                      >
                        Add New School
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchools
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((school) => (
                    <TableRow 
                      key={school.id}
                      hover 
                      sx={{ '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' } }}
                      onClick={() => handleViewSchool(school)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <SchoolIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{school.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{school.city}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{school.schoolCode}</TableCell>
                      <TableCell>{school.board}</TableCell>
                      <TableCell>
                        <Chip 
                          label={school.status} 
                          size="small" 
                          color={school.status === 'Active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(school.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{school.admin.name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {school.admin.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, school);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {!loading && emptyRows > 0 && filteredSchools.length > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredSchools.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSchools.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => selectedSchool && handleViewSchool(selectedSchool)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedSchool && handleEditSchool(selectedSchool)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedSchool && handleToggleStatus(selectedSchool)}>
          {selectedSchool?.status === 'Active' ? (
            <>
              <LockIcon fontSize="small" sx={{ mr: 1 }} />
              Deactivate
            </>
          ) : (
            <>
              <LockOpenIcon fontSize="small" sx={{ mr: 1 }} />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => selectedSchool && handleLoginAsAdmin(selectedSchool)}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          Login as Admin
        </MenuItem>
        <MenuItem 
          onClick={() => selectedSchool && handleDeleteSchool(selectedSchool)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add school"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
        onClick={() => navigate('/super-admin/schools/add')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default SchoolList;
