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

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <h2 className="font-headline text-4xl font-extrabold text-indigo-950 tracking-tight mb-2">
          Semantic Search
        </h2>
        <p className="text-on-surface-variant max-w-2xl leading-relaxed">
          Query your document library using natural language. Our AI understands
          context, nuance, and intent beyond simple keyword matching.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          <span className="material-symbols-outlined text-red-500">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative group">
          {/* Blur glow background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Search input container */}
          <div className="relative flex items-center p-2 bg-surface-container-lowest shadow-xl rounded-2xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-indigo-400 ml-4 mr-2 text-2xl ai-pulse">
              auto_awesome
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-indigo-950 placeholder:text-gray-400 outline-none px-2 py-3"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="bg-primary primary-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left filter sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="bg-surface-container-low rounded-2xl p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-indigo-500 text-xl">
                filter_list
              </span>
              <h3 className="font-headline font-bold text-indigo-950">
                Scope your search
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Select documents to narrow results, or leave all unchecked to
              search everything.
            </p>

            {documents.length > 0 ? (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <label
                    key={doc.doc_id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-highest/40 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.doc_id)}
                      onChange={() => {
                        setSelectedDocIds((prev) =>
                          prev.includes(doc.doc_id)
                            ? prev.filter((id) => id !== doc.doc_id)
                            : [...prev, doc.doc_id]
                        );
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="material-symbols-outlined text-indigo-400 text-lg">
                      description
                    </span>
                    <span className="text-sm font-medium text-indigo-900 truncate">
                      {doc.file_name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No indexed documents found.
              </p>
            )}

            {selectedDocIds.length > 0 && (
              <button
                onClick={() => setSelectedDocIds([])}
                className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Clear selection ({selectedDocIds.length})
              </button>
            )}
          </div>
        </aside>

        {/* Right results area */}
        <main className="col-span-12 lg:col-span-9">
          {/* Loading shimmer */}
          {isSearching && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
                      <div className="h-3 bg-gray-100 rounded-lg w-1/5" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded-lg w-full" />
                    <div className="h-3 bg-gray-100 rounded-lg w-5/6" />
                    <div className="h-3 bg-gray-100 rounded-lg w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isSearching && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-indigo-300 text-4xl">
                  manage_search
                </span>
              </div>
              <h3 className="font-headline text-xl font-bold text-indigo-950 mb-2">
                Ready to search
              </h3>
              <p className="text-on-surface-variant max-w-md">
                Enter a natural language query above to find relevant passages
                across your documents.
              </p>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-indigo-950">
                  Results
                  <span className="ml-2 text-sm font-normal text-on-surface-variant">
                    ({results.length} found)
                  </span>
                </h3>
              </div>

              {results.map((result) => {
                const score = result.similarity_score * 100;
                const isHighMatch = score >= 75;

                return (
                  <div
                    key={result.chunk_id}
                    className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm hover:shadow-md border border-outline-variant/10 transition-shadow duration-200"
                  >
                    {/* Card header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-indigo-50 rounded-xl p-3 shrink-0">
                        <span className="material-symbols-outlined text-indigo-600 text-2xl">
                          description
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-indigo-950 truncate">
                          {result.file_name}
                        </h4>
                        {result.page_start && (
                          <p className="text-sm text-on-surface-variant">
                            {result.page_end &&
                            result.page_end !== result.page_start
                              ? `Pages ${result.page_start}-${result.page_end}`
                              : `Page ${result.page_start}`}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full ${
                          isHighMatch
                            ? 'bg-secondary-container/20 text-indigo-700'
                            : 'bg-surface-container-highest/50 text-gray-600'
                        }`}
                      >
                        {score.toFixed(1)}% match
                      </span>
                    </div>

                    {/* Text excerpt */}
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap italic">
                      <mark className="bg-yellow-100/60 text-gray-800 rounded px-0.5">
                        {result.text}
                      </mark>
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-outline-variant/10">
                      <button
                        onClick={() =>
                          window.open(
                            api.getDocumentViewUrl(result.doc_id),
                            '_blank'
                          )
                        }
                        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          open_in_new
                        </span>
                        View Fragment
                      </button>
                      <button
                        onClick={() => handleCopyText(result.text)}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          content_copy
                        </span>
                        Copy
                      </button>
                      <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          bookmark
                        </span>
                        Bookmark
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
