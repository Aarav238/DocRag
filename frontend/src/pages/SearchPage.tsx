import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DocumentList } from '../components/DocumentList';
import type { Document, SearchResult } from '../api/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listDocuments('indexed').then(({ documents }) => setDocuments(documents));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await api.search(
        query,
        selectedDocIds.length > 0 ? selectedDocIds : undefined
      );
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Semantic Search</h1>
        <p className="text-gray-600">
          Search across your documents using natural language
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {documents.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Filter by documents (optional)
          </h3>
          <DocumentList
            documents={documents}
            selectable
            selectedIds={selectedDocIds}
            onSelectionChange={setSelectedDocIds}
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Results ({results.length})
          </h2>
          {results.map((result) => (
            <div
              key={result.chunk_id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {result.file_name}
                </span>
                <div className="flex items-center gap-3">
                  {result.page_start && (
                    <span className="text-sm text-gray-500">
                      {result.page_end && result.page_end !== result.page_start
                        ? `Pages ${result.page_start}-${result.page_end}`
                        : `Page ${result.page_start}`}
                    </span>
                  )}
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {(result.similarity_score * 100).toFixed(1)}% match
                  </span>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {result.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
