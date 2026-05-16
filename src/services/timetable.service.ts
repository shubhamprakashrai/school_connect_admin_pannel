/** Timetable service — `/timetable/*` */

import apiService from '../service/apiService';
import { TIMETABLE_ENDPOINTS } from '../config/api.config';
import type {
  TimetableEntryRequest,
  TimetableResponse,
} from '../types/timetable';

export const timetableService = {
  /** GET /timetable/section/{sectionId} — full weekly schedule for a section. */
  bySection(sectionId: string): Promise<TimetableResponse> {
    return apiService.get(TIMETABLE_ENDPOINTS.bySection(sectionId));
  },
  /** GET /timetable/teacher/{teacherId} — every section a teacher teaches in. */
  byTeacher(teacherId: string): Promise<TimetableResponse[]> {
    return apiService.getList(TIMETABLE_ENDPOINTS.byTeacher(teacherId));
  },
  /**
   * PUT /timetable/section/{sectionId}/entry — upsert one cell (day × time-slot).
   * Backend validates against teacher conflicts (same teacher in two sections at the same slot).
   */
  upsertEntry(sectionId: string, payload: TimetableEntryRequest): Promise<TimetableResponse> {
    return apiService.put(TIMETABLE_ENDPOINTS.upsertEntry(sectionId), payload);
  },
  /**
   * DELETE /timetable/section/{sectionId}/entry — clear one cell.
   * Backend takes `day` + `timeSlotId` as query params or body? checked: body.
   */
  deleteEntry(
    sectionId: string,
    payload: { academicYearId: string; day: TimetableEntryRequest['day']; timeSlotId: string },
  ): Promise<TimetableResponse> {
    return apiService.delete(TIMETABLE_ENDPOINTS.deleteEntry(sectionId), { data: payload });
  },
};

export default timetableService;
