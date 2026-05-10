/** Parent + ParentPortal DTOs */

export interface ParentResponse {
  parentId: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email?: string;
  phone?: string;
  parentType?: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  status?: string;
  portalAccessEnabled?: boolean;
  isPrimaryContact?: boolean;
  isEmergencyContact?: boolean;
  canPickupChild?: boolean;
  preferredLanguage?: string;
  receiveSms?: boolean;
  receiveEmail?: boolean;
  receiveAppNotifications?: boolean;
  studentIds?: string[];
  userId?: string;
}

export interface ParentRequest {
  firstname: string;
  midlename?: string;
  lastname: string;
  email?: string;
  phone?: string;
  parentType?: 'FATHER' | 'MOTHER' | 'GUARDIAN';
}

// Parent portal-specific
export interface ParentChildSummary {
  studentId: string;
  fullName: string;
  rollNumber?: string;
  className?: string;
  sectionName?: string;
  photoUrl?: string;
  attendancePercentage?: number;
}

export interface ParentProfile {
  parentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  children: ParentChildSummary[];
}
