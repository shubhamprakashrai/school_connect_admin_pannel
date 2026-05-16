/** Timetable DTOs — weekly grid of (day × time-slot) → subject + teacher. */

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'
  | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface TimetableEntryRequest {
  academicYearId: string;
  day: DayOfWeek;
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
}

export interface TimetableTimeSlotInfo {
  id: string;
  label?: string;
  startTime: string;
  endTime: string;
}

export interface TimetableSubjectInfo {
  id: string;
  name: string;
  code?: string;
}

export interface TimetableTeacherInfo {
  id: string;
  name: string;
  employeeId?: string;
}

export interface TimetablePeriodEntry {
  entryId: string;
  timeSlot: TimetableTimeSlotInfo;
  subject: TimetableSubjectInfo;
  teacher: TimetableTeacherInfo;
}

export interface TimetableDaySchedule {
  day: DayOfWeek;
  periods: TimetablePeriodEntry[];
}

export interface TimetableResponse {
  sectionId: string;
  sectionName: string;
  className: string;
  academicYearId: string;
  academicYearName: string;
  days: TimetableDaySchedule[];
}
