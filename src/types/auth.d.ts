/**
 * Auth-related DTO mirrors of the backend (`com.schoolmgmt.dto.*`).
 * Keep field names in sync with the Java DTOs.
 */

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  // Lower-case variants used by the existing UI; tolerated until pages migrate.
  | 'superadmin'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'parent';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

export interface LoginRequest {
  /** At least one of email or phone must be set. */
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
  expiresIn: number; // seconds
  user: UserInfo;
  passwordResetRequired: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AdminResetPasswordRequest {
  userId: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}
