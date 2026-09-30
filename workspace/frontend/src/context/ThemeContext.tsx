import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme?: (isDark: boolean) => void;
}

const LOCAL_STORAGE_KEY_THEME = 'cleanconnect_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (err) {
      console.error('Error reading theme from localStorage:', err);
      return false;
    }
  });

  // Sync documentElement class and localStorage whenever isDark changes
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
      }
    } catch (err) {
      console.error('Error persisting theme:', err);
    }
  }, [isDark]);

  // Sync with OS theme changes if user hasn't explicitly set a preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
        if (!saved) {
          setIsDark(e.matches);
        }
      } catch {}
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDark(dark);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      isDark,
      toggleTheme,
      setTheme,
    }),
    [isDark, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
