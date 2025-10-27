import { useTheme } from '../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
};
