import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client';
import { DocumentList } from '../components/DocumentList';
import type { Document, QAResponse } from '../api/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: QAResponse['sources'];
  confidence?: string;
  timestamp?: string;
}

const CHAT_STORAGE_KEY = 'docrag-chat-history';

// Load messages from localStorage
const loadStoredMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
};

// Save messages to localStorage
const saveMessages = (messages: Message[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

export function ChatPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => loadStoredMessages());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load documents
  useEffect(() => {
    api.listDocuments('indexed').then(({ documents }) => setDocuments(documents));
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setExpandedSources(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question, timestamp: new Date().toISOString() },
    ]);
    setIsLoading(true);

    try {
      const response = await api.askQuestion(
        question,
        selectedDocIds.length > 0 ? selectedDocIds : undefined
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.sources,
          confidence: response.confidence,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (index: number) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map((d) => d.doc_id));
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Left Sidebar - Document Selection */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-outline-variant/10 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-xl">description</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-on-surface">Documents</h3>
              <p className="text-xs text-on-surface-variant">
                {documents.length} available
              </p>
            </div>
          </div>

          {/* Select All / Clear */}
          {documents.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">
                {selectedDocIds.length > 0 ? (
                  <span className="font-medium text-primary">
                    {selectedDocIds.length} selected
                  </span>
                ) : (
                  'None selected'
                )}
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer"
              >
                {selectedDocIds.length === documents.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-3">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-outline text-2xl">description</span>
              </div>
              <p className="text-sm font-medium text-on-surface">No documents</p>
              <p className="text-xs text-on-surface-variant mt-1">Upload documents to start chatting</p>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              selectable
              selectedIds={selectedDocIds}
              onSelectionChange={setSelectedDocIds}
              compact
            />
          )}
        </div>

        {/* Sidebar Footer */}
        {selectedDocIds.length > 0 && (
          <div className="p-3 border-t border-outline-variant/10 bg-primary-fixed/20">
            <p className="text-xs text-primary text-center font-medium">
              Chatting with {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-outline-variant/10 overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 border-b border-slate-100 bg-white/70 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="font-headline text-lg font-extrabold text-indigo-900">Document Q&A</h1>
            <p className="text-sm text-on-surface-variant">
              {selectedDocIds.length > 0
                ? `Chatting with ${selectedDocIds.length} document(s)`
                : 'Select documents or chat with all'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-xl transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Clear
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-on-surface-variant py-12">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-outline">chat_bubble</span>
              </div>
              <p className="font-headline font-semibold text-on-surface">Start a conversation</p>
              <p className="text-sm text-on-surface-variant mt-1">Ask questions about your documents</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'primary-gradient text-white'
                    : 'bg-surface-container-low text-on-surface'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="chat-markdown text-on-surface">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                        ),
                        h1: ({ children }) => (
                          <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-on-surface">{children}</h2>
                        ),
                        h2: ({ children }) => (
                          <h3 className="text-base font-semibold mb-2 mt-3 text-on-surface">{children}</h3>
                        ),
                        h3: ({ children }) => (
                          <h4 className="text-sm font-semibold mb-1 mt-2 text-on-surface">{children}</h4>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-on-surface">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        code: ({ className, children }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm font-mono text-on-surface">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto my-3 text-sm font-mono">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 py-1 my-3 bg-primary-fixed/10 rounded-r-lg text-on-surface-variant italic">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="my-4 border-outline-variant/30" />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/20">
                    <button
                      onClick={() => toggleSources(index)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {expandedSources.has(index) ? 'expand_more' : 'chevron_right'}
                      </span>
                      {message.sources.length} source(s)
                      {message.confidence && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            message.confidence === 'high'
                              ? 'bg-green-100 text-green-800'
                              : message.confidence === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {message.confidence} confidence
                        </span>
                      )}
                    </button>

                    {expandedSources.has(index) && (
                      <div className="mt-2 space-y-2">
                        {message.sources.map((source, i) => (
                          <div
                            key={i}
                            className="text-sm bg-surface-container-lowest rounded-lg p-2 border border-outline-variant/20"
                          >
                            <div className="font-medium text-on-surface">
                              {source.file_name}
                              {source.page_start && (
                                <span className="text-on-surface-variant ml-2">
                                  Page {source.page_start}
                                  {source.page_end &&
                                    source.page_end !== source.page_start &&
                                    `-${source.page_end}`}
                                </span>
                              )}
                            </div>
                            <p className="text-on-surface-variant mt-1">
                              {source.text_excerpt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex gap-1">
                    <div className="w-2 h-2 bg-outline rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-outline rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-outline rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-on-surface-variant">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-error-container text-on-error-container text-sm">
            {error}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-outline-variant/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-on-surface placeholder:text-outline"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2 px-6 py-2 primary-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
