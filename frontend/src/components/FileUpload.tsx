import { useCallback, useEffect, useRef, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadingFileName?: string;
}

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

function validateFile(file: File): string | null {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type "${ext}". Only .PDF and .DOCX files are accepted.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}

export function FileUpload({ onUpload, isUploading, uploadingFileName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const dismissTimer = useRef<number | null>(null);

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (validationError) {
      dismissTimer.current = window.setTimeout(() => setValidationError(null), 6000);
      return () => {
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
      };
    }
  }, [validationError]);

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }
      setValidationError(null);
      await onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFile(file);
      }
      e.target.value = '';
    },
    [handleFile]
  );

  const hasError = !!validationError;

  return (
    <div className="relative group min-w-0 max-w-full overflow-hidden rounded-2xl">
      {/* Gradient glow — shifts to red on error */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500 ${
          hasError
            ? 'bg-gradient-to-r from-red-500/15 via-red-400/10 to-red-500/15 opacity-100'
            : 'bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100'
        }`}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!hasError) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative min-w-0 bg-white border-2 border-dashed rounded-2xl px-4 py-8 text-center transition-all duration-300 sm:px-8 sm:py-10 md:p-14 ${
          hasError
            ? 'border-red-300 bg-red-50/30'
            : isDragging
            ? 'border-violet-400 bg-violet-50/50 sm:scale-[1.005]'
            : isUploading
            ? 'border-violet-300/50 bg-violet-50/20'
            : 'border-neutral-200 hover:border-violet-300'
        }`}
        style={isShaking ? { animation: 'headShake 0.5s ease-in-out' } : undefined}
      >
        {isUploading ? (
          <div className="flex min-w-0 flex-col items-center">
            {/* Animated upload icon */}
            <div className="relative mb-5 sm:mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100/50 bg-violet-50 sm:h-20 sm:w-20">
                <span className="material-symbols-outlined text-3xl text-violet-500 animate-bounce sm:text-4xl">
                  cloud_upload
                </span>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-20" />
            </div>

            {/* File info */}
            <div className="mb-5 w-full max-w-md min-w-0 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-xl text-violet-500">description</span>
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-neutral-800 sm:text-base">
                  {uploadingFileName || 'Uploading...'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mx-auto mb-4 h-1.5 w-full max-w-[16rem] overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full w-full animate-pulse rounded-full accent-gradient" />
            </div>

            <p className="max-w-md px-1 text-sm font-medium text-neutral-600">
              Uploading and processing your document...
            </p>
            <p className="mt-1 px-1 text-xs text-neutral-400">This may take a few moments</p>
          </div>
        ) : hasError ? (
          /* ── Error state — the zone transforms to show the rejection ── */
          <div className="flex min-w-0 flex-col items-center animate-fade-in">
            {/* Error icon */}
            <div className="mb-5 sm:mb-6">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200/60 bg-red-50 sm:h-20 sm:w-20">
                <span
                  className="material-symbols-outlined text-3xl text-red-400 sm:text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_off
                </span>
              </div>
            </div>

            {/* Error message */}
            <h3 className="mb-1.5 px-1 font-headline text-lg font-black text-neutral-900 sm:text-xl">
              File not accepted
            </h3>
            <p className="mb-6 max-w-md px-2 text-sm font-medium text-red-600 sm:px-0">
              {validationError}
            </p>

            {/* Try again button */}
            <label className="mx-auto mb-6 block w-full max-w-xs sm:mx-0 sm:inline-block sm:w-auto sm:max-w-none">
              <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-px hover:bg-neutral-800 active:scale-[0.98] sm:w-auto sm:px-8">
                <span className="material-symbols-outlined text-xl">refresh</span>
                Try Another File
              </span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <p className="px-2 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:text-xs">
              Accepted: .PDF, .DOCX (Max 50MB)
            </p>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div className="mb-5 sm:mb-8">
              <div
                className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 sm:h-20 sm:w-20 ${
                  isDragging ? 'scale-105 bg-violet-100' : 'border border-violet-100/50 bg-violet-50'
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-violet-500 sm:text-4xl">cloud_upload</span>
              </div>
            </div>

            <h3 className="mb-2 px-1 font-headline text-lg font-black leading-snug text-neutral-900 sm:text-2xl">
              {isDragging ? 'Drop your file here' : 'Drag and drop your document'}
            </h3>
            <p className="mx-auto mb-6 max-w-sm px-2 text-center text-sm text-neutral-500 sm:mb-8 sm:px-0">
              or click to browse your files
            </p>

            <label className="mx-auto mb-6 block w-full max-w-xs sm:mx-0 sm:mb-8 sm:inline-block sm:w-auto sm:max-w-none">
              <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl primary-gradient px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/20 transition-all duration-200 hover:-translate-y-px hover:shadow-2xl hover:shadow-violet-500/25 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-3.5">
                <span className="material-symbols-outlined text-xl">upload_file</span>
                Choose File
              </span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <p className="px-2 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:text-xs">
              Accepted: .PDF, .DOCX (Max 50MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
