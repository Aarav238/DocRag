import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { api } from '../api/client';
import { ThemeToggle } from './ThemeToggle';

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
  const navigate = useNavigate();
  const { openUserProfile, signOut } = useClerk();
  const pageTitle = usePageTitle(location.pathname);
  const [indexedCount, setIndexedCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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

  // Close settings dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [settingsOpen]);

  // Close dropdown & mobile nav on route change
  useEffect(() => {
    setSettingsOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* ── Mobile sidebar backdrop ── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-neutral-200/70 bg-white dark:bg-surface-container dark:border-outline-variant py-6 transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="mb-8 px-6 animate-fade-in flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl primary-gradient shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-105">
              <span className="text-white text-base font-black font-headline">D</span>
            </div>
            <div>
              <h1 className="font-headline text-lg font-black leading-tight text-neutral-900 dark:text-on-surface">DocRAG</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">Intelligence</p>
            </div>
          </Link>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-surface-container-high dark:hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
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
                className={`relative mx-1 flex items-center rounded-xl px-4 py-3 transition-all duration-200 ease-out group animate-slide-in-left ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:text-on-surface-variant dark:hover:bg-surface-container-high dark:hover:text-on-surface'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-violet-500 dark:bg-violet-400" />
                )}

                <span
                  className={`material-symbols-outlined text-[22px] mr-3 ${
                    isActive ? 'text-violet-600 dark:text-violet-300' : 'text-neutral-400 group-hover:text-neutral-600 dark:text-on-surface-variant dark:group-hover:text-on-surface'
                  }`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-neutral-100 dark:border-outline-variant px-5 pt-5">
          <Link
            to="/upload"
            className="flex w-full items-center justify-center gap-2 rounded-xl primary-gradient py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-px"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Analysis
          </Link>
          <div className="mt-4 space-y-0.5">
            <Link
              to="/guide"
              className="flex items-center gap-2.5 px-2 py-2.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-on-surface rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </Link>
            <a
              href="mailto:aarav8090shukla@gmail.com"
              className="flex items-center gap-2.5 px-2 py-2.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-on-surface rounded-lg"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              Support
            </a>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="lg:ml-[260px] flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex w-full flex-wrap items-center justify-between gap-3 border-b border-neutral-200/60 dark:border-outline-variant glass-panel px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-on-surface-variant dark:hover:bg-surface-container-high dark:hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl leading-none">menu</span>
            </button>

            <h2 className="font-headline text-lg sm:text-xl font-extrabold tracking-tight text-neutral-900 dark:text-on-surface truncate">
              {pageTitle}
            </h2>
            <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-3">
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
            <ThemeToggle variant="compact" />
            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                className={`rounded-xl p-2.5 transition-all active:scale-95 cursor-pointer ${
                  settingsOpen
                    ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300'
                    : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-on-surface-variant dark:hover:bg-surface-container-high dark:hover:text-on-surface'
                }`}
                aria-label="Settings"
                aria-expanded={settingsOpen}
              >
                <span
                  className={`material-symbols-outlined text-[20px] leading-none transition-transform duration-300 block ${
                    settingsOpen ? 'rotate-90' : ''
                  }`}
                >
                  settings
                </span>
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-neutral-200/60 dark:border-outline-variant bg-white dark:bg-surface-container shadow-xl shadow-neutral-200/50 dark:shadow-black/40 animate-scale-in z-50">
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate('/upload');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-on-surface transition-colors hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-neutral-400">upload_file</span>
                      Add Document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate('/upload');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-on-surface transition-colors hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-neutral-400">folder_open</span>
                      Manage Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        openUserProfile();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-on-surface transition-colors hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/10 dark:hover:text-violet-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px] text-neutral-400">person</span>
                      Account Settings
                    </button>
                  </div>

                  <div className="mx-3 border-t border-neutral-100 dark:border-outline-variant" />

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        signOut({ redirectUrl: '/' });
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

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
