import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../api/client';
import { DocumentList } from '../components/DocumentList';
import { StreamingMarkdown } from '../components/StreamingMarkdown';
import type { Document, QAResponse } from '../api/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: QAResponse['sources'];
  confidence?: string;
  timestamp?: string;
}

const getChatStorageKey = (userId: string) => `docrag-chat-history-${userId}`;

const loadStoredMessages = (userId: string | undefined): Message[] => {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(getChatStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
};

const saveMessages = (userId: string | undefined, messages: Message[]) => {
  if (!userId) return;
  try {
    localStorage.setItem(getChatStorageKey(userId), JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

export function ChatPage() {
  const { user } = useUser();
  const userId = user?.id;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listDocuments('indexed').then(({ documents }) => setDocuments(documents));
  }, []);

  // Load messages when user changes (login/switch account)
  // Also clean up the old unscoped key from before this fix
  useEffect(() => {
    localStorage.removeItem('docrag-chat-history');
    setMessages(loadStoredMessages(userId));
    setExpandedSources(new Set());
  }, [userId]);

  useEffect(() => {
    saveMessages(userId, messages);
  }, [userId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex gap-5 h-[calc(100vh-12rem)] p-5 animate-fade-in">
      {/* Left Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-violet-600 text-xl">description</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-neutral-900">Documents</h3>
              <p className="text-xs text-neutral-500">{documents.length} available</p>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                {selectedDocIds.length > 0 ? (
                  <span className="font-bold text-violet-600">{selectedDocIds.length} selected</span>
                ) : (
                  'None selected'
                )}
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-violet-600 hover:text-violet-800 font-bold cursor-pointer"
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
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-neutral-400 text-2xl">description</span>
              </div>
              <p className="text-sm font-medium text-neutral-700">No documents</p>
              <p className="text-xs text-neutral-500 mt-1">Upload documents to start chatting</p>
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
          <div className="p-3 border-t border-violet-100 bg-violet-50/50">
            <p className="text-xs text-violet-600 text-center font-bold">
              Chatting with {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-neutral-200/60 overflow-hidden shadow-sm">
        {/* Top Bar */}
        <div className="p-4 border-b border-neutral-100 glass-panel flex items-center justify-between">
          <div>
            <h1 className="font-headline text-lg font-black text-neutral-900">Document Q&A</h1>
            <p className="text-sm text-neutral-500">
              {selectedDocIds.length > 0
                ? `Chatting with ${selectedDocIds.length} document(s)`
                : 'Select documents or chat with all'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              Clear
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-neutral-500 py-16">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100/50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-violet-300">chat_bubble</span>
              </div>
              <p className="font-headline font-bold text-neutral-800">Start a conversation</p>
              <p className="text-sm text-neutral-500 mt-1">Ask questions about your documents</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'primary-gradient text-white shadow-lg shadow-violet-500/15'
                    : 'bg-neutral-50 text-on-surface border border-neutral-100'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <StreamingMarkdown text={message.content} />
                )}

                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-200/50">
                    <button
                      onClick={() => toggleSources(index)}
                      className="text-sm text-violet-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {expandedSources.has(index) ? 'expand_more' : 'chevron_right'}
                      </span>
                      {message.sources.length} source(s)
                      {message.confidence && (
                        <span
                          className={`ml-2 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                            message.confidence === 'high'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : message.confidence === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              : 'bg-red-50 text-red-700 border border-red-200/50'
                          }`}
                        >
                          {message.confidence} confidence
                        </span>
                      )}
                    </button>

                    {expandedSources.has(index) && (
                      <div className="mt-2 space-y-2 animate-fade-in">
                        {message.sources.map((source, i) => (
                          <div
                            key={i}
                            className="text-sm bg-white rounded-xl p-3 border border-neutral-200/50 shadow-sm"
                          >
                            <div className="font-bold text-neutral-800">
                              {source.file_name}
                              {source.page_start && (
                                <span className="text-neutral-500 ml-2 font-medium">
                                  Page {source.page_start}
                                  {source.page_end &&
                                    source.page_end !== source.page_start &&
                                    `-${source.page_end}`}
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-500 mt-1">{source.text_excerpt}</p>
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
            <div className="flex justify-start animate-fade-in">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce animation-delay-150" />
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce animation-delay-300" />
                  </div>
                  <span className="text-neutral-500 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2.5 bg-red-50 text-red-700 text-sm font-medium border-t border-red-100">
            {error}
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none bg-white text-neutral-900 placeholder:text-neutral-400 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2 px-6 py-3 primary-gradient text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-violet-500/15"
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
