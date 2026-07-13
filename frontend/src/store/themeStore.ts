import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  toggleTheme: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setCompactMode: (compact: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  const initialFontSize = (localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium';
  const initialCompactMode = localStorage.getItem('compactMode') === 'true';
  
  // Apply initial theme
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Apply initial font size
  document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  document.documentElement.classList.add(`font-size-${initialFontSize}`);

  // Apply initial compact mode
  if (initialCompactMode) {
    document.documentElement.classList.add('compact');
  } else {
    document.documentElement.classList.remove('compact');
  }

  return {
    theme: initialTheme,
    fontSize: initialFontSize,
    compactMode: initialCompactMode,
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return { theme: nextTheme };
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
