/** SectionDetail service — `/sections/*` extras */

import apiService from '../service/apiService';
import { SECTION_DETAIL_ENDPOINTS } from '../config/api.config';
import type {
  SectionConfigRequest,
  SectionDetailResponse,
} from '../types/sectionDetail';

export const sectionDetailService = {
  /** GET /sections/{id}/detail — class-teacher, capacity, timetable config. */
  detail(sectionId: string): Promise<SectionDetailResponse> {
    return apiService.get(SECTION_DETAIL_ENDPOINTS.detail(sectionId));
  },
  /** POST /sections/{id}/timetable-config — first-time config. */
  createConfig(
    sectionId: string,
    payload: SectionConfigRequest,
  ): Promise<SectionDetailResponse> {
    return apiService.post(SECTION_DETAIL_ENDPOINTS.createConfig(sectionId), payload);
  },
  /** PUT /sections/{id}/timetable-config — replace existing config. */
  updateConfig(
    sectionId: string,
    payload: SectionConfigRequest,
  ): Promise<SectionDetailResponse> {
    return apiService.put(SECTION_DETAIL_ENDPOINTS.updateConfig(sectionId), payload);
  },
};

export default sectionDetailService;
