import { useState, useEffect, useCallback, useRef } from 'react';
import { FileUpload } from '../components/FileUpload';
import { DocumentList } from '../components/DocumentList';
import { api } from '../api/client';
import type { Document } from '../api/types';

const PROCESSING_STATUSES = ['uploaded', 'extracting', 'chunking', 'embedding'];

export function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
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
    }
  }, []);

  const hasProcessingDocuments = useCallback((docs: Document[]) => {
    return docs.some((doc) => PROCESSING_STATUSES.includes(doc.status));
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling

    intervalRef.current = window.setInterval(async () => {
      const docs = await fetchDocuments();
      // Stop polling if no documents are being processed
      if (!hasProcessingDocuments(docs)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 2000); // Poll every 2 seconds for better UX
  }, [fetchDocuments, hasProcessingDocuments]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
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
      // Start polling since we just uploaded a new document
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

  const indexedCount = documents.filter((d) => d.status === 'indexed').length;
  const processingCount = documents.filter((d) => PROCESSING_STATUSES.includes(d.status)).length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-50 w-full flex justify-between items-center px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <h2 className="font-headline text-xl font-extrabold tracking-tight text-indigo-900">
            Upload Documents
          </h2>
          <div className="flex items-center gap-3">
            {indexedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {indexedCount} indexed
              </span>
            )}
            {processingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                {processingCount} processing
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-8 w-full space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="border-l-4 border-green-500 bg-green-50 px-4 py-3 rounded-r-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600 flex-shrink-0">check_circle</span>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="border-l-4 border-red-500 bg-red-50 px-4 py-3 rounded-r-lg flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 flex-shrink-0 mt-0.5">error</span>
            <div>
              <p className="font-medium text-red-800">Upload failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 cursor-pointer"
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">Your Documents</h2>
            {documents.length > 0 && (
              <span className="text-sm text-outline">{documents.length} total</span>
            )}
          </div>
          <DocumentList documents={documents} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
