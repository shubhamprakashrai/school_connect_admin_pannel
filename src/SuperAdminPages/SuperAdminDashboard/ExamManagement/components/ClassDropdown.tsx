import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent } from '@mui/material';
import { Class } from '../types/exam.types';

interface ClassDropdownProps {
  value: string;
  onChange: (classId: string) => void;
  error?: boolean;
  helperText?: string;
  classes: Class[];
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  label?: string;
}

const ClassDropdown: React.FC<ClassDropdownProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  classes = [],
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  label = 'Class',
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  // Group classes by level
  const groupedClasses = classes.reduce<Record<string, Class[]>>((acc, cls) => {
    if (!acc[cls.level]) {
      acc[cls.level] = [];
    }
    acc[cls.level].push(cls);
    return acc;
  }, {});

  return (
    <FormControl 
      fullWidth={fullWidth} 
      size={size} 
      error={error}
      disabled={disabled}
      required={required}
    >
      <InputLabel id="class-select-label">{label}</InputLabel>
      <Select
        labelId="class-select-label"
        id="class-select"
        value={value}
        label={label}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <em>Select a class</em>;
          }
          const selectedClass = classes.find((c) => c.id === selected);
          return selectedClass?.name || selected;
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <MenuItem disabled value="">
          <em>Select a class</em>
        </MenuItem>
        {Object.entries(groupedClasses).map(([level, levelClasses]) => [
          <div key={`divider-${level}`} style={{ padding: '4px 16px', color: '#666', fontSize: '0.75rem' }}>
            {level}
          </div>,
          ...levelClasses.map((cls) => (
            <MenuItem key={cls.id} value={cls.id} style={{ paddingLeft: '32px' }}>
              {cls.name}
            </MenuItem>
          )),
        ])}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ClassDropdown;
