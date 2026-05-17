/** Safety module DTOs — backend pending. */

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
export type IncidentType = 'BULLYING' | 'INJURY' | 'BEHAVIORAL' | 'MEDICAL' | 'OTHER';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
  createdBy?: string;
}

export interface SafetyIncidentRequest {
  type: IncidentType;
  studentId?: string;
  occurredAt: string;
  location?: string;
  description: string;
  reportedBy?: string;
}

export interface SafetyIncidentResponse {
  id: string;
  type: IncidentType;
  studentId?: string;
  studentName?: string;
  occurredAt: string;
  location?: string;
  description: string;
  reportedBy?: string;
  status: IncidentStatus;
  resolution?: string;
  createdAt?: string;
}

export interface CounselingSessionRequest {
  studentId: string;
  scheduledAt: string;
  topic: string;
  notes?: string;
}

export interface CounselingSessionResponse {
  id: string;
  studentId: string;
  studentName?: string;
  counselorId?: string;
  counselorName?: string;
  scheduledAt: string;
  completedAt?: string;
  topic: string;
  notes?: string;
}
