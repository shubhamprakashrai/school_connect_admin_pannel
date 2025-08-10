import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Box,
  Button,
  Typography
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Visibility as ViewIcon, 
  Delete as DeleteIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { AttendanceRecord } from '../types/attendance';
import { getAttendanceStats, filterAttendanceRecords, sortAttendanceRecords } from '../utils/attendanceHelpers';

export interface AttendanceListProps {
  attendanceRecords: AttendanceRecord[];
  onDelete: (id: string) => void;
  classSections: Array<{ className: string; section: string }>;
  onFilterChange: (filters: { classFilter: string; sectionFilter: string; dateFilter: string }) => void;
  filters: {
    classFilter: string;
    sectionFilter: string;
    dateFilter: string;
  };
}

const AttendanceList: React.FC<AttendanceListProps> = ({
  attendanceRecords,
  onDelete,
  classSections,
  onFilterChange,
  filters
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'class'>('date');
  const [sortAsc, setSortAsc] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Get unique classes and sections for filters
  const classes = useMemo(() => {
    const uniqueClasses = new Set(classSections.map(cs => cs.className));
    return Array.from(uniqueClasses);
  }, [classSections]);

  const sections = useMemo(() => {
    if (!filters.classFilter) return [];
    return classSections
      .filter(cs => cs.className === filters.classFilter)
      .map(cs => cs.section);
  }, [classSections, filters.classFilter]);

  // Apply filters, search, and sorting
  const filteredRecords = useMemo(() => {
    let result = [...attendanceRecords];
    
    // Apply search
    if (searchQuery) {
      result = filterAttendanceRecords(result, { searchQuery });
    }
    
    // Apply filters
    result = filterAttendanceRecords(result, {
      classFilter: filters.classFilter,
      sectionFilter: filters.sectionFilter,
      dateFilter: filters.dateFilter
    });
    
    // Apply sorting
    return sortAttendanceRecords(result, sortBy, sortAsc);
  }, [attendanceRecords, searchQuery, filters, sortBy, sortAsc]);

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column: 'date' | 'class') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  const handleView = (id: string) => {
    navigate(`/attendance/view/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/attendance/edit/${id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleAddNew = () => {
    navigate('/attendance/mark');
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Attendance Records</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddNew}
        >
          Mark Attendance
        </Button>
      </Box>
      
      <Box p={2} display="flex" flexWrap="wrap" gap={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
        
        {showFilters && (
          <Box display="flex" flexWrap="wrap" gap={2} mt={2} width="100%">
            <TextField
              select
              label="Class"
              size="small"
              value={filters.classFilter || ''}
              onChange={(e) => onFilterChange({
                ...filters,
                classFilter: e.target.value,
                sectionFilter: '' // Reset section when class changes
              })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls} value={cls}>
                  {cls}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Section"
              size="small"
              value={filters.sectionFilter || ''}
              onChange={(e) => onFilterChange({
                ...filters,
                sectionFilter: e.target.value
              })}
              disabled={!filters.classFilter}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="">All Sections</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="Date"
              type="date"
              size="small"
              value={filters.dateFilter || ''}
              onChange={(e) => onFilterChange({
                ...filters,
                dateFilter: e.target.value
              })}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        )}
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('date')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Date {sortBy === 'date' && (sortAsc ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('class')}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Class {sortBy === 'class' && (sortAsc ? '↑' : '↓')}
              </TableCell>
              <TableCell>Section</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Present</TableCell>
              <TableCell align="right">Absent</TableCell>
              <TableCell align="right">Leave</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => {
                  const stats = getAttendanceStats(record);
                  return (
                    <TableRow hover key={record.id}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.class}</TableCell>
                      <TableCell>{record.section}</TableCell>
                      <TableCell align="right">{stats.total}</TableCell>
                      <TableCell align="right">{stats.present}</TableCell>
                      <TableCell align="right">{stats.absent}</TableCell>
                      <TableCell align="right">{stats.leave}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleView(record.id)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(record.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleDelete(record.id, e)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AttendanceList;
