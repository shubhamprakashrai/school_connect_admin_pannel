/**
 * Active academic year context.
 * Modules that need the current year (attendance forms, exams, calendar)
 * read from here so a single switch updates everything.
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
import academicYearService from '../services/academicYear.service';
import type { AcademicYearResponse } from '../types/academicYear';
import { useAuth } from './AuthContext';

interface AcademicYearContextValue {
  active: AcademicYearResponse | null;
  all: AcademicYearResponse[];
  loading: boolean;
  refresh: () => Promise<void>;
  setActive: (year: AcademicYearResponse) => void;
}

const AcademicYearContext = createContext<AcademicYearContextValue | null>(null);

export function AcademicYearProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [all, setAll] = useState<AcademicYearResponse[]>([]);
  const [active, setActiveState] = useState<AcademicYearResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const list = await academicYearService.list();
      setAll(list);
      const found = list.find((y) => y.isActive) ?? list[0] ?? null;
      setActiveState(found);
    } catch {
      // Silently fail — UI will fall back to "no active year".
      setAll([]);
      setActiveState(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AcademicYearContextValue>(
    () => ({
      active,
      all,
      loading,
      refresh,
      setActive: (y) => setActiveState(y),
    }),
    [active, all, loading, refresh],
  );

  return <AcademicYearContext.Provider value={value}>{children}</AcademicYearContext.Provider>;
}

export function useAcademicYear(): AcademicYearContextValue {
  const ctx = useContext(AcademicYearContext);
  if (!ctx) throw new Error('useAcademicYear must be used inside <AcademicYearProvider>');
  return ctx;
}
