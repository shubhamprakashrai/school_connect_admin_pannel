/** Safety service — `/safety/*` (backend pending). */

import apiService from '../service/apiService';
import type {
  CounselingSessionRequest,
  CounselingSessionResponse,
  SafetyAlert,
  SafetyIncidentRequest,
  SafetyIncidentResponse,
} from '../types/safety';

const BASE = '/safety';

export const safetyService = {
  // ---- Alerts (admin broadcasts, e.g. "Holiday — school closed at 11am due to rain") ----
  alerts(): Promise<SafetyAlert[]> {
    return apiService.getList(`${BASE}/alerts`);
  },
  activeAlerts(): Promise<SafetyAlert[]> {
    return apiService.getList(`${BASE}/alerts/active`);
  },
  createAlert(payload: Omit<SafetyAlert, 'id'>): Promise<SafetyAlert> {
    return apiService.post(`${BASE}/alerts`, payload);
  },

  // ---- Incidents ----
  reportIncident(payload: SafetyIncidentRequest): Promise<SafetyIncidentResponse> {
    return apiService.post(`${BASE}/incidents`, payload);
  },

  // ---- Counseling sessions ----
  bookCounseling(payload: CounselingSessionRequest): Promise<CounselingSessionResponse> {
    return apiService.post(`${BASE}/counseling`, payload);
  },
};

export default safetyService;
