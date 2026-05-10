/** Admin + User DTOs */

export interface AdminResponse {
  id: string;
  userId?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  yearsOfService?: number;
  salary?: number;
  employmentType?: string;
  status?: string;
  permissions?: string[];
  profileImageUrl?: string;
  notes?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminRequest {
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  joinDate?: string;
  permissions?: string[];
}

export interface AdminUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  department?: string;
  status?: string;
  permissions?: string[];
}

// User management
export interface UserSummary {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  primaryRole?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED';
  emailVerified: boolean;
  tenantId?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  byRole: Record<string, number>;
}
