import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

const YEAR = new Date().getFullYear();

interface AuthChromeProps {
  children: ReactNode;
}

export function AuthChrome({ children }: AuthChromeProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background selection:bg-violet-100 selection:text-violet-900 font-body">
      <nav className="fixed top-0 w-full z-50 glass-panel flex justify-between items-center px-6 py-4 max-w-full border-b border-neutral-200/40 dark:border-outline-variant">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-black font-headline">D</span>
          </div>
          <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-on-surface font-headline">DocRAG</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle variant="compact" />
          <a
            href="mailto:aarav8090shukla@gmail.com"
            className="text-sm font-medium text-neutral-500 hover:text-violet-600 transition-colors cursor-pointer"
          >
            Support
          </a>
        </div>
      </nav>

      {children}

      <footer className="w-full py-8 bg-transparent flex flex-col md:flex-row justify-between items-center px-6 sm:px-12 mt-auto border-t border-neutral-200/40">
        <div className="text-xs font-medium tracking-wide text-neutral-400 mb-4 md:mb-0">
          &copy; {YEAR} DocRAG Intelligence. All rights reserved.
        </div>
        <div className="flex gap-8 flex-wrap justify-center">
          <span className="text-xs font-medium tracking-wide text-neutral-400 hover:text-violet-600 transition-colors cursor-default">
            Privacy Policy
          </span>
          <span className="text-xs font-medium tracking-wide text-neutral-400 hover:text-violet-600 transition-colors cursor-default">
            Terms of Service
          </span>
          <span className="text-xs font-medium tracking-wide text-neutral-400 hover:text-violet-600 transition-colors cursor-default">
            Security
          </span>
        </div>
      </footer>
    </div>
  );
}
