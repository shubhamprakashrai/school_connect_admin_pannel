import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent, CircularProgress } from '@mui/material';
import { Subject } from '../types/exam.types';

interface SubjectDropdownProps {
  value: string;
  onChange: (subjectId: string) => void;
  classId?: string;
  error?: boolean;
  helperText?: string;
  subjects: Subject[];
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  label?: string;
  showCode?: boolean;
  loading?: boolean;
}

const SubjectDropdown: React.FC<SubjectDropdownProps> = ({
  value,
  onChange,
  classId,
  error = false,
  helperText,
  subjects = [],
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  label = 'Subject',
  showCode = true,
  loading = false,
}) => {
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (classId) {
      const filtered = subjects.filter(subject => subject.classId === classId);
      setFilteredSubjects(filtered);
      
      // Reset selected subject if it's not in the filtered list
      if (value) {
        const selectedSubject = filtered.find(s => s.id === value);
        if (!selectedSubject) {
          onChange('');
        }
      }
    } else {
      setFilteredSubjects([]);
      if (value) {
        onChange('');
      }
    }
  }, [classId, subjects, value, onChange]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const renderValue = (selected: string) => {
    if (!selected) {
      return <em>Select a subject</em>;
    }
    
    const selectedSubject = subjects.find(s => s.id === selected);
    if (!selectedSubject) return <em>Select a subject</em>;
    
    return showCode 
      ? `${selectedSubject.name} (${selectedSubject.code})`
      : selectedSubject.name;
  };

  return (
    <FormControl 
      fullWidth={fullWidth} 
      size={size} 
      error={error}
      disabled={disabled || !classId || loading}
      required={required}
    >
      <InputLabel id="subject-select-label">
        {loading ? 'Loading subjects...' : label}
      </InputLabel>
      <Select
        labelId="subject-select-label"
        id="subject-select"
        value={value}
        label={loading ? 'Loading subjects...' : label}
        onChange={handleChange}
        displayEmpty
        renderValue={renderValue}
        startAdornment={
          loading ? (
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <CircularProgress size={20} color="inherit" />
            </div>
          ) : null
        }
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <MenuItem disabled value="">
          <em>Select a subject</em>
        </MenuItem>
        {filteredSubjects.length === 0 ? (
          <MenuItem disabled>
            {classId ? 'No subjects found' : 'Select a class first'}
          </MenuItem>
        ) : (
          filteredSubjects.map((subject) => (
            <MenuItem key={subject.id} value={subject.id}>
              {showCode ? (
                <>
                  <div style={{ fontWeight: 500 }}>{subject.name}</div>
                  <div style={{ opacity: 0.7, marginLeft: '8px', fontSize: '0.875rem' }}>
                    {subject.code}
                  </div>
                </>
              ) : (
                subject.name
              )}
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SubjectDropdown;
