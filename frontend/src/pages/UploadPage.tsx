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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">
            Upload PDF or DOCX files to index them for search and Q&A
          </p>
        </div>
        {documents.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {indexedCount} indexed
            </div>
            {processingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {processingCount} processing
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          <h2 className="text-lg font-semibold text-gray-900">Your Documents</h2>
          {documents.length > 0 && (
            <span className="text-sm text-gray-500">{documents.length} total</span>
          )}
        </div>
        <DocumentList documents={documents} onDelete={handleDelete} />
      </div>
    </div>
  );
}
