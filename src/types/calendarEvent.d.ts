/** Calendar event DTOs (May 2026 refactor — audience-targeted). */

import type { Page } from './tenant';

export type CalendarEventType =
  | 'WORKING_DAY'
  | 'HOLIDAY'
  | 'HALF_DAY'
  | 'EXAM'
  | 'EVENT'
  | 'TEACHER_MEETING'
  | 'SPORTS_DAY'
  | 'PARENT_TEACHER_MEETING';

/**
 * AudienceType controls which roles can see an event when fetched via the
 * audience-aware `/calendar-events/search` endpoint. `ALL` is the default
 * for legacy events created without explicit targeting.
 */
export type AudienceType =
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'TEACHERS'
  | 'STUDENTS'
  | 'PARENTS'
  | 'ALL';

export interface CalendarEventRequest {
  eventDate: string;
  endDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  academicYearId?: string;
  /** Empty / undefined ⇒ event applies to every section in the tenant. */
  applicableSections?: string[];
  audienceType?: AudienceType;
}

/** PUT /calendar-events/{id}/sections-audience body. */
export interface UpdateEventSectionsAndAudienceRequest {
  applicableSections?: string[];
  audienceType?: AudienceType;
}

export interface CalendarEventResponse {
  id: string;
  eventDate: string;
  endDate?: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  academicYearId?: string;
  academicYearName?: string;
  applicableSections?: string[];
  audienceType?: AudienceType;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

/** Filter shape for GET /calendar-events/search. All fields optional. */
export interface CalendarEventSearchParams {
  eventType?: CalendarEventType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export type CalendarEventPage = Page<CalendarEventResponse>;
