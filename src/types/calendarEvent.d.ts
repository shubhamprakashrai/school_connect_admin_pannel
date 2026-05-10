/** Calendar event DTOs */

export type CalendarEventType =
  | 'WORKING_DAY'
  | 'HOLIDAY'
  | 'HALF_DAY'
  | 'EXAM'
  | 'EVENT'
  | 'TEACHER_MEETING'
  | 'SPORTS_DAY'
  | 'PARENT_TEACHER_MEETING';

export type HolidayType = 'NATIONAL' | 'REGIONAL' | 'RELIGIOUS' | 'SCHOOL_EVENT' | 'TEACHER_TRAINING';

export interface CalendarEventRequest {
  eventDate: string;
  endDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  isWorkingDay?: boolean;
  academicYearId?: string;
  applicableSections?: string;
  halfDay?: boolean;
  holidayType?: HolidayType;
}

export interface CalendarEventResponse {
  id: string;
  eventDate: string;
  endDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  isWorkingDay?: boolean;
  academicYearId?: string;
  academicYearName?: string;
  applicableSections?: string;
  halfDay?: boolean;
  holidayType?: HolidayType;
  createdAt?: string;
  updatedAt?: string;
}
