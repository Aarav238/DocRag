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
        className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden p-8">
        {/* Header */}
        <div className="pb-4">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-error text-3xl">warning</span>
          </div>
          <h3 className="font-headline text-2xl font-bold text-on-surface text-center">Delete Document</h3>
          <p className="text-sm text-on-surface-variant text-center mt-2">
            Are you sure you want to delete{' '}
            <span className="font-medium text-on-surface">"{fileName}"</span>?
          </p>
          <p className="text-xs text-on-surface-variant/70 text-center mt-2">
            This will permanently remove the document and all its indexed data.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-on-surface-variant bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-error rounded-lg shadow-lg shadow-error/20 hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
    bgColor: 'bg-amber-50',
    label: 'Queued',
    icon: 'clock',
  },
  extracting: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    label: 'Extracting text...',
    icon: 'document',
  },
  chunking: {
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    label: 'Chunking...',
    icon: 'scissors',
  },
  embedding: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    label: 'Creating embeddings...',
    icon: 'sparkles',
  },
  indexed: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    label: 'Ready',
    icon: 'check',
  },
  failed: {
    color: 'text-error',
    bgColor: 'bg-error-container',
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
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-2xl">description</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
      <span className="material-symbols-outlined text-primary text-2xl">article</span>
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
        <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-on-surface-variant text-3xl">description</span>
        </div>
        <p className="text-on-surface-variant font-medium">No documents uploaded yet</p>
        <p className="text-sm text-on-surface-variant/70 mt-1">Upload a PDF or DOCX to get started</p>
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
              className={`group relative rounded-xl border p-3 transition-all duration-200 ${
                canSelect ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'border-primary bg-primary-fixed/20 shadow-sm'
                  : 'border-outline-variant/10 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container-low'
              }`}
              onClick={() => canSelect && toggleSelection(doc.doc_id)}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                {canSelect && (
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-primary/40 group-hover:border-primary'
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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-lg">
                    {isPdf ? 'description' : 'article'}
                  </span>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate" title={doc.file_name}>
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {getFileExtension(doc.file_type, doc.file_name).toUpperCase()} · {new Date(doc.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </p>
                </div>

                {/* View button */}
                {doc.status === 'indexed' && (
                  <a
                    href={api.getDocumentViewUrl(doc.doc_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="View document"
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">visibility</span>
                  </a>
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
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
            className={`group relative bg-surface-container-lowest rounded-2xl border p-4 transition-all duration-200 ${
              canSelect ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-primary bg-primary-fixed/10 shadow-md shadow-primary/10'
                : 'border-outline-variant/10 hover:border-outline-variant/20 shadow-sm hover:shadow-md'
            } ${isProcessing ? 'animate-pulse' : ''}`}
            onClick={() => canSelect && toggleSelection(doc.doc_id)}
          >
            {/* Processing overlay shimmer */}
            {isProcessing && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
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
                        ? 'bg-primary border-primary'
                        : 'border-outline-variant group-hover:border-primary'
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
                <p className="font-semibold text-on-surface truncate" title={doc.file_name}>
                  {doc.file_name}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
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
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.color}`}>
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
                      className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      title="View document"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </a>
                  )}

                  {/* Download button */}
                  <a
                    href={api.getDocumentDownloadUrl(doc.doc_id)}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Download document"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                  </a>

                  {/* Delete button */}
                  {onDelete && (
                    <button
                      onClick={(e) => handleDeleteClick(e, doc)}
                      className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  )}
                </div>
              )}

              {/* Delete button for non-indexed docs */}
              {onDelete && doc.status !== 'uploaded' && doc.status !== 'indexed' && (
                <button
                  onClick={(e) => handleDeleteClick(e, doc)}
                  className="flex-shrink-0 p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete document"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              )}
            </div>

            {/* Processing progress bar */}
            {isProcessing && (
              <div className="mt-3 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    doc.status === 'uploaded'
                      ? 'w-1/4 bg-amber-400'
                      : doc.status === 'extracting'
                      ? 'w-2/4 bg-indigo-500'
                      : doc.status === 'chunking'
                      ? 'w-3/4 bg-indigo-600'
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
