/** AcademicYear service — `/academic-years/*` */

import apiService from '../service/apiService';
import { ACADEMIC_YEAR_ENDPOINTS } from '../config/api.config';
import type { AcademicYearRequest, AcademicYearResponse } from '../types/academicYear';

export const academicYearService = {
  list(): Promise<AcademicYearResponse[]> {
    return apiService.getList(ACADEMIC_YEAR_ENDPOINTS.ROOT);
  },
  active(): Promise<AcademicYearResponse> {
    return apiService.get(ACADEMIC_YEAR_ENDPOINTS.ACTIVE);
  },
  getById(id: string): Promise<AcademicYearResponse> {
    return apiService.get(ACADEMIC_YEAR_ENDPOINTS.byId(id));
  },
  create(payload: AcademicYearRequest): Promise<AcademicYearResponse> {
    return apiService.post(ACADEMIC_YEAR_ENDPOINTS.ROOT, payload);
  },
  update(id: string, payload: AcademicYearRequest): Promise<AcademicYearResponse> {
    return apiService.put(ACADEMIC_YEAR_ENDPOINTS.byId(id), payload);
  },
  activate(id: string): Promise<AcademicYearResponse> {
    return apiService.put(ACADEMIC_YEAR_ENDPOINTS.activate(id));
  },
  remove(id: string): Promise<void> {
    return apiService.delete(ACADEMIC_YEAR_ENDPOINTS.byId(id));
  },
};

export default academicYearService;
