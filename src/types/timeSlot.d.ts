/** TimeSlot DTOs — periods + breaks for the school's bell schedule. */

export interface TimeSlotRequest {
  /** HH:mm — LocalTime on backend. */
  startTime: string;
  endTime: string;
  /** Free-text label, e.g. "Period 1", "Lunch", "Recess". */
  label?: string;
}

export interface TimeSlotResponse {
  id: string;
  startTime: string;
  endTime: string;
  /** Backend computes a display label like `Period 1 · 09:00 – 09:45`. */
  displayLabel?: string;
  durationMinutes?: number;
  isActive?: boolean;
}
