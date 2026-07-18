import { create } from 'zustand';

interface ThemeState {
  themeMode: 'light' | 'dark' | 'system';
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setCompactMode: (compact: boolean) => void;
}

const resolveTheme = (mode: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

const applyThemeClass = (resolvedTheme: 'light' | 'dark') => {
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = (localStorage.getItem('themeMode') as 'light' | 'dark' | 'system') || 'dark';
  const initialTheme = resolveTheme(initialMode);
  const initialFontSize = (localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium';
  const initialCompactMode = localStorage.getItem('compactMode') === 'true';

  // Apply initial classes
  applyThemeClass(initialTheme);
  
  document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  document.documentElement.classList.add(`font-size-${initialFontSize}`);

  if (initialCompactMode) {
    document.documentElement.classList.add('compact');
  } else {
    document.documentElement.classList.remove('compact');
  }

  // Listener for system scheme shifts
  const systemMatcher = window.matchMedia('(prefers-color-scheme: dark)');
  systemMatcher.addEventListener('change', () => {
    if (get().themeMode === 'system') {
      const updated = resolveTheme('system');
      applyThemeClass(updated);
      set({ theme: updated });
    }
  });

  return {
    themeMode: initialMode,
    theme: initialTheme,
    fontSize: initialFontSize,
    compactMode: initialCompactMode,
    setThemeMode: (mode) => set(() => {
      localStorage.setItem('themeMode', mode);
      const resolved = resolveTheme(mode);
      applyThemeClass(resolved);
      return { themeMode: mode, theme: resolved };
    }),
    toggleTheme: () => set((state) => {
      let nextMode: 'light' | 'dark' | 'system';
      if (state.themeMode === 'light') {
        nextMode = 'dark';
      } else if (state.themeMode === 'dark') {
        nextMode = 'system';
      } else {
        nextMode = 'light';
      }
      localStorage.setItem('themeMode', nextMode);
      const resolved = resolveTheme(nextMode);
      applyThemeClass(resolved);
      return { themeMode: nextMode, theme: resolved };
    }),
    setFontSize: (size) => set(() => {
      localStorage.setItem('fontSize', size);
      document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
      document.documentElement.classList.add(`font-size-${size}`);
      return { fontSize: size };
    }),
    setCompactMode: (compact) => set(() => {
      localStorage.setItem('compactMode', String(compact));
      if (compact) {
        document.documentElement.classList.add('compact');
      } else {
        document.documentElement.classList.remove('compact');
      }
      return { compactMode: compact };
    })
  };
});
