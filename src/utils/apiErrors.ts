/**
 * Helpers for classifying API errors thrown by `apiService`.
 *
 * `apiService.normalizeError` produces objects shaped like
 *   { message, statusCode, errors?, timestamp?, path? }
 * where `statusCode` is the HTTP status (0 for network errors).
 */

export function isServerError(err: unknown): boolean {
  const status = (err as { statusCode?: number } | null)?.statusCode;
  return typeof status === 'number' && status >= 500;
}
