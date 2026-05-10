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

/** POST /parents/search body — every field is optional. */
export interface ParentFilterRequest {
  search?: string;
  city?: string;
  minChildrenCount?: number;
  email?: string;
  phone?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/** Slim shape returned by /parents/search — minimal fields for table display. */
export interface ParentSearchResult {
  parentId: string;
  parentUserId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PaginatedParentSearchResponse {
  content: ParentSearchResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
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
