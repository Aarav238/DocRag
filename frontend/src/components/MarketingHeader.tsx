import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

interface MarketingHeaderProps {
  showTryDemo?: boolean;
}

export function MarketingHeader({ showTryDemo = true }: MarketingHeaderProps) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-neutral-200/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-lg shadow-violet-500/15 transition-transform group-hover:scale-105">
            <span className="text-white text-sm font-black font-headline">D</span>
          </div>
          <span className="font-headline text-xl font-extrabold tracking-tight text-neutral-900">DocRAG</span>
        </Link>

        {/* Nav links */}
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
              className="primary-gradient text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px transition-all duration-200 whitespace-nowrap"
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
              className="primary-gradient text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-px transition-all duration-200 whitespace-nowrap"
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
        </div>
      </div>
    </nav>
  );
}
