'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = (typeof window !== 'undefined'
        ? (localStorage.getItem('theme') as Theme | null)
        : null);

      if (savedTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        const prefersDark =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;

        const systemTheme: Theme = prefersDark ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    } catch {
      // در صورت عدم دسترسی به localStorage (مثلاً در Private Mode)، نادیده بگیر
      applyTheme('light');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  // نکته: Provider را همیشه رندر می‌کنیم تا useTheme در اولین رندر هم Context داشته باشد
  // برای جلوگیری از FOUC می‌توانید در اولین رندر محتوا را موقتاً نامرئی کنید:
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={mounted ? '' : 'invisible'}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useSafeTheme() {
  const context = useContext(ThemeContext);
  return context || { theme: 'light' as Theme, toggleTheme: () => {}, setTheme: () => {} };
}
