import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { ThemeToggle } from './ThemeToggle';

interface MarketingHeaderProps {
  showTryDemo?: boolean;
}

export function MarketingHeader({ showTryDemo = true }: MarketingHeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-neutral-200/50 dark:border-outline-variant">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-lg shadow-violet-500/15 transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-black font-headline">D</span>
          </div>
          <span className="font-headline text-xl font-extrabold tracking-tight text-neutral-900">DocRAG</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-500">
          <a href="/#features" className="hover:text-violet-600 transition-colors duration-200">
            Features
          </a>
          <a href="/#how-it-works" className="hover:text-violet-600 transition-colors duration-200">
            How it Works
          </a>
          <a href="/#use-cases" className="hover:text-violet-600 transition-colors duration-200">
            Use Cases
          </a>
          <Link to="/guide" className="hover:text-violet-600 transition-colors duration-200">
            Guide
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle variant="compact" />
          <SignedOut>
            {showTryDemo && (
              <button
                type="button"
                onClick={() => navigate('/draft?demo=true')}
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-neutral-500 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Try Demo
              </button>
            )}
            <Link
              to="/sign-in"
              className="hidden sm:inline-flex px-3 py-2 text-sm font-semibold text-neutral-600 hover:text-violet-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="primary-gradient text-white text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px transition-all duration-200 whitespace-nowrap"
            >
              Get Started
            </Link>
          </SignedOut>

          <SignedIn>
            {showTryDemo && (
              <button
                type="button"
                onClick={() => navigate('/draft?demo=true')}
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-neutral-500 hover:text-violet-600 transition-colors cursor-pointer"
              >
                Try Demo
              </button>
            )}
            <Link
              to="/upload"
              className="primary-gradient text-white text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px transition-all duration-200 whitespace-nowrap"
            >
              Open app
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-9 h-9',
                },
              }}
            />
          </SignedIn>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl leading-none">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
            >
              How it Works
            </a>
            <a
              href="/#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
            >
              Use Cases
            </a>
            <Link
              to="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
            >
              Guide
            </Link>
            <SignedOut>
              <div className="pt-3 border-t border-neutral-100 mt-2 space-y-2">
                {showTryDemo && (
                  <button
                    type="button"
                    onClick={() => { navigate('/draft?demo=true'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-3 text-sm font-medium text-neutral-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Try Demo
                  </button>
                )}
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-neutral-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
}
