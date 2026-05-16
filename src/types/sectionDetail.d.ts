/** SectionDetail DTOs — section + timetable config. */

import type { TimeSlotResponse } from './timeSlot';

export interface SectionTeacherInfo {
  id: string;
  name: string;
  employeeId?: string;
  designation?: string;
}

export interface SectionSubjectInfo {
  id: string;
  name: string;
  code?: string;
  type?: string;
}

export interface SectionTimetableConfig {
  bellCount: number;
  timeSlots: TimeSlotResponse[];
  subjects: SectionSubjectInfo[];
  teachers: SectionTeacherInfo[];
}

export interface SectionDetailResponse {
  sectionId: string;
  sectionName: string;
  capacity?: number;
  classId: string;
  className: string;
  classTeacher?: SectionTeacherInfo;
  isTimetableConfigured: boolean;
  timetableConfig?: SectionTimetableConfig;
}

/** POST/PUT /sections/{id}/timetable-config body. */
export interface SectionConfigRequest {
  bellCount: number;
  timeSlotIds: string[];
  subjectIds?: string[];
  teacherIds?: string[];
}
