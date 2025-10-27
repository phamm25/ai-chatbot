import { useEffect, useState } from 'react';
import { useThemeStore } from '../state/theme';

export const ThemeToggle = () => {
  const { mode, toggle } = useThemeStore((state) => ({ mode: state.mode, toggle: state.toggle }));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 rounded-full border border-gray-200 bg-white/70 p-3 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur transition hover:scale-105 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100"
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};
