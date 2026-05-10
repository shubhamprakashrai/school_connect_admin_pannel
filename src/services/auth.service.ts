/**
 * Auth service.
 *
 * One file per backend controller: this module mirrors `/auth/*` exactly.
 * Every other domain (students, teachers, etc.) follows the same pattern.
 */

import apiService from '../service/apiService';
import { AUTH_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';
import type {
  AdminResetPasswordRequest,
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  UserInfo,
  VerifyEmailRequest,
} from '../types/auth';

// ---------------------------------------------------------------------------
// Storage — one place to read/write the session, used by AuthContext too.
// ---------------------------------------------------------------------------

export const authStorage = {
  saveSession(payload: AuthResponse, rememberMe: boolean) {
    const store = rememberMe ? localStorage : sessionStorage;
    const other = rememberMe ? sessionStorage : localStorage;

    store.setItem(STORAGE_KEYS.ACCESS_TOKEN, payload.accessToken);
    store.setItem(STORAGE_KEYS.REFRESH_TOKEN, payload.refreshToken);
    store.setItem(STORAGE_KEYS.USER, JSON.stringify(payload.user));
    store.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    if (payload.user.tenantId) {
      store.setItem(STORAGE_KEYS.TENANT_ID, payload.user.tenantId);
    }

    other.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    other.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    other.removeItem(STORAGE_KEYS.USER);
    other.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  },

  clear() {
    for (const store of [localStorage, sessionStorage]) {
      store.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      store.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      store.removeItem(STORAGE_KEYS.USER);
      store.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
    }
  },

  getUser(): UserInfo | null {
    const raw =
      sessionStorage.getItem(STORAGE_KEYS.USER) ||
      localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserInfo;
    } catch {
      return null;
    }
  },

  getAccessToken(): string | null {
    return (
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },

  isAuthenticated(): boolean {
    return Boolean(authStorage.getAccessToken());
  },
};

// ---------------------------------------------------------------------------
// JWT helpers (decode-only — verification stays on the server).
// ---------------------------------------------------------------------------

export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getTokenExpiry(token: string): number | null {
  const payload = decodeJwt<{ exp?: number }>(token);
  return payload?.exp ? payload.exp * 1000 : null;
}

// ---------------------------------------------------------------------------
// Endpoint wrappers — one method per backend route.
// ---------------------------------------------------------------------------

export const authService = {
  /** POST /auth/login */
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse, LoginRequest>(
      AUTH_ENDPOINTS.LOGIN,
      payload,
    );
    authStorage.saveSession(res, payload.rememberMe ?? false);
    return res;
  },

  /** POST /auth/register */
  register(payload: RegisterRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse, RegisterRequest>(
      AUTH_ENDPOINTS.REGISTER,
      payload,
    );
  },

  /** POST /auth/refresh */
  refresh(refreshToken: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse, RefreshTokenRequest>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken },
    );
  },

  /** POST /auth/logout */
  async logout(): Promise<void> {
    try {
      await apiService.post<void>(AUTH_ENDPOINTS.LOGOUT);
    } finally {
      authStorage.clear();
    }
  },

  /** POST /auth/forgot-password */
  forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);
  },

  /** POST /auth/reset-password */
  resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);
  },

  /** POST /auth/Initialreset-password (first-login forced reset) */
  initialResetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.INITIAL_RESET_PASSWORD, payload);
  },

  /** POST /auth/verify-email */
  verifyEmail(payload: VerifyEmailRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.VERIFY_EMAIL, payload);
  },

  /** POST /auth/resend-verification */
  resendVerification(payload: ResendVerificationRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, payload);
  },

  /** POST /auth/change-password (authenticated) */
  changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, payload);
  },

  /** POST /auth/admin-reset-password */
  adminResetPassword(payload: AdminResetPasswordRequest): Promise<{ message: string }> {
    return apiService.post(AUTH_ENDPOINTS.ADMIN_RESET_PASSWORD, payload);
  },

  /** GET /auth/validate-token */
  validateToken(): Promise<{ valid: boolean; user?: UserInfo }> {
    return apiService.get(AUTH_ENDPOINTS.VALIDATE_TOKEN);
  },

  /**
   * GET /auth/first-login-info?token=… — public.
   * Returns the user identity associated with a welcome-email token so the
   * password screen can show "Setting password for {name} ({email})".
   */
  firstLoginInfo(token: string): Promise<{
    userId: string; email: string; fullName: string; tenantId: string; valid: boolean;
  }> {
    return apiService.get(AUTH_ENDPOINTS.FIRST_LOGIN_INFO, { params: { token } });
  },

  /**
   * POST /auth/first-login — public.
   * Exchanges a welcome-email token + permanent password for AuthResponse
   * (auto-login). Persists the session via `rememberMe=true`.
   */
  async firstLogin(payload: { token: string; newPassword: string }): Promise<AuthResponse> {
    const res = await apiService.post<AuthResponse, typeof payload>(
      AUTH_ENDPOINTS.FIRST_LOGIN,
      payload,
    );
    authStorage.saveSession(res, true);
    return res;
  },

  storage: authStorage,
};

export default authService;
