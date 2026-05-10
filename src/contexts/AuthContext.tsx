/**
 * Auth context.
 *
 * - Hydrates from storage on mount, optionally re-validates the token.
 * - Schedules an auto-logout when the JWT exp claim is reached.
 * - Listens for the global `auth:logout` event dispatched by `apiService`
 *   so a 401 with a failed refresh kicks the user out everywhere at once.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import authService, { authStorage, getTokenExpiry } from '../services/auth.service';
import { dispatchNotification } from '../components/NotificationCenter';
import type { AuthResponse, LoginRequest, UserInfo } from '../types/auth';

interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  passwordResetRequired: boolean;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => authStorage.getUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [passwordResetRequired, setPasswordResetRequired] = useState<boolean>(false);
  const expiryTimerRef = useRef<number | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimerRef.current !== null) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  };

  const performLogout = useCallback(async () => {
    clearExpiryTimer();
    try {
      await authService.logout();
    } catch {
      // Server-side failure is non-blocking — local session is wiped in finally.
    }
    setUser(null);
    setPasswordResetRequired(false);
  }, []);

  /** Schedule auto-logout 5s before token actually expires. */
  const scheduleExpiryLogout = useCallback(
    (token: string) => {
      clearExpiryTimer();
      const expMs = getTokenExpiry(token);
      if (!expMs) return;
      const wait = expMs - Date.now() - 5000;
      if (wait <= 0) {
        void performLogout();
        return;
      }
      expiryTimerRef.current = window.setTimeout(() => {
        void performLogout();
      }, wait);
    },
    [performLogout],
  );

  // ---- Initial hydrate -----------------------------------------------------
  // Render proceeds with the cached user immediately; we then verify the
  // token in the background. If the server says it's invalid, we sign out.
  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }
    scheduleExpiryLogout(token);
    setIsInitializing(false);

    let alive = true;
    authService.validateToken()
      .then((res) => {
        if (!alive) return;
        if (res.valid === false) {
          void performLogout();
          return;
        }
        if (res.user) setUser(res.user);
      })
      .catch(() => {
        // Silent — apiService's 401 interceptor will sign out if it's truly stale.
      });
    return () => { alive = false; };
  }, [scheduleExpiryLogout, performLogout]);

  // ---- Global logout event from apiService (401 → refresh failed) ----------
  useEffect(() => {
    const handler = () => {
      clearExpiryTimer();
      setUser(null);
      setPasswordResetRequired(false);
      dispatchNotification({
        level: 'warning',
        title: 'Session expired',
        body: 'Please sign in again.',
      });
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  useEffect(() => () => clearExpiryTimer(), []);

  // ---- Public API ----------------------------------------------------------
  const login = useCallback<AuthContextValue['login']>(async (payload) => {
    const response = await authService.login(payload);
    setUser(response.user);
    setPasswordResetRequired(response.passwordResetRequired);
    scheduleExpiryLogout(response.accessToken);
    if (!response.passwordResetRequired) {
      dispatchNotification({
        level: 'success',
        title: `Welcome back${response.user.firstName ? ', ' + response.user.firstName : ''}`,
        body: response.user.tenantId ? `Signed in to ${response.user.tenantId}` : undefined,
      });
    }
    return response;
  }, [scheduleExpiryLogout]);

  const refreshUser = useCallback(async () => {
    try {
      const result = await authService.validateToken();
      if (result.valid && result.user) {
        setUser(result.user);
      } else {
        await performLogout();
      }
    } catch {
      await performLogout();
    }
  }, [performLogout]);

  const hasRole = useCallback<AuthContextValue['hasRole']>(
    (...roles) => {
      if (!user) return false;
      const normalized = user.role?.toString().toUpperCase();
      return roles.map((r) => r.toUpperCase()).includes(normalized);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      passwordResetRequired,
      login,
      logout: performLogout,
      refreshUser,
      hasRole,
    }),
    [user, isInitializing, passwordResetRequired, login, performLogout, refreshUser, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
