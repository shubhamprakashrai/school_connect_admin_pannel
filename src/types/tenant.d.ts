/**
 * Tenant DTO mirrors of `com.schoolmgmt.dto.{request,response,common}`.
 */

export type TenantStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DELETED'
  | 'TRIAL_EXPIRED';

export type SubscriptionPlan =
  | 'TRIAL'
  | 'BASIC'
  | 'STANDARD'
  | 'PREMIUM'
  | 'ENTERPRISE';

export interface TenantLimits {
  maxStudents: number;
  currentStudents: number;
  maxTeachers: number;
  currentTeachers: number;
  maxStorageGb: number;
  currentStorageMb: number;
  studentUsagePercentage?: number;
  teacherUsagePercentage?: number;
  storageUsagePercentage?: number;
}

export interface TenantResponse {
  id: string;
  identifier: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website?: string;
  logoUrl?: string;
  status: TenantStatus;
  subscriptionPlan: SubscriptionPlan;
  limits: TenantLimits;
  createdAt: string;
  activatedAt?: string;
}

export interface TenantInfo {
  id: string;
  identifier: string;
  name: string;
  subdomain: string;
  email: string;
  status: TenantStatus;
  subscriptionPlan?: SubscriptionPlan;
}

export interface AdminInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  tenantId?: string;
}

export interface CreateSchoolClassRequest {
  name: string;
  description?: string;
}

export interface TenantRegistrationRequest {
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  subscriptionPlan: SubscriptionPlan;
  website?: string;
  userRequest: UserRequest;
  configuration?: Record<string, string>;
  createDefaultClasses?: boolean;
  initialClasses?: CreateSchoolClassRequest[];
  studentLoginRequired?: boolean;
}

export interface TenantRegistrationResponse {
  tenant: TenantInfo;
  admin: AdminInfo;
  message: string;
  accessUrl: string;
  nextSteps: string[];
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logoUrl?: string;
  configuration?: Record<string, string>;
}

export interface TenantFilterRequest {
  name?: string;
  subdomain?: string;
  email?: string;
  status?: TenantStatus;
  subscriptionPlan?: SubscriptionPlan;
  city?: string;
  state?: string;
  country?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface TenantStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  activeUsers: number;
  totalClasses: number;
  attendancePercentage: number;
  storageUsedMb: number;
  usersByRole: Record<string, number>;
  studentsByClass: Record<string, number>;
}

export interface TenantActivationRequest {
  activationCode: string;
}

export interface UpdateSubscriptionRequest {
  subscriptionPlan: SubscriptionPlan;
  validUntil?: string;
}

export interface UpdateLimitsRequest {
  maxStudents?: number;
  maxTeachers?: number;
  maxStorageGb?: number;
}

export interface BulkTenantOperationRequest {
  tenantIds: string[];
  reason?: string;
}

/**
 * Spring Data Page<T> shape — most paginated endpoints return this envelope.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
