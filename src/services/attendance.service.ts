/**
 * Attendance services.
 *
 * Three backend controllers cover this domain:
 *   - `/student/attendance/*`        StudentAttendanceController
 *   - `/attendance/*`                AttendanceController (generic mark)
 *   - `/teachers/bulk-attendance/*`  BulkTeacherAttendanceController
 */

import apiService from '../service/apiService';
import {
  ATTENDANCE_ENDPOINTS,
  STUDENT_ATTENDANCE_ENDPOINTS,
  TEACHER_BULK_ATTENDANCE_ENDPOINTS,
} from '../config/api.config';
import type {
  AttendanceMarkingRequest,
  AttendanceResponse,
  AttendanceSummaryResponse,
  BulkAttendanceRequest,
  BulkTeacherAttendanceRequest,
  BulkTeacherAttendanceResponse,
  StudentAttendanceRequest,
  StudentAttendanceResponse,
} from '../types/attendance';

export const studentAttendanceService = {
  /** POST /student/attendance — mark single record */
  mark(payload: StudentAttendanceRequest): Promise<StudentAttendanceResponse> {
    return apiService.post(STUDENT_ATTENDANCE_ENDPOINTS.ROOT, payload);
  },
  /** POST /student/attendance/bulk — mark whole section */
  markBulk(payload: BulkAttendanceRequest): Promise<StudentAttendanceResponse[]> {
    return apiService.postList(STUDENT_ATTENDANCE_ENDPOINTS.BULK, payload);
  },
  /** GET /student/attendance/{id} */
  getById(id: string): Promise<StudentAttendanceResponse> {
    return apiService.get(STUDENT_ATTENDANCE_ENDPOINTS.byId(id));
  },
  /** GET /student/attendance/student/{studentId}/date/{date} */
  byStudentAndDate(studentId: string, date: string): Promise<StudentAttendanceResponse | null> {
    return apiService.get(STUDENT_ATTENDANCE_ENDPOINTS.byStudentAndDate(studentId, date));
  },
  /** GET /student/attendance/section/{sectionId}/date/{date} */
  bySectionAndDate(sectionId: string, date: string): Promise<StudentAttendanceResponse[]> {
    return apiService.getList(STUDENT_ATTENDANCE_ENDPOINTS.bySectionAndDate(sectionId, date));
  },
  /** GET /student/attendance/student/{studentId}/summary?startDate=&endDate= */
  studentSummary(
    studentId: string,
    params: { startDate?: string; endDate?: string } = {},
  ): Promise<AttendanceSummaryResponse> {
    return apiService.get(STUDENT_ATTENDANCE_ENDPOINTS.studentSummary(studentId), { params });
  },
  /**
   * Quick attendance percentage for a student over a date range. Mobile
   * exposes `/attendance/student/{id}/percentage` as a shortcut; on our
   * backend the same number lives inside the full summary response. Pull
   * that and return just the percentage so callers don't have to know.
   */
  async studentPercentage(
    studentId: string,
    params: { startDate?: string; endDate?: string } = {},
  ): Promise<number> {
    const s = await studentAttendanceService.studentSummary(studentId, params);
    return s.attendancePercentage ?? 0;
  },
  /** PUT /student/attendance/{id} */
  update(id: string, payload: Partial<StudentAttendanceRequest>): Promise<StudentAttendanceResponse> {
    return apiService.put(STUDENT_ATTENDANCE_ENDPOINTS.byId(id), payload);
  },
  /** DELETE /student/attendance/{id} */
  remove(id: string): Promise<void> {
    return apiService.delete(STUDENT_ATTENDANCE_ENDPOINTS.byId(id));
  },
};

export const attendanceService = {
  /** POST /attendance — generic single mark */
  mark(payload: AttendanceMarkingRequest): Promise<AttendanceResponse> {
    return apiService.post(ATTENDANCE_ENDPOINTS.ROOT, payload);
  },
};

export const teacherBulkAttendanceService = {
  /** POST /teachers/bulk-attendance */
  markBulk(payload: BulkTeacherAttendanceRequest): Promise<BulkTeacherAttendanceResponse> {
    return apiService.post(TEACHER_BULK_ATTENDANCE_ENDPOINTS.ROOT, payload);
  },
  /** GET /teachers/bulk-attendance/template (CSV download) */
  downloadTemplate(filename = 'teacher-attendance-template.csv'): Promise<void> {
    return apiService.download(TEACHER_BULK_ATTENDANCE_ENDPOINTS.TEMPLATE, filename);
  },
  /** POST /teachers/bulk-attendance/validate */
  validate(payload: BulkTeacherAttendanceRequest): Promise<BulkTeacherAttendanceResponse> {
    return apiService.post(TEACHER_BULK_ATTENDANCE_ENDPOINTS.VALIDATE, payload);
  },
  /** GET /teachers/bulk-attendance — list */
  list(params: { date?: string; teacherId?: string } = {}): Promise<AttendanceResponse[]> {
    return apiService.getList(TEACHER_BULK_ATTENDANCE_ENDPOINTS.ROOT, { params });
  },
  /** PUT /teachers/bulk-attendance/{id} */
  update(id: string, payload: Partial<AttendanceResponse>): Promise<AttendanceResponse> {
    return apiService.put(TEACHER_BULK_ATTENDANCE_ENDPOINTS.byId(id), payload);
  },
  /** DELETE /teachers/bulk-attendance/{id} */
  remove(id: string): Promise<void> {
    return apiService.delete(TEACHER_BULK_ATTENDANCE_ENDPOINTS.byId(id));
  },
};

export default studentAttendanceService;
