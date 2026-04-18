import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'docrag-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredMode(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* ignore */ }
  return 'system';
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return mode;
}

function applyResolved(resolved: ResolvedTheme, animate: boolean) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-transitioning');
    window.setTimeout(() => root.classList.remove('theme-transitioning'), 260);
  }
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readStoredMode()));

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    const nextResolved = resolve(next);
    setResolved(nextResolved);
    applyResolved(nextResolved, true);
  }, []);

  // Follow system changes while in 'system' mode.
  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next: ResolvedTheme = mql.matches ? 'dark' : 'light';
      setResolved(next);
      applyResolved(next, true);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
