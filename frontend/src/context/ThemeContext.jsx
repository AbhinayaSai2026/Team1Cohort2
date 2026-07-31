// TICKET-ADV124 — ThemeProvider: context flips data-theme; CSS owns colours.
import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'reconx-theme';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

function initialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  // TODO(TICKET-ADV124): lazy-init from localStorage('reconx-theme') — fall back
  //                     to 'light' if nothing is stored.
  const [theme , setTheme ] = useState('light');

  // TODO(TICKET-ADV124): useEffect that:
  //                     1. sets document.documentElement.dataset.theme = theme
  //                     2. persists `theme` to localStorage on every change.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);
  // TODO(TICKET-ADV124): flip 'light' <-> 'dark' via setTheme(prev => ...).

  const toggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
