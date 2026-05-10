/** Calendar event service — `/calendar-events/*` */

import apiService from '../service/apiService';
import { CALENDAR_EVENT_ENDPOINTS } from '../config/api.config';
import type { CalendarEventRequest, CalendarEventResponse } from '../types/calendarEvent';

export const calendarEventService = {
  create(payload: CalendarEventRequest): Promise<CalendarEventResponse> {
    return apiService.post(CALENDAR_EVENT_ENDPOINTS.ROOT, payload);
  },
  getById(id: string): Promise<CalendarEventResponse> {
    return apiService.get(CALENDAR_EVENT_ENDPOINTS.byId(id));
  },
  byDate(date: string): Promise<CalendarEventResponse[]> {
    return apiService.getList(CALENDAR_EVENT_ENDPOINTS.BY_DATE, { params: { date } });
  },
  byRange(startDate: string, endDate: string): Promise<CalendarEventResponse[]> {
    return apiService.getList(CALENDAR_EVENT_ENDPOINTS.BY_RANGE, { params: { startDate, endDate } });
  },
  byAcademicYear(academicYearId: string): Promise<CalendarEventResponse[]> {
    return apiService.getList(CALENDAR_EVENT_ENDPOINTS.byAcademicYear(academicYearId));
  },
  isWorkingDay(date: string): Promise<{ workingDay: boolean; reason?: string }> {
    return apiService.get(CALENDAR_EVENT_ENDPOINTS.IS_WORKING_DAY, { params: { date } });
  },
  update(id: string, payload: CalendarEventRequest): Promise<CalendarEventResponse> {
    return apiService.put(CALENDAR_EVENT_ENDPOINTS.byId(id), payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(CALENDAR_EVENT_ENDPOINTS.byId(id));
  },
};

export default calendarEventService;
