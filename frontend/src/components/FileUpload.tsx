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
    <div className="relative group">
      {/* Gradient glow — shifts to red on error */}
      <div
        className={`absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500 ${
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
        className={`relative bg-white border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all duration-300 ${
          hasError
            ? 'border-red-300 bg-red-50/30'
            : isDragging
            ? 'border-violet-400 bg-violet-50/50 scale-[1.005]'
            : isUploading
            ? 'border-violet-300/50 bg-violet-50/20'
            : 'border-neutral-200 hover:border-violet-300'
        }`}
        style={isShaking ? { animation: 'headShake 0.5s ease-in-out' } : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            {/* Animated upload icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-violet-500 animate-bounce">
                  cloud_upload
                </span>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-20" />
            </div>

            {/* File info */}
            <div className="bg-white rounded-xl px-5 py-2.5 shadow-sm border border-neutral-200 mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-violet-500">description</span>
                <span className="font-medium text-neutral-800 truncate max-w-[200px]">
                  {uploadingFileName || 'Uploading...'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-4">
              <div className="h-full accent-gradient rounded-full animate-pulse w-full" />
            </div>

            <p className="text-sm text-neutral-600 font-medium">Uploading and processing your document...</p>
            <p className="text-xs text-neutral-400 mt-1">This may take a few moments</p>
          </div>
        ) : hasError ? (
          /* ── Error state — the zone transforms to show the rejection ── */
          <div className="flex flex-col items-center animate-fade-in">
            {/* Error icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-200/60">
                <span
                  className="material-symbols-outlined text-4xl text-red-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_off
                </span>
              </div>
            </div>

            {/* Error message */}
            <h3 className="font-headline text-xl font-black text-neutral-900 mb-1.5">
              File not accepted
            </h3>
            <p className="text-sm text-red-600 font-medium mb-6 max-w-sm">
              {validationError}
            </p>

            {/* Try again button */}
            <label className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg cursor-pointer hover:bg-neutral-800 hover:-translate-y-px active:scale-[0.98] transition-all duration-200">
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

            <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
              Accepted: .PDF, .DOCX (Max 50MB)
            </p>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div className="mb-8">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 ${
                  isDragging ? 'bg-violet-100 scale-105' : 'bg-violet-50 border border-violet-100/50'
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-violet-500">cloud_upload</span>
              </div>
            </div>

            <h3 className="font-headline text-2xl font-black text-neutral-900 mb-2">
              {isDragging ? 'Drop your file here' : 'Drag and drop your document'}
            </h3>
            <p className="text-sm text-neutral-500 mb-8">or click to browse your files</p>

            <label className="inline-block mb-8">
              <span className="inline-flex items-center gap-2 px-8 py-3.5 primary-gradient text-white font-bold rounded-xl shadow-xl shadow-violet-500/20 cursor-pointer hover:shadow-2xl hover:shadow-violet-500/25 hover:-translate-y-px active:scale-[0.98] transition-all duration-200">
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

            <p className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
              Accepted: .PDF, .DOCX (Max 50MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
