import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent, Chip, Box } from '@mui/material';
import { ExamType } from '../types/exam.types';

interface ExamTypeSelectProps {
  value: ExamType | '';
  onChange: (type: ExamType) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  label?: string;
}

const examTypeColors: Record<ExamType, string> = {
  [ExamType.MIDTERM]: '#4caf50',
  [ExamType.FINAL]: '#f44336',
  [ExamType.UNIT_TEST]: '#2196f3',
  [ExamType.QUIZ]: '#ff9800',
  [ExamType.ASSIGNMENT]: '#9c27b0',
  [ExamType.OTHER]: '#607d8b',
  [ExamType.PRACTICAL]: '#607d8b',
};

const examTypeLabels: Record<ExamType, string> = {
  [ExamType.MIDTERM]: 'Midterm Exam',
  [ExamType.FINAL]: 'Final Exam',
  [ExamType.UNIT_TEST]: 'Unit Test',
  [ExamType.QUIZ]: 'Quiz',
  [ExamType.ASSIGNMENT]: 'Assignment',
  [ExamType.OTHER]: 'Other',
  [ExamType.PRACTICAL]: 'Practical Exam', 
};

const ExamTypeSelect: React.FC<ExamTypeSelectProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'medium',
  label = 'Exam Type',
}) => {
  const handleChange = (event: SelectChangeEvent<ExamType | ''>) => {
    onChange(event.target.value as ExamType);
  };

  return (
    <FormControl 
      fullWidth={fullWidth} 
      size={size} 
      error={error}
      disabled={disabled}
      required={required}
    >
      <InputLabel id="exam-type-select-label">{label}</InputLabel>
      <Select
        labelId="exam-type-select-label"
        id="exam-type-select"
        value={value}
        label={label}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <em>Select exam type</em>;
          }
          return (
            <Chip 
              label={examTypeLabels[selected as ExamType]} 
              size="small"
              style={{
                backgroundColor: examTypeColors[selected as ExamType],
                color: 'white',
                fontWeight: 500,
              }}
            />
          );
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
          <em>Select exam type</em>
        </MenuItem>
        {Object.entries(ExamType).map(([key, type]) => (
          <MenuItem key={type} value={type}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box 
                width={12} 
                height={12} 
                borderRadius="50%" 
                bgcolor={examTypeColors[type]}
                flexShrink={0}
              />
              <span>{examTypeLabels[type]}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ExamTypeSelect;
