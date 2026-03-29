import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { api } from '../api/client';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/upload', label: 'Upload', icon: 'upload_file' },
  { path: '/search', label: 'Search', icon: 'search' },
  { path: '/chat', label: 'Chat', icon: 'chat_bubble' },
  { path: '/draft', label: 'Draft', icon: 'edit_note' },
  { path: '/guide', label: 'Guide', icon: 'auto_stories' },
];

const PAGE_TITLES: Record<string, string> = {
  '/upload': 'Upload Documents',
  '/search': 'Semantic Search',
  '/chat': 'Document Q&A',
  '/draft': 'Draft Generator',
  '/guide': 'Guide',
};

const PROCESSING = new Set(['uploaded', 'extracting', 'chunking', 'embedding']);

function usePageTitle(pathname: string): string {
  return useMemo(() => {
    if (pathname.startsWith('/draft')) return PAGE_TITLES['/draft'] ?? 'Draft';
    return PAGE_TITLES[pathname] ?? 'DocRAG';
  }, [pathname]);
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const pageTitle = usePageTitle(location.pathname);
  const [indexedCount, setIndexedCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .listDocuments()
      .then(({ documents }) => {
        if (cancelled) return;
        const indexed = documents.filter((d) => d.status === 'indexed').length;
        const processing = documents.filter((d) => PROCESSING.has(d.status)).length;
        setIndexedCount(indexed);
        setProcessingCount(processing);
      })
      .catch(() => {
        if (!cancelled) {
          setIndexedCount(0);
          setProcessingCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* ── Dark Sidebar ── */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-sidebar py-6 dark-scroll">
        {/* Logo */}
        <div className="mb-8 px-6 animate-fade-in">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
              <div className="w-5 h-5 rounded-full border-2 border-white/80 relative">
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h1 className="font-headline text-lg font-black leading-tight text-white">DocRAG</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item, i) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/draft' && location.pathname.startsWith('/draft'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative mx-1 flex items-center rounded-xl px-4 py-3 transition-all duration-200 ease-out group animate-slide-in-left`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400" />
                )}

                <div
                  className={`flex items-center gap-3 w-full ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>

                {/* Active bg */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-white/[0.06] pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-slate-700/40 px-5 pt-5">
          <Link
            to="/upload"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Analysis
          </Link>
          <div className="mt-4 space-y-0.5">
            <Link
              to="/guide"
              className="flex items-center gap-2.5 px-2 py-2.5 text-xs text-slate-500 transition-colors hover:text-slate-300 rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </Link>
            <a
              href="mailto:support@example.com"
              className="flex items-center gap-2.5 px-2 py-2.5 text-xs text-slate-500 transition-colors hover:text-slate-300 rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              Support
            </a>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="ml-[260px] flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-50 flex w-full flex-wrap items-center justify-between gap-3 border-b border-neutral-200/60 glass-panel px-8 py-3.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 sm:gap-6">
            <h2 className="font-headline text-xl font-extrabold tracking-tight text-neutral-900 truncate">
              {pageTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {indexedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {indexedCount} Indexed
                </span>
              )}
              {processingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {processingCount} Processing
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-xl p-2.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 active:scale-95"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">notifications</span>
            </button>
            <Link
              to="/guide"
              className="rounded-xl p-2.5 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-600 active:scale-95"
              aria-label="Help and settings"
            >
              <span className="material-symbols-outlined text-[20px] leading-none">settings</span>
            </Link>
            <div className="ml-1 sm:ml-2">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      'w-8 h-8 rounded-xl overflow-hidden border-2 border-neutral-200 hover:border-violet-300 transition-colors',
                    userButtonTrigger: 'rounded-xl focus:shadow-none',
                  },
                }}
              />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
