/** Calendar event service — `/calendar-events/*` (May 2026 refactor). */

import apiService from '../service/apiService';
import { CALENDAR_EVENT_ENDPOINTS } from '../config/api.config';
import type {
  CalendarEventPage,
  CalendarEventRequest,
  CalendarEventResponse,
  CalendarEventSearchParams,
  UpdateEventSectionsAndAudienceRequest,
} from '../types/calendarEvent';

export const calendarEventService = {
  /** POST /calendar-events — create generic (admin/super-admin) event. */
  create(payload: CalendarEventRequest): Promise<CalendarEventResponse> {
    return apiService.post(CALENDAR_EVENT_ENDPOINTS.ROOT, payload);
  },
  /** POST /calendar-events/academic — create audience-targeted academic event. */
  createAcademic(payload: CalendarEventRequest): Promise<CalendarEventResponse> {
    return apiService.post(CALENDAR_EVENT_ENDPOINTS.ACADEMIC, payload);
  },
  getById(id: string): Promise<CalendarEventResponse> {
    return apiService.get(CALENDAR_EVENT_ENDPOINTS.byId(id));
  },
  /**
   * GET /calendar-events/search — paginated. The backend filters by the
   * authenticated user's role/audience automatically; callers just pass
   * date range + optional type. Helper unwraps the Page envelope to give
   * back an array when callers don't need pagination metadata.
   */
  search(params: CalendarEventSearchParams = {}): Promise<CalendarEventPage> {
    return apiService.get(CALENDAR_EVENT_ENDPOINTS.SEARCH, { params });
  },
  /**
   * Convenience: fetch every event in a date range, paginating server-side
   * (size=200 covers most month/quarter views).
   */
  async byRange(startDate: string, endDate: string): Promise<CalendarEventResponse[]> {
    const page = await calendarEventService.search({ startDate, endDate, page: 0, size: 200 });
    return page.content || [];
  },
  update(id: string, payload: CalendarEventRequest): Promise<CalendarEventResponse> {
    return apiService.put(CALENDAR_EVENT_ENDPOINTS.byId(id), payload);
  },
  /** PUT /calendar-events/{id}/sections-audience — change targeting without rewriting the event. */
  updateSectionsAudience(id: string, payload: UpdateEventSectionsAndAudienceRequest): Promise<CalendarEventResponse> {
    return apiService.put(CALENDAR_EVENT_ENDPOINTS.updateSectionsAudience(id), payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(CALENDAR_EVENT_ENDPOINTS.byId(id));
  },
  removeAcademic(id: string): Promise<void> {
    return apiService.delete(CALENDAR_EVENT_ENDPOINTS.deleteAcademic(id));
  },
};

export default calendarEventService;
