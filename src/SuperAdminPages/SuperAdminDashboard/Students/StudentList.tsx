import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockStudents = Array.from({ length: 50 }, (_, i) => ({
  id: `STU${1000 + i}`,
  name: `Student ${i + 1}`,
  rollNo: i + 1,
  class: ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5'][Math.floor(Math.random() * 8)],
  section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
  parentContact: `98765${Math.floor(10000 + Math.random() * 90000)}`,
  status: Math.random() > 0.2 ? 'Active' : 'Inactive',
  admissionDate: new Date(2023, 0, Math.floor(Math.random() * 365)).toISOString().split('T')[0],
  avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
}));

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    gender: '',
    status: '',
  });

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, studentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(studentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const handleView = (id: string) => {
    navigate(`/dashboard/students/${id}`);
    handleMenuClose();
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/students/${id}/edit`);
    handleMenuClose();
  };

  const handleDelete = (id: string) => {
    console.log('Delete student:', id);
    handleMenuClose();
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return student[key as keyof typeof student] === value;
    });

    return matchesSearch && matchesFilters;
  });

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const uniqueClasses = [...new Set(mockStudents.map(s => s.class))];
  const uniqueSections = [...new Set(mockStudents.map(s => s.section))];
  const uniqueGenders = [...new Set(mockStudents.map(s => s.gender))];
  const statuses = ['Active', 'Inactive'];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">
          Students
          <Chip
            label={`${filteredStudents.length} ${filteredStudents.length === 1 ? 'Student' : 'Students'}`}
            color="primary"
            size="small"
            sx={{ ml: 2, fontWeight: 'bold' }}
          />
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ExportIcon />} onClick={() => console.log('Export CSV')}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/dashboard/students/add')}>
            Add Student
          </Button>
        </Box>
      </Box>

      {/* Search & Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search by name, ID, or class..."
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

          {[
            { label: 'Class', key: 'class', options: uniqueClasses, placeholder: 'All Classes' },
            { label: 'Section', key: 'section', options: uniqueSections, placeholder: 'All Sections' },
            { label: 'Gender', key: 'gender', options: uniqueGenders, placeholder: 'All Genders' },
            { label: 'Status', key: 'status', options: statuses, placeholder: 'All Status' },
          ].map(({ label, key, options, placeholder }) => (
            <FormControl key={key} size="small" sx={{ minWidth: 140 }}>
              <InputLabel shrink>{label}</InputLabel>
              <Select
                value={filters[key as keyof typeof filters]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                displayEmpty
                renderValue={(selected) => selected || placeholder}
              >
                <MenuItem value="">{placeholder}</MenuItem>
                {options.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </Paper>

      {/* Student Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>ID / Roll No.</TableCell>
                <TableCell>Class / Section</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Parent Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length ? paginatedStudents.map(student => (
                <TableRow hover key={student.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={student.status === 'Active' ? 'success' : 'error'}
                      >
                        <Avatar src={student.avatar} sx={{ width: 36, height: 36 }} />
                      </Badge>
                      <Box>
                        <Typography variant="body2">{student.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.admissionDate}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.id}</Typography>
                    <Typography variant="caption" color="text.secondary">Roll: {student.rollNo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">Class {student.class}</Typography>
                    <Typography variant="caption" color="text.secondary">Section {student.section}</Typography>
                  </TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.parentContact}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      size="small"
                      color={student.status === 'Active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, student.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No students found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: 180 } }}
      >
        <MenuItem onClick={() => selectedStudent && handleView(selectedStudent)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => selectedStudent && handleEdit(selectedStudent)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedStudent && handleDelete(selectedStudent)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StudentList;
