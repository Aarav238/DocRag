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
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative bg-white border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-300 ${
          isDragging
            ? 'border-violet-400 bg-violet-50/50 scale-[1.005]'
            : isUploading
            ? 'border-violet-300/50 bg-violet-50/20'
            : 'border-neutral-200 hover:border-violet-300'
        }`}
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
