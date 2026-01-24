import type { Document, SearchResponse, QAResponse, DraftResponse } from './types';

// Get backend URL from environment variable, fallback to /api for local dev proxy
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api';
const API_BASE = BACKEND_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }
  return response.json();
}

export const api = {
  // Documents
  async uploadDocument(file: File): Promise<{ doc_id: string; file_name: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  async getDocument(docId: string): Promise<Document> {
    const response = await fetch(`${API_BASE}/documents/${docId}`);
    return handleResponse(response);
  },

  async listDocuments(status?: string): Promise<{ documents: Document[] }> {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE}/documents${params}`);
    return handleResponse(response);
  },

  async deleteDocument(docId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Search
  async search(query: string, docIds?: string[], topK: number = 5): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, top_k: String(topK) });
    if (docIds?.length) {
      params.set('doc_ids', docIds.join(','));
    }
    const response = await fetch(`${API_BASE}/search?${params}`);
    return handleResponse(response);
  },

  // Q&A
  async askQuestion(
    question: string,
    docIds?: string[],
    topK: number = 5
  ): Promise<QAResponse> {
    const response = await fetch(`${API_BASE}/qa`, {
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

  // Draft Generator
  async generateDraft(
    instruction: string,
    referenceDocIds: string[],
    sections?: string[],
    styleGuidance?: string
  ): Promise<DraftResponse> {
    const response = await fetch(`${API_BASE}/draft/generate`, {
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
