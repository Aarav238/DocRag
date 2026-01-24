import { useState } from 'react';
import type { Document } from '../api/types';
import { api } from '../api/client';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (docId: string) => Promise<void> | void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  compact?: boolean; // Compact mode for sidebars
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  fileName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  fileName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Delete Document</h3>
          <p className="text-sm text-gray-500 text-center mt-2">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-700">"{fileName}"</span>?
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            This will permanently remove the document and all its indexed data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; icon: string }> = {
  uploaded: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Queued',
    icon: 'clock',
  },
  extracting: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Extracting text...',
    icon: 'document',
  },
  chunking: {
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: 'Chunking...',
    icon: 'scissors',
  },
  embedding: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Creating embeddings...',
    icon: 'sparkles',
  },
  indexed: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Ready',
    icon: 'check',
  },
  failed: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Failed',
    icon: 'x',
  },
};

function StatusIcon({ status }: { status: string }) {
  const isProcessing = ['uploaded', 'extracting', 'chunking', 'embedding'].includes(status);

  if (isProcessing) {
    return (
      <div className="relative">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (status === 'indexed') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (status === 'failed') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  return null;
}

// Helper to get clean file extension
function getFileExtension(fileType: string, fileName?: string): string {
  // Try to extract from filename first
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext) return ext;
  }
  // Handle MIME types
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('docx') || fileType.includes('wordprocessingml')) return 'docx';
  if (fileType.includes('doc')) return 'doc';
  // Default to the file type or extract extension
  return fileType.split('/').pop() || fileType;
}

function FileIcon({ fileType }: { fileType: string }) {
  const isPdf = fileType.includes('pdf');
  if (isPdf) {
    return (
      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

export function DocumentList({
  documents,
  onDelete,
  selectable,
  selectedIds = [],
  onSelectionChange,
  compact = false,
}: DocumentListProps) {
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelection = (docId: string) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(docId)) {
      onSelectionChange(selectedIds.filter((id) => id !== docId));
    } else {
      onSelectionChange([...selectedIds, docId]);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setDeleteTarget(doc);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteTarget.doc_id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No documents uploaded yet</p>
        <p className="text-sm text-gray-400 mt-1">Upload a PDF or DOCX to get started</p>
      </div>
    );
  }

  // Compact mode for sidebars (Chat page)
  if (compact) {
    return (
      <div className="space-y-2">
        {documents.map((doc) => {
          const isSelected = selectedIds.includes(doc.doc_id);
          const canSelect = selectable && doc.status === 'indexed';
          const isPdf = doc.file_type.includes('pdf');

          return (
            <div
              key={doc.doc_id}
              className={`group relative rounded-lg border p-3 transition-all duration-200 ${
                canSelect ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
              }`}
              onClick={() => canSelect && toggleSelection(doc.doc_id)}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                {canSelect && (
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Small file icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isPdf ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <svg className={`w-4 h-4 ${isPdf ? 'text-red-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={doc.file_name}>
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileExtension(doc.file_type, doc.file_name).toUpperCase()} · {new Date(doc.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Normal mode (Upload page, Draft page)
  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const config = statusConfig[doc.status] || statusConfig.failed;
        const isProcessing = ['uploaded', 'extracting', 'chunking', 'embedding'].includes(doc.status);
        const isSelected = selectedIds.includes(doc.doc_id);
        const canSelect = selectable && doc.status === 'indexed';

        return (
          <div
            key={doc.doc_id}
            className={`group relative bg-white rounded-xl border-2 p-4 transition-all duration-200 ${
              canSelect ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10'
                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
            } ${isProcessing ? 'animate-pulse' : ''}`}
            onClick={() => canSelect && toggleSelection(doc.doc_id)}
          >
            {/* Processing overlay shimmer */}
            {isProcessing && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            )}

            <div className="relative flex items-center gap-4">
              {/* Selection checkbox */}
              {canSelect && (
                <div className="flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelection(doc.doc_id);
                    }}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* File icon */}
              <FileIcon fileType={doc.file_type} />

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate" title={doc.file_name}>
                  {doc.file_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getFileExtension(doc.file_type, doc.file_name).toUpperCase()} · {new Date(doc.created_at).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata',
                  })}
                </p>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.color}`}>
                <StatusIcon status={doc.status} />
                <span className="text-sm font-medium whitespace-nowrap">{config.label}</span>
              </div>

              {/* Action buttons */}
              {doc.status === 'indexed' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* View button (PDF only) */}
                  {doc.file_type.includes('pdf') && (
                    <a
                      href={api.getDocumentViewUrl(doc.doc_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="View document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                  )}

                  {/* Download button */}
                  <a
                    href={api.getDocumentDownloadUrl(doc.doc_id)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
                    title="Download document"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>

                  {/* Delete button */}
                  {onDelete && (
                    <button
                      onClick={(e) => handleDeleteClick(e, doc)}
                      className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Delete button for non-indexed docs */}
              {onDelete && doc.status !== 'uploaded' && doc.status !== 'indexed' && (
                <button
                  onClick={(e) => handleDeleteClick(e, doc)}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete document"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Processing progress bar */}
            {isProcessing && (
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    doc.status === 'uploaded'
                      ? 'w-1/4 bg-amber-400'
                      : doc.status === 'extracting'
                      ? 'w-2/4 bg-blue-500'
                      : doc.status === 'chunking'
                      ? 'w-3/4 bg-indigo-500'
                      : 'w-[90%] bg-purple-500'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          fileName={deleteTarget.file_name}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
