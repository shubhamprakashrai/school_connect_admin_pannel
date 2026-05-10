/**
 * Single axios client for the entire app.
 *
 * - BASE_URL is sourced from `api.config.ts`, which reads `import.meta.env`.
 *   Change the env file once and every request in the app updates.
 * - Request interceptor injects `Authorization: Bearer <token>` and
 *   `X-Tenant-ID: <tenantId>` automatically — call sites never have to
 *   touch headers.
 * - Response interceptor:
 *     401 → try /auth/refresh once; if that fails, clear session and
 *           dispatch a global `auth:logout` event so the app can react.
 *     5xx, network → retry with exponential backoff (up to 2 retries).
 *     all errors → normalized into the app's ApiError shape.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  API_DEBUG,
  API_TIMEOUT,
  AUTH_ENDPOINTS,
  BASE_URL,
  DEFAULT_TENANT_ID,
  STORAGE_KEYS,
} from '../config/api.config';
import type { ApiError, ApiResponse, RequestOptions } from '../types/api';

// ---------------------------------------------------------------------------
// Internal helpers — kept close to the client, intentionally not exported.
// ---------------------------------------------------------------------------

function readAccessToken(): string | null {
  return (
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
}

function readRefreshToken(): string | null {
  return (
    sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  );
}

function readTenantId(): string {
  return (
    sessionStorage.getItem(STORAGE_KEYS.TENANT_ID) ||
    localStorage.getItem(STORAGE_KEYS.TENANT_ID) ||
    DEFAULT_TENANT_ID
  );
}

function persistTokens(accessToken: string, refreshToken?: string) {
  // Mirror tokens into whichever store already held the previous one so the
  // user's "remember me" choice is preserved across refreshes.
  const target = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    ? localStorage
    : sessionStorage;
  target.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  if (refreshToken) target.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

function clearSession() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    store.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    store.removeItem(STORAGE_KEYS.USER);
    store.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Endpoints that must be called without an `X-Tenant-ID` header.
 * Login derives the tenant from the credentials, registration creates the
 * tenant, etc. — sending a stale/default tenant header here causes the
 * backend to scope its lookup to the wrong tenant and reject the request.
 */
const TENANT_AGNOSTIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/Initialreset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/tenants/register',
];

/**
 * Coerce any of these shapes into a flat array:
 *   - already an array → as-is
 *   - Spring `Page<T>` → `.content`
 *   - null/undefined/anything else → []
 */
export function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const content = (payload as { content?: unknown }).content;
    if (Array.isArray(content)) return content as T[];
  }
  return [];
}

function isTenantAgnosticPath(url?: string): boolean {
  if (!url) return false;
  return TENANT_AGNOSTIC_PATHS.some((p) => url.includes(p));
}

/**
 * Half the backend wraps responses in a `{status, message, data, error, timestamp}`
 * envelope; the other half returns raw DTOs. We auto-detect the envelope and
 * return only the inner `data` so call sites stay clean.
 *
 * Heuristic: wrapped responses always have an upper-case `status` field of
 * either 'SUCCESS' / 'ERROR' / 'WARNING' AND a `data` key. Anything else is
 * passed through untouched.
 */
function unwrapEnvelope<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in payload &&
    'data' in payload &&
    typeof (payload as { status: unknown }).status === 'string' &&
    /^(SUCCESS|ERROR|WARNING|FAIL)$/i.test((payload as { status: string }).status)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function normalizeError(error: AxiosError<ApiError>): ApiError {
  if (error.response) {
    const data = error.response.data as Partial<ApiError> | undefined;
    return {
      message: data?.message || error.message || 'Request failed',
      statusCode: error.response.status,
      errors: data?.errors,
      timestamp: data?.timestamp,
      path: data?.path,
    };
  }
  return {
    message: error.message || 'Network error',
    statusCode: 0,
  };
}

// ---------------------------------------------------------------------------
// Axios instance + interceptors
// ---------------------------------------------------------------------------

class ApiService {
  private readonly client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: API_TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.attachRequestInterceptor();
    this.attachResponseInterceptor();
  }

  private attachRequestInterceptor() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = readAccessToken();
        if (token && config.headers) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        // Public / pre-auth routes look up the tenant from the credentials
        // themselves (login) or are tenant-agnostic (register, forgot password,
        // verify email, etc.). Sending an X-Tenant-ID with a wrong / default
        // value here makes the backend look up the user under that tenant and
        // fail. Skip the header for those.
        if (config.headers && !isTenantAgnosticPath(config.url)) {
          config.headers.set('X-Tenant-ID', readTenantId());
        }
        if (API_DEBUG) {
          // eslint-disable-next-line no-console
          console.debug('[api]', config.method?.toUpperCase(), config.url, config.params || '');
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  private attachResponseInterceptor() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as
          | (InternalAxiosRequestConfig & { _retryCount?: number; _retried401?: boolean })
          | undefined;

        // 401 — try to refresh once and replay
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retried401 &&
          !originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH) &&
          !originalRequest.url?.includes(AUTH_ENDPOINTS.LOGIN)
        ) {
          originalRequest._retried401 = true;
          try {
            const newToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            }
            return this.client.request(originalRequest);
          } catch {
            clearSession();
            window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: '401' } }));
            return Promise.reject(normalizeError(error));
          }
        }

        // 5xx / network — exponential backoff retry
        const isRetriable =
          (!error.response && error.code !== 'ERR_CANCELED') ||
          (error.response && error.response.status >= 500);

        if (isRetriable && originalRequest) {
          const attempt = (originalRequest._retryCount ?? 0) + 1;
          const maxRetries = 2;
          if (attempt <= maxRetries) {
            originalRequest._retryCount = attempt;
            const wait = Math.min(2 ** attempt * 250, 4000);
            await delay(wait);
            return this.client.request(originalRequest);
          }
        }

        // After retries are exhausted, broadcast a server-error event so the
        // notification center can pick it up. (NotificationCenter is the only
        // listener; UI components keep using the rejected promise as before.)
        if (error.response && error.response.status >= 500) {
          window.dispatchEvent(new CustomEvent('api:server-error', {
            detail: {
              status: error.response.status,
              path: originalRequest?.url,
              message: (error.response.data as { message?: string } | undefined)?.message,
            },
          }));
        }

        return Promise.reject(normalizeError(error));
      },
    );
  }

  private refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      return Promise.reject(new Error('no refresh token'));
    }

    this.refreshPromise = axios
      .post<{ accessToken: string; refreshToken?: string }>(
        `${BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': readTenantId(),
          },
          timeout: API_TIMEOUT,
        },
      )
      .then((res) => {
        const { accessToken, refreshToken: newRefresh } = res.data;
        persistTokens(accessToken, newRefresh);
        return accessToken;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  async request<T = unknown>(
    config: AxiosRequestConfig,
    options: RequestOptions = {},
  ): Promise<T> {
    const merged: AxiosRequestConfig = {
      ...config,
      headers: { ...config.headers, ...(options.headers || {}) },
      params: { ...(config.params || {}), ...(options.params || {}) },
    };
    const response: AxiosResponse<T> = await this.client.request<T>(merged);
    return unwrapEnvelope<T>(response.data);
  }

  get<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ method: 'GET', url }, options);
  }

  /**
   * GET that always returns a flat array. Backend Spring controllers
   * typically return `Page<T>` even from "list everything" endpoints; this
   * helper auto-extracts `.content` so callers can treat the result as a
   * plain array regardless of pagination shape.
   */
  async getList<T = unknown>(url: string, options: RequestOptions = {}): Promise<T[]> {
    const res = await this.request<unknown>({ method: 'GET', url }, options);
    return toList<T>(res);
  }

  /** POST that flattens a Page<T> response down to T[]. */
  async postList<T = unknown, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T[]> {
    const res = await this.request<unknown>({ method: 'POST', url, data }, options);
    return toList<T>(res);
  }

  post<T = unknown, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ method: 'POST', url, data }, options);
  }

  put<T = unknown, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data }, options);
  }

  patch<T = unknown, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data }, options);
  }

  delete<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({ method: 'DELETE', url }, options);
  }

  upload<T = unknown>(url: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(
      { method: 'POST', url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } },
      options,
    );
  }

  async download(url: string, filename: string, options: RequestOptions = {}): Promise<void> {
    const response = await this.client.request<Blob>({
      method: 'GET',
      url,
      responseType: 'blob',
      headers: options.headers,
      params: options.params,
    });
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }

  raw(): AxiosInstance {
    return this.client;
  }
}

export const apiService = new ApiService();
export default apiService;

export type { ApiError, ApiResponse, RequestOptions };
