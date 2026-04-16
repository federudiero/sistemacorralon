import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aridos_theme_mode';
const ThemeContext = createContext(null);

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readStoredMode() {
  if (typeof window === 'undefined') return 'dark';
  try {
    return localStorage.getItem(STORAGE_KEY) || getSystemPreference();
  } catch {
    return getSystemPreference();
  }
}

function applyTheme(mode) {
  if (typeof document === 'undefined') return;
  const themeName = mode === 'light' ? 'corporate' : 'night';
  document.documentElement.setAttribute('data-theme', themeName);
  document.documentElement.dataset.colorMode = mode;
  document.documentElement.style.colorScheme = mode;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode);

  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore persistence failure
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (event) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return;
      } catch {
        // ignore storage failure
      }
      setMode(event.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      setMode,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode debe usarse dentro de ThemeProvider');
  return ctx;
}
