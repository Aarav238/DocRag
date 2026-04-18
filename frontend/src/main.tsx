import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  console.error('Missing VITE_CLERK_PUBLISHABLE_KEY — add it to frontend/.env')
}

function ClerkWithTheme() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey ?? ''}
      signInFallbackRedirectUrl="/upload"
      signUpFallbackRedirectUrl="/upload"
      appearance={{
        variables: {
          colorPrimary: isDark ? '#8b5cf6' : '#5b21b6',
          colorBackground: isDark ? '#111827' : '#ffffff',
          colorText: isDark ? '#f5f5f5' : '#0a0a0a',
          colorTextSecondary: isDark ? '#94a3b8' : '#525252',
          colorInputBackground: isDark ? '#0a0f1e' : '#ffffff',
          colorInputText: isDark ? '#f5f5f5' : '#0a0a0a',
          colorNeutral: isDark ? '#f5f5f5' : '#0a0a0a',
          colorDanger: isDark ? '#f87171' : '#dc2626',
          colorSuccess: isDark ? '#34d399' : '#059669',
          colorWarning: isDark ? '#fbbf24' : '#d97706',
          fontFamily: '"Outfit", sans-serif',
          borderRadius: '0.75rem',
        },
        elements: {
          card: isDark
            ? 'bg-surface-container border border-outline-variant shadow-xl shadow-black/40'
            : '',
          formFieldInput: isDark
            ? 'bg-surface border-outline-variant text-on-surface'
            : '',
          socialButtonsBlockButton: isDark
            ? 'bg-surface-container-high border-outline-variant text-on-surface hover:bg-surface-container-highest'
            : '',
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClerkWithTheme />
    </ThemeProvider>
  </StrictMode>,
)
