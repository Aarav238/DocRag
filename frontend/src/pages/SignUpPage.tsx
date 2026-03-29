import { useEffect } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { AuthChrome } from '../components/auth/AuthChrome';

const SIGN_UP_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCwW-cQyZYuPlQn8cVckFN1xrY_P8Rj8m2N4BhlfRGiAKfo_D_GPlBItR06hDNGMNmOzstAKn4EnKZVQFReWe7IHukntuU8R9uqQdEcfMgQ5ISOHJseUyUUpfsR0_NTdb2e1sUvEYZyotabNTlnsYKgRLO_nhUt0SqBqahDOPksDB0M7iOGstUv5Ms9RIS8cSdDBBx8yRSjWIDI9nhDs5FhSOojEM99JNTueRarjP0kabLjFCgxYuZr6Xb_wyOkIkxDULApMkpWBKKc';

const clerkAppearance = {
  variables: {
    colorPrimary: '#5b21b6',
    colorText: '#0a0a0a',
    colorTextSecondary: '#525252',
    colorInputBackground: '#f0f0f0',
    colorInputText: '#0a0a0a',
    borderRadius: '0.75rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9375rem',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none bg-transparent border-0 p-0 w-full gap-0',
    header: 'hidden',
    main: 'gap-5',
    socialButtonsBlockButton:
      'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl !bg-neutral-100 hover:!bg-neutral-200 border-0 transition-colors duration-200 !text-neutral-800 !font-bold !text-sm',
    socialButtonsBlockButtonText: 'font-bold text-sm',
    dividerLine: 'bg-neutral-200',
    dividerText: 'text-neutral-400 text-[10px] uppercase tracking-widest font-bold px-4',
    formFieldLabel: 'block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1 ml-1',
    formFieldInput:
      'w-full bg-neutral-100 border-none rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-violet-500/30',
    formButtonPrimary:
      'w-full py-4 px-6 rounded-xl primary-gradient text-white font-bold tracking-tight text-lg shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 !border-0',
    formButtonReset: 'text-violet-600 font-bold text-xs',
    footer: 'hidden',
    identityPreview: 'rounded-xl bg-neutral-100',
    formFieldSuccessText: 'text-emerald-600 text-xs font-medium',
    formFieldErrorText: 'text-red-500 text-xs font-medium',
    alertText: 'text-sm',
    otpCodeFieldInput: 'rounded-xl bg-neutral-100 border-0',
  },
} as const;

export function SignUpPage() {
  useEffect(() => {
    document.title = 'Sign Up | DocRAG Intelligence';
  }, []);

  return (
    <AuthChrome>
      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12 w-full">
        <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-0 overflow-hidden rounded-2xl bg-white shadow-xl shadow-neutral-200/50 border border-neutral-200/60 animate-scale-in">
          {/* Left panel */}
          <div className="hidden md:flex flex-col justify-center p-12 bg-sidebar relative overflow-hidden min-h-[520px]">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url('${SIGN_UP_HERO}')` }}
              aria-hidden
            />
            <div className="absolute inset-0 dot-grid-dark z-[1]" />
            <div className="relative z-10">
              <h1 className="text-4xl font-black tracking-tight text-white mb-6 font-headline">
                Master Your
                <br />
                <span className="text-cyan-400">Knowledge Base.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Join thousands of researchers and professionals using DocRAG to transform static documents into
                interactive intelligence.
              </p>
              <div className="mt-12 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                    <span className="material-symbols-outlined text-cyan-400">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-headline">AI-Powered Synthesis</h3>
                    <p className="text-sm text-slate-400">
                      Get instant answers grounded in your specific documents.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                    <span className="material-symbols-outlined text-cyan-400">security</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-headline">Enterprise Security</h3>
                    <p className="text-sm text-slate-400">
                      Your data remains private and encrypted at all times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="mb-8 animate-fade-in-up">
              <h2 className="text-3xl font-black tracking-tight text-neutral-900 mb-2 font-headline">Create Account</h2>
              <p className="text-neutral-500 text-sm font-medium">Start your 14-day premium trial today.</p>
            </div>

            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              appearance={clerkAppearance}
            />

            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
              <p className="text-sm font-medium text-neutral-500">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-violet-600 font-bold hover:underline ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthChrome>
  );
}
