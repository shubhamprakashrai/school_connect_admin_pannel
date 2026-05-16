/** StudentEnrollment service — `/enrollments/*` */

import apiService from '../service/apiService';
import { ENROLLMENT_ENDPOINTS } from '../config/api.config';
import type {
  PromoteRequest,
  StudentEnrollmentRequest,
  StudentEnrollmentResponse,
} from '../types/enrollment';

export const enrollmentService = {
  /** POST /enrollments — enrol a student in a class/section for an academic year. */
  enrol(payload: StudentEnrollmentRequest): Promise<StudentEnrollmentResponse> {
    return apiService.post(ENROLLMENT_ENDPOINTS.ROOT, payload);
  },
  /** GET /enrollments/student/{studentId}/history — every year-row for one student. */
  history(studentId: string): Promise<StudentEnrollmentResponse[]> {
    return apiService.getList(ENROLLMENT_ENDPOINTS.history(studentId));
  },
  /** GET /enrollments/session/{academicYearId} — every student enrolled in an academic year. */
  bySession(academicYearId: string): Promise<StudentEnrollmentResponse[]> {
    return apiService.getList(ENROLLMENT_ENDPOINTS.bySession(academicYearId));
  },
  /** POST /enrollments/promote — bulk promote students to next class/section. */
  promote(payload: PromoteRequest): Promise<StudentEnrollmentResponse[]> {
    return apiService.postList(ENROLLMENT_ENDPOINTS.PROMOTE, payload);
  },
};

export default enrollmentService;
