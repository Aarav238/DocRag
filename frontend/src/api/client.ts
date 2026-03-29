import type { Document, SearchResponse, QAResponse, DraftResponse } from './types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';
const API_BASE = BACKEND_URL;

let tokenGetter: (() => Promise<string | null>) | null = null;

/** Called from a component inside ClerkProvider (e.g. ClerkTokenBridge). */
export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (tokenGetter) {
    const t = await tokenGetter();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  return fetch(input, { ...init, headers });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }
  return response.json();
}

export const api = {
  async uploadDocument(file: File): Promise<{ doc_id: string; file_name: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authFetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  async getDocument(docId: string): Promise<Document> {
    const response = await authFetch(`${API_BASE}/documents/${docId}`);
    return handleResponse(response);
  },

  async listDocuments(status?: string): Promise<{ documents: Document[] }> {
    const params = status ? `?status=${status}` : '';
    const response = await authFetch(`${API_BASE}/documents${params}`);
    return handleResponse(response);
  },

  async deleteDocument(docId: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  /** Open PDF/view in a new tab (uses session token; required now that the API is authenticated). */
  async openDocumentView(docId: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/documents/${docId}/view`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Could not open document' }));
      throw new Error(error.detail || 'Could not open document');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 120_000);
  },

  async downloadDocument(docId: string, fileName: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/documents/${docId}/download`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || 'Download failed');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async search(query: string, docIds?: string[], topK: number = 5): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    if (docIds?.length) {
      params.set('doc_ids', docIds.join(','));
    }
    const response = await authFetch(`${API_BASE}/search?${params}`);
    return handleResponse(response);
  },

  async askQuestion(
    question: string,
    docIds?: string[],
    topK: number = 5
  ): Promise<QAResponse> {
    const response = await authFetch(`${API_BASE}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        doc_ids: docIds,
        top_k: topK,
      }),
    });
    return handleResponse(response);
  },

  async generateDraft(
    instruction: string,
    referenceDocIds: string[],
    sections?: string[],
    styleGuidance?: string
  ): Promise<DraftResponse> {
    const response = await authFetch(`${API_BASE}/draft/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction,
        reference_doc_ids: referenceDocIds,
        sections,
        style_guidance: styleGuidance,
      }),
    });
    return handleResponse(response);
  },
};
