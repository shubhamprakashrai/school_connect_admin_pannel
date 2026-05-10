/**
 * Tenant context.
 *
 * The active tenant id is read by `apiService` directly from storage on every
 * request, so anything that wants to switch tenant only has to call
 * `setTenantId` here — the next API call will carry the new `X-Tenant-ID`
 * header automatically.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_TENANT_ID, STORAGE_KEYS } from '../config/api.config';
import { useAuth } from './AuthContext';

interface TenantContextValue {
  tenantId: string;
  setTenantId: (id: string) => void;
  resetToDefault: () => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function readPersistedTenantId(): string {
  return (
    sessionStorage.getItem(STORAGE_KEYS.TENANT_ID) ||
    localStorage.getItem(STORAGE_KEYS.TENANT_ID) ||
    DEFAULT_TENANT_ID
  );
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tenantId, setTenantIdState] = useState<string>(() => readPersistedTenantId());

  // Pull tenant from the logged-in user — keeps storage in sync after login.
  useEffect(() => {
    if (user?.tenantId && user.tenantId !== tenantId) {
      setTenantIdState(user.tenantId);
      // Mirror to whichever store already has the session.
      const target = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        ? localStorage
        : sessionStorage;
      target.setItem(STORAGE_KEYS.TENANT_ID, user.tenantId);
    }
  }, [user, tenantId]);

  const setTenantId = useCallback((id: string) => {
    setTenantIdState(id);
    const target = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      ? localStorage
      : sessionStorage;
    target.setItem(STORAGE_KEYS.TENANT_ID, id);
  }, []);

  const resetToDefault = useCallback(() => {
    setTenantId(DEFAULT_TENANT_ID);
  }, [setTenantId]);

  const value = useMemo<TenantContextValue>(
    () => ({ tenantId, setTenantId, resetToDefault }),
    [tenantId, setTenantId, resetToDefault],
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>');
  return ctx;
}
