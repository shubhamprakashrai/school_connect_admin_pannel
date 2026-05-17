/** Exam service — `/exams/*` (backend pending). */

import apiService from '../service/apiService';
import type {
  ExamRequest,
  ExamResponse,
  ExamResults,
  ExamStatistics,
  ExamType,
  ReportCard,
} from '../types/exam';
import type { Page } from '../types/tenant';

const BASE = '/exams';

export const examService = {
  // ---- Types catalog (Unit-test, Mid-term, Final…) ---------------------
  types(): Promise<ExamType[]> {
    return apiService.getList(`${BASE}/types`);
  },
  activeTypes(): Promise<ExamType[]> {
    return apiService.getList(`${BASE}/types/active`);
  },
  createType(payload: Omit<ExamType, 'id'>): Promise<ExamType> {
    return apiService.post(`${BASE}/types`, payload);
  },
  updateType(id: string, payload: Omit<ExamType, 'id'>): Promise<ExamType> {
    return apiService.put(`${BASE}/types/${id}`, payload);
  },
  removeType(id: string): Promise<void> {
    return apiService.delete(`${BASE}/types/${id}`);
  },

  // ---- Exams ----------------------------------------------------------
  list(params: { page?: number; size?: number } = {}): Promise<Page<ExamResponse>> {
    return apiService.get(BASE, { params });
  },
  upcoming(): Promise<ExamResponse[]> {
    return apiService.getList(`${BASE}/upcoming`);
  },
  upcomingByClass(classId: string): Promise<ExamResponse[]> {
    return apiService.getList(`${BASE}/upcoming/class/${classId}`);
  },
  byClass(classId: string): Promise<ExamResponse[]> {
    return apiService.getList(`${BASE}/class/${classId}`);
  },
  getById(id: string): Promise<ExamResponse> {
    return apiService.get(`${BASE}/${id}`);
  },
  create(payload: ExamRequest): Promise<ExamResponse> {
    return apiService.post(BASE, payload);
  },
  update(id: string, payload: ExamRequest): Promise<ExamResponse> {
    return apiService.put(`${BASE}/${id}`, payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(`${BASE}/${id}`);
  },

  // ---- Marks + results + analytics ------------------------------------
  submitMarks(examId: string, entries: ExamResults['entries']): Promise<ExamResults> {
    return apiService.post(`${BASE}/${examId}/marks`, { entries });
  },
  results(examId: string): Promise<ExamResults> {
    return apiService.get(`${BASE}/${examId}/results`);
  },
  statistics(examId: string): Promise<ExamStatistics> {
    return apiService.get(`${BASE}/${examId}/statistics`);
  },

  // ---- Per-student views ----------------------------------------------
  studentResults(studentId: string): Promise<ReportCard['entries']> {
    return apiService.getList(`${BASE}/students/${studentId}/results`);
  },
  studentReportCard(studentId: string): Promise<ReportCard> {
    return apiService.get(`${BASE}/students/${studentId}/report-card`);
  },
};

export default examService;
