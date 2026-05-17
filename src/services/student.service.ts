/** Student service — `/students/*` + `/students/bulk/*` */

import apiService from '../service/apiService';
import { BULK_STUDENT_ENDPOINTS, STUDENT_ENDPOINTS } from '../config/api.config';
import type { Page } from '../types/tenant';
import type {
  BulkStudentRequest,
  BulkStudentResponse,
  CreateStudentRequest,
  StudentFilterRequest,
  StudentResponse,
  StudentStatistics,
  UpdateStudentRequest,
} from '../types/student';

export interface ListStudentsParams extends StudentFilterRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export const studentService = {
  list(params: ListStudentsParams = {}): Promise<Page<StudentResponse>> {
    return apiService.get(STUDENT_ENDPOINTS.ROOT, { params });
  },
  getById(studentId: string): Promise<StudentResponse> {
    return apiService.get(STUDENT_ENDPOINTS.byId(studentId));
  },
  byClass(classId: string): Promise<StudentResponse[]> {
    return apiService.getList(STUDENT_ENDPOINTS.byClass(classId));
  },
  bySection(sectionId: string): Promise<StudentResponse[]> {
    return apiService.getList(STUDENT_ENDPOINTS.bySection(sectionId));
  },
  search(query: string): Promise<StudentResponse[]> {
    return apiService.getList(STUDENT_ENDPOINTS.SEARCH, { params: { query } });
  },
  statistics(): Promise<StudentStatistics> {
    return apiService.get(STUDENT_ENDPOINTS.STATISTICS);
  },
  create(payload: CreateStudentRequest): Promise<StudentResponse> {
    return apiService.post(STUDENT_ENDPOINTS.ROOT, payload);
  },
  update(studentId: string, payload: UpdateStudentRequest): Promise<StudentResponse> {
    return apiService.put(STUDENT_ENDPOINTS.byId(studentId), payload);
  },
  setStatus(studentId: string, status: string): Promise<StudentResponse> {
    // Backend uses @RequestParam, not @RequestBody — pass via query string.
    return apiService.patch(STUDENT_ENDPOINTS.status(studentId), undefined, { params: { status } });
  },
  remove(studentId: string): Promise<void> {
    return apiService.delete(STUDENT_ENDPOINTS.byId(studentId));
  },
  /**
   * GET /students/export?[filters] — server-generated CSV download.
   * Filters mirror the list endpoint's query params (classId, sectionId,
   * status, gender, search). Use this for large exports — the in-browser
   * CSV builder under `utils/exporters.ts` is fine for a few hundred rows
   * but stalls on tens of thousands.
   */
  export(params: Record<string, string | undefined> = {}, filename = 'students.csv'): Promise<void> {
    return apiService.download(STUDENT_ENDPOINTS.EXPORT, filename, { params });
  },
};

export const bulkStudentService = {
  /** POST /students/bulk */
  createMany(payload: BulkStudentRequest): Promise<BulkStudentResponse> {
    return apiService.post(BULK_STUDENT_ENDPOINTS.ROOT, payload);
  },
  /** GET /students/bulk/template — downloads CSV/XLSX */
  downloadTemplate(filename = 'students-bulk-template.csv'): Promise<void> {
    return apiService.download(BULK_STUDENT_ENDPOINTS.TEMPLATE, filename);
  },
  /** POST /students/bulk/validate */
  validate(payload: BulkStudentRequest): Promise<BulkStudentResponse> {
    return apiService.post(BULK_STUDENT_ENDPOINTS.VALIDATE, payload);
  },
};

export default studentService;
