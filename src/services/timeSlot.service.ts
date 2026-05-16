/** TimeSlot service — `/time-slots/*` */

import apiService from '../service/apiService';
import { TIME_SLOT_ENDPOINTS } from '../config/api.config';
import type { TimeSlotRequest, TimeSlotResponse } from '../types/timeSlot';

export const timeSlotService = {
  /** GET /time-slots — active slots only. Allowed for ADMIN/SUPER_ADMIN/TEACHER. */
  list(): Promise<TimeSlotResponse[]> {
    return apiService.getList(TIME_SLOT_ENDPOINTS.ROOT);
  },
  /** GET /time-slots/all — admin view including inactive slots. */
  listAll(): Promise<TimeSlotResponse[]> {
    return apiService.getList(TIME_SLOT_ENDPOINTS.ALL);
  },
  create(payload: TimeSlotRequest): Promise<TimeSlotResponse> {
    return apiService.post(TIME_SLOT_ENDPOINTS.ROOT, payload);
  },
  update(id: string, payload: TimeSlotRequest): Promise<TimeSlotResponse> {
    return apiService.put(TIME_SLOT_ENDPOINTS.byId(id), payload);
  },
  /** PATCH — flip active flag without rewriting the row. */
  toggleActive(id: string): Promise<TimeSlotResponse> {
    return apiService.patch(TIME_SLOT_ENDPOINTS.toggleActive(id));
  },
  remove(id: string): Promise<void> {
    return apiService.delete(TIME_SLOT_ENDPOINTS.byId(id));
  },
};

export default timeSlotService;
