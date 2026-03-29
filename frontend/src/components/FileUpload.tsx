import { useCallback, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  uploadingFileName?: string;
}

export function FileUpload({ onUpload, isUploading, uploadingFileName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await onUpload(file);
      }
      e.target.value = '';
    },
    [onUpload]
  );

  return (
    <div className="relative group">
      {/* Gradient glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-10 group-hover:opacity-25 transition-opacity duration-300" />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative bg-surface-container-lowest border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-indigo-50/50 scale-[1.01]'
            : isUploading
            ? 'border-primary/40 bg-indigo-50/30'
            : 'border-outline-variant hover:border-primary'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            {/* Animated upload icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-bounce">
                  cloud_upload
                </span>
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-25" />
            </div>

            {/* File info */}
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">description</span>
                <span className="font-medium text-on-surface truncate max-w-[200px]">
                  {uploadingFileName || 'Uploading...'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse w-full" />
            </div>

            <p className="text-sm text-on-surface-variant">Uploading and processing your document...</p>
            <p className="text-xs text-outline mt-1">This may take a few moments</p>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-colors ${
                  isDragging ? 'bg-indigo-100' : 'bg-indigo-50'
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
              </div>
            </div>

            <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">
              {isDragging ? 'Drop your file here' : 'Drag and drop your document'}
            </h3>
            <p className="text-sm text-on-surface-variant mb-8">or click to browse your files</p>

            <label className="inline-block mb-6">
              <span className="inline-flex items-center gap-2 px-8 py-3 primary-gradient text-white font-bold rounded-lg shadow-xl cursor-pointer hover:opacity-90 active:scale-95 transition-all">
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

            <p className="text-xs font-semibold text-outline tracking-wide">
              ACCEPTED: .PDF, .DOCX (MAX 50MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
