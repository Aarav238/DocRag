import { useState, useEffect, useCallback, useRef } from 'react';
import { FileUpload } from '../components/FileUpload';
import { DocumentList } from '../components/DocumentList';
import { DocumentListSkeleton } from '../components/DocumentListSkeleton';
import { api } from '../api/client';
import type { Document } from '../api/types';

const PROCESSING_STATUSES = ['uploaded', 'extracting', 'chunking', 'embedding'];

export function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const { documents } = await api.listDocuments();
      setDocuments(documents);
      return documents;
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      return [];
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  const hasProcessingDocuments = useCallback((docs: Document[]) => {
    return docs.some((doc) => PROCESSING_STATUSES.includes(doc.status));
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      const docs = await fetchDocuments();
      if (!hasProcessingDocuments(docs)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 2000);
  }, [fetchDocuments, hasProcessingDocuments]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchDocuments().then((docs) => {
      if (hasProcessingDocuments(docs)) {
        startPolling();
      }
    });

    return () => stopPolling();
  }, [fetchDocuments, hasProcessingDocuments, startPolling, stopPolling]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadingFileName(file.name);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.uploadDocument(file);
      await fetchDocuments();
      startPolling();
      setSuccessMessage(`"${file.name}" uploaded successfully! Processing started.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadingFileName('');
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.doc_id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="flex min-h-full min-w-0 flex-col animate-fade-in">
      <div className="mx-auto w-full min-w-0 max-w-6xl space-y-6 p-3 sm:space-y-8 sm:p-6 lg:p-8">
        {/* Success Message */}
        {successMessage && (
          <div className="flex animate-scale-in items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:items-center sm:px-5 sm:py-4">
            <span className="material-symbols-outlined shrink-0 text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span className="min-w-0 flex-1 text-sm font-medium text-emerald-800 sm:text-base">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex animate-scale-in items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 sm:px-5 sm:py-4">
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-red-500">error</span>
            <div className="min-w-0 flex-1 pr-1">
              <p className="font-bold text-red-800">Upload failed</p>
              <p className="mt-1 break-words text-sm text-red-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="-m-1 shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-100/60 hover:text-red-600 cursor-pointer"
              aria-label="Dismiss error"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}

        {/* File Upload */}
        <FileUpload
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadingFileName={uploadingFileName}
        />

        {/* Documents List */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h2 className="font-headline text-lg font-bold text-neutral-900">Your Documents</h2>
            {documents.length > 0 && (
              <span className="text-sm font-medium text-neutral-400 sm:shrink-0">{documents.length} total</span>
            )}
          </div>
          {isLoadingDocs ? (
            <DocumentListSkeleton count={3} />
          ) : (
            <DocumentList documents={documents} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
