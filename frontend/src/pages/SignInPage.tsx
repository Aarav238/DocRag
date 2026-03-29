import { useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { AuthChrome } from '../components/auth/AuthChrome';

const SIGN_IN_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5S4yjinStiZnR3DB0JDZMso2FBkS0sBIjbQNI8afVfdnLB8wwh-E-ea1YuSbY8t3g0sVMApEeklaWvCB5CvadiPOgn5VFGkess8R-kZFF3vvTNNAEXX8fsWORCtVEMDhE59eWiuF9YTiaXw2JkH35BvG_IZ_AYvdnQah1cwsV8VqyBnD369xkvigmGZkyD8KcpsU2jNtxzDLTb0xslE5DNG5vjMO7RglF6uQq22q881L2Fntcy1nYIyP609qeAFlyRS3i36GeTJhE';

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
    main: 'gap-6',
    socialButtonsBlockButton:
      'flex items-center justify-center gap-2 py-3 px-4 rounded-xl !bg-neutral-100 hover:!bg-neutral-200 border-0 transition-colors duration-200 !text-neutral-800 !font-bold !text-sm',
    socialButtonsBlockButtonText: 'font-bold text-sm',
    dividerLine: 'bg-neutral-200',
    dividerText: 'text-neutral-400 text-[10px] uppercase tracking-widest font-bold bg-white px-4',
    formFieldLabel: 'text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-1',
    formFieldInput:
      'w-full px-4 py-3.5 rounded-xl bg-neutral-100 border-0 focus:ring-2 focus:ring-violet-500/30 text-neutral-900 placeholder:text-neutral-400 font-medium',
    formFieldInputShowPasswordButton: 'text-violet-500',
    formButtonPrimary:
      'w-full py-4 primary-gradient text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 hover:opacity-95 active:scale-[0.98] transition-all duration-200 !text-base',
    formButtonReset: 'text-violet-600 font-bold text-xs',
    footer: 'hidden',
    identityPreview: 'rounded-xl bg-neutral-100',
    formFieldSuccessText: 'text-emerald-600 text-xs font-medium',
    formFieldErrorText: 'text-red-500 text-xs font-medium',
    alertText: 'text-sm',
    otpCodeFieldInput: 'rounded-xl bg-neutral-100 border-0',
  },
} as const;

export function SignInPage() {
  useEffect(() => {
    document.title = 'Sign In | DocRAG Intelligence';
  }, []);

  return (
    <AuthChrome>
      <main className="min-h-screen flex flex-col md:flex-row flex-1">
        {/* Left panel */}
        <section className="hidden md:flex md:w-1/2 bg-sidebar flex-col justify-center px-16 relative overflow-hidden min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <img className="w-full h-full object-cover" alt="" src={SIGN_IN_HERO} />
          </div>
          <div className="absolute inset-0 dot-grid-dark z-[1]" />
          <div className="relative z-10 max-w-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25">
                <div className="w-5 h-5 rounded-full border-2 border-white/80 relative">
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <span className="font-headline text-2xl font-black tracking-tight text-white">DocRAG</span>
            </div>
            <h1 className="font-headline text-4xl font-black tracking-tight text-gradient leading-tight sm:text-5xl" style={{ WebkitTextFillColor: 'unset' }}>
              <span className="text-white">The Intelligent</span>
              <br />
              <span className="text-cyan-400">Layer</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Upload your files, index them in seconds, then search, chat, and draft — always grounded in your
              own documents with citations.
            </p>
          </div>
        </section>

        {/* Right panel */}
        <section className="flex w-full items-center justify-center px-6 pb-6 pt-24 sm:px-12 sm:pb-12 md:pt-16 md:mt-0 md:w-1/2 bg-white">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="mb-8">
              <h2 className="font-headline text-3xl font-black tracking-tight text-neutral-900 mb-2">
                Welcome back
              </h2>
              <p className="text-neutral-500 font-medium">Enter your credentials to access your workspace.</p>
            </div>

            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              appearance={clerkAppearance}
            />

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-neutral-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/sign-up"
                  className="text-violet-600 font-bold hover:underline transition-all underline-offset-4 decoration-2"
                >
                  Create a workspace
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </AuthChrome>
  );
}
