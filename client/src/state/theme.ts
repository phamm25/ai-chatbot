import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem('chatbot-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getInitialMode(),
  toggle: () => {
    const nextMode: ThemeMode = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: nextMode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chatbot-theme', nextMode);
    }
  },
  setMode: (mode: ThemeMode) => {
    set({ mode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('chatbot-theme', mode);
    }
  },
}));

export const applyThemeClass = (mode: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
