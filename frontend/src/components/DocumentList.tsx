import { useState } from 'react';
import type { Document } from '../api/types';
import { api } from '../api/client';

interface DocumentListProps {
  documents: Document[];
  onDelete?: (docId: string) => Promise<void> | void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  compact?: boolean;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden p-8 animate-scale-in">
        <div className="pb-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100/50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
          </div>
          <h3 className="font-headline text-2xl font-black text-neutral-900 text-center">Delete Document</h3>
          <p className="text-sm text-neutral-500 text-center mt-2">
            Are you sure you want to delete{' '}
            <span className="font-bold text-neutral-800">"{fileName}"</span>?
          </p>
          <p className="text-xs text-neutral-400 text-center mt-2">
            This will permanently remove the document and all its indexed data.
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
  uploaded: { color: 'text-amber-700', bgColor: 'bg-amber-50 border border-amber-200/50', label: 'Queued', icon: 'clock' },
  extracting: { color: 'text-violet-600', bgColor: 'bg-violet-50 border border-violet-200/50', label: 'Extracting...', icon: 'document' },
  chunking: { color: 'text-violet-700', bgColor: 'bg-violet-50 border border-violet-200/50', label: 'Chunking...', icon: 'scissors' },
  embedding: { color: 'text-cyan-700', bgColor: 'bg-cyan-50 border border-cyan-200/50', label: 'Embedding...', icon: 'sparkles' },
  indexed: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border border-emerald-200/50', label: 'Ready', icon: 'check' },
  failed: { color: 'text-red-600', bgColor: 'bg-red-50 border border-red-200/50', label: 'Failed', icon: 'x' },
};

function StatusIcon({ status }: { status: string }) {
  const isProcessing = ['uploaded', 'extracting', 'chunking', 'embedding'].includes(status);

  if (isProcessing) {
    return (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
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

function getFileExtension(fileType: string, fileName?: string): string {
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext) return ext;
  }
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('docx') || fileType.includes('wordprocessingml')) return 'docx';
  if (fileType.includes('doc')) return 'doc';
  return fileType.split('/').pop() || fileType;
}

function FileIcon({ fileType }: { fileType: string }) {
  const isPdf = fileType.includes('pdf');
  return (
    <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100/50 flex items-center justify-center">
      <span className="material-symbols-outlined text-violet-500 text-2xl">
        {isPdf ? 'description' : 'article'}
      </span>
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
  const [busyDocId, setBusyDocId] = useState<string | null>(null);

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
    if (!isDeleting) setDeleteTarget(null);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/50 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-neutral-400 text-3xl">description</span>
        </div>
        <p className="text-neutral-600 font-medium">No documents uploaded yet</p>
        <p className="text-sm text-neutral-400 mt-1">Upload a PDF or DOCX to get started</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
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
                  ? 'border-violet-300 bg-violet-50/40 shadow-sm'
                  : 'border-neutral-100 bg-white hover:border-violet-200 hover:bg-violet-50/20'
              }`}
              onClick={() => canSelect && toggleSelection(doc.doc_id)}
            >
              <div className="flex items-center gap-3">
                {canSelect && (
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-violet-600 border-violet-600'
                        : 'border-neutral-300 group-hover:border-violet-400'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50">
                  <span className="material-symbols-outlined text-violet-500 text-lg">
                    {isPdf ? 'description' : 'article'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate" title={doc.file_name}>
                    {doc.file_name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {getFileExtension(doc.file_type, doc.file_name).toUpperCase()} · {new Date(doc.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </p>
                </div>

                {doc.status === 'indexed' && (
                  <button
                    type="button"
                    disabled={busyDocId === doc.doc_id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setBusyDocId(doc.doc_id);
                      try {
                        await api.openDocumentView(doc.doc_id);
                      } catch (err) {
                        console.error(err);
                        alert(err instanceof Error ? err.message : 'Could not open document');
                      } finally {
                        setBusyDocId(null);
                      }
                    }}
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-violet-500 hover:bg-violet-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer disabled:opacity-40"
                    title="View document"
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none">visibility</span>
                  </button>
                )}

                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, i) => {
        const config = statusConfig[doc.status] || statusConfig.failed;
        const isProcessing = ['uploaded', 'extracting', 'chunking', 'embedding'].includes(doc.status);
        const isSelected = selectedIds.includes(doc.doc_id);
        const canSelect = selectable && doc.status === 'indexed';

        return (
          <div
            key={doc.doc_id}
            className={`group relative bg-white rounded-2xl border p-5 transition-all duration-200 card-hover animate-fade-in-up ${
              canSelect ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'border-violet-300 bg-violet-50/20 shadow-md shadow-violet-500/5'
                : 'border-neutral-200/60 shadow-sm'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
            onClick={() => canSelect && toggleSelection(doc.doc_id)}
          >
            {/* Processing shimmer */}
            {isProcessing && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </div>
            )}

            <div className="relative flex items-center gap-4">
              {canSelect && (
                <div className="flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 border-violet-600'
                        : 'border-neutral-300 group-hover:border-violet-400'
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

              <FileIcon fileType={doc.file_type} />

              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 truncate" title={doc.file_name}>
                  {doc.file_name}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
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

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} ${config.color}`}>
                <StatusIcon status={doc.status} />
                <span className="text-sm font-bold whitespace-nowrap">{config.label}</span>
              </div>

              {doc.status === 'indexed' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.file_type.includes('pdf') && (
                    <button
                      type="button"
                      disabled={busyDocId === doc.doc_id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setBusyDocId(doc.doc_id);
                        try {
                          await api.openDocumentView(doc.doc_id);
                        } catch (err) {
                          console.error(err);
                          alert(err instanceof Error ? err.message : 'Could not open document');
                        } finally {
                          setBusyDocId(null);
                        }
                      }}
                      className="flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-violet-500 hover:bg-violet-50 transition-colors cursor-pointer disabled:opacity-40"
                      title="View document"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={busyDocId === doc.doc_id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setBusyDocId(doc.doc_id);
                      try {
                        await api.downloadDocument(doc.doc_id, doc.file_name);
                      } catch (err) {
                        console.error(err);
                        alert(err instanceof Error ? err.message : 'Download failed');
                      } finally {
                        setBusyDocId(null);
                      }
                    }}
                    className="flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-violet-500 hover:bg-violet-50 transition-colors cursor-pointer disabled:opacity-40"
                    title="Download document"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                  </button>

                  {onDelete && (
                    <button
                      onClick={(e) => handleDeleteClick(e, doc)}
                      className="flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  )}
                </div>
              )}

              {onDelete && doc.status !== 'uploaded' && doc.status !== 'indexed' && (
                <button
                  onClick={(e) => handleDeleteClick(e, doc)}
                  className="flex-shrink-0 p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete document"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              )}
            </div>

            {isProcessing && (
              <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    doc.status === 'uploaded'
                      ? 'w-1/4 bg-amber-400'
                      : doc.status === 'extracting'
                      ? 'w-2/4 bg-violet-500'
                      : doc.status === 'chunking'
                      ? 'w-3/4 bg-violet-600'
                      : 'w-[90%] bg-cyan-500'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}

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
