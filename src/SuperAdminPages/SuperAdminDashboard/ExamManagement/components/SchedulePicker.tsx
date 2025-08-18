import React from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';

interface SchedulePickerProps {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  dateError?: string;
  startTimeError?: string;
  endTimeError?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  dateError,
  startTimeError,
  endTimeError,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      onDateChange(format(newDate, 'yyyy-MM-dd'));
    }
  };

  const handleStartTimeChange = (newTime: Date | null) => {
    if (newTime) {
      onStartTimeChange(format(newTime, 'HH:mm:ss'));
    }
  };

  const handleEndTimeChange = (newTime: Date | null) => {
    if (newTime) {
      onEndTimeChange(format(newTime, 'HH:mm:ss'));
    }
  };

  // Parse the date string into a Date object
  const parsedDate = date ? parse(date, 'yyyy-MM-dd', new Date()) : null;
  
  // Parse time strings into Date objects (using a fixed date since we only care about time)
  const parsedStartTime = startTime 
    ? parse(startTime, 'HH:mm:ss', new Date(2000, 0, 1)) 
    : null;
    
  const parsedEndTime = endTime 
    ? parse(endTime, 'HH:mm:ss', new Date(2000, 0, 1)) 
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Schedule
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          '& > *': {
            flex: 1,
            minWidth: 0, // Prevents flex items from overflowing
          },
        }}>
          <DatePicker
            label="Exam Date"
            value={parsedDate}
            onChange={handleDateChange}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!dateError,
                helperText: dateError,
                disabled,
                inputProps: {
                  'aria-invalid': !!dateError,
                  'aria-errormessage': dateError ? 'date-helper-text' : undefined,
                },
                FormHelperTextProps: {
                  id: 'date-helper-text',
                },
              },
            }}
            format="dd/MM/yyyy"
            disablePast
          />
          <TimePicker
            label="Start Time"
            value={parsedStartTime}
            onChange={handleStartTimeChange}
            disabled={!date || disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!startTimeError,
                helperText: startTimeError,
                disabled: !date || disabled,
                inputProps: {
                  'aria-invalid': !!startTimeError,
                  'aria-errormessage': startTimeError ? 'start-time-helper-text' : undefined,
                },
                FormHelperTextProps: {
                  id: 'start-time-helper-text',
                },
              },
            }}
            format="hh:mm a"
            minutesStep={5}
          />
          <TimePicker
            label="End Time"
            value={parsedEndTime}
            onChange={handleEndTimeChange}
            disabled={!date || !startTime || disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!endTimeError,
                helperText: endTimeError,
                disabled: !date || !startTime || disabled,
                inputProps: {
                  'aria-invalid': !!endTimeError,
                  'aria-errormessage': endTimeError ? 'end-time-helper-text' : undefined,
                },
                FormHelperTextProps: {
                  id: 'end-time-helper-text',
                },
              },
            }}
            format="hh:mm a"
            minutesStep={5}
            minTime={parsedStartTime || undefined}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SchedulePicker;
