export interface Document {
  doc_id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  status: 'uploaded' | 'extracting' | 'chunking' | 'embedding' | 'indexed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface SearchResult {
  chunk_id: string;
  doc_id: string;
  file_name: string;
  text: string;
  page_start?: number;
  page_end?: number;
  similarity_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
}

export interface Source {
  chunk_id: string;
  doc_id: string;
  file_name: string;
  page_start?: number;
  page_end?: number;
  text_excerpt: string;
}

export interface QAResponse {
  question: string;
  answer: string;
  sources: Source[];
  confidence: 'high' | 'medium' | 'low';
}

export interface DraftSection {
  title: string;
  content: string;
}

export interface DraftResponse {
  instruction: string;
  draft: string;
  sections: DraftSection[];
  reference_docs: string[];
}
