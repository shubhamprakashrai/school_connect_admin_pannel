/**
 * Client-side exporters — turn the rows already in memory into a download.
 * Used by list pages that don't need server-generated reports.
 */

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  // Quote when the cell contains a separator, quote, or newline.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export interface CsvColumn<T> {
  /** Column header. */
  header: string;
  /** Resolver — receives the row, returns the cell value. */
  value: (row: T) => unknown;
}

/**
 * Export an array of objects as CSV, downloading immediately.
 *
 *   exportToCsv('students.csv', rows, [
 *     { header: 'Name', value: (s) => s.fullName },
 *     { header: 'Roll', value: (s) => s.rollNumber },
 *   ]);
 */
export function exportToCsv<T>(filename: string, rows: T[], cols: CsvColumn<T>[]): void {
  const headerLine = cols.map((c) => escapeCsvCell(c.header)).join(',');
  const dataLines  = rows.map((r) => cols.map((c) => escapeCsvCell(c.value(r))).join(','));
  // BOM helps Excel detect UTF-8 on Windows.
  const csv = '﻿' + [headerLine, ...dataLines].join('\r\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

/** Export a JSON dump (pretty-printed). */
export function exportToJson(filename: string, data: unknown): void {
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    filename,
  );
}

/**
 * Export to "Excel" — really an Excel-compatible CSV. Avoids the xlsx
 * dependency for now; can be swapped if/when SheetJS gets added.
 */
export function exportToExcel<T>(filename: string, rows: T[], cols: CsvColumn<T>[]): void {
  const xlsxFilename = filename.replace(/\.(csv|json)$/i, '') + '.csv';
  exportToCsv(xlsxFilename, rows, cols);
}
