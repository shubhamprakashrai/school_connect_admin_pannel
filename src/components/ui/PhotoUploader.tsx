/**
 * Drag-and-drop photo uploader.
 *
 * - Drag a file or click to pick.
 * - Validates extension + size client-side (max 2MB by default).
 * - Renders a base64 data-URL preview and emits it via `onChange`.
 *
 * Until the backend exposes a multipart upload endpoint we keep the data
 * URL flow — fields like `photoUrl` / `logoUrl` accept any URL string. To
 * switch to a real upload, replace `readAsDataURL` with `apiService.upload`.
 */

import { useCallback, useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

interface PhotoUploaderProps {
  value?: string | null;
  onChange: (next: string | null) => void;
  label?: string;
  hint?: string;
  /** Max size in MB (default 2). */
  maxSizeMb?: number;
  /** "circle" for avatars, "rect" for logos / banners. */
  shape?: 'circle' | 'rect';
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml';

export default function PhotoUploader({
  value, onChange, label = 'Photo', hint = 'PNG, JPG, WEBP or SVG · up to 2 MB',
  maxSizeMb = 2, shape = 'circle',
}: PhotoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Unsupported file type');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File is larger than ${maxSizeMb} MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || '') || null);
    reader.onerror = () => setError('Could not read file');
    reader.readAsDataURL(file);
  }, [onChange, maxSizeMb]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = ''; // allow re-selecting the same file
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const previewClass = shape === 'circle'
    ? 'w-24 h-24 rounded-full'
    : 'w-32 h-20 rounded-xl';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
          {label}
        </label>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        className={`flex items-center gap-4 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
          dragging
            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10'
            : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/40 dark:bg-slate-900/40'
        }`}
      >
        {value ? (
          <img
            src={value}
            alt="preview"
            className={`${previewClass} object-cover border border-white shadow-sm`}
          />
        ) : (
          <div className={`${previewClass} bg-gradient-to-br from-brand-500 via-accent-violet to-accent-pink text-white flex items-center justify-center`}>
            <Camera className="w-7 h-7" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink-900 dark:text-slate-100 inline-flex items-center gap-1">
            <Upload className="w-4 h-4" />
            {value ? 'Replace photo' : 'Drop a file or click to upload'}
          </div>
          <div className="text-xs text-ink-500 dark:text-slate-400 mt-0.5 truncate">
            {hint}
          </div>
          {error && (
            <div className="text-xs text-rose-500 mt-1">{error}</div>
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
            aria-label="Remove photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onInput}
        />
      </div>
    </div>
  );
}
