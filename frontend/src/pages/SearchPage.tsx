import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DocumentListSkeleton } from '../components/DocumentListSkeleton';
import type { Document, SearchResult } from '../api/types';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listDocuments('indexed').then(({ documents }) => setDocuments(documents)).finally(() => setIsLoadingDocs(false));
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
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-6 sm:mb-10">
        <h2 className="font-headline text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
          Semantic Search
        </h2>
        <p className="text-neutral-500 max-w-2xl leading-relaxed">
          Query your document library using natural language. Our AI understands
          context, nuance, and intent beyond simple keyword matching.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl animate-scale-in">
          <span className="material-symbols-outlined text-red-500">error</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 sm:mb-10">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/15 via-cyan-500/15 to-violet-500/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />

          <div className="relative flex items-center gap-2 sm:gap-3 p-2 pl-3 sm:pl-4 bg-white shadow-lg shadow-neutral-200/50 rounded-2xl border border-neutral-200/60 group-focus-within:border-violet-300 transition-colors">
            <div
              className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200/60"
              aria-hidden
            >
              <span className="material-symbols-outlined text-[22px] text-violet-600 leading-none">find_in_page</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-medium text-neutral-900 placeholder:text-neutral-400 outline-none px-1 sm:px-2 py-3"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="primary-gradient text-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-500/20 shrink-0"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Left filter sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 sticky top-24 border border-neutral-200/60 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-violet-500 text-xl">filter_list</span>
              <h3 className="font-headline font-bold text-neutral-900">Scope your search</h3>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              Select documents to narrow results, or leave all unchecked to search everything.
            </p>

            {isLoadingDocs ? (
              <DocumentListSkeleton count={3} compact />
            ) : documents.length > 0 ? (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <label
                    key={doc.doc_id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50/50 cursor-pointer transition-colors"
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
                      className="w-4 h-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="material-symbols-outlined text-violet-400 text-lg">description</span>
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {doc.file_name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">No indexed documents found.</p>
            )}

            {selectedDocIds.length > 0 && (
              <button
                onClick={() => setSelectedDocIds([])}
                className="mt-4 w-full text-sm text-violet-600 hover:text-violet-800 font-bold py-2.5 rounded-lg hover:bg-violet-50 transition-colors"
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
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 border border-neutral-100 animate-pulse"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded-lg w-1/3" />
                      <div className="h-3 bg-neutral-100 rounded-lg w-1/5" />
                    </div>
                    <div className="h-6 bg-neutral-200 rounded-full w-20" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-100 rounded-lg w-full" />
                    <div className="h-3 bg-neutral-100 rounded-lg w-5/6" />
                    <div className="h-3 bg-neutral-100 rounded-lg w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isSearching && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 border border-violet-100/50">
                <span className="material-symbols-outlined text-violet-300 text-4xl">manage_search</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-neutral-900 mb-2">
                Ready to search
              </h3>
              <p className="text-neutral-500 max-w-md">
                Enter a natural language query above to find relevant passages
                across your documents.
              </p>
            </div>
          )}

          {/* Results */}
          {!isSearching && results.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-neutral-900">
                  Results
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    ({results.length} found)
                  </span>
                </h3>
              </div>

              {results.map((result, i) => {
                const score = result.similarity_score * 100;
                const isHighMatch = score >= 75;

                return (
                  <div
                    key={result.chunk_id}
                    className="bg-white rounded-2xl p-4 sm:p-7 border border-neutral-200/60 card-hover animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Card header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-violet-50 rounded-xl p-3 shrink-0 border border-violet-100/50">
                        <span className="material-symbols-outlined text-violet-600 text-2xl">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 truncate">{result.file_name}</h4>
                        {result.page_start && (
                          <p className="text-sm text-neutral-500">
                            {result.page_end && result.page_end !== result.page_start
                              ? `Pages ${result.page_start}-${result.page_end}`
                              : `Page ${result.page_start}`}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-sm font-bold px-3.5 py-1.5 rounded-lg ${
                          isHighMatch
                            ? 'bg-violet-50 text-violet-700 border border-violet-200/50'
                            : 'bg-neutral-100 text-neutral-600 border border-neutral-200/50'
                        }`}
                      >
                        {score.toFixed(1)}% match
                      </span>
                    </div>

                    {/* Text excerpt */}
                    <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                      <mark className="bg-amber-100/60 text-neutral-800 rounded px-0.5">
                        {result.text}
                      </mark>
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-1 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await api.openDocumentView(result.doc_id);
                          } catch (err) {
                            console.error(err);
                            alert(err instanceof Error ? err.message : 'Could not open document');
                          }
                        }}
                        className="flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-800 hover:bg-violet-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                        View Fragment
                      </button>
                      <button
                        onClick={() => handleCopyText(result.text)}
                        className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                        Copy
                      </button>
                      <button className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-3 py-2 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">bookmark</span>
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
